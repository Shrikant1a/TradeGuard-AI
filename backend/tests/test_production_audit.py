import pytest
import time
import os
from backend.app.services.risk_engine import RiskEngine, RiskCheckRequest
from backend.app.services.paper_trading import PaperTradingService
from backend.app.services.stellar_service import (
    stellar_service,
    canonical_signal_payload,
    hash_canonical_payload
)
from backend.app.services.market_data import MarketDataProvider


@pytest.fixture
def risk_engine():
    return RiskEngine(
        max_risk_per_trade_pct=1.0,
        max_daily_loss_pct=3.0,
        max_portfolio_exposure_pct=40.0,
        max_position_size_pct=15.0,
        max_open_positions=5,
        require_stop_loss=True,
        require_take_profit=True
    )


@pytest.fixture
def paper_service():
    return PaperTradingService(initial_capital=1000000.0)


# =========================================================================
# 1. RISK ENGINE AUDIT TESTS
# =========================================================================

def test_risk_blocks_missing_stop_loss(risk_engine):
    req = RiskCheckRequest(
        symbol="AAPL",
        side="BUY",
        quantity=10,
        entry_price=200.0,
        stop_loss=None, # Missing mandatory stop loss
        take_profit=230.0,
        portfolio_equity=1000000.0
    )
    res = risk_engine.evaluate_order(req)
    assert res.allowed is False
    assert res.status == "BLOCKED"
    assert any("stop-loss" in r.lower() or "stop loss" in r.lower() for r in res.reasons)


def test_risk_blocks_excessive_risk_pct(risk_engine):
    # Capital is 1,000,000. 1% max risk = 10,000.
    # Entry 200, Stop Loss 150 -> Risk per share = 50.
    # Quantity 300 -> Total risk = 15,000 (1.5% of capital) -> Exceeds 1%!
    req = RiskCheckRequest(
        symbol="AAPL",
        side="BUY",
        quantity=300,
        entry_price=200.0,
        stop_loss=150.0,
        take_profit=250.0,
        portfolio_equity=1000000.0
    )
    res = risk_engine.evaluate_order(req)
    assert res.allowed is False
    assert res.status == "BLOCKED"
    assert any("risk" in r.lower() for r in res.reasons)


def test_risk_blocks_excessive_exposure(risk_engine):
    # Max exposure 40% = 400,000.
    # Current exposure: 350,000. New order value: 100,000. Total = 450,000 (45%) -> Exceeds 40%!
    req = RiskCheckRequest(
        symbol="AAPL",
        side="BUY",
        quantity=500,
        entry_price=200.0,
        stop_loss=198.0,
        take_profit=220.0,
        portfolio_equity=1000000.0,
        current_portfolio_exposure_value=350000.0
    )
    res = risk_engine.evaluate_order(req)
    assert res.allowed is False
    assert res.status == "BLOCKED"
    assert any("exposure" in r.lower() for r in res.reasons)


def test_risk_blocks_single_position_allocation_exceeding_15_pct(risk_engine):
    # Max single position size: 15% of 1,000,000 = 150,000.
    # Order value: 1000 shares * 200.0 = 200,000 (20%) -> Exceeds 15%!
    req = RiskCheckRequest(
        symbol="AAPL",
        side="BUY",
        quantity=1000,
        entry_price=200.0,
        stop_loss=198.0,
        take_profit=220.0,
        portfolio_equity=1000000.0
    )
    res = risk_engine.evaluate_order(req)
    assert res.allowed is False
    assert res.status == "BLOCKED"
    assert any("position" in r.lower() or "allocation" in r.lower() for r in res.reasons)


def test_risk_blocks_more_than_max_positions(risk_engine):
    # 5 positions already open
    req = RiskCheckRequest(
        symbol="NEW_SYM",
        side="BUY",
        quantity=10,
        entry_price=100.0,
        stop_loss=98.0,
        take_profit=110.0,
        portfolio_equity=1000000.0,
        existing_open_positions_count=5
    )
    res = risk_engine.evaluate_order(req)
    assert res.allowed is False
    assert res.status == "BLOCKED"
    assert any("position" in r.lower() for r in res.reasons)


def test_risk_blocks_daily_loss_circuit_breaker(risk_engine):
    # Daily loss > 3% = 3.5%
    req = RiskCheckRequest(
        symbol="AAPL",
        side="BUY",
        quantity=10,
        entry_price=150.0,
        stop_loss=148.0,
        take_profit=160.0,
        portfolio_equity=1000000.0,
        daily_realized_loss_pct=3.5
    )
    res = risk_engine.evaluate_order(req)
    assert res.allowed is False
    assert res.status == "BLOCKED"
    assert any("daily" in r.lower() or "circuit breaker" in r.lower() for r in res.reasons)


# =========================================================================
# 2. PAPER TRADING AUDIT TESTS
# =========================================================================

