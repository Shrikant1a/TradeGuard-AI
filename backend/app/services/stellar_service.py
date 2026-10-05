import asyncio
import datetime
import hashlib
import json
import logging
import time
from typing import Any, Dict, List, Optional

from backend.app.config import settings

logger = logging.getLogger("tradeguard.stellar")


def canonical_signal_payload(
    signal_id: str,
    symbol: str,
    signal: str,
    confidence: float,
    model: str,
    timestamp: int,
    price: float,
) -> Dict[str, Any]:
    """
    Deterministic canonical serialization for AI trading signals.
    Guarantees that identical signal inputs yield identical byte representations
    and SHA-256 hashes across all components (AI engine, storage, Soroban, frontend).
    """
    return {
        "confidence": round(float(confidence), 1),
        "model": str(model),
        "price": round(float(price), 2),
        "signal": str(signal).upper(),
        "signal_id": str(signal_id),
        "symbol": str(symbol).upper(),
        "timestamp": int(timestamp),
    }


def hash_canonical_payload(payload: Dict[str, Any]) -> str:
    """Computes SHA-256 hex digest of canonically sorted JSON payload."""
    serialized = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(serialized).hexdigest()


class StellarSorobanService:
    """
    TradeGuard Stellar Soroban Service:
    - Performs canonical deterministic SHA-256 hashing of AI Signals and Risk Decisions.
    - Interacts directly with deployed Soroban Smart Contract 'TradeGuardAudit' on Stellar Testnet.
    - Submits genuine signed transactions when STELLAR_SECRET_KEY is configured.
    - Polls Stellar RPC for real transaction status and real ledger sequence numbers.
    - NEVER generates fake transaction hashes or fake simulated ledger sequences.
    - Performs read-only contract verification using official stellar_sdk.
    - Persists audit trail to database for cross-restart resilience.
    """

    def __init__(self):
        self.rpc_url = settings.STELLAR_RPC_URL
        self.contract_id = settings.STELLAR_CONTRACT_ID
        self.network = settings.STELLAR_NETWORK.upper()
        self.network_passphrase = getattr(
            settings, "STELLAR_NETWORK_PASSPHRASE", "Test SDF Network ; September 2015"
        )
        self.secret_key = settings.STELLAR_SECRET_KEY
        self._audit_ledger: Dict[str, Dict[str, Any]] = {}
        self._sdk_available = False
        self._server = None

        self._init_sdk()

    def _init_sdk(self):
        """Initializes Stellar Soroban Server client from stellar_sdk."""
        try:
            from stellar_sdk import SorobanServer
            self._server = SorobanServer(self.rpc_url)
            self._sdk_available = True
            logger.info(
                f"StellarSorobanService initialized: RPC={self.rpc_url}, Contract={self.contract_id}, Network={self.network}"
            )
        except Exception as e:
            self._sdk_available = False
            logger.warning(f"Failed to initialize stellar_sdk SorobanServer: {e}")

    def generate_sha256(self, payload: Any) -> str:
        """Standardized SHA-256 hash calculation with sorted deterministic keys."""
        if isinstance(payload, str):
            data_bytes = payload.encode("utf-8")
        elif isinstance(payload, dict):
            data_bytes = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
        else:
            data_bytes = str(payload).encode("utf-8")
        return hashlib.sha256(data_bytes).hexdigest()

    async def get_latest_ledger_sequence(self) -> Optional[int]:
        """Queries the actual latest ledger sequence from Stellar Soroban RPC."""
        if not self._sdk_available or not self._server:
            return None
        try:
            def _fetch():
                resp = self._server.get_latest_ledger()
                return getattr(resp, "sequence", None)
            return await asyncio.to_thread(_fetch)
        except Exception as e:
            logger.warning(f"Failed to fetch latest ledger sequence from Stellar RPC: {e}")
            return None

    async def get_total_records(self) -> int:
        """Reads total count of audited signals directly from Soroban contract."""
        if not self._sdk_available or not self._server:
            return len(self._audit_ledger)

        try:
            def _call():
                from stellar_sdk import (
                    stellar_xdr, scval, Address, InvokeHostFunction,
                    Keypair, TransactionBuilder, Account
                )
                dummy_account = Account(Keypair.random().public_key, sequence=1)
                invoke_args = stellar_xdr.InvokeContractArgs(
                    contract_address=Address(self.contract_id).to_xdr_sc_address(),
                    function_name=stellar_xdr.SCSymbol(b"get_total_records"),
                    args=[]
                )
                hf = stellar_xdr.HostFunction(
                    type=stellar_xdr.HostFunctionType.HOST_FUNCTION_TYPE_INVOKE_CONTRACT,
                    invoke_contract=invoke_args
                )
                op = InvokeHostFunction(host_function=hf)
                tx = (
                    TransactionBuilder(dummy_account, network_passphrase=self.network_passphrase, base_fee=100)
                    .append_operation(op)
                    .set_timeout(30)
                    .build()
                )
                sim = self._server.simulate_transaction(tx)
                if sim.results and sim.results[0].xdr:
                    return int(scval.to_native(stellar_xdr.SCVal.from_xdr(sim.results[0].xdr)))
                return 0

            return await asyncio.to_thread(_call)
        except Exception as e:
            logger.warning(f"Error querying get_total_records from Soroban contract: {e}")
            return len(self._audit_ledger)

    async def get_signal_from_contract(self, signal_id: str) -> Optional[Dict[str, Any]]:
        """Reads a SignalRecord struct directly from Soroban smart contract persistent storage."""
        if not self._sdk_available or not self._server:
            return None

        try:
            def _call():
                from stellar_sdk import (
                    stellar_xdr, scval, Address, InvokeHostFunction,
                    Keypair, TransactionBuilder, Account
                )
                dummy_account = Account(Keypair.random().public_key, sequence=1)
                invoke_args = stellar_xdr.InvokeContractArgs(
                    contract_address=Address(self.contract_id).to_xdr_sc_address(),
                    function_name=stellar_xdr.SCSymbol(b"get_signal"),
                    args=[scval.to_string(signal_id)]
                )
                hf = stellar_xdr.HostFunction(
                    type=stellar_xdr.HostFunctionType.HOST_FUNCTION_TYPE_INVOKE_CONTRACT,
                    invoke_contract=invoke_args
                )
                op = InvokeHostFunction(host_function=hf)
                tx = (
                    TransactionBuilder(dummy_account, network_passphrase=self.network_passphrase, base_fee=100)
                    .append_operation(op)
                    .set_timeout(30)
                    .build()
                )
                sim = self._server.simulate_transaction(tx)
                if sim.results and sim.results[0].xdr:
                    val = scval.to_native(stellar_xdr.SCVal.from_xdr(sim.results[0].xdr))
                    if isinstance(val, dict):
                        return val
                return None

            return await asyncio.to_thread(_call)
        except Exception as e:
            logger.warning(f"Error querying get_signal({signal_id}) from Soroban contract: {e}")
            return None

    async def record_signal_on_chain(
        self,
        signal_code: str,
        asset_symbol: str,
        signal_type: str,
        model_version: str,
        strategy_hash: str,
        signal_hash: str,
        risk_level: str,
        user_ref: str = "anon_trader_pool",
        timestamp: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Records the verified signal hash onto Stellar Soroban Smart Contract.
        If STELLAR_SECRET_KEY is configured:
            Submits a real signed transaction to Stellar Testnet, polls for real confirmation,
            and returns the genuine transaction hash and ledger sequence.
        If STELLAR_SECRET_KEY is NOT configured:
            Checks whether this signal is already on-chain. If not, marks status as PENDING
            (with real explanation) and NEVER invents fake transaction hashes or fake ledgers.
        """
        now_ts = timestamp or int(time.time())
        user_ref_hash = self.generate_sha256(user_ref)

        tx_hash: Optional[str] = None
        ledger_seq: Optional[int] = None
        verification_status = "PENDING"
        explorer_url: Optional[str] = None
        submission_error: Optional[str] = None

        # Check if contract already has this record stored
        on_chain_existing = await self.get_signal_from_contract(signal_code)
        if on_chain_existing and on_chain_existing.get("signal_hash") == signal_hash:
            verification_status = "VERIFIED"
            logger.info(f"Signal {signal_code} is already verified on-chain in Soroban storage.")

        # Attempt on-chain invocation if secret key is present and not yet verified
        elif self._sdk_available and self._server and self.secret_key:
            try:
                def _submit_tx():
                    from stellar_sdk import (
                        stellar_xdr, scval, Address, InvokeHostFunction,
                        Keypair, Network, TransactionBuilder, soroban_rpc
                    )
                    kp = Keypair.from_secret(self.secret_key)
                    source_account = self._server.load_account(kp.public_key)

                    args = [
                        scval.to_string(signal_code),
                        scval.to_string(asset_symbol),
                        scval.to_string(signal_type),
                        scval.to_uint64(now_ts),
                        scval.to_string(model_version),
                        scval.to_string(strategy_hash),
                        scval.to_string(signal_hash),
                        scval.to_string(risk_level),
                        scval.to_string(user_ref_hash),
                    ]
                    invoke_args = stellar_xdr.InvokeContractArgs(
                        contract_address=Address(self.contract_id).to_xdr_sc_address(),
                        function_name=stellar_xdr.SCSymbol(b"record_signal"),
                        args=args,
                    )
                    hf = stellar_xdr.HostFunction(
                        type=stellar_xdr.HostFunctionType.HOST_FUNCTION_TYPE_INVOKE_CONTRACT,
                        invoke_contract=invoke_args,
                    )
                    op = InvokeHostFunction(host_function=hf)
                    builder = (
                        TransactionBuilder(
                            source_account=source_account,
                            network_passphrase=self.network_passphrase,
                            base_fee=1000,
                        )
                        .append_operation(op)
                        .set_timeout(300)
                    )
                    tx = builder.build()
                    prepared = self._server.prepare_transaction(tx)
                    prepared.sign(kp)
                    send_resp = self._server.send_transaction(prepared)

                    if send_resp.status == soroban_rpc.SendTransactionStatus.PENDING:
                        poll_resp = self._server.poll_transaction(send_resp.hash)
                        return {
                            "status": "SUCCESS" if poll_resp.status == soroban_rpc.GetTransactionStatus.SUCCESS else str(poll_resp.status),
                            "hash": send_resp.hash,
                            "ledger": getattr(poll_resp, "ledger", None),
                        }
                    elif send_resp.status == soroban_rpc.SendTransactionStatus.DUPLICATE:
                        return {"status": "SUCCESS", "hash": send_resp.hash, "ledger": None}
                    else:
                        return {"status": "FAILED", "hash": send_resp.hash, "error": str(send_resp.error_result_xdr)}

                tx_result = await asyncio.to_thread(_submit_tx)
                if tx_result.get("status") == "SUCCESS":
                    tx_hash = tx_result.get("hash")
                    ledger_seq = tx_result.get("ledger")
                    verification_status = "VERIFIED"
                    explorer_url = f"https://stellar.expert/explorer/{self.network.lower()}/tx/{tx_hash}"
                    logger.info(f"Signal {signal_code} recorded on Stellar Testnet! TX={tx_hash}, Ledger={ledger_seq}")
                else:
                    verification_status = "FAILED"
                    submission_error = str(tx_result.get("error", "Transaction submission rejected"))
                    logger.warning(f"Signal {signal_code} on-chain transaction failed: {submission_error}")

            except Exception as ex:
                verification_status = "FAILED"
                submission_error = str(ex)
                logger.error(f"Error submitting on-chain transaction for {signal_code}: {ex}")

        elif not self.secret_key and verification_status != "VERIFIED":
            verification_status = "PENDING"
            submission_error = "STELLAR_SECRET_KEY not configured. Transaction ready for testnet submission."

        record = {
            "signal_code": signal_code,
            "asset": asset_symbol,
            "signal_type": signal_type,
            "timestamp": now_ts,
            "timestamp_iso": datetime.datetime.utcfromtimestamp(now_ts).isoformat() + "Z",
            "model_version": model_version,
            "strategy_hash": strategy_hash,
            "signal_hash": signal_hash,
            "risk_level": risk_level,
            "user_reference_hash": user_ref_hash,
            "stellar_tx_hash": tx_hash,
            "stellar_contract_id": self.contract_id,
            "stellar_ledger_seq": ledger_seq,
            "network": self.network,
            "verification_status": verification_status,
            "explorer_url": explorer_url,
            "submission_error": submission_error,
            "is_on_chain": verification_status == "VERIFIED",
        }

        # Store in in-memory fast audit ledger
        self._audit_ledger[signal_code] = record
        self._audit_ledger[signal_hash] = record

        # Asynchronously persist to database
        asyncio.create_task(self._persist_to_db(record))

        return record

    async def verify_signal_on_chain(
        self, signal_code: str, provided_signal_hash: str
    ) -> Dict[str, Any]:
        """
        Cryptographic verification:
        Performs real read query on Soroban contract to verify signal authenticity.
        """
        # 1. Query contract directly for immutable ground truth
        on_chain_record = await self.get_signal_from_contract(signal_code)
        local_record = self._audit_ledger.get(signal_code)

        if on_chain_record:
            stored_hash = on_chain_record.get("signal_hash")
            is_match = (stored_hash == provided_signal_hash)
            verification_status = "VERIFIED" if is_match else "TAMPERED_OR_INVALID"
            tx_hash = local_record.get("stellar_tx_hash") if local_record else None
            ledger_seq = local_record.get("stellar_ledger_seq") if local_record else None
            explorer_url = f"https://stellar.expert/explorer/{self.network.lower()}/tx/{tx_hash}" if tx_hash else None

            return {
                "signal_code": signal_code,
                "asset": on_chain_record.get("asset"),
                "signal_type": on_chain_record.get("signal_type"),
                "model_version": on_chain_record.get("model_version"),
                "on_chain_signal_hash": stored_hash,
                "provided_signal_hash": provided_signal_hash,
                "is_verified": is_match,
                "verification_status": verification_status,
                "stellar_tx_hash": tx_hash,
                "stellar_contract_id": self.contract_id,
                "stellar_ledger_seq": ledger_seq,
                "network": self.network,
                "explorer_url": explorer_url,
                "source": "Soroban Contract (On-Chain)",
            }

        # 2. If not found on contract, check local database / cache
        if local_record:
            stored_hash = local_record["signal_hash"]
            is_match = (stored_hash == provided_signal_hash)
            # Local record without on-chain confirmation is NOT claimed as VERIFIED
            status = "VERIFIED" if (is_match and local_record.get("verification_status") == "VERIFIED") else "PENDING"
            if not is_match:
                status = "TAMPERED_OR_INVALID"

            return {
                "signal_code": signal_code,
                "asset": local_record["asset"],
                "signal_type": local_record["signal_type"],
                "model_version": local_record["model_version"],
                "on_chain_signal_hash": stored_hash,
                "provided_signal_hash": provided_signal_hash,
                "is_verified": is_match and status == "VERIFIED",
                "verification_status": status,
                "stellar_tx_hash": local_record.get("stellar_tx_hash"),
                "stellar_contract_id": self.contract_id,
                "stellar_ledger_seq": local_record.get("stellar_ledger_seq"),
                "network": self.network,
                "explorer_url": local_record.get("explorer_url"),
                "source": "Local Audit Store (Awaiting On-Chain Confirmation)",
            }

        return {
            "signal_code": signal_code,
            "is_verified": False,
            "error": "Signal record not found on Stellar Soroban smart contract or audit database.",
            "verification_status": "NOT_FOUND_ON_CHAIN",
        }

    def get_all_records(self) -> List[Dict[str, Any]]:
        """Returns unique audit records sorted by descending timestamp."""
        seen = set()
        records = []
        for rec in self._audit_ledger.values():
            sc = rec["signal_code"]
            if sc not in seen:
                seen.add(sc)
                records.append(rec)
        return sorted(records, key=lambda x: x["timestamp"], reverse=True)

    async def _persist_to_db(self, record: Dict[str, Any]):
        """Persists audit record into database table BlockchainRecord."""
        try:
            from backend.app.db.database import AsyncSessionLocal
            from backend.app.db.models import BlockchainRecord
            from sqlalchemy import select

            async with AsyncSessionLocal() as session:
                q = select(BlockchainRecord).where(BlockchainRecord.signal_code == record["signal_code"])
                existing = (await session.execute(q)).scalar_one_or_none()

                if existing:
                    existing.verification_status = record.get("verification_status", "PENDING")
                    if record.get("stellar_tx_hash"):
                        existing.stellar_tx_hash = record["stellar_tx_hash"]
                    if record.get("stellar_ledger_seq"):
                        existing.stellar_ledger_seq = record["stellar_ledger_seq"]
                    if record.get("explorer_url"):
                        existing.explorer_url = record["explorer_url"]
                else:
                    new_rec = BlockchainRecord(
                        signal_code=record["signal_code"],
                        asset_symbol=record["asset"],
                        signal_type=record["signal_type"],
                        signal_hash=record["signal_hash"],
                        strategy_hash=record["strategy_hash"],
                        user_reference_hash=record["user_reference_hash"],
                        model_version=record["model_version"],
                        risk_level=record["risk_level"],
                        stellar_tx_hash=record.get("stellar_tx_hash"),
                        stellar_contract_id=record["stellar_contract_id"],
                        stellar_ledger_seq=record.get("stellar_ledger_seq"),
                        network=record["network"],
                        verification_status=record.get("verification_status", "PENDING"),
                        explorer_url=record.get("explorer_url"),
                    )
                    session.add(new_rec)
                await session.commit()
        except Exception as e:
            logger.debug(f"DB persistence note: {e}")

    async def load_from_db(self):
        """Loads historical blockchain records from database into memory cache."""
        try:
            from backend.app.db.database import AsyncSessionLocal
            from backend.app.db.models import BlockchainRecord
            from sqlalchemy import select

            async with AsyncSessionLocal() as session:
                q = select(BlockchainRecord).order_by(BlockchainRecord.id.desc()).limit(100)
                res = await session.execute(q)
                rows = res.scalars().all()
                for r in rows:
                    rec = {
                        "signal_code": r.signal_code,
                        "asset": r.asset_symbol,
                        "signal_type": r.signal_type,
                        "timestamp": int(r.verified_at.timestamp()) if r.verified_at else int(time.time()),
                        "timestamp_iso": r.verified_at.isoformat() + "Z" if r.verified_at else "",
                        "model_version": r.model_version,
                        "strategy_hash": r.strategy_hash,
                        "signal_hash": r.signal_hash,
                        "risk_level": r.risk_level,
                        "user_reference_hash": r.user_reference_hash,
                        "stellar_tx_hash": r.stellar_tx_hash,
                        "stellar_contract_id": r.stellar_contract_id,
                        "stellar_ledger_seq": r.stellar_ledger_seq,
                        "network": r.network,
                        "verification_status": r.verification_status,
                        "explorer_url": r.explorer_url,
                        "is_on_chain": r.verification_status == "VERIFIED",
                    }
                    self._audit_ledger[r.signal_code] = rec
                    self._audit_ledger[r.signal_hash] = rec
                logger.info(f"Loaded {len(rows)} persisted blockchain records into audit ledger.")
        except Exception as e:
            logger.warning(f"Could not load blockchain records from DB: {e}")


# Singleton instance
stellar_service = StellarSorobanService()
