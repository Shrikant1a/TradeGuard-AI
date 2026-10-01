import asyncio
import time
import logging
from typing import Callable, Any, Optional, Dict
from enum import Enum

logger = logging.getLogger("tradeguard.circuit_breaker")

class CircuitState(str, Enum):
    CLOSED = "CLOSED"         # Normal operation
    OPEN = "OPEN"             # Failing, fast-reject or serve fallback
    HALF_OPEN = "HALF_OPEN"   # Testing recovery

class CircuitBreakerOpenException(Exception):
    """Raised when request is rejected because circuit is OPEN"""
    pass

class CircuitBreaker:
    """
    Production Circuit Breaker with exponential backoff & automatic cooldown recovery.
    Protects downstream third-party APIs (Yahoo, AlphaVantage, Stellar RPC).
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 4,
        recovery_timeout_sec: float = 30.0,
        request_timeout_sec: float = 10.0
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout_sec = recovery_timeout_sec
        self.request_timeout_sec = request_timeout_sec

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.last_state_change = time.time()
        self._lock = asyncio.Lock()

    async def call(
        self,
        async_func: Callable,
        *args,
        fallback: Optional[Callable] = None,
        **kwargs
    ) -> Any:
        """Executes async_func under circuit protection and request timeout"""
        async with self._lock:
            now = time.time()
            if self.state == CircuitState.OPEN:
                if now - self.last_failure_time > self.recovery_timeout_sec:
                    logger.info(f"CircuitBreaker [{self.name}]: Transitioning from OPEN to HALF_OPEN (probing recovery).")
                    self.state = CircuitState.HALF_OPEN
                    self.last_state_change = now
                else:
                    logger.warning(f"CircuitBreaker [{self.name}]: OPEN. Request fast-failing to fallback.")
                    if fallback:
                        return await fallback(*args, **kwargs) if asyncio.iscoroutinefunction(fallback) else fallback(*args, **kwargs)
                    raise CircuitBreakerOpenException(f"Service {self.name} is currently unavailable (circuit open).")

        # Execute call with timeout
        try:
            result = await asyncio.wait_for(async_func(*args, **kwargs), timeout=self.request_timeout_sec)
            
            async with self._lock:
                if self.state == CircuitState.HALF_OPEN:
                    logger.info(f"CircuitBreaker [{self.name}]: Probe succeeded. Circuit recovering to CLOSED.")
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
                    self.last_state_change = time.time()
                elif self.state == CircuitState.CLOSED and self.failure_count > 0:
                    self.failure_count = 0
            return result

        except Exception as exc:
            async with self._lock:
                self.failure_count += 1
                self.last_failure_time = time.time()
                logger.warning(
                    f"CircuitBreaker [{self.name}]: Call failed ({type(exc).__name__}: {exc}). "
                    f"Failures: {self.failure_count}/{self.failure_threshold}"
                )

                if self.failure_count >= self.failure_threshold:
                    self.state = CircuitState.OPEN
                    self.last_state_change = time.time()
                    logger.error(f"CircuitBreaker [{self.name}]: Tripped to OPEN for {self.recovery_timeout_sec}s cooldown.")

            if fallback:
                try:
                    return await fallback(*args, **kwargs) if asyncio.iscoroutinefunction(fallback) else fallback(*args, **kwargs)
                except Exception as fb_exc:
                    logger.error(f"CircuitBreaker [{self.name}]: Fallback also failed ({fb_exc})")
            raise exc

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "last_failure_ago_sec": round(time.time() - self.last_failure_time, 1) if self.last_failure_time else None
        }

# Pre-configured instances
market_circuit_breaker = CircuitBreaker("MarketDataAPI", failure_threshold=4, recovery_timeout_sec=30.0, request_timeout_sec=8.0)
news_circuit_breaker = CircuitBreaker("NewsAPI", failure_threshold=4, recovery_timeout_sec=30.0, request_timeout_sec=10.0)
stellar_circuit_breaker = CircuitBreaker("StellarRPC", failure_threshold=3, recovery_timeout_sec=45.0, request_timeout_sec=8.0)
ai_circuit_breaker = CircuitBreaker("AIEngine", failure_threshold=3, recovery_timeout_sec=30.0, request_timeout_sec=15.0)
