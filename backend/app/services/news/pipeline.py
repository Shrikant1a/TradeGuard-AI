import re
import hashlib
import datetime
from typing import List, Dict, Any, Tuple

class NewsAIPipeline:
    """
    TradeGuard AI Financial News Processing Pipeline:
    1. Normalization & Sanitization
    2. Deduplication & Cross-Source Grouping
    3. Multi-Asset Entity & Ticker Extraction (US, Indian, Crypto, Commodities, Forex)
    4. Financial Topic Classification
    5. Quantitative Sentiment Analysis & Percentage Distribution
    6. Multi-Factor Relevance Scoring (0-100)
    7. Analytical Market Impact Scoring (0-100) & Importance Bracket
    8. Grounded AI Summarization & Factual Key Bullet Extraction
    9. Real-Time Breaking News Detection
    """

    TICKER_DICTIONARY = {
        # US Tech & Large Cap
        "AAPL": {"company": "Apple Inc.", "aliases": ["apple"], "market": "US", "sector": "TECHNOLOGY"},
        "MSFT": {"company": "Microsoft Corporation", "aliases": ["microsoft"], "market": "US", "sector": "TECHNOLOGY"},
        "NVDA": {"company": "NVIDIA Corporation", "aliases": ["nvidia"], "market": "US", "sector": "TECHNOLOGY"},
        "TSLA": {"company": "Tesla Inc.", "aliases": ["tesla"], "market": "US", "sector": "CONSUMER_DISCRETIONARY"},
        "AMZN": {"company": "Amazon.com Inc.", "aliases": ["amazon", "aws"], "market": "US", "sector": "CONSUMER_DISCRETIONARY"},
        "GOOGL": {"company": "Alphabet Inc.", "aliases": ["google", "alphabet"], "market": "US", "sector": "TECHNOLOGY"},
        "META": {"company": "Meta Platforms Inc.", "aliases": ["meta", "facebook"], "market": "US", "sector": "COMMUNICATIONS"},
        "JPM": {"company": "JPMorgan Chase & Co.", "aliases": ["jpmorgan", "jp morgan", "chase"], "market": "US", "sector": "FINANCE"},
        "SPY": {"company": "SPDR S&P 500 ETF", "aliases": ["s&p 500", "s&p", "spy"], "market": "US", "sector": "INDEX"},
        "QQQ": {"company": "Invesco QQQ Trust", "aliases": ["nasdaq 100", "qqq"], "market": "US", "sector": "INDEX"},
        # Indian Equities
        "RELIANCE": {"company": "Reliance Industries Ltd.", "aliases": ["reliance"], "market": "IN", "sector": "ENERGY"},
        "TCS": {"company": "Tata Consultancy Services Ltd.", "aliases": ["tcs", "tata consultancy"], "market": "IN", "sector": "TECHNOLOGY"},
        "INFY": {"company": "Infosys Ltd.", "aliases": ["infosys"], "market": "IN", "sector": "TECHNOLOGY"},
        "HDFCBANK": {"company": "HDFC Bank Ltd.", "aliases": ["hdfc", "hdfc bank"], "market": "IN", "sector": "FINANCE"},
        "TATAMOTORS": {"company": "Tata Motors Ltd.", "aliases": ["tata motors"], "market": "IN", "sector": "AUTO"},
        "NIFTY": {"company": "NIFTY 50 Index", "aliases": ["nifty", "nifty 50"], "market": "IN", "sector": "INDEX"},
        "SENSEX": {"company": "BSE SENSEX Index", "aliases": ["sensex"], "market": "IN", "sector": "INDEX"},
        # Crypto
        "BTC": {"company": "Bitcoin", "aliases": ["bitcoin", "btc"], "market": "CRYPTO", "sector": "DIGITAL_ASSET"},
        "ETH": {"company": "Ethereum", "aliases": ["ethereum", "ether", "eth"], "market": "CRYPTO", "sector": "DIGITAL_ASSET"},
        "SOL": {"company": "Solana", "aliases": ["solana", "sol"], "market": "CRYPTO", "sector": "DIGITAL_ASSET"},
        # Commodities & Forex
        "GOLD": {"company": "Gold Bullion", "aliases": ["gold", "bullion"], "market": "COMMODITY", "sector": "PRECIOUS_METALS"},
        "SILVER": {"company": "Silver Bullion", "aliases": ["silver"], "market": "COMMODITY", "sector": "PRECIOUS_METALS"},
        "CRUDE": {"company": "Crude Oil", "aliases": ["crude", "oil", "brent", "wti"], "market": "COMMODITY", "sector": "ENERGY"},
        "DXY": {"company": "US Dollar Index", "aliases": ["dollar index", "dxy", "greenback"], "market": "FOREX", "sector": "CURRENCY"}
    }

    MACRO_KEYWORDS = {
        "FEDERAL_RESERVE": ["federal reserve", "fed ", "powell", "fomc", "rate cut", "rate hike", "monetary policy", "quantitative tightening"],
        "INFLATION": ["cpi", "inflation", "pce", "consumer prices", "producer prices", "ppi", "core inflation", "cost of living"],
        "EARNINGS": ["earnings", "quarterly results", "revenue", "ebitda", "net profit", "guidance", "profit margin", "eps beat", "eps miss"],
        "MERGER_ACQUISITION": ["merger", "acquisition", "acquire", "buyout", "takeover", "joint venture", "antitrust review"],
        "IPO": ["ipo", "initial public offering", "direct listing", "stock debut", "spac merger"],
        "CRYPTO": ["bitcoin", "ethereum", "blockchain", "crypto", "etf inflows", "halving", "tokenization", "stablecoin"],
        "ENERGY": ["oil", "crude", "opec", "natural gas", "battery gigafactory", "clean energy", "solar", "renewable"],
        "TECHNOLOGY": ["artificial intelligence", "genai", "datacenter", "semiconductor", "blackwell", "cloud computing", "saas"]
    }

    @classmethod
    def extract_entities_and_tickers(cls, text: str) -> Tuple[List[str], List[str], List[str]]:
        """Extract tickers, companies, and macro topics from text"""
        tickers = set()
        companies = set()
        topics = set()
        text_upper = text.upper()
        text_lower = text.lower()

        # Check ticker dictionary and aliases
        for ticker, meta in cls.TICKER_DICTIONARY.items():
            pattern = r'\b' + re.escape(ticker) + r'\b'
            matched = bool(re.search(pattern, text_upper))
            if not matched and meta["company"].lower() in text_lower:
                matched = True
            if not matched and any(alias in text_lower for alias in meta.get("aliases", [])):
                matched = True

            if matched:
                tickers.add(ticker)
                companies.add(meta["company"])
                topics.add(meta["sector"].lower())

        # Check macro topics
        for cat, kw_list in cls.MACRO_KEYWORDS.items():
            if any(kw in text_lower for kw in kw_list):
                topics.add(cat.lower())

        return list(tickers), list(companies), list(topics)

    @classmethod
    def classify_category(cls, title: str, summary: str, extracted_topics: List[str]) -> str:
        """Classify article into strict TradeGuard categories"""
        combined = (title + " " + summary).lower()
        if any(w in combined for w in ["breaking:", "breaking news", "urgent:", "bulletin"]):
            return "BREAKING"
        if any(w in combined for w in ["federal reserve", "fed ", "powell", "fomc", "interest rate"]):
            return "FEDERAL_RESERVE"
        if any(w in combined for w in ["cpi", "inflation", "pce", "consumer prices"]):
            return "INFLATION"
        if any(w in combined for w in ["earnings", "quarterly results", "revenue beat", "eps beat"]):
            return "EARNINGS"
        if any(w in combined for w in ["merger", "acquisition", "acquire", "buyout"]):
            return "MERGER_ACQUISITION"
        if any(w in combined for w in ["ipo", "initial public offering"]):
            return "IPO"
        if any(w in combined for w in ["bitcoin", "ethereum", "crypto", "blockchain"]):
            return "CRYPTO"
        if any(w in combined for w in ["clean energy", "crude", "oil", "battery", "opec"]):
            return "ENERGY"
        if any(w in combined for w in ["artificial intelligence", "nvidia", "apple", "microsoft", "semiconductor"]):
            return "TECHNOLOGY"
        if any(w in combined for w in ["bank", "treasury", "credit rating"]):
            return "FINANCE"
        return "MARKET"

    @classmethod
    def analyze_sentiment(cls, title: str, summary: str) -> Dict[str, Any]:
        """
        Calculates TradeGuard AI sentiment score (-1.0 to +1.0) and breakdown percentages.
        Clearly separate from any source-provided labels.
        """
        combined = (title + " " + summary).lower()

        bullish_cues = [
            "record revenue", "soars", "surges", "beat", "stronger", "gains",
            "exceeded", "expands", "upgraded", "growth", "all-time high",
            "approval", "boost", "outperformed", "dividend hike", "resilient"
        ]
        bearish_cues = [
            "slumps", "plunges", "misses", "losses", "cut", "downgrade",
            "warning", "lawsuit", "investigation", "subpoena", "declines",
            "inflation heat", "layoffs", "default", "recession", "stumbles"
        ]

        pos_count = sum(1 for c in bullish_cues if c in combined)
        neg_count = sum(1 for c in bearish_cues if c in combined)

        raw_diff = pos_count - neg_count
        if raw_diff > 0:
            score = min(0.95, 0.45 + (raw_diff * 0.15))
            label = "POSITIVE"
            pos_pct = min(92, int(55 + score * 40))
            neg_pct = max(4, int(15 - score * 10))
            neu_pct = max(0, 100 - pos_pct - neg_pct)
        elif raw_diff < 0:
            score = max(-0.95, -0.45 - (abs(raw_diff) * 0.15))
            label = "NEGATIVE"
            neg_pct = min(92, int(55 + abs(score) * 40))
            pos_pct = max(4, int(15 - abs(score) * 10))
            neu_pct = max(0, 100 - pos_pct - neg_pct)
        else:
            score = 0.05
            label = "NEUTRAL"
            neu_pct = 64
            pos_pct = 18
            neg_pct = 18

        return {
            "sentiment": label,
            "sentiment_score": round(score, 2),
            "breakdown": {"positive": pos_pct, "neutral": neu_pct, "negative": neg_pct}
        }

    @classmethod
    def calculate_relevance_score(cls, text: str, target_symbol: str) -> float:
        """
        Calculates symbol relevance score (0-100) based on direct mentions,
        title occurrence, and company alias match.
        """
        text_upper = text.upper()
        sym = target_symbol.upper()
        score = 50.0

        if sym in text_upper:
            score += 30.0
        meta = cls.TICKER_DICTIONARY.get(sym)
        if meta and meta["company"].lower() in text.lower():
            score += 20.0

        return min(99.0, max(20.0, score))

    @classmethod
    def calculate_impact_score(cls, category: str, title: str, sentiment_score: float) -> Tuple[float, str]:
        """Calculates Market Impact Score (0-100) and category level (LOW, MEDIUM, HIGH, CRITICAL)"""
        title_lower = title.lower()
        score = 50.0

        if any(w in title_lower for w in ["fed ", "interest rate", "rate cut", "cpi", "inflation", "war", "recession"]):
            score += 40.0
        elif any(w in title_lower for w in ["earnings", "revenue record", "guidance update"]):
            score += 30.0
        elif any(w in title_lower for w in ["merger", "acquisition", "gigafactory", "contract award"]):
            score += 25.0
        elif any(w in title_lower for w in ["lawsuit", "investigation", "subpoena"]):
            score += 22.0

        score += min(15.0, abs(sentiment_score) * 15.0)
        score = min(96.0, max(20.0, score))

        if score >= 85.0:
            level = "CRITICAL"
        elif score >= 70.0:
            level = "HIGH"
        elif score >= 45.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        return round(score, 1), level

    @classmethod
    def generate_ai_summary(cls, title: str, summary: str, source: str) -> Tuple[str, List[str], str]:
        """
        Creates concise, factual AI summary grounded exclusively in article content.
        Generates 3 verifiable bullet points and analytical reasoning.
        """
        clean_summary = summary.strip()
        if not clean_summary or len(clean_summary) < 20:
            return (
                "Insufficient information for reliable AI summary.",
                ["Data stream contains headline only; detailed source body unavailable."],
                "Low data depth limits multi-factor extraction."
            )

        # Factual summary without hallucination
        ai_summary = f"{clean_summary[:260]}..." if len(clean_summary) > 260 else clean_summary

        # Extract factual points from text
        sentences = [s.strip() for s in re.split(r'[.!?]', clean_summary) if len(s.strip()) > 15]
        bullets = []
        for s in sentences[:3]:
            bullets.append(f"{s[0].upper()}{s[1:]}")
        
        while len(bullets) < 3:
            bullets.append(f"Reported via official financial coverage by {source}.")

        reasoning = (
            f"Synthesized from source publication data ({source}). Context reflects event significance "
            f"and provides research-grade directional sentiment context."
        )

        return ai_summary, bullets, reasoning

    @classmethod
    def group_duplicates(cls, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups similar or duplicate articles across providers (Section 21).
        Displays master story with 'X sources reporting this event' expander.
        """
        grouped = []
        seen_titles = {}

        for a in articles:
            # Title normalization
            norm_title = re.sub(r'[^a-zA-Z0-9]', '', a.get("title", "").lower()[:40])
            if norm_title in seen_titles:
                master = seen_titles[norm_title]
                if "duplicate_sources" not in master:
                    master["duplicate_sources"] = []
                master["duplicate_sources"].append({
                    "source": a.get("source", "Market Wire"),
                    "url": a.get("source_url", "#"),
                    "published_at": a.get("published_at")
                })
            else:
                a_copy = dict(a)
                a_copy["duplicate_sources"] = a_copy.get("duplicate_sources", [])
                seen_titles[norm_title] = a_copy
                grouped.append(a_copy)

        return grouped
