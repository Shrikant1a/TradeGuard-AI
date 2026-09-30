from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import datetime

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

SYSTEM_ALERTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "symbol": "AAPL",
        "alert_type": "AI_BUY_SIGNAL",
        "title": "AI Model BUY Confirmation: AAPL",
        "message": "Ensemble model confirmed BUY signal with 72% confidence. Fast EMA crossed above Slow EMA with volume expansion.",
        "severity": "SUCCESS",
        "is_read": False,
        "timestamp": (datetime.datetime.utcnow() - datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M")
    },
    {
        "id": 2,
        "symbol": "NVDA",
        "alert_type": "HIGH_VOLATILITY",
        "title": "Elevated Volatility Warning: NVDA",
        "message": "ATR Daily Volatility surged to 3.8%. Stop-loss bracket widened dynamically to mitigate whipsaws.",
        "severity": "WARNING",
        "is_read": False,
        "timestamp": (datetime.datetime.utcnow() - datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M")
    },
    {
        "id": 3,
        "symbol": "PORTFOLIO",
        "alert_type": "RISK_ENGINE_POLICY",
        "title": "Pre-Trade Risk Policy Check Passed",
        "message": "Portfolio exposure is at 32%, well within your safe threshold of 40%.",
        "severity": "INFO",
        "is_read": True,
        "timestamp": (datetime.datetime.utcnow() - datetime.timedelta(hours=3)).strftime("%Y-%m-%d %H:%M")
    },
    {
        "id": 4,
        "symbol": "TSLA",
        "alert_type": "TRADINGVIEW_WEBHOOK",
        "title": "TradingView Webhook Received: TSLA",
        "message": "Pine Script Strategy triggered Alert Condition with SHA-256 blockchain verification receipt.",
        "severity": "INFO",
        "is_read": True,
        "timestamp": (datetime.datetime.utcnow() - datetime.timedelta(hours=5)).strftime("%Y-%m-%d %H:%M")
    }
]

class CreateAlertRequest(BaseModel):
    symbol: str
    alert_type: str
    title: str
    message: str
    severity: str = "INFO"

@router.get("")
async def get_alerts():
    """Retrieve all notifications and alert logs"""
    return SYSTEM_ALERTS

@router.post("")
async def create_alert(req: CreateAlertRequest):
    """Creates a new trading or system alert"""
    new_alert = {
        "id": len(SYSTEM_ALERTS) + 1,
        "symbol": req.symbol.upper(),
        "alert_type": req.alert_type,
        "title": req.title,
        "message": req.message,
        "severity": req.severity,
        "is_read": False,
        "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    }
    SYSTEM_ALERTS.insert(0, new_alert)
    return new_alert

@router.post("/read-all")
async def mark_all_as_read():
    """Marks all alerts as read"""
    for a in SYSTEM_ALERTS:
        a["is_read"] = True
    return {"status": "SUCCESS"}
