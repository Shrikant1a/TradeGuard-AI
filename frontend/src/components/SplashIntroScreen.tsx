"use client";

import React, { useState, useEffect } from "react";
import { TradeGuardIcon } from "./TradeGuardLogo";

interface SplashIntroScreenProps {
  onComplete?: () => void;
  minDuration?: number; // in milliseconds
}

export function SplashIntroScreen({ onComplete, minDuration = 2200 }: SplashIntroScreenProps) {
  const [phase, setPhase] = useState<"logo" | "text" | "ready" | "fadeout">("logo");
  const [statusText, setStatusText] = useState("Initializing TradeGuard AI...");
  const [progress, setProgress] = useState(15);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Phase 1: Logo pulse (0ms)
    const t1 = setTimeout(() => {
      setPhase("text");
      setStatusText("Calibrating Walk-Forward AI Models...");
      setProgress(55);
    }, 600);

    // Phase 2: Text revealed + ledger connection
    const t2 = setTimeout(() => {
      setStatusText("Verifying Stellar Soroban Ledger...");
      setProgress(85);
    }, 1300);

    // Phase 3: Ready state
    const t3 = setTimeout(() => {
      setPhase("ready");
      setStatusText("Terminal Ready • Access Granted");
      setProgress(100);
    }, 1800);

    // Phase 4: Smooth Fadeout transition
    const t4 = setTimeout(() => {
      setPhase("fadeout");
      setTimeout(() => {
        setIsDismissed(true);
        if (onComplete) onComplete();
      }, 700);
    }, minDuration);

    // Timeout safety recovery watchdog (max 3.2s)
    const tWatchdog = setTimeout(() => {
      setPhase("fadeout");
      setTimeout(() => {
        setIsDismissed(true);
        if (onComplete) onComplete();
      }, 300);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tWatchdog);
    };
  }, [minDuration, onComplete]);

  // Keyboard navigation support (Enter, Space, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSkip = () => {
    setPhase("fadeout");
    setTimeout(() => {
      setIsDismissed(true);
      if (onComplete) onComplete();
    }, 300);
  };

  if (isDismissed) return null;

  return (
    <div
      onClick={handleSkip}
      role="dialog"
      aria-label="TradeGuard AI Splash Screen"
      tabIndex={0}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060a14] select-none cursor-pointer transition-all duration-700 ease-out touch-manipulation ${
        phase === "fadeout"
          ? "opacity-0 scale-105 pointer-events-none blur-sm"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background Cyber Ambient Glow & Terminal Grid */}
      <div className="absolute inset-0 terminal-grid opacity-30 pointer-events-none" />
      <div className="absolute w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-cyan-500/10 blur-[100px] sm:blur-[120px] pointer-events-none -top-20 -left-20 animate-pulse" />
      <div className="absolute w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-purple-600/10 blur-[100px] sm:blur-[130px] pointer-events-none -bottom-20 -right-20 animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Center Cinematic Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md w-full">
        {/* Animated Shield Logo Container */}
        <div className="relative mb-6">
          {/* Outward Radiating Wave Rings */}
          <div className="absolute -inset-4 rounded-full border border-cyan-500/30 animate-ping opacity-30 pointer-events-none" />
          <div className="absolute -inset-8 rounded-full border border-purple-500/20 animate-ping opacity-20 pointer-events-none" style={{ animationDelay: "0.5s" }} />
          
          {/* Logo with initial zoom entrance */}
          <div className={`transition-all duration-700 ease-out transform ${
            phase === "logo" 
              ? "scale-90 opacity-70" 
              : "scale-100 opacity-100 drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]"
          }`}>
            <TradeGuardIcon size={84} glow={true} />
          </div>
        </div>

        {/* Animated Brand Typography */}
        <div className={`flex flex-col items-center transition-all duration-700 ease-out ${
          phase === "logo"
            ? "opacity-0 translate-y-4"
            : "opacity-100 translate-y-0"
        }`}>
          <div className="font-logo font-black tracking-[0.18em] text-3xl sm:text-4xl flex items-center justify-center gap-2">
            <span className="animate-logo-shimmer drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              TRADE<span className="text-cyan-400">GUARD</span>
            </span>
            <span className="relative inline-flex items-center justify-center font-mono font-black text-sm px-2 py-0.5 rounded-lg bg-gradient-to-r from-cyan-950/90 to-blue-950/90 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.7)]">
              <span className="absolute inset-0 rounded-lg bg-cyan-400/30 animate-ping opacity-50" />
              AI
            </span>
          </div>

          <p className="mt-2.5 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-slate-400 font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Stellar Soroban Verified Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          </p>
        </div>

        {/* High-Tech Progress & Status Indicator */}
        <div className={`mt-6 sm:mt-8 w-full max-w-xs transition-all duration-500 ${
          phase === "logo" ? "opacity-0" : "opacity-100"
        }`}>
          {/* Glowing Progress Track */}
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Status Text */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 animate-pulse">{statusText}</span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Interactive Enter Platform Control */}
        <button
          id="splash-enter-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 hover:from-cyan-500/40 hover:to-purple-500/40 text-cyan-200 border border-cyan-400/40 text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center gap-2 cursor-pointer"
        >
          <span>Enter Dashboard</span>
          <span className="text-cyan-400">→</span>
        </button>

        {/* Keyboard hint */}
        <div className="mt-3 text-[10px] text-slate-500 tracking-wider font-mono">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Enter</kbd> or tap anywhere
        </div>
      </div>
    </div>
  );
}
