import pytest
import pandas as pd
import numpy as np
import datetime
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.technical_analysis import TechnicalAnalysisService
from backend.app.services.ai_engine import AIEngine
from backend.app.services.risk_engine import RiskEngine, RiskCheckRequest
from backend.app.services.backtesting import BacktestingEngine
from backend.app.services.stellar_service import stellar_service
from backend.app.services.paper_trading import paper_trading_service

def create_sample_bars(n=100):
    dates = pd.date_range(end=datetime.datetime.utcnow(), periods=n, freq='D')
    prices = 150.0 + np.cumsum(np.random.normal(0.2, 2.0, n))
    df = pd.DataFrame({
        "timestamp": dates,
        "open": prices - 1.0,
        "high": prices + 2.0,
        "low": prices - 2.0,
        "close": prices,
        "volume": np.random.randint(1000000, 5000000, n)
    })
    return df

def test_technical_indicators_calculation():
    df = create_sample_bars(120)
    data = TechnicalAnalysisService.calculate_indicators(df)
    assert "rsi" in data.columns
    assert "macd" in data.columns
    assert "sma_50" in data.columns
    assert "bollinger_upper" in data.columns
    assert "atr" in data.columns

    metrics = TechnicalAnalysisService.get_latest_metrics(data)
    assert "rsi" in metrics
    assert "trend" in metrics
    assert metrics["trend"] in ["BULLISH", "BEARISH", "NEUTRAL"]

def test_ai_signal_generation_and_probabilities():
    df = create_sample_bars(120)
    ai = AIEngine()
    sig = ai.generate_signal(df, "AAPL")
    
    assert sig["signal_type"] in ["BUY", "HOLD", "SELL"]
    assert "probabilities" in sig
    probs = sig["probabilities"]
    # Total sum is close to 100%
    assert abs((probs["bullish"] + probs["neutral"] + probs["bearish"]) - 100.0) < 1.0
    assert 0 <= sig["confidence"] <= 85.0 # Calibrated to avoid false certainty
    assert sig["risk_score"] in ["LOW", "MEDIUM", "HIGH"]
    assert sig["suggested_entry"] > 0
    assert sig["stop_loss"] > 0
    assert sig["take_profit"] > 0

def test_risk_engine_blocks_excessive_risk():
    risk_engine = RiskEngine(max_risk_per_trade_pct=1.0)
    
    # Capital: ₹10,00,000, 1% max risk = ₹10,000
    # Entry: 200, Stop Loss: 150 (risk per unit: 50)
    # Quantity: 300 units => risk = 15,000 > 10,000 => MUST BLOCK
    req = RiskCheckRequest(
        symbol="AAPL",
        side="BUY",
        quantity=300.0,
        entry_price=200.0,
        stop_loss=150.0,
        take_profit=300.0,
        portfolio_equity=1000000.0
    )
    result = risk_engine.evaluate_order(req)
    assert result.allowed is False
    assert result.status == "BLOCKED"
    assert any("exceeds the max risk limit" in r for r in result.blocking_reasons)

def test_risk_engine_blocks_missing_stop_loss():
    risk_engine = RiskEngine(require_stop_loss=True)
    req = RiskCheckRequest(
        symbol="AAPL",
        side="BUY",
        quantity=10.0,
        entry_price=200.0,
        stop_loss=None, # Missing stop loss
        take_profit=250.0,
        portfolio_equity=1000000.0
    )
    result = risk_engine.evaluate_order(req)
    assert result.allowed is False
    assert any("Mandatory stop-loss rule violated" in r for r in result.blocking_reasons)

def test_risk_engine_blocks_circuit_breaker():
    risk_engine = RiskEngine(circuit_breaker_active=True)
    req = RiskCheckRequest(
        symbol="AAPL",
        side="BUY",
        quantity=5.0,
        entry_price=200.0,
        stop_loss=195.0,
        take_profit=215.0,
        portfolio_equity=1000000.0
    )
    result = risk_engine.evaluate_order(req)
    assert result.allowed is False
    assert any("circuit breaker is currently ACTIVE" in r for r in result.blocking_reasons)

def test_backtesting_simulation():
    df = create_sample_bars(150)
    engine = BacktestingEngine()
    bt = engine.run_backtest(df, "AAPL", initial_capital=1000000.0)
    
    assert "total_return_pct" in bt
    assert "equity_curve" in bt
    assert "max_drawdown_pct" in bt
    assert "sharpe_ratio" in bt
    assert bt["initial_capital"] == 1000000.0
    assert len(bt["equity_curve"]) > 0

@pytest.mark.asyncio
async def test_stellar_soroban_record_and_verify():
    import os, time
    testnet_key = os.getenv("STELLAR_SECRET_KEY", "SCLF6MB4JZNDADKEX2BUDXIMF2AJBB6CMAFAZ77XWZF56OEKTDKVAHOT")
    stellar_service.secret_key = testnet_key
    sig_code = f"TG-TEST-{int(time.time()) % 100000}"
    asset = "AAPL"
    sig_hash = stellar_service.generate_sha256(f"test-signal-payload-{sig_code}")
    
    record = await stellar_service.record_signal_on_chain(
        signal_code=sig_code,
        asset_symbol=asset,
        signal_type="BUY",
        model_version="TradeGuard-v1.2",
        strategy_hash="mock-strat-hash",
        signal_hash=sig_hash,
        risk_level="MEDIUM"
    )
    
    assert record["verification_status"] == "VERIFIED"
    assert record["stellar_tx_hash"] is not None
    assert record["stellar_ledger_seq"] > 5000000

    # Verify matching hash
    verified = await stellar_service.verify_signal_on_chain(sig_code, sig_hash)
    assert verified["is_verified"] is True
    assert verified["verification_status"] == "VERIFIED"

    # Verify tampered hash
    tampered = await stellar_service.verify_signal_on_chain(sig_code, "wrong-hash-000")
    assert tampered["is_verified"] is False
    assert tampered["verification_status"] == "TAMPERED_OR_INVALID"
