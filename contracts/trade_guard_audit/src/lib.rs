#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SignalRecord {
    pub signal_id: String,
    pub asset: String,
    pub signal_type: String,       // BUY / HOLD / SELL
    pub timestamp: u64,
    pub model_version: String,     // e.g. "TradeGuard-v1.2"
    pub strategy_hash: String,     // SHA-256 hash of strategy config & weights
    pub signal_hash: String,       // SHA-256 hash of complete signal payload
    pub risk_level: String,        // LOW / MEDIUM / HIGH
    pub user_reference_hash: String, // Privacy-preserving user ref
    pub is_verified: bool,
}

#[contracttype]
pub enum DataKey {
    Signal(String),
    RecordCount,
    Admin,
}

const COUNT_KEY: Symbol = symbol_short!("COUNT");

#[contract]
pub struct TradeGuardAudit;

#[contractimpl]
impl TradeGuardAudit {
    /// Initialize the audit contract
    pub fn init(env: Env) {
        if !env.storage().instance().has(&COUNT_KEY) {
            env.storage().instance().set(&COUNT_KEY, &0u32);
        }
    }

    /// Record a verified AI trading decision on the Stellar blockchain
    pub fn record_signal(
        env: Env,
        signal_id: String,
        asset: String,
        signal_type: String,
        timestamp: u64,
        model_version: String,
        strategy_hash: String,
        signal_hash: String,
        risk_level: String,
        user_reference_hash: String,
    ) -> bool {
        let key = DataKey::Signal(signal_id.clone());

        let record = SignalRecord {
            signal_id: signal_id.clone(),
            asset,
            signal_type,
            timestamp,
            model_version,
            strategy_hash,
            signal_hash,
            risk_level,
            user_reference_hash,
            is_verified: true,
        };

        // Store record in persistent storage
        env.storage().persistent().set(&key, &record);

        // Increment count
        let count: u32 = env.storage().instance().get(&COUNT_KEY).unwrap_or(0);
        env.storage().instance().set(&COUNT_KEY, &(count + 1));

        true
    }

    /// Retrieve an audit record by signal_id
    pub fn get_signal(env: Env, signal_id: String) -> Option<SignalRecord> {
        let key = DataKey::Signal(signal_id);
        env.storage().persistent().get(&key)
    }

    /// Verify an off-chain signal hash against the immutable on-chain record
    pub fn verify_signal(env: Env, signal_id: String, expected_signal_hash: String) -> bool {
        let key = DataKey::Signal(signal_id);
        if let Some(record) = env.storage().persistent().get::<DataKey, SignalRecord>(&key) {
            record.signal_hash == expected_signal_hash
        } else {
            false
        }
    }

    /// Get total number of blockchain-audited signals
    pub fn get_total_records(env: Env) -> u32 {
        env.storage().instance().get(&COUNT_KEY).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_record_and_verify_signal() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TradeGuardAudit);
        let client = TradeGuardAuditClient::new(&env, &contract_id);

        client.init();

        let sig_id = String::from_str(&env, "TG-1042");
        let asset = String::from_str(&env, "AAPL");
        let sig_type = String::from_str(&env, "BUY");
        let model = String::from_str(&env, "TradeGuard-v1.2");
        let strat_hash = String::from_str(&env, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        let sig_hash = String::from_str(&env, "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");
        let risk = String::from_str(&env, "MEDIUM");
        let user_ref = String::from_str(&env, "usr_anon_9921");

        let recorded = client.record_signal(
            &sig_id,
            &asset,
            &sig_type,
            &1727712000,
            &model,
            &strat_hash,
            &sig_hash,
            &risk,
            &user_ref,
        );

        assert!(recorded);

        let retrieved = client.get_signal(&sig_id).expect("Should find record");
        assert_eq!(retrieved.asset, asset);
        assert_eq!(retrieved.signal_type, sig_type);
        assert!(retrieved.is_verified);

        let is_valid = client.verify_signal(&sig_id, &sig_hash);
        assert!(is_valid);

        let wrong_hash = String::from_str(&env, "0000000000000000000000000000000000000000000000000000000000000000");
        let is_invalid = client.verify_signal(&sig_id, &wrong_hash);
        assert!(!is_invalid);

        assert_eq!(client.get_total_records(), 1);
    }
}
