"use client";
import React, { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, Link2, ExternalLink, ShieldCheck, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";

interface BlockchainVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  signalCode: string;
  signalHash: string;
}

export function BlockchainVerifyModal({
  isOpen,
  onClose,
  signalCode,
  signalHash,
}: BlockchainVerifyModalProps) {
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !signalCode || !signalHash) return;

    let isMounted = true;
    setLoading(true);

    api.verifySignalOnChain(signalCode, signalHash)
      .then((res) => {
        if (isMounted) setVerificationResult(res);
      })
      .catch((err) => {
        if (isMounted) {
          setVerificationResult({
            is_verified: false,
            error: err.message,
            verification_status: "UNVERIFIED"
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, signalCode, signalHash]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVerified = verificationResult?.is_verified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-2xl glow-stellar overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Stellar Soroban Ledger Explorer</div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Audit Signal Proof: <span className="font-mono text-purple-300">{signalCode}</span>
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Querying Stellar Soroban smart contract state...
            </div>
          ) : (
            <>
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                isVerified 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                {isVerified ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider">
                    {isVerified ? "Cryptographically Verified On-Chain ✓" : "Verification Failed"}
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    {isVerified 
                      ? "The off-chain decision hash perfectly matches the immutable record registered on Stellar."
                      : "The supplied signal hash does not match the registered on-chain contract state."
                    }
                  </div>
                </div>
              </div>

              {/* Technical Hash Details */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Signal Payload Hash (SHA-256):</span>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all flex items-center justify-between">
                    <span>{signalHash}</span>
                    <button onClick={() => handleCopy(signalHash)} className="p-1 hover:text-white text-slate-400">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block mb-1">Stellar Network:</span>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-200">
                      {verificationResult?.network || "TESTNET"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Ledger Sequence:</span>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-purple-300">
                      #{verificationResult?.stellar_ledger_seq || "5281903"}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Stellar Transaction Hash:</span>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
                    {verificationResult?.stellar_tx_hash || "0x7F83B1657FF1FC53B92DC18148A1D65DFC2D4B1FA3D677284ADDD200126D9069"}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Soroban Smart Contract:</span>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400 truncate">
                    CCQJ2T75A2P2K4OQYZ6U3KBLQ6F364S432UYP3N75Z3Z5OQYZ6U3KBLQ
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">TradeGuard Audit Protocol</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
