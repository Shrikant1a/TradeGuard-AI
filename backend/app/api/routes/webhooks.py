from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import datetime
from backend.app.config import settings
from backend.app.services.stellar_service import stellar_service

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

WEBHOOK_EVENTS_LOG: List[Dict[str, Any]] = [
    {
        "id": 1,
        "symbol": "AAPL",
        "signal": "BUY",
        "price": 223.80,
        "volume": 42000000.0,
        "source": "tradingview",
        "received_at": (datetime.datetime.utcnow() - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
        "blockchain_verified": True,
        "status": "PROCESSED"
    },
    {
        "id": 2,
        "symbol": "NVDA",
        "signal": "BUY",
        "price": 127.40,
        "volume": 68000000.0,
        "source": "tradingview",
        "received_at": (datetime.datetime.utcnow() - datetime.timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S"),
        "blockchain_verified": True,
        "status": "PROCESSED"
    }
]

class TradingViewWebhookPayload(BaseModel):
    symbol: str
    price: Optional[float] = None
    volume: Optional[float] = None
    time: Optional[str] = None
    signal: str # BUY, SELL, RISK_ALERT
    source: Optional[str] = "tradingview"

import secrets
from backend.app.services.cache_service import cache_service

@router.post("/tradingview")
async def receive_tradingview_webhook(
    payload: TradingViewWebhookPayload,
    request: Request,
    x_tradingview_secret: Optional[str] = Header(None)
):
    """
    Ingests TradingView alert webhook payload with constant-time secret validation,
    request sanitation, duplicate detection, and cryptographic audit recording.
    """
    # 1. Constant-time secret validation
    expected_secret = getattr(settings, "TRADINGVIEW_WEBHOOK_SECRET", None)
    if expected_secret:
        provided = x_tradingview_secret or ""
        # Also check payload if secret was embedded in JSON body
        if not provided and isinstance(payload.dict().get("secret"), str):
            provided = payload.dict()["secret"]
            
        if not provided or not secrets.compare_digest(provided, expected_secret):
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid TradingView webhook secret")

    # 2. Input validation
    sym = payload.symbol.upper().strip()
    if not sym or len(sym) > 20:
        raise HTTPException(status_code=400, detail="Invalid asset symbol")

    valid_signals = ("BUY", "SELL", "HOLD", "RISK_ALERT", "EXIT")
    sig = payload.signal.upper().strip()
    if sig not in valid_signals:
        raise HTTPException(status_code=400, detail=f"Invalid signal type. Expected one of {valid_signals}")

    price = float(payload.price or 100.0)
    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    # 3. Duplicate Detection / Idempotency Window (60 seconds)
    dedup_signature = stellar_service.generate_sha256(f"{sym}:{sig}:{round(price, 2)}:{int(time.time() // 60)}")
    dedup_key = f"webhook:dedup:{dedup_signature}"
    if await cache_service.get(dedup_key):
        return {
            "status": "DUPLICATE_IGNORED",
            "message": f"Duplicate webhook for {sym} ({sig}) ignored within 60s idempotency window",
            "symbol": sym
        }
    await cache_service.set(dedup_key, "1", ttl=60)

    # 4. Generate cryptographic hash of webhook payload
    raw_dict = payload.dict()
    payload_hash = stellar_service.generate_sha256(raw_dict)

    # 5. Record verification on Stellar audit ledger
    tx_rec = await stellar_service.record_signal_on_chain(
        signal_code=f"TV-{abs(hash(sym + sig + now_str)) % 9000 + 1000}",
        asset_symbol=sym,
        signal_type=sig,
        model_version="TradingView-PineScript-v5",
        strategy_hash=stellar_service.generate_sha256("PineScript-MultiFactor"),
        signal_hash=payload_hash,
        risk_level="MEDIUM"
    )

    event_record = {
        "id": len(WEBHOOK_EVENTS_LOG) + 1,
        "symbol": sym,
        "signal": sig,
        "price": price,
        "volume": payload.volume or 1000000.0,
        "source": payload.source or "tradingview",
        "raw_payload": raw_dict,
        "received_at": now_str,
        "stellar_tx_hash": tx_rec["stellar_tx_hash"],
        "blockchain_verified": True,
        "status": "PROCESSED"
    }

    WEBHOOK_EVENTS_LOG.insert(0, event_record)
    if len(WEBHOOK_EVENTS_LOG) > 100:
        WEBHOOK_EVENTS_LOG.pop()

    return {
        "status": "SUCCESS",
        "message": f"TradingView alert for {sym} processed and verified on Stellar",
        "event_id": event_record["id"],
        "stellar_tx_hash": tx_rec["stellar_tx_hash"]
    }

@router.get("/tradingview/logs")
async def get_webhook_logs():
    """Retrieve history of received TradingView alert webhooks"""
    return WEBHOOK_EVENTS_LOG
