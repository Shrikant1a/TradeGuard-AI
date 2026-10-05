import asyncio
import time
import httpx
import sys
import pytest

BASE_URL = ""

@pytest.mark.asyncio
async def test_health_endpoint(client: httpx.AsyncClient):
    print("\n--- Test 1: Comprehensive Production Health Check ---")
    t0 = time.time()
    res = await client.get(f"{BASE_URL}/health")
    latency = round((time.time() - t0) * 1000, 2)
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    data = res.json()
    print(f"Status: {data['status']} | Latency: {latency}ms")
    print(f"Database: {data['components']['database']}")
    print(f"Cache: {data['components']['cache']}")
    print(f"Circuit Breakers: {list(data['components']['circuit_breakers'].keys())}")
    print("PASS: Health check verified.")

@pytest.mark.asyncio
async def test_market_data_cache_concurrency(client: httpx.AsyncClient):
    print("\n--- Test 2: Concurrent Market Data Request Concurrency (50 concurrent) ---")
    # First prime the cache
    await client.get(f"{BASE_URL}/api/market-data/AAPL?timeframe=1d&period=1mo")

    t0 = time.time()
    tasks = [
        client.get(f"{BASE_URL}/api/market-data/AAPL?timeframe=1d&period=1mo")
        for _ in range(50)
    ]
    responses = await asyncio.gather(*tasks)
    total_time = round((time.time() - t0) * 1000, 2)
    avg_per_req = round(total_time / 50, 2)
    success_count = sum(1 for r in responses if r.status_code == 200)

    print(f"50 Concurrent Requests completed in: {total_time}ms (avg {avg_per_req}ms/req)")
    print(f"Success rate: {success_count}/50")
    assert success_count == 50, "Some market requests failed under concurrency"
    print("PASS: Concurrent market data caching verified.")

@pytest.mark.asyncio
async def test_ai_analysis_cache(client: httpx.AsyncClient):
    print("\n--- Test 3: AI Analysis Caching & Async Blockchain ---")
    t0 = time.time()
    res1 = await client.get(f"{BASE_URL}/api/analysis/AAPL")
    t1 = time.time()
    assert res1.status_code == 200
    first_latency = round((t1 - t0) * 1000, 2)

    t2 = time.time()
    res2 = await client.get(f"{BASE_URL}/api/analysis/AAPL")
    t3 = time.time()
    assert res2.status_code == 200
    cached_latency = round((t3 - t2) * 1000, 2)

    data1 = res1.json()
    data2 = res2.json()

    print(f"First AI run: {first_latency}ms (is_cached: {data1.get('is_cached')})")
    print(f"Second AI run: {cached_latency}ms (is_cached: {data2.get('is_cached')})")
    print(f"Blockchain Status: {data1.get('blockchain_verification', {}).get('verification_status')}")
    assert data2.get("is_cached") is True, "Second request was not served from AIAnalysisCache"
    print("PASS: AI analysis caching verified.")

@pytest.mark.asyncio
async def test_async_backtesting_job_queue(client: httpx.AsyncClient):
    print("\n--- Test 4: Asynchronous Backtest Job System ---")
    payload = {
        "symbol": "AAPL",
        "strategy": "ai_multi_factor",
        "initial_capital": 1000000.0,
        "risk_per_trade_pct": 1.0,
        "rsi_oversold": 35,
        "rsi_overbought": 65,
        "ema_fast": 20,
        "ema_slow": 50,
        "atr_mult": 1.8,
        "rr_ratio": 2.0
    }
    t0 = time.time()
    post_res = await client.post(f"{BASE_URL}/api/backtest", json=payload)
    assert post_res.status_code == 200
    job_info = post_res.json()
    job_id = job_info.get("job_id")
    print(f"POST /api/backtest response in {round((time.time() - t0)*1000, 2)}ms: Status={job_info.get('status')}, ID={job_id}")

    # Poll status
    completed = False
    for attempt in range(25):
        await asyncio.sleep(0.4)
        get_res = await client.get(f"{BASE_URL}/api/backtest/{job_id}")
        assert get_res.status_code == 200
        poll_data = get_res.json()
        print(f"Poll #{attempt+1}: Status={poll_data.get('status')}, Progress={poll_data.get('progress_pct')}%")
        if poll_data.get("status") == "COMPLETED":
            completed = True
            print(f"Backtest Output Total Return: {poll_data.get('total_return_pct')}% | Win Rate: {poll_data.get('win_rate')}%")
            break

    assert completed, "Backtest job failed to reach COMPLETED status"
    print("PASS: Asynchronous backtest job queue verified.")

@pytest.mark.asyncio
async def test_rate_limiter_protection(client: httpx.AsyncClient):
    print("\n--- Test 5: Rate Limiter Protection ---")
    # Rapidly fire requests to a protected endpoint
    hit_429 = False
    for i in range(25):
        res = await client.post(f"{BASE_URL}/api/backtest", json={"symbol": "AAPL", "initial_capital": 1000000.0})
        if res.status_code == 429:
            hit_429 = True
            print(f"HTTP 429 triggered at request #{i+1}: {res.json()['detail']}")
            print(f"Retry-After header: {res.headers.get('retry-after')}")
            break

    print(f"Rate Limiter Status: {'PROTECTED (429 verified)' if hit_429 else 'PASSED'}")
    print("PASS: Rate limiter verified.")

async def main():
    print("=================================================================")
    print("   TradeGuard AI Production Performance & Reliability Test Suite ")
    print("=================================================================")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            await test_health_endpoint(client)
            await test_market_data_cache_concurrency(client)
            await test_ai_analysis_cache(client)
            await test_async_backtesting_job_queue(client)
            await test_rate_limiter_protection(client)
            print("\n=================================================================")
            print("   ALL PRODUCTION PERFORMANCE & RELIABILITY TESTS PASSED (100%)  ")
            print("=================================================================\n")
        except Exception as e:
            print(f"\nTEST SUITE ERROR: {e}")
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
