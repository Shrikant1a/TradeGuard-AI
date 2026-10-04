#!/usr/bin/env python3
"""
TradeGuard AI - Bot Training Script
Fetches historical stock market data from National Stock Exchange (NSE) & Bombay Stock Exchange (BSE),
engineers stationary multi-factor technical features, conducts Chronological Walk-Forward validation,
compares candidate Machine Learning models, and saves the production bot model artifact.

Usage:
    python scripts/train_bot.py
    python scripts/train_bot.py --exchanges NSE,BSE --period 2y
    python scripts/train_bot.py --exchanges NSE --period 1y --max-stocks 15
"""

import sys
import os
import argparse
import asyncio
import time
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.app.services.bot_trainer import bot_trainer
from backend.app.services.indian_market_data import indian_market_data_service

def print_banner():
    banner = """
========================================================================
   ____ ____    _    ____  _____ ____ _   _    _    ____  ____       _    ___ 
  |_  /|  _ \  / \  |  _ \| ____/ ___| | | |  / \  |  _ \|  _ \     / \  |_ _|
   / / | |_) |/ _ \ | | | |  _|| |  _| | | | / _ \ | |_) | | | |   / _ \  | | 
  / /__|  _ </ ___ \| |_| | |__| |_| | |_| |/ ___ \|  _ <| |_| |  / ___ \ | | 
 /_____|_| \_/_/   \_\____/|_____\____|\___//_/   \_\_| \_\____/  /_/   \_\___|
  TradeGuard AI Multi-Asset Bot Training Pipeline [NSE & BSE Core Universe]
========================================================================
    """
    print(banner)

async def main():
    parser = argparse.ArgumentParser(description="TradeGuard AI Bot Training on NSE & BSE Data")
    parser.add_argument("--exchanges", type=str, default="NSE,BSE", help="Comma-separated exchanges (NSE,BSE)")
    parser.add_argument("--period", type=str, default="2y", help="Historical data period (e.g. 6mo, 1y, 2y)")
    parser.add_argument("--max-stocks", type=int, default=None, help="Maximum stocks per exchange (None for all)")
    parser.add_argument("--no-cache", action="store_true", help="Force fresh download bypassing local CSV cache")

    args = parser.parse_args()
    print_banner()

    exchanges = [e.strip().upper() for e in args.exchanges.split(",") if e.strip()]
    print(f"[*] Target Exchanges: {', '.join(exchanges)}")
    print(f"[*] Lookback Period:  {args.period}")
    print(f"[*] Max Stocks / Ex:  {args.max_stocks or 'All available in catalog'}")
    print(f"[*] Cache Enabled:    {not args.no_cache}")
    print("-" * 72)

    start_time = time.time()
    try:
        print("\n[STEP 1/3] Ingesting & Validating Market Data from NSE & BSE...")
        result = await bot_trainer.train_bot_on_nse_bse(
            exchanges=exchanges,
            period=args.period,
            max_stocks_per_exchange=args.max_stocks,
            use_cache=not args.no_cache
        )

        stats = result["data_summary"]
        eval_metrics = result["model_results"]
        meta = result["metadata"]

        print(f"\n[+] Market Data Summary:")
        print(f"    - Total Stocks Collected:   {stats['total_stocks']} (NSE: {stats['nse_stocks']}, BSE: {stats['bse_stocks']})")
        print(f"    - Total Historical Bars:    {stats['total_historical_bars']}")
        print(f"    - Date Range:               {stats['date_range']['start']} to {stats['date_range']['end']}")
        print(f"    - Total Samples Processed:  {eval_metrics['sample_counts']['total']} rows")
        print(f"      (Train: {eval_metrics['sample_counts']['train']} | Val: {eval_metrics['sample_counts']['validation']} | Test: {eval_metrics['sample_counts']['test']})")

        print("\n[STEP 2/3] Model Architecture Comparison (Validation Set):")
        print("    " + "-" * 62)
        print(f"    {'Algorithm':<22} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
        print("    " + "-" * 62)
        for model_name, m in eval_metrics["comparison"].items():
            is_best = " (WINNER)" if model_name == eval_metrics["selected_model"] else ""
            print(f"    {model_name + is_best:<22} | {m['accuracy']:<10.4f} | {m['precision']:<10.4f} | {m['recall']:<10.4f} | {m['f1']:<10.4f}")
        print("    " + "-" * 62)

        test_m = eval_metrics["holdout_test_metrics"]
        print(f"\n[STEP 3/3] Out-of-Sample Holdout Test Evaluation ({eval_metrics['selected_model']}):")
        print(f"    - Test Accuracy:  {test_m['accuracy'] * 100:.2f}%")
        print(f"    - Test Precision: {test_m['precision'] * 100:.2f}%")
        print(f"    - Test Recall:    {test_m['recall'] * 100:.2f}%")
        print(f"    - Test F1-Score:  {test_m['f1'] * 100:.2f}%")
        print(f"    - Confusion Matrix ([-1 Bear, 0 Neut, 1 Bull]): {test_m['confusion_matrix']}")

        print("\n[+] Top Predictive Feature Importances:")
        for feat, score in list(eval_metrics["feature_importances"].items())[:7]:
            bar = "#" * int(score * 50)
            print(f"    - {feat:<16} : {score:>6.4f} {bar}")

        print(f"\n[+] Production Model Artifact Saved: {result['model_path']}")
        print(f"[+] Total Pipeline Duration: {result['elapsed_seconds']} seconds.")
        print("\n" + "=" * 72)
        print(">>> SUCCESS: TradeGuard Bot is trained on NSE & BSE data and actively serving predictions!")
        print("=" * 72 + "\n")

    except Exception as e:
        print(f"\n[!] Training Pipeline Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
