import pytest
import datetime
import numpy as np
import pandas as pd
from pathlib import Path
from httpx import AsyncClient, ASGITransport

from backend.app.main import app
from backend.app.services.indian_market_data import indian_market_data_service, IndianMarketDataService
from backend.app.services.bot_trainer import bot_trainer, FEATURE_COLUMNS, BotTrainer
from backend.app.services.ai_engine import AIEngine

def generate_mock_stock_df(symbol: str, days: int = 120) -> pd.DataFrame:
    dates = pd.date_range(end=datetime.datetime.utcnow(), periods=days, freq='D')
    seed = abs(hash(symbol)) % (2**31)
    np.random.seed(seed)
    
    price = 1000.0
    records = []
    for dt in dates:
        ret = np.random.normal(0.0005, 0.018)
        price *= (1 + ret)
        spread = price * 0.015
        open_p = price + np.random.uniform(-spread*0.3, spread*0.3)
        high_p = max(open_p, price) + np.random.uniform(0, spread*0.4)
        low_p = min(open_p, price) - np.random.uniform(0, spread*0.4)
        vol = int(np.random.lognormal(13.0, 0.5))
        records.append({
            "timestamp": dt,
            "open": round(open_p, 2),
            "high": round(high_p, 2),
            "low": round(low_p, 2),
            "close": round(price, 2),
            "volume": vol
        })
    return pd.DataFrame(records)

def test_indian_market_data_catalog():
    catalog = indian_market_data_service.get_catalog()
    assert len(catalog) >= 40
    
    nse_stocks = [s for s in catalog if s["exchange"] == "NSE"]
    bse_stocks = [s for s in catalog if s["exchange"] == "BSE"]
    assert len(nse_stocks) >= 20
    assert len(bse_stocks) >= 15
    
    # Check key symbols
    symbols = [s["symbol"] for s in catalog]
    assert "RELIANCE.NS" in symbols
    assert "TCS.NS" in symbols
    assert "TCS.BO" in symbols
    assert "WIPRO.BO" in symbols

def test_feature_engineering_and_labels():
    df = generate_mock_stock_df("RELIANCE.NS", 100)
    feats = bot_trainer.extract_stock_features(df)
    
    for col in FEATURE_COLUMNS:
        assert col in feats.columns
        assert not feats[col].isnull().any()
        
    labels = bot_trainer.create_labels(feats, horizon_days=5)
    assert set(labels.unique()).issubset({-1, 0, 1})
    assert len(labels) == len(feats)

def test_pooled_dataset_and_model_training(tmp_path):
    trainer = BotTrainer(models_dir=str(tmp_path))
    
    # Create mock dataset for 4 Indian stocks (2 NSE, 2 BSE)
    stock_dfs = {
        "RELIANCE.NS": generate_mock_stock_df("RELIANCE.NS", 100),
        "TCS.NS": generate_mock_stock_df("TCS.NS", 100),
        "TCS.BO": generate_mock_stock_df("TCS.BO", 100),
        "WIPRO.BO": generate_mock_stock_df("WIPRO.BO", 100)
    }
    
    X_df, y_series = trainer.build_pooled_dataset(stock_dfs, horizon_days=5)
    assert len(X_df) > 150
    assert len(y_series) == len(X_df)
    
    result = trainer.train_models_on_dataset(X_df, y_series)
    assert "evaluation" in result
    eval_m = result["evaluation"]
    
    assert eval_m["selected_model"] in ["GradientBoosting", "RandomForest", "LogisticRegression"]
    assert "holdout_test_metrics" in eval_m
    assert 0.0 <= eval_m["holdout_test_metrics"]["accuracy"] <= 1.0
    assert len(eval_m["feature_importances"]) == len(FEATURE_COLUMNS)
    
    # Verify model artifact is written
    assert trainer.model_path.exists()
    assert trainer.metadata_path.exists()
    
    # Test loading and inference
    test_df = generate_mock_stock_df("INFY.NS", 60)
    pred = trainer.predict(test_df)
    assert pred is not None
    assert "probabilities" in pred
    probs = pred["probabilities"]
    assert abs(probs["bullish"] + probs["neutral"] + probs["bearish"] - 100.0) < 1.0

def test_ai_engine_integrates_trained_model():
    ai = AIEngine()
    df = generate_mock_stock_df("RELIANCE.NS", 80)
    sig = ai.generate_signal(df, "RELIANCE.NS")
    
    assert sig["signal_type"] in ["BUY", "HOLD", "SELL"]
    assert 0.0 <= sig["confidence"] <= 85.0
    assert "model_name" in sig
    assert "probabilities" in sig

@pytest.mark.asyncio
async def test_bot_api_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Get status
        resp = await client.get("/api/bot/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "bot_status" in data
        assert "current_training_job" in data
        
        # 2. Get stocks
        resp_stocks = await client.get("/api/bot/stocks")
        assert resp_stocks.status_code == 200
        stocks_data = resp_stocks.json()
        assert stocks_data["total_stocks"] >= 40
        assert stocks_data["nse_stocks_count"] > 0
        assert stocks_data["bse_stocks_count"] > 0
        
        # 3. Filter stocks by exchange
        resp_bse = await client.get("/api/bot/stocks?exchange=BSE")
        assert resp_bse.status_code == 200
        bse_data = resp_bse.json()
        assert all(s["exchange"] == "BSE" for s in bse_data["stocks"])
