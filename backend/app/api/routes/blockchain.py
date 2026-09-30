from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from backend.app.services.stellar_service import stellar_service

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain Audit"])

@router.get("/records")
async def list_blockchain_records():
    """Retrieve full immutable audit log of verified signals recorded on Stellar Soroban"""
    records = stellar_service.get_all_records()
    if not records:
        # Seed records for initial presentation
        seeds = [
            ("TG-1042", "AAPL", "BUY", "TradeGuard-v1.2", "MEDIUM"),
            ("TG-1043", "NVDA", "BUY", "TradeGuard-v1.2", "MEDIUM"),
            ("TG-1044", "TSLA", "HOLD", "TradeGuard-v1.2", "HIGH"),
            ("TG-1045", "MSFT", "SELL", "TradeGuard-v1.2", "LOW"),
            ("TG-1046", "BTC-USD", "BUY", "TradeGuard-v1.2", "HIGH"),
        ]
        for sc, sym, sig_type, model, risk in seeds:
            s_hash = stellar_service.generate_sha256(f"{sc}:{sym}:{sig_type}:{model}")
            await stellar_service.record_signal_on_chain(
                signal_code=sc,
                asset_symbol=sym,
                signal_type=sig_type,
                model_version=model,
                strategy_hash=stellar_service.generate_sha256("TradeGuard-MultiFactor-v1.2"),
                signal_hash=s_hash,
                risk_level=risk
            )
        records = stellar_service.get_all_records()

    return {
        "network": stellar_service.network,
        "contract_id": stellar_service.contract_id,
        "total_records": len(records),
        "records": records
    }

@router.get("/verify/{signal_code}")
async def verify_signal_on_chain(
    signal_code: str,
    signal_hash: str = Query(..., description="Expected SHA-256 hash of signal payload")
):
    """
    Cryptographic verification endpoint:
    Compares client or off-chain signal hash against on-chain Stellar Soroban record.
    Returns proof of authenticity and ledger sequence.
    """
    verification = await stellar_service.verify_signal_on_chain(signal_code, signal_hash)
    return verification
