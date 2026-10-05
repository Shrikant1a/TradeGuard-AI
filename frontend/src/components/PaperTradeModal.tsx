"use client";
import React, { useState, useEffect } from "react";
import { X, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

interface PaperTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  defaultSide?: string;
  defaultPrice?: number;
  currency?: string;
  onTradeExecuted?: () => void;
}

export function PaperTradeModal({
  isOpen,
  onClose,
  defaultSymbol = "RELIANCE",
  defaultSide = "BUY",
  defaultPrice = 2850.50,
  currency = "INR",
  onTradeExecuted
}: PaperTradeModalProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [side, setSide] = useState(defaultSide);
  const [quantity, setQuantity] = useState(10);
  const [price, setPrice] = useState(defaultPrice);
  const [stopLoss, setStopLoss] = useState(round2(defaultPrice * 0.96));
  const [takeProfit, setTakeProfit] = useState(round2(defaultPrice * 1.08));

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riskCheckResult, setRiskCheckResult] = useState<any>(null);
  const [executionMessage, setExecutionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  function round2(num: number) {
    return Math.round(num * 100) / 100;
  }

  useEffect(() => {
    setSymbol(defaultSymbol);
    setSide(defaultSide);
    setPrice(defaultPrice);
    if (defaultSide === "BUY") {
      setStopLoss(round2(defaultPrice * 0.96));
      setTakeProfit(round2(defaultPrice * 1.08));
    } else {
      setStopLoss(round2(defaultPrice * 1.04));
      setTakeProfit(round2(defaultPrice * 0.92));
    }
  }, [defaultSymbol, defaultSide, defaultPrice]);

  // Real-time risk evaluation when parameters change
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setIsEvaluating(true);
        const res = await api.checkRisk({
          symbol,
          side,
          quantity: Number(quantity),
          entry_price: Number(price),
          stop_loss: Number(stopLoss),
          take_profit: Number(takeProfit),
          portfolio_equity: 1000000.0,
          existing_open_positions_count: 2,
          current_portfolio_exposure_value: 320000.0,
          daily_realized_loss_pct: 0.0,
          atr_pct: 2.1
        });
        setRiskCheckResult(res);
      } catch (err) {
        console.error("Risk check error:", err);
      } finally {
        setIsEvaluating(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, symbol, side, quantity, price, stopLoss, takeProfit]);

  if (!isOpen) return null;

  const totalValue = quantity * price;
  const riskAmount = side === "BUY" ? Math.max(0, (price - stopLoss) * quantity) : Math.max(0, (stopLoss - price) * quantity);
  const potentialProfit = side === "BUY" ? Math.max(0, (takeProfit - price) * quantity) : Math.max(0, (price - takeProfit) * quantity);
  const rrRatio = riskAmount > 0 ? (potentialProfit / riskAmount).toFixed(2) : "0.00";

  const handleExecute = async () => {
    try {
      setIsSubmitting(true);
      setExecutionMessage(null);
      const res = await api.createPaperTrade({
        symbol,
        side,
        quantity: Number(quantity),
        price: Number(price),
        stop_loss: Number(stopLoss),
        take_profit: Number(takeProfit)
      });

      if (res.success) {
        setExecutionMessage({
          type: "success",
          text: `Order executed! Stellar Soroban Tx: ${res.trade?.blockchain_tx_hash?.slice(0, 16)}...`
        });
        if (onTradeExecuted) onTradeExecuted();
        setTimeout(() => {
          onClose();
          setExecutionMessage(null);
        }, 1800);
      } else {
        setExecutionMessage({
          type: "error",
          text: res.message || "Trade blocked by risk management policy."
        });
      }
    } catch (err: any) {
      setExecutionMessage({
        type: "error",
        text: err.message || "Failed to execute paper trade"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBlocked = riskCheckResult && !riskCheckResult.allowed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700 bg-[#0d1527] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Pre-Trade Validation Engine</div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Execute Paper Order: <span className="font-mono text-cyan-300">{symbol}</span>
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Order Side Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSide("BUY");
                setStopLoss(round2(price * 0.96));
                setTakeProfit(round2(price * 1.08));
              }}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                side === "BUY" 
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              BUY (Long)
            </button>
            <button
              type="button"
              onClick={() => {
                setSide("SELL");
                setStopLoss(round2(price * 1.04));
                setTakeProfit(round2(price * 0.92));
              }}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                side === "SELL" 
                  ? "bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/20" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              SELL (Short)
            </button>
          </div>

          {/* Inputs Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400">Quantity (Shares / Units)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Limit / Market Price ({getCurrencySymbol(currency)})</label>
              <input
                type="number"
                step="0.05"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Stop Loss & Take Profit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-rose-400 flex items-center justify-between">
                <span>Stop Loss Price ({getCurrencySymbol(currency)})</span>
                <span className="text-[10px] text-slate-500 font-normal">Mandatory</span>
              </label>
              <input
                type="number"
                step="0.05"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-rose-500/40 text-slate-100 font-mono text-sm focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-emerald-400 flex items-center justify-between">
                <span>Take Profit Price ({getCurrencySymbol(currency)})</span>
                <span className="text-[10px] text-slate-500 font-normal">Target</span>
              </label>
              <input
                type="number"
                step="0.05"
                value={takeProfit}
                onChange={(e) => setTakeProfit(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/40 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Trade Impact Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase text-slate-400">Order Value</span>
              <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">{formatCurrency(totalValue, currency)}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase text-rose-400">Max Risk</span>
              <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">{formatCurrency(riskAmount, currency)}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase text-emerald-400">Potential Gain</span>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">{formatCurrency(potentialProfit, currency)}</div>
            </div>
          </div>

          {/* Risk Engine Feedback Box */}
          <div className="p-3.5 rounded-xl border transition-all duration-200">
            {isEvaluating ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                Evaluating pre-trade institutional risk parameters...
              </div>
            ) : isBlocked ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-rose-300 mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  Trade Blocked by Risk-Management Policy
                </div>
                <ul className="list-disc list-inside space-y-1 text-rose-200/90 text-[11px] mt-1.5">
                  {riskCheckResult.blocking_reasons.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
                {riskCheckResult.suggested_adjusted_quantity && (
                  <div className="mt-2 pt-2 border-t border-rose-500/20 text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>Suggested Safe Quantity: <strong className="text-cyan-400 font-mono">{riskCheckResult.suggested_adjusted_quantity}</strong> units</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(riskCheckResult.suggested_adjusted_quantity)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Pre-Trade Risk Clearance Approved
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Risk amount (${riskAmount.toFixed(2)}) is within your 1.0% capital risk limit. Risk/Reward ratio: <span className="font-mono text-emerald-300">{rrRatio}:1</span>.
                </div>
              </div>
            )}
          </div>

          {/* Execution Notification */}
          {executionMessage && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${
              executionMessage.type === "success" 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}>
              {executionMessage.text}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Paper Portfolio Virtual INR: <span className="text-slate-200 font-mono font-bold">₹10,00,000</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isBlocked || isSubmitting}
              onClick={handleExecute}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                isBlocked
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : side === "BUY"
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-lg shadow-rose-500/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Executing & Hashing...
                </>
              ) : isBlocked ? (
                <>Blocked by Risk Policy</>
              ) : (
                <>Confirm Paper {side}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
