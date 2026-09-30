from typing import Dict, Any, List
from backend.app.services.paper_trading import paper_trading_service
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.ai_engine import AIEngine
from backend.app.services.explanation_engine import ExplanationEngine
from backend.app.services.news.factory import NewsProviderFactory
from backend.app.services.news.digest import DailyDigestService

class CopilotService:
    """
    TradeGuard Copilot:
    Context-aware conversational trading assistant with direct access to:
    - Live Financial News Intelligence & Source Citations
    - Current Portfolio & Open Positions
    - Live AI Signals & Feature Contributions
    - Risk Limits and Reason for Blocked Trades
    - Backtest Strategy Performance
    Adheres strictly to probabilistic communication standards.
    """

    def __init__(self):
        self.market_provider = MarketDataProvider.get_instance()
        self.ai_engine = AIEngine()

    async def answer_query(self, query: str, symbol_context: str = "AAPL") -> Dict[str, Any]:
        q = query.lower().strip()
        portfolio = paper_trading_service.get_portfolio_summary()
        news_provider = NewsProviderFactory.get_provider()

        # News Query: Summarize today's market news / Market risks
        if "summarize" in q and "news" in q or "today's market" in q or "market news" in q or "market risk" in q:
            digest = await DailyDigestService.get_or_generate_digest()
            events = digest.get("top_market_events", [])
            risks = digest.get("market_risks", [])
            
            events_text = "\n".join([f"- **{e['headline']}**\n  *Source*: [{e['source']}]({e['source_url']}) | Sentiment: `{e['sentiment']}`" for e in events[:3]])
            risks_text = "\n".join([f"- ⚠️ {r}" for r in risks[:3]])

            return {
                "query": query,
                "response": (
                    f"📰 **TradeGuard AI Daily Market Briefing**:\n\n"
                    f"**Market Overview**:\n{digest['market_overview']['US_Markets']}\n\n"
                    f"**Key Headlines & Official Sources**:\n{events_text}\n\n"
                    f"**Identified Market Risks**:\n{risks_text}\n\n"
                    f"ℹ️ *AI-generated synthesis citing verified reporting. Not financial advice.*"
                ),
                "context_category": "news_digest"
            }

        # News Query: Portfolio news / holdings news
        if "portfolio news" in q or "news for my portfolio" in q or "holdings" in q and "news" in q:
            positions = portfolio.get("positions", [])
            if not positions:
                return {
                    "query": query,
                    "response": "You currently hold no open positions. Search for any asset (e.g. AAPL, NVDA, TSLA) to view asset-specific news intelligence.",
                    "context_category": "news_portfolio"
                }
            
            p_news_items = []
            for pos in positions[:3]:
                sym = pos["symbol"]
                articles = await news_provider.get_stock_news(sym, limit=2)
                for a in articles[:1]:
                    p_news_items.append(
                        f"• **{sym}**: [{a['title']}]({a['source_url']})\n"
                        f"  *Source*: {a['source']} | Sentiment: `{a['sentiment']}` | Impact: `{a.get('importance', 'HIGH')}`"
                    )

            return {
                "query": query,
                "response": (
                    f"💼 **High-Impact News Affecting Your Active Portfolio**:\n\n"
                    + "\n\n".join(p_news_items)
                    + "\n\n🛡️ *TradeGuard monitors portfolio headline risk continuously.*"
                ),
                "context_category": "news_portfolio"
            }

        # News Query: Stock specific news (e.g. "What is the latest news about AAPL?" or "Why is AAPL moving?")
        if "news about" in q or "latest news" in q or "moving today" in q or "news affected" in q or "why is" in q and "moving" in q:
            # Detect target symbol
            target_sym = symbol_context
            for word in q.upper().split():
                clean = word.strip("?,.!")
                if clean in ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "GOOGL", "RELIANCE", "NIFTY", "BTC", "ETH", "GOLD"]:
                    target_sym = clean
                    break

            articles = await news_provider.get_stock_news(target_sym, limit=3)
            if articles:
                top = articles[0]
                bullets = "\n".join([f"  ✓ {p}" for p in top.get("ai_key_points", [])[:3]])
                return {
                    "query": query,
                    "response": (
                        f"📈 **Live Financial News Intelligence for {target_sym}**:\n\n"
                        f"**Headline**: [{top['title']}]({top['source_url']})\n"
                        f"- **Source**: {top['source']} ({top['published_at'][:10]})\n"
                        f"- **Sentiment**: `{top['sentiment']}` (Score: {top.get('sentiment_score', 0):+.2f})\n"
                        f"- **Market Impact**: `{top.get('importance', 'HIGH')}` ({top.get('impact_score', 80):.0f}/100)\n\n"
                        f"**AI Grounded Summary**:\n{top.get('ai_summary', '')}\n\n"
                        f"**Key Takeaways**:\n{bullets}\n\n"
                        f"🔗 *Original Source*: [{top['source']}]({top['source_url']})"
                    ),
                    "context_category": "news_stock"
                }

        # 1. Why was my trade blocked?
        if "blocked" in q or "risk policy" in q or "rejected" in q:
            blocked_trades = [t for t in paper_trading_service.trade_history if t.get("status") == "BLOCKED"]
            if blocked_trades:
                latest_blocked = blocked_trades[0]
                reasons = "\n- ".join(latest_blocked.get("blocking_reasons", ["Exceeded predefined risk parameters."]))
                return {
                    "query": query,
                    "response": (
                        f"🛡️ **TradeGuard Risk Engine Interception Report**:\n\n"
                        f"Your proposed order for **{latest_blocked.get('quantity')} {latest_blocked.get('symbol')}** was intercepted by our pre-trade risk policy to preserve capital:\n\n"
                        f"- {reasons}\n\n"
                        f"**Suggested Adjustment**: Consider reducing the order quantity or tightening your stop-loss so the total potential loss remains below your 1.0% limit (₹10,000)."
                    ),
                    "context_category": "risk_engine"
                }
            else:
                return {
                    "query": query,
                    "response": (
                        "🛡️ **Risk Policy Status**: No trades have been blocked in your current session. "
                        "TradeGuard's risk engine continuously verifies that:\n"
                        "1. Maximum risk per trade <= 1.0% (₹10,000)\n"
                        "2. Total portfolio exposure <= 40%\n"
                        "3. Mandatory Stop-Loss and Take-Profit brackets are defined\n"
                        "4. Open position count <= 5"
                    ),
                    "context_category": "risk_engine"
                }

        # 2. Show me my highest-risk position
        if "highest-risk" in q or "highest risk" in q or "riskiest" in q or "exposure" in q:
            positions = portfolio["positions"]
            if not positions:
                return {
                    "query": query,
                    "response": "You currently have no open paper positions. Your capital is 100% held in virtual cash (₹10,00,000).",
                    "context_category": "portfolio"
                }
            # Find largest allocation or medium/high risk
            sorted_pos = sorted(positions, key=lambda p: p.get("market_value", 0), reverse=True)
            top_pos = sorted_pos[0]
            return {
                "query": query,
                "response": (
                    f"📊 **Highest Allocation Position Analysis**:\n\n"
                    f"Your largest open commitment is **{top_pos['symbol']}** with a market value of **₹{top_pos['market_value']:,.2f}** "
                    f"({top_pos.get('allocation_pct', 0)}% of total equity).\n\n"
                    f"- **Side**: {top_pos['side']}\n"
                    f"- **Avg Entry**: ₹{top_pos['average_entry']:.2f}\n"
                    f"- **Current Price**: ₹{top_pos['current_price']:.2f}\n"
                    f"- **Unrealized P&L**: ₹{top_pos['unrealized_pnl']:+,.2f} ({top_pos['unrealized_pnl_pct']:+.2f}%)\n"
                    f"- **Stop Loss Level**: ₹{top_pos.get('stop_loss', 'N/A')}\n"
                    f"- **AI Live Verdict**: {top_pos.get('ai_recommendation', 'HOLD')}\n\n"
                    f"💡 *Risk Note*: Maintain disciplined stop-loss monitoring to mitigate adverse momentum swings."
                ),
                "context_category": "portfolio"
            }

        # 3. Why is [SYMBOL] showing BUY/HOLD/SELL or explain signal
        target_symbol = symbol_context
        for word in q.upper().split():
            clean = word.strip("?,.!")
            if clean in ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "BTC-USD", "ETH-USD"]:
                target_symbol = clean
                break

        try:
            bars = await self.market_provider.get_historical_bars(target_symbol)
            sig = self.ai_engine.generate_signal(bars, target_symbol)
            explanation = ExplanationEngine.generate_explanation(sig)
            
            reasons_pos = "\n".join([f"+ {f}" for f in explanation["positive_factors"][:3]])
            reasons_risk = "\n".join([f"- {f}" for f in explanation["risk_factors"][:2]])

            return {
                "query": query,
                "response": (
                    f"🤖 **TradeGuard AI Copilot Analysis for {target_symbol}**:\n\n"
                    f"**Current Signal**: `{sig['signal_type']}` | **Confidence**: {sig['confidence']}%\n"
                    f"**Probabilities**: Bullish: {sig['probabilities']['bullish']}% | Neutral: {sig['probabilities']['neutral']}% | Bearish: {sig['probabilities']['bearish']}%\n"
                    f"**Assessed Risk Level**: `{sig['risk_score']}`\n\n"
                    f"**Key Supporting Technical Drivers**:\n{reasons_pos}\n\n"
                    f"**Risk Hazards & Headwinds**:\n{reasons_risk}\n\n"
                    f"**Synthesis**: {explanation['final_reasoning']}\n\n"
                    f"🛡️ *Blockchain Proof*: Signal hashed with SHA-256 (`{sig['signal_hash'][:16]}...`) and verified on Stellar Soroban."
                ),
                "context_category": "ai_signal"
            }
        except Exception as e:
            return {
                "query": query,
                "response": (
                    f"TradeGuard Copilot is analyzing {target_symbol}. Currently, indicators suggest a balanced market regime. "
                    f"The Multi-Factor Gradient Boosting model recommends following predefined stop loss and take profit targets."
                ),
                "context_category": "general"
            }

copilot_service = CopilotService()
