import datetime
import pytest
from zoneinfo import ZoneInfo
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.indian_market_calendar import indian_market_calendar
from backend.app.services.symbol_registry import symbol_registry
from backend.app.services.risk_engine import RiskEngine
from backend.app.services.paper_trading import PaperTradingService

client = TestClient(app)

def test_indian_market_calendar_session_hours():
    """Verify Indian market hours: 09:15 to 15:30 IST regular session."""
    ist = ZoneInfo("Asia/Kolkata")
    
    # Tuesday at 10:30 AM IST (Trading day, regular session)
    dt_open = datetime.datetime(2026, 10, 6, 10, 30, tzinfo=ist)
    assert indian_market_calendar.is_market_open(dt_open) is True
    session_info = indian_market_calendar.get_market_status(dt_open)
    assert session_info["status"] == "OPEN"
    assert session_info["is_open"] is True

    # Tuesday at 09:05 AM IST (Pre-market)
    dt_pre = datetime.datetime(2026, 10, 6, 9, 5, tzinfo=ist)
    assert indian_market_calendar.is_market_open(dt_pre) is False
    status_pre = indian_market_calendar.get_market_status(dt_pre)
    assert status_pre["status"] == "PRE-MARKET"
    assert status_pre["is_open"] is False

    # Tuesday at 16:30 IST (After hours / Closed)
    dt_post = datetime.datetime(2026, 10, 6, 16, 30, tzinfo=ist)
    assert indian_market_calendar.is_market_open(dt_post) is False
    status_post = indian_market_calendar.get_market_status(dt_post)
    assert status_post["status"] == "CLOSED"
    assert status_post["is_open"] is False

def test_indian_market_calendar_weekend_and_holidays():
    """Verify Saturday/Sunday and statutory Indian exchange holidays are recognized as closed."""
    ist = ZoneInfo("Asia/Kolkata")
    
    # Saturday at 11:00 AM IST
    dt_sat = datetime.datetime(2026, 10, 10, 11, 0, tzinfo=ist)
    assert indian_market_calendar.is_trading_day(dt_sat) is False
    status_sat = indian_market_calendar.get_market_status(dt_sat)
    assert status_sat["is_open"] is False
    assert status_sat["status"] == "CLOSED"

    # Republic Day holiday: 2026-01-26
    dt_holiday = datetime.datetime(2026, 1, 26, 11, 0, tzinfo=ist)
    assert indian_market_calendar.is_trading_day(dt_holiday) is False
    status_hol = indian_market_calendar.get_market_status(dt_holiday)
    assert status_hol["is_open"] is False
    assert status_hol["status"] == "CLOSED"
    assert "Republic Day" in status_hol["message"]

def test_symbol_registry_resolution():
    """Verify symbol mapping for Indian equities and indices."""
    # NSE default equity
    rel_nse = symbol_registry.resolve("RELIANCE", "NSE")
    assert rel_nse is not None
    assert rel_nse["exchange"] == "NSE"
    assert rel_nse["provider_symbol"] == "RELIANCE.NS"
    assert rel_nse["currency"] == "INR"
    assert rel_nse["currency_symbol"] == "₹"

    # BSE equity mapping
    rel_bse = symbol_registry.resolve("RELIANCE", "BSE")
    assert rel_bse is not None
    assert rel_bse["exchange"] == "BSE"
    assert rel_bse["provider_symbol"] == "RELIANCE.BO"

    # Benchmark indices
    nifty = symbol_registry.resolve("NIFTY 50")
    assert nifty is not None
    assert nifty["provider_symbol"] == "^NSEI"
    assert nifty["exchange"] == "NSE"

    sensex = symbol_registry.resolve("SENSEX")
    assert sensex is not None
    assert sensex["provider_symbol"] == "^BSESN"
    assert sensex["exchange"] == "BSE"

def test_symbol_registry_search():
    """Verify search returns normalized Indian equities by name or ticker."""
    results = symbol_registry.search("reliance")
    assert len(results) >= 1
    assert any(r["symbol"] == "RELIANCE" for r in results)

    tcs_results = symbol_registry.search("tata")
    assert any(r["symbol"] in ["TCS", "TATAMOTORS", "TATASTEEL"] for r in tcs_results)

    hdfc_results = symbol_registry.search("HDFC")
    assert any(r["symbol"] == "HDFCBANK" for r in hdfc_results)

def test_market_data_status_endpoint():
    """Verify /api/market-data/status returns Indian market session and IST metadata."""
    res = client.get("/api/market-data/status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "is_open" in data
    assert "ist_time" in data
    assert "trading_hours" in data
    assert "09:15 - 15:30 IST" in data["trading_hours"]

def test_market_data_indices_endpoint():
    """Verify /api/market-data/indices returns NIFTY 50 and SENSEX with INR currency."""
    res = client.get("/api/market-data/indices")
    assert res.status_code == 200
    indices = res.json()
    assert len(indices) >= 2
    symbols = [idx["symbol"] for idx in indices]
    assert "NIFTY 50" in symbols
    assert "SENSEX" in symbols
    for item in indices:
        assert item["currency"] == "INR"
        assert item["currency_symbol"] == "₹"

def test_inr_risk_calculation_gatekeeper():
    """Verify RiskEngine enforces 1% per-trade risk in INR on virtual ₹10,00,000 capital."""
    risk_engine = RiskEngine()
    portfolio_equity = 1000000.0  # ₹10,00,000
    max_risk_allowed = portfolio_equity * 0.01  # ₹10,000

    # Order 1: RELIANCE buy 10 shares @ ₹2,850.50, Stop loss ₹2,800.00
    # Risk per share = ₹50.50 * 10 = ₹505.00 <= ₹10,000 -> APPROVED
    decision_pass = risk_engine.evaluate_order(
        symbol="RELIANCE",
        side="BUY",
        quantity=10,
        price=2850.50,
        stop_loss=2800.00,
        take_profit=2950.00,
        account_balance=portfolio_equity,
        active_positions=[]
    )
    assert decision_pass.allowed is True

    # Order 2: High leverage / excessive stop distance:
    # 500 shares @ ₹2,850.50, Stop loss ₹2,800.00 -> Risk = 500 * ₹50.50 = ₹25,250 > ₹10,000 -> BLOCKED
    decision_fail = risk_engine.evaluate_order(
        symbol="RELIANCE",
        side="BUY",
        quantity=500,
        price=2850.50,
        stop_loss=2800.00,
        take_profit=3000.00,
        account_balance=portfolio_equity,
        active_positions=[]
    )
    assert decision_fail.allowed is False
    assert any("risk" in r.lower() or "exposure" in r.lower() for r in decision_fail.reasons)

def test_paper_trading_inr_portfolio_baseline():
    """Verify PaperTradingService defaults to INR and Indian equity baseline positions."""
    service = PaperTradingService()
    portfolio = service.get_portfolio()
    assert portfolio["currency"] == "INR"
    assert portfolio["currency_symbol"] == "₹"
    assert portfolio["total_equity"] >= 1000000.0
    symbols = [p["symbol"] for p in portfolio["positions"]]
    assert any(s in ["RELIANCE", "TCS", "INFY"] for s in symbols)