@pytest.mark.asyncio
async def test_paper_trading_invalid_quantities(paper_service):
    # Reject 0 or negative quantities
    res_zero = await paper_service.execute_trade("AAPL", "BUY", 0, 150.0)
    assert res_zero["status"] == "REJECTED"

    res_neg = await paper_service.execute_trade("AAPL", "BUY", -5, 150.0)
    assert res_neg["status"] == "REJECTED"


@pytest.mark.asyncio
async def test_paper_trading_sell_nonexistent_position(paper_service):
    # Clear seeded positions to test selling nonexistent position
    paper_service.positions.clear()
    res = await paper_service.execute_trade("TSLA", "SELL", 10, 120.0)
    assert res["status"] == "REJECTED"
    assert "no active open position" in res["message"].lower()


@pytest.mark.asyncio
async def test_paper_trading_sell_more_than_owned(paper_service):
    # Set known position of 20 shares of TSLA
    paper_service.positions["TSLA"] = {
        "symbol": "TSLA",
        "side": "LONG",
        "quantity": 20.0,
        "average_entry": 200.0,
        "current_price": 200.0,
        "market_value": 4000.0,
        "unrealized_pnl": 0.0
    }

    # Try selling 30 shares
    sell_res = await paper_service.execute_trade("TSLA", "SELL", 30, 210.0)
    assert sell_res["status"] == "REJECTED"
    assert "only hold" in sell_res["message"].lower() or "insufficient" in sell_res["message"].lower()


@pytest.mark.asyncio
async def test_paper_trading_full_lifecycle_and_pnl(paper_service):
    paper_service.positions.clear()
    paper_service.virtual_balance = 1000000.0
    initial_cash = paper_service.virtual_balance

    # 1. Buy 50 shares of AAPL at $100 -> Cost = 5000 (SL=95, TP=120)
    buy_res = await paper_service.execute_trade("AAPL", "BUY", 50, 100.0, stop_loss=95.0, take_profit=120.0)
    assert buy_res["status"] == "EXECUTED"
    assert paper_service.virtual_balance == initial_cash - 5000.0
    assert "AAPL" in paper_service.positions
    assert paper_service.positions["AAPL"]["quantity"] == 50

    # 2. Sell 50 shares of AAPL at $120 -> Revenue = 6000, Realized PnL = +1000
    sell_res = await paper_service.execute_trade("AAPL", "SELL", 50, 120.0)
    assert sell_res["status"] == "EXECUTED"
    assert sell_res["realized_pnl"] == 1000.0
    assert paper_service.virtual_balance == initial_cash + 1000.0
    assert "AAPL" not in paper_service.positions  # Fully closed


# =========================================================================
# 3. CANONICAL SIGNAL HASH DETERMINISM
# =========================================================================

def test_canonical_signal_hash_determinism():
    payload1 = canonical_signal_payload(
        signal_id="TG-DET-001",
        symbol="AAPL",
        signal="BUY",
        confidence=78.4,
        model="GradientBoosting",
        timestamp=1728000000,
        price=150.25
    )
    payload2 = canonical_signal_payload(
        signal_id="TG-DET-001",
        symbol="AAPL",
        signal="BUY",
        confidence=78.4,
        model="GradientBoosting",
        timestamp=1728000000,
        price=150.25
    )

    hash1 = hash_canonical_payload(payload1)
    hash2 = hash_canonical_payload(payload2)

    assert hash1 == hash2
    assert len(hash1) == 64


# =========================================================================
# 4. MARKET DATA PROVENANCE AND TRANSPARENCY
# =========================================================================

@pytest.mark.asyncio
async def test_market_data_transparency_and_metadata():
    provider = MarketDataProvider.get_instance()
    df, meta = await provider.get_historical_bars("AAPL", period="1mo", with_meta=True)

    assert not df.empty
    assert "provider" in meta
    assert meta["provider"] in ["Yahoo Finance", "Synthetic Fallback"]
    assert "is_live" in meta
    assert isinstance(meta["is_live"], bool)
    assert "is_stale" in meta
    assert "timestamp" in meta


# =========================================================================
# 5. AUTHENTICATION (MOBILE & WEB)
# =========================================================================

@pytest.mark.asyncio
async def test_auth_register_and_token_flow():
    from httpx import AsyncClient, ASGITransport
    from backend.app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        test_user = f"trader_{int(time.time()) % 100000}"
        test_email = f"{test_user}@tradeguard.ai"
        test_pass = "SecurePass123!"

        # 1. Register new user
        reg_res = await client.post("/api/auth/register", json={
            "username": test_user,
            "email": test_email,
            "password": test_pass
        })
        assert reg_res.status_code == 201
        data = reg_res.json()
        assert data["username"] == test_user
        assert data["email"] == test_email
        assert "user_id" in data

        # 2. Login via OAuth2 Form data for access token
        token_res = await client.post("/api/auth/token", data={
            "username": test_user,
            "password": test_pass
        })
        assert token_res.status_code == 200
        token_data = token_res.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
        assert token_data["username"] == test_user

        # 3. Access authenticated profile
        me_res = await client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {token_data['access_token']}"
        })
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["authenticated"] is True
        assert me_data["username"] == test_user
