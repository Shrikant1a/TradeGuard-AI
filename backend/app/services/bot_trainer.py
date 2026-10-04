import os
import json
import time
import logging
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from backend.app.services.technical_analysis import TechnicalAnalysisService
from backend.app.services.indian_market_data import indian_market_data_service, IndianMarketDataService

logger = logging.getLogger("tradeguard.bot_trainer")

FEATURE_COLUMNS = [
    "return_1d",
    "return_5d",
    "volatility_20",
    "vol_ratio",
    "rsi",
    "macd",
    "macd_signal",
    "macd_diff",
    "dist_sma20",
    "dist_sma50",
    "dist_sma200",
    "bb_pos",
    "atr_pct",
    "roc_10"
]

class BotTrainer:
    """
    TradeGuard AI Multi-Asset Bot Training Pipeline:
    - Ingests all stock market data from National Stock Exchange (NSE) and Bombay Stock Exchange (BSE)
    - Builds stationary, multi-factor time-series features
    - Chronological Walk-Forward train/val/test splits to eliminate lookahead bias
    - Compares Gradient Boosting, Random Forest, and Calibrated Logistic Regression
    - Serializes best-performing model artifact and rich performance metrics
    """

    MODEL_VERSION = "TradeGuard-Bot-v2.0-NSE-BSE"

    def __init__(self, models_dir: Optional[str] = None):
        if models_dir is None:
            base_dir = Path(__file__).resolve().parent.parent
            self.models_dir = base_dir / "models"
        else:
            self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        self.model_path = self.models_dir / "tradeguard_bot_model.joblib"
        self.metadata_path = self.models_dir / "model_metadata.json"
        
        self._loaded_model_cache: Optional[Dict[str, Any]] = None

        # Training state for real-time tracking
        self.training_state: Dict[str, Any] = {
            "status": "IDLE", # IDLE, FETCHING_DATA, FEATURE_ENGINEERING, TRAINING_MODELS, COMPLETED, FAILED
            "progress_pct": 0,
            "message": "Bot is ready for training",
            "started_at": None,
            "completed_at": None,
            "last_error": None
        }

    def get_training_state(self) -> Dict[str, Any]:
        """Return the current training progress state."""
        return dict(self.training_state)

    def extract_stock_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates stationary features for machine learning using TechnicalAnalysisService.
        """
        data = TechnicalAnalysisService.calculate_indicators(df)
        close = data["close"]
        sma_20 = close.rolling(window=20).mean().bfill()

        data["return_1d"] = close.pct_change(1)
        data["return_5d"] = close.pct_change(5)
        data["volatility_20"] = data["hist_volatility"] / 100.0
        data["macd_diff"] = data["macd"] - data["macd_signal"]
        data["dist_sma20"] = (close - sma_20) / sma_20.replace(0, 1)
        data["dist_sma50"] = (close - data["sma_50"]) / data["sma_50"].replace(0, 1)
        data["dist_sma200"] = (close - data["sma_200"]) / data["sma_200"].replace(0, 1)
        data["bb_pos"] = data["bb_pct"]

        # Ensure all required features are present
        for col in FEATURE_COLUMNS:
            if col not in data.columns:
                data[col] = 0.0

        return data.dropna(subset=FEATURE_COLUMNS)

    def create_labels(
        self, 
        df: pd.DataFrame, 
        horizon_days: int = 5, 
        threshold: float = 0.015
    ) -> pd.Series:
        """
        Directional classification target:
        1 = BULLISH (future return > +1.5%)
        0 = NEUTRAL (-1.5% <= return <= +1.5%)
        -1 = BEARISH (future return < -1.5%)
        """
        future_return = df["close"].shift(-horizon_days) / df["close"] - 1.0
        labels = pd.Series(0, index=df.index, dtype=int)
        labels[future_return > threshold] = 1
        labels[future_return < -threshold] = -1
        return labels

    def build_pooled_dataset(
        self, 
        stock_dfs: Dict[str, pd.DataFrame], 
        horizon_days: int = 5, 
        threshold: float = 0.015
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Transforms all raw NSE & BSE stock bars into a pooled multi-asset feature dataset.
        """
        x_list: List[pd.DataFrame] = []
        y_list: List[pd.Series] = []

        for symbol, df in stock_dfs.items():
            if df is None or len(df) < 35:
                continue
            feats = self.extract_stock_features(df)
            labels = self.create_labels(feats, horizon_days=horizon_days, threshold=threshold)

            # Drop final horizon rows where target is unknown
            valid_feats = feats.iloc[:-horizon_days].copy()
            valid_labels = labels.iloc[:-horizon_days].copy()

            if len(valid_feats) > 10:
                valid_feats["_symbol"] = symbol
                valid_feats["_date"] = pd.to_datetime(valid_feats["timestamp"]) if "timestamp" in valid_feats.columns else valid_feats.index
                x_list.append(valid_feats)
                y_list.append(valid_labels)

        if not x_list:
            raise ValueError("No valid training samples could be extracted from provided stock datasets.")

        full_x = pd.concat(x_list, ignore_index=True)
        full_y = pd.concat(y_list, ignore_index=True)

        # Chronologically sort by date to guarantee strict walk-forward temporal order
        if "_date" in full_x.columns:
            sort_order = full_x["_date"].argsort()
            full_x = full_x.iloc[sort_order].reset_index(drop=True)
            full_y = full_y.iloc[sort_order].reset_index(drop=True)

        return full_x, full_y

    def train_models_on_dataset(
        self, 
        X_df: pd.DataFrame, 
        y_series: pd.Series
    ) -> Dict[str, Any]:
        """
        Trains and compares multiple candidate algorithms:
        - GradientBoostingClassifier
        - RandomForestClassifier
        - LogisticRegression (L2 regularized)
        Using a strict 70% Train / 15% Validation / 15% Holdout Test split.
        """
        X = X_df[FEATURE_COLUMNS].copy()
        y = y_series.copy()

        n = len(X)
        if n < 60:
            raise ValueError(f"Insufficient total samples for robust walk-forward split (found {n}, minimum 60 required).")

        train_end = int(n * 0.70)
        val_end = int(n * 0.85)

        X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
        X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
        X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)
        X_test_scaled = scaler.transform(X_test)

        candidates = {
            "GradientBoosting": {
                "model": GradientBoostingClassifier(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42),
                "use_scaled": False
            },
            "RandomForest": {
                "model": RandomForestClassifier(n_estimators=120, max_depth=8, min_samples_split=5, random_state=42, n_jobs=-1),
                "use_scaled": False
            },
            "LogisticRegression": {
                "model": LogisticRegression(max_iter=1000, C=1.0, random_state=42),
                "use_scaled": True
            }
        }

        results: Dict[str, Any] = {}
        best_f1 = -1.0
        best_name = "GradientBoosting"
        best_trained_model = None

        for name, cfg in candidates.items():
            model = cfg["model"]
            use_s = cfg["use_scaled"]

            x_tr = X_train_scaled if use_s else X_train
            x_vl = X_val_scaled if use_s else X_val

            model.fit(x_tr, y_train)
            val_preds = model.predict(x_vl)

            acc = float(accuracy_score(y_val, val_preds))
            prec = float(precision_score(y_val, val_preds, average="weighted", zero_division=0))
            rec = float(recall_score(y_val, val_preds, average="weighted", zero_division=0))
            f1 = float(f1_score(y_val, val_preds, average="weighted", zero_division=0))

            results[name] = {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1": round(f1, 4)
            }

            if f1 > best_f1:
                best_f1 = f1
                best_name = name
                best_trained_model = model

        # Evaluate winning model on the completely unseen holdout test set
        use_s_best = candidates[best_name]["use_scaled"]
        x_ts = X_test_scaled if use_s_best else X_test
        test_preds = best_trained_model.predict(x_ts)

        test_acc = float(accuracy_score(y_test, test_preds))
        test_prec = float(precision_score(y_test, test_preds, average="weighted", zero_division=0))
        test_rec = float(recall_score(y_test, test_preds, average="weighted", zero_division=0))
        test_f1 = float(f1_score(y_test, test_preds, average="weighted", zero_division=0))
        cm = confusion_matrix(y_test, test_preds, labels=[-1, 0, 1]).tolist()

        # Compute feature importances
        feature_importances: Dict[str, float] = {}
        if hasattr(best_trained_model, "feature_importances_"):
            for col, imp in zip(FEATURE_COLUMNS, best_trained_model.feature_importances_):
                feature_importances[col] = round(float(imp), 4)
        elif hasattr(best_trained_model, "coef_"):
            mean_abs_coef = np.mean(np.abs(best_trained_model.coef_), axis=0)
            norm_coef = mean_abs_coef / (np.sum(mean_abs_coef) + 1e-9)
            for col, imp in zip(FEATURE_COLUMNS, norm_coef):
                feature_importances[col] = round(float(imp), 4)

        # Sort feature importances descending
        sorted_features = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

        evaluation = {
            "selected_model": best_name,
            "validation_metrics": results[best_name],
            "holdout_test_metrics": {
                "accuracy": round(test_acc, 4),
                "precision": round(test_prec, 4),
                "recall": round(test_rec, 4),
                "f1": round(test_f1, 4),
                "confusion_matrix": cm
            },
            "comparison": results,
            "feature_importances": sorted_features,
            "sample_counts": {
                "total": n,
                "train": len(X_train),
                "validation": len(X_val),
                "test": len(X_test)
            }
        }

        # Save artifacts
        artifact_data = {
            "model": best_trained_model,
            "model_name": best_name,
            "use_scaled": use_s_best,
            "scaler": scaler,
            "feature_columns": FEATURE_COLUMNS,
            "classes": [-1, 0, 1],
            "version": self.MODEL_VERSION,
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        joblib.dump(artifact_data, self.model_path)
        self._loaded_model_cache = artifact_data

        metadata = {
            "model_version": self.MODEL_VERSION,
            "trained_at": datetime.datetime.utcnow().isoformat(),
            "selected_model": best_name,
            "features_count": len(FEATURE_COLUMNS),
            "features": FEATURE_COLUMNS,
            "sample_counts": evaluation["sample_counts"],
            "validation_metrics": results[best_name],
            "holdout_test_metrics": evaluation["holdout_test_metrics"],
            "top_features": list(sorted_features.items())[:6],
            "comparison": results
        }

        with open(self.metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        return {
            "evaluation": evaluation,
            "metadata": metadata,
            "saved_model_path": str(self.model_path),
            "saved_metadata_path": str(self.metadata_path)
        }

    async def train_bot_on_nse_bse(
        self,
        exchanges: List[str] = ["NSE", "BSE"],
        period: str = "2y",
        max_stocks_per_exchange: Optional[int] = None,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Orchestrates full end-to-end data ingestion from NSE and BSE,
        dataset pooling, and machine learning bot training.
        """
        self.training_state = {
            "status": "FETCHING_DATA",
            "progress_pct": 10,
            "message": f"Fetching historical market data from {', '.join(exchanges)}...",
            "started_at": datetime.datetime.utcnow().isoformat(),
            "completed_at": None,
            "last_error": None
        }

        try:
            start_time = time.time()
            # 1. Fetch Universe Data
            dataset = await indian_market_data_service.fetch_universe_dataset(
                exchanges=exchanges,
                period=period,
                max_stocks_per_exchange=max_stocks_per_exchange,
                use_cache=use_cache
            )

            if len(dataset) < 3:
                raise ValueError(f"Insufficient stock data downloaded ({len(dataset)} stocks). Check internet or exchange connections.")

            stats = indian_market_data_service.get_summary_stats(dataset)

            # 2. Feature Engineering
            self.training_state["status"] = "FEATURE_ENGINEERING"
            self.training_state["progress_pct"] = 40
            self.training_state["message"] = f"Engineering technical indicators across {stats['total_stocks']} NSE & BSE assets ({stats['total_historical_bars']} total bars)..."

            X_df, y_series = self.build_pooled_dataset(dataset)

            # 3. Model Training & Comparison
            self.training_state["status"] = "TRAINING_MODELS"
            self.training_state["progress_pct"] = 70
            self.training_state["message"] = f"Training & comparing GradientBoosting, RandomForest, and LogisticRegression on {len(X_df)} samples..."

            training_result = self.train_models_on_dataset(X_df, y_series)
            elapsed_sec = round(time.time() - start_time, 2)

            self.training_state["status"] = "COMPLETED"
            self.training_state["progress_pct"] = 100
            self.training_state["message"] = f"Bot successfully trained on {stats['total_stocks']} NSE & BSE stocks in {elapsed_sec}s!"
            self.training_state["completed_at"] = datetime.datetime.utcnow().isoformat()

            final_output = {
                "success": True,
                "elapsed_seconds": elapsed_sec,
                "data_summary": stats,
                "model_results": training_result["evaluation"],
                "metadata": training_result["metadata"],
                "active_model": training_result["metadata"]["selected_model"],
                "model_path": training_result["saved_model_path"]
            }
            return final_output

        except Exception as e:
            logger.exception("Bot training failed:")
            self.training_state["status"] = "FAILED"
            self.training_state["progress_pct"] = 0
            self.training_state["message"] = f"Training failed: {str(e)}"
            self.training_state["last_error"] = str(e)
            raise

    def load_trained_model(self) -> Optional[Dict[str, Any]]:
        """Load serialized bot model from disk if available."""
        if self._loaded_model_cache is not None:
            return self._loaded_model_cache

        if self.model_path.exists():
            try:
                self._loaded_model_cache = joblib.load(self.model_path)
                return self._loaded_model_cache
            except Exception as e:
                logger.warning(f"Error loading trained model from {self.model_path}: {e}")
        return None

    def get_model_status(self) -> Dict[str, Any]:
        """Returns the status, metrics, and details of the current bot model."""
        if self.metadata_path.exists():
            try:
                with open(self.metadata_path, "r") as f:
                    metadata = json.load(f)
                return {
                    "is_trained": True,
                    "model_version": metadata.get("model_version", self.MODEL_VERSION),
                    "active_model": metadata.get("selected_model", "Unknown"),
                    "trained_at": metadata.get("trained_at"),
                    "validation_f1": metadata.get("validation_metrics", {}).get("f1"),
                    "holdout_test_accuracy": metadata.get("holdout_test_metrics", {}).get("accuracy"),
                    "holdout_test_f1": metadata.get("holdout_test_metrics", {}).get("f1"),
                    "total_samples": metadata.get("sample_counts", {}).get("total"),
                    "top_features": metadata.get("top_features", []),
                    "metadata": metadata
                }
            except Exception:
                pass

        return {
            "is_trained": False,
            "model_version": self.MODEL_VERSION,
            "active_model": "None (Using On-The-Fly Heuristics)",
            "message": "Bot has not been trained on NSE/BSE stock data yet. Trigger training to activate."
        }

    def predict(self, df: pd.DataFrame) -> Optional[Dict[str, Any]]:
        """
        Run inference using the trained global bot model on a stock's historical bars.
        """
        model_artifact = self.load_trained_model()
        if not model_artifact:
            return None

        model = model_artifact["model"]
        scaler = model_artifact.get("scaler")
        use_scaled = model_artifact.get("use_scaled", False)

        feats = self.extract_stock_features(df)
        if feats.empty:
            return None

        current_row = feats.iloc[[-1]][FEATURE_COLUMNS]
        if use_scaled and scaler:
            x_input = scaler.transform(current_row)
        else:
            x_input = current_row

        probs = model.predict_proba(x_input)[0]
        classes = list(model.classes_)

        p_bear = float(probs[classes.index(-1)]) if -1 in classes else 0.0
        p_neut = float(probs[classes.index(0)]) if 0 in classes else 0.0
        p_bull = float(probs[classes.index(1)]) if 1 in classes else 0.0

        total_p = p_bear + p_neut + p_bull
        if total_p > 0:
            p_bear = round((p_bear / total_p) * 100, 1)
            p_neut = round((p_neut / total_p) * 100, 1)
            p_bull = round((p_bull / total_p) * 100, 1)

        return {
            "model_name": model_artifact["model_name"],
            "model_version": model_artifact.get("version", self.MODEL_VERSION),
            "probabilities": {
                "bullish": p_bull,
                "neutral": p_neut,
                "bearish": p_bear
            },
            "features": current_row.to_dict(orient="records")[0]
        }

# Singleton instance
bot_trainer = BotTrainer()
