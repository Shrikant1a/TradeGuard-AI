from fastapi import APIRouter, BackgroundTasks, Query, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import logging

from backend.app.services.bot_trainer import bot_trainer
from backend.app.services.indian_market_data import indian_market_data_service
from backend.app.services.market_data import MarketDataProvider

logger = logging.getLogger("tradeguard.bot_routes")

router = APIRouter(prefix="/api/bot", tags=["AI Bot Training & Inference"])
market_provider = MarketDataProvider.get_instance()

class TrainBotRequest(BaseModel):
    exchanges: List[str] = Field(default=["NSE", "BSE"], description="Exchanges to fetch and train on (NSE, BSE)")
    period: str = Field(default="2y", description="Historical data lookback period (e.g., '6mo', '1y', '2y')")
    max_stocks_per_exchange: Optional[int] = Field(default=None, description="Optional cap on number of stocks per exchange (e.g., 15 for fast training, None for all)")
    run_in_background: bool = Field(default=False, description="Whether to run training asynchronously in the background")

class PredictRequest(BaseModel):
    symbol: str = Field(..., description="Stock symbol to predict (e.g., 'RELIANCE.NS', 'TCS.BO', 'INFY.NS')")


@router.get("/status")
async def get_bot_status() -> Dict[str, Any]:
    """
    Returns the current status of the TradeGuard Bot:
    - Trained status, active model algorithm, training date, holdout test metrics
    - Real-time training progress state if a training run is currently active
    """
    model_status = bot_trainer.get_model_status()
    training_state = bot_trainer.get_training_state()

    return {
        "bot_status": model_status,
        "current_training_job": training_state
    }


@router.get("/stocks")
async def get_bot_stocks(
    exchange: Optional[str] = Query(None, description="Filter by exchange: 'NSE' or 'BSE'")
) -> Dict[str, Any]:
    """
    Returns the catalog of all supported stocks from the National Stock Exchange (NSE)
    and Bombay Stock Exchange (BSE) available for bot training and inference.
    """
    exchanges = [exchange] if exchange else None
    catalog = indian_market_data_service.get_catalog(exchanges)

    nse_count = sum(1 for s in catalog if s["exchange"] == "NSE")
    bse_count = sum(1 for s in catalog if s["exchange"] == "BSE")

    return {
        "total_stocks": len(catalog),
        "nse_stocks_count": nse_count,
        "bse_stocks_count": bse_count,
        "stocks": catalog
    }


@router.post("/train")
async def train_bot_endpoint(
    req: TrainBotRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Triggers end-to-end bot training on real market data from NSE and BSE:
    1. Ingests OHLCV historical bars across liquid Indian equities
    2. Builds stationary multi-factor technical indicator feature matrix
    3. Executes strict Chronological Walk-Forward validation (Train: 70%, Val: 15%, Holdout: 15%)
    4. Evaluates Gradient Boosting, Random Forest, and Calibrated Logistic Regression
    5. Saves best model artifact for immediate live trading and signal generation
    """
    current_state = bot_trainer.get_training_state()
    if current_state["status"] in ["FETCHING_DATA", "FEATURE_ENGINEERING", "TRAINING_MODELS"]:
        raise HTTPException(
            status_code=409, 
            detail=f"A training job is already active: {current_state['message']}"
        )

    norm_exchanges = [e.upper().strip() for e in req.exchanges]
    for ex in norm_exchanges:
        if ex not in ["NSE", "BSE"]:
            raise HTTPException(status_code=400, detail=f"Unsupported exchange '{ex}'. Must be 'NSE' or 'BSE'.")

    async def _run_training():
        try:
            await bot_trainer.train_bot_on_nse_bse(
                exchanges=norm_exchanges,
                period=req.period,
                max_stocks_per_exchange=req.max_stocks_per_exchange,
                use_cache=True
            )
        except Exception as e:
            logger.error(f"Async training error: {e}")

    if req.run_in_background:
        background_tasks.add_task(_run_training)
        return {
            "status": "ACCEPTED",
            "message": f"Training initiated in background across {', '.join(norm_exchanges)} stocks.",
            "period": req.period,
            "check_status_url": "/api/bot/status"
        }
    else:
        # Run synchronously and return complete metrics
        result = await bot_trainer.train_bot_on_nse_bse(
            exchanges=norm_exchanges,
            period=req.period,
            max_stocks_per_exchange=req.max_stocks_per_exchange,
            use_cache=True
        )
        return result


@router.post("/predict")
async def predict_with_bot(req: PredictRequest) -> Dict[str, Any]:
    """
    Runs directional inference using the trained bot on any NSE or BSE stock.
    """
    clean_sym = req.symbol.upper().strip()
    # Fetch historical bars
    df = await market_provider.get_historical_bars(clean_sym, period="6mo")
    if df is None or df.empty or len(df) < 15:
        raise HTTPException(status_code=400, detail=f"Insufficient market data history to predict for {clean_sym}")

    prediction = bot_trainer.predict(df)
    if not prediction:
        raise HTTPException(
            status_code=400, 
            detail="Trained bot model not loaded. Please train the bot first via POST /api/bot/train"
        )

    probs = prediction["probabilities"]
    p_bull = probs["bullish"]
    p_neut = probs["neutral"]
    p_bear = probs["bearish"]

    if p_bull >= 55.0 and p_bull > p_bear * 1.5:
        decision = "BUY"
        conf = min(round(p_bull * 1.12, 1), 84.0)
    elif p_bear >= 55.0 and p_bear > p_bull * 1.5:
        decision = "SELL"
        conf = min(round(p_bear * 1.12, 1), 82.0)
    else:
        decision = "HOLD"
        conf = min(round(max(p_neut, 52.0), 1), 84.0)

    last_close = float(df.iloc[-1]["close"])

    return {
        "symbol": clean_sym,
        "last_price": last_close,
        "decision": decision,
        "confidence": conf,
        "probabilities": probs,
        "model_used": prediction["model_name"],
        "model_version": prediction["model_version"],
        "features": prediction["features"]
    }
