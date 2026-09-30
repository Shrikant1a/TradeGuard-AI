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

@router.post("/tradingview")
async def receive_tradingview_webhook(
    payload: TradingViewWebhookPayload,
    request: Request,
    x_tradingview_secret: Optional[str] = Header(None)
):
    """
    Ingests TradingView alert webhook payload, verifies secret header if supplied,
    stores alert in audit center, and records cryptographic verification hash.
    """
    # Verify optional webhook secret if configured
    if x_tradingview_secret and x_tradingview_secret != settings.TRADINGVIEW_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid TradingView webhook secret")

    sym = payload.symbol.upper().strip()
    price = payload.price or 100.0
    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    # Generate cryptographic hash of webhook payload
    raw_dict = payload.dict()
    payload_hash = stellar_service.generate_sha256(raw_dict)

    # Record verification on Stellar audit ledger
    tx_rec = await stellar_service.record_signal_on_chain(
        signal_code=f"TV-{abs(hash(sym + payload.signal + now_str)) % 9000 + 1000}",
        asset_symbol=sym,
        signal_type=payload.signal.upper(),
        model_version="TradingView-PineScript-v5",
        strategy_hash=stellar_service.generate_sha256("PineScript-MultiFactor"),
        signal_hash=payload_hash,
        risk_level="MEDIUM"
    )

    event_record = {
        "id": len(WEBHOOK_EVENTS_LOG) + 1,
        "symbol": sym,
        "signal": payload.signal.upper(),
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
