import hashlib
import json
import datetime
from typing import Dict, Any, List, Optional
from backend.app.services.stellar_service import stellar_service

class SignalFusionEngine:
    """
    TradeGuard AI Signal Fusion System:
    Combines quantitative Technical Analysis with Live Financial News Intelligence
    into an auditable combined signal with probabilistic confidence and full factor context.
    """

    @classmethod
    async def fuse_signals(
        self,
        technical_signal: Dict[str, Any],
        news_sentiment: Dict[str, Any],
        recent_articles: List[Dict[str, Any]],
        symbol: str
    ) -> Dict[str, Any]:
        tech_type = technical_signal.get("signal_type", "HOLD")
        tech_conf = float(technical_signal.get("confidence", 60.0))
        base_risk = technical_signal.get("risk_score", "MEDIUM")

        news_score = float(news_sentiment.get("sentiment_score", 0.0))
        dominant_sent = news_sentiment.get("sentiment", "NEUTRAL")

        # Highest impact article
        max_impact = 0.0
        top_news_item = None
        for a in recent_articles:
            imp = float(a.get("impact_score", 0.0))
            if imp > max_impact:
                max_impact = imp
                top_news_item = a

        # Factor Contexts
        technical_factors = []
        news_factors = []
        risk_factors = []

        # Technical factors
        metrics = technical_signal.get("latest_metrics", {})
        if metrics.get("close", 0) > metrics.get("sma_50", 0):
            technical_factors.append(f"+ Price ({metrics.get('close', 0):.2f}) trades comfortably above 50 SMA")
        else:
            technical_factors.append(f"- Price trades beneath 50 SMA resistance ({metrics.get('sma_50', 0):.2f})")

        if metrics.get("macd", 0) > metrics.get("macd_signal", 0):
            technical_factors.append("+ Bullish MACD histogram expansion")
        else:
            technical_factors.append("- MACD remains below signal line")

        if metrics.get("volume_ratio", 1.0) > 1.1:
            technical_factors.append("+ Higher-than-average volume participation")

        # News factors
        if top_news_item:
            title_snip = top_news_item.get("title", "")[:60]
            if news_score > 0.2:
                news_factors.append(f"+ Positive news sentiment ({dominant_sent}): '{title_snip}...'")
                news_factors.append(f"+ Market Impact rated {top_news_item.get('importance', 'HIGH')} ({max_impact:.0f}/100)")
            elif news_score < -0.2:
                news_factors.append(f"- Adverse news headline ({dominant_sent}): '{title_snip}...'")
                news_factors.append(f"- Elevated negative impact score ({max_impact:.0f}/100)")
            else:
                news_factors.append(f"~ Neutral news backdrop with steady market coverage ({news_score:+.2f})")
        else:
            news_factors.append("~ Baseline market headlines without idiosyncratic shocks")

        # Combined scoring logic (70% Technical, 30% News)
        # Convert technical to directional score: BUY = +1, SELL = -1, HOLD = 0
        tech_dir = 1.0 if tech_type == "BUY" else (-1.0 if tech_type == "SELL" else 0.0)
        combined_dir = (tech_dir * 0.65) + (news_score * 0.35)

        # Risk adjustments
        combined_risk = base_risk
        if news_score < -0.3 and max_impact > 75:
            risk_factors.append("- High-impact negative news creates elevated headline volatility risk")
            if combined_risk == "LOW":
                combined_risk = "MEDIUM"
            elif combined_risk == "MEDIUM":
                combined_risk = "HIGH"
        
        if metrics.get("atr_pct", 2.0) > 3.0:
            risk_factors.append(f"- Elevated historical volatility (ATR {metrics.get('atr_pct', 2.0):.1f}%)")

        # Determine final signal
        if combined_dir >= 0.35:
            final_signal = "BUY"
            combined_conf = min(89.0, max(55.0, (tech_conf * 0.7) + ((50 + news_score * 40) * 0.3)))
        elif combined_dir <= -0.35:
            final_signal = "SELL"
            combined_conf = min(89.0, max(55.0, (tech_conf * 0.7) + ((50 + abs(news_score) * 40) * 0.3)))
        else:
            final_signal = "HOLD"
            combined_conf = round(max(52.0, tech_conf * 0.9), 1)

        # Build transparent reasoning
        reasoning = (
            f"Technical indicators are {tech_type.lower()} (confidence: {tech_conf:.1f}%) and recent news sentiment "
            f"is {dominant_sent.lower()} (impact: {max_impact:.0f}/100). "
        )
        if combined_risk == "HIGH":
            reasoning += "However, elevated volatility and headline uncertainty warrant strict capital preservation."
        else:
            reasoning += "Multi-factor convergence provides disciplined probability support."

        # Verification hash including news context
        news_hash_preimage = f"{symbol}:{final_signal}:{combined_conf}:{max_impact}:{news_score}"
        news_event_hash = hashlib.sha256(news_hash_preimage.encode()).hexdigest()

        # Record cryptographic proof on Stellar Soroban if high impact
        stellar_proof = None
        if max_impact >= 75:
            try:
                stellar_proof = await stellar_service.record_signal_on_chain(
                    signal_code=f"TG-NEWS-{abs(hash(news_event_hash)) % 9000 + 1000}",
                    asset_symbol=symbol,
                    signal_type=final_signal,
                    model_version="TradeGuard-NewsIntel-v1.3",
                    strategy_hash=news_event_hash,
                    signal_hash=news_event_hash,
                    risk_level=combined_risk
                )
            except Exception:
                pass

        return {
            "symbol": symbol.upper(),
            "technical_signal": tech_type,
            "technical_confidence": tech_conf,
            "news_sentiment": dominant_sent,
            "news_sentiment_score": news_score,
            "news_impact_score": max_impact,
            "combined_signal": final_signal,
            "combined_confidence": round(combined_conf, 1),
            "combined_risk_level": combined_risk,
            "technical_factors": technical_factors,
            "news_factors": news_factors,
            "risk_factors": risk_factors,
            "reasoning": reasoning,
            "news_event_hash": news_event_hash,
            "blockchain_verified": stellar_proof is not None,
            "blockchain_record": stellar_proof,
            "disclaimer": "Analytical synthesis for research and decision-support. Does not guarantee future returns."
        }
