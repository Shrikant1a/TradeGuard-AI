"use client";

import React from "react";

interface TradeGuardIconProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function TradeGuardIcon({ size = 36, className = "", glow = true }: TradeGuardIconProps) {
  const filterId = React.useId();
  const grad1Id = React.useId();
  const grad2Id = React.useId();
  const grad3Id = React.useId();

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl bg-cyan-500/30 blur-md -z-10 animate-pulse"
          style={{ transform: "scale(1.15)" }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(6,182,212,0.35)]"
      >
        <defs>
          {/* Cyberpunk Shield Gradient */}
          <linearGradient id={grad1Id} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          {/* Internal Core Gradient */}
          <linearGradient id={grad2Id} x1="24" y1="10" x2="24" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Golden/Emerald Alpha Bull Pulse */}
          <linearGradient id={grad3Id} x1="14" y1="34" x2="34" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <filter id={filterId} x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hex-Shield Protection Crest */}
        <path
          d="M24 4L39 10.5V23C39 31.8 32.6 39.8 24 44C15.4 39.8 9 31.8 9 23V10.5L24 4Z"
          fill="#0a1124"
          stroke={`url(#${grad1Id})`}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Inner Shield Contour Line */}
        <path
          d="M24 8L35.5 13V22.5C35.5 29.5 30.5 35.8 24 39.2C17.5 35.8 12.5 29.5 12.5 22.5V13L24 8Z"
          fill="none"
          stroke={`url(#${grad1Id})`}
          strokeWidth="0.8"
          strokeOpacity="0.4"
          strokeDasharray="2 2"
        />

        {/* Ascending Trading Candlesticks / Growth Vector */}
        {/* Bar 1 (Left low) */}
        <rect x="16" y="25" width="2.5" height="7" rx="1.2" fill="#0ea5e9" fillOpacity="0.8" />
        <line x1="17.25" y1="23" x2="17.25" y2="34" stroke="#0ea5e9" strokeWidth="0.8" strokeLinecap="round" />

        {/* Bar 2 (Mid trend) */}
        <rect x="22.75" y="19" width="2.5" height="11" rx="1.2" fill="#06b6d4" />
        <line x1="24" y1="17" x2="24" y2="32" stroke="#22d3ee" strokeWidth="0.8" strokeLinecap="round" />

        {/* Bar 3 (Right high impulse) */}
        <rect x="29.5" y="15" width="2.5" height="11" rx="1.2" fill="#10b981" />
        <line x1="30.75" y1="13" x2="30.75" y2="28" stroke="#34d399" strokeWidth="0.8" strokeLinecap="round" />

        {/* Bullish Alpha Signal Surge Path */}
        <path
          d="M15 28L22 23L27 25L34 14"
          stroke={`url(#${grad3Id})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* AI Neural Apex / Prediction Star */}
        <circle cx="34" cy="14" r="2.5" fill="#f8fafc" />
        <circle cx="34" cy="14" r="4.2" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.8" />

        {/* Stellar Blockchain Verification Node at Center Base */}
        <polygon
          points="24,31 27,33.5 26,37 24,35 22,37 21,33.5"
          fill="#a855f7"
          fillOpacity="0.9"
        />
      </svg>
    </div>
  );
}

interface TradeGuardLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export function TradeGuardLogo({
  size = "md",
  showText = true,
  subtitle = "Stellar Soroban Verified",
  className = ""
}: TradeGuardLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 48,
  };

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const currentIconSize = iconSizes[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <TradeGuardIcon size={currentIconSize} />
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`${titleSizes[size]} font-black tracking-tight text-white flex items-center gap-1.5`}>
            <span>TRADEGUARD</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono font-black text-xs px-1 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              AI
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
