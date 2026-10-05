import datetime
import hashlib
from typing import List, Dict, Any, Optional
from backend.app.services.news.base import NewsProvider

class DemoNewsProvider(NewsProvider):
    """
    Demo Financial News Provider.
    Supplies rich, realistic financial market stories when no live API keys are provided.
    Strictly flags every article as is_demo=True and source marked with 'DEMO DATA'.
    """

    def __init__(self):
        self._articles = self._generate_articles()

    def _generate_articles(self) -> List[Dict[str, Any]]:
        now = datetime.datetime.utcnow()
        raw_items = [
            {
                "id": 1,
                "title": "RBI Monetary Policy Committee Maintains Repo Rate at 6.50%, Projects Real GDP Growth at 7.2% for FY26",
                "summary": "The Reserve Bank of India Monetary Policy Committee (MPC) voted to keep the policy repo rate unchanged at 6.50% while maintaining the stance of withdrawal of accommodation. Governor Shaktikanta Das highlighted resilient domestic macroeconomic fundamentals, strong rural consumption indicators, and continuing balance sheet strength across Indian commercial banks.",
                "source": "Reserve Bank of India / Livemint",
                "source_url": "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
                "image_url": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60",
                "author": "Shaktikanta Das / RBI Staff",
                "published_at": (now - datetime.timedelta(minutes=15)).isoformat() + "Z",
                "category": "RBI_POLICY",
                "symbols": ["NIFTY", "BANKNIFTY", "SBIN", "HDFCBANK", "ICICIBANK"],
                "companies": ["Reserve Bank of India", "State Bank of India", "HDFC Bank"],
                "topics": ["economy_monetary", "financial_markets", "indian_economy"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.72,
                "sentiment_breakdown": {"positive": 72, "neutral": 22, "negative": 6},
                "source_sentiment": "POSITIVE",
                "relevance_score": 99.0,
                "impact_score": 94.0,
                "importance": "CRITICAL",
                "is_breaking": True,
                "affected_assets": ["NIFTY", "BANKNIFTY", "SBIN", "HDFCBANK", "ICICIBANK"],
                "ai_summary": "RBI MPC held benchmark repo rate steady at 6.50% and projected 7.2% real GDP growth. Resilient Indian macroeconomic activity and robust domestic credit expansion anchor financial market stability.",
                "ai_key_points": [
                    "Policy repo rate maintained at 6.50% with unanimous MPC resolution",
                    "India FY26 real GDP growth projected at robust 7.2% trajectory",
                    "Banking sector asset quality and credit deposit ratios remain in healthy expansion band"
                ],
                "ai_reasoning": "Monetary policy stability provides favorable liquidity backdrop for Indian equities, banking credit margins, and infrastructure capital expenditure.",
                "duplicate_sources": [
                    {"source": "Economic Times", "url": "https://economictimes.indiatimes.com/rbi-policy", "published_at": (now - datetime.timedelta(minutes=14)).isoformat() + "Z"},
                    {"source": "Business Standard", "url": "https://business-standard.com/rbi-repo-rate", "published_at": (now - datetime.timedelta(minutes=12)).isoformat() + "Z"}
                ]
            },
            {
                "id": 2,
                "title": "Reliance Industries Accelerates ₹75,000 Crore Clean Energy Gigafactory Capex; Jio 5G Monetization Expands",
                "summary": "Reliance Industries Limited announced major project commissioning milestones at its Dhirubhai Ambani Green Energy Giga Complex in Jamnagar, alongside expanding ARPU metrics for Jio True 5G network coverage spanning over 450 million subscribers nationwide.",
                "source": "Reliance Investor Relations / Economic Times",
                "source_url": "https://www.ril.com/investor-relations",
                "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60",
                "author": "Mukesh Ambani / RIL Leadership",
                "published_at": (now - datetime.timedelta(minutes=32)).isoformat() + "Z",
                "category": "INDIAN_ECONOMY",
                "symbols": ["RELIANCE", "NIFTY"],
                "companies": ["Reliance Industries Ltd.", "Jio Infocomm"],
                "topics": ["energy", "technology", "financial_markets"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.82,
                "sentiment_breakdown": {"positive": 82, "neutral": 14, "negative": 4},
                "source_sentiment": "POSITIVE",
                "relevance_score": 97.0,
                "impact_score": 90.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["RELIANCE", "NIFTY", "ENERGY_INDEX"],
                "ai_summary": "Reliance Industries confirmed timely execution of its Jamnagar clean energy gigafactory capex and expanding monetization across digital telecommunications services.",
                "ai_key_points": [
                    "₹75,000 Cr green energy manufacturing capacity on schedule for progressive commercial launch",
                    "Jio telecom ARPU expands with accelerating enterprise 5G fixed wireless access additions",
                    "Consolidated operating EBITDA margins remain resilient across oil-to-chemicals and retail"
                ],
                "ai_reasoning": "Diversified cash flow engines and scalable clean tech investments provide sustained institutional accumulation support for Reliance shares.",
                "duplicate_sources": []
            },
            {
                "id": 3,
                "title": "TCS Secures $1.2B Enterprise Digital & AI Transformation Deal with European Financial Consortium",
                "summary": "Tata Consultancy Services (TCS), India's premier IT exporter, announced a multi-year $1.2 billion contract to modernize core cloud banking platforms and implement generative AI compliance workflows for a leading European financial services consortium.",
                "source": "TCS Newsroom / Moneycontrol",
                "source_url": "https://www.tcs.com/newsroom",
                "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
                "author": "K. Krithivasan / TCS Communications",
                "published_at": (now - datetime.timedelta(minutes=50)).isoformat() + "Z",
                "category": "INDIAN_IT",
                "symbols": ["TCS", "INFY", "NIFTY"],
                "companies": ["Tata Consultancy Services Ltd."],
                "topics": ["technology", "earnings", "indian_it"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.85,
                "sentiment_breakdown": {"positive": 85, "neutral": 12, "negative": 3},
                "source_sentiment": "POSITIVE",
                "relevance_score": 95.0,
                "impact_score": 87.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["TCS", "INFY", "WIPRO", "NIFTY_IT"],
                "ai_summary": "TCS secured a marquee $1.2B digital and AI infrastructure transformation mandate, confirming resilient demand for Tier-1 Indian IT services across global financial institutions.",
                "ai_key_points": [
                    "Total contract value of $1.2 billion across multi-year modernization timeline",
                    "Operating margins targeted in 26-28% range with high offshore delivery efficiency",
                    "Strengthens deal pipeline and forward revenue visibility for Indian IT index"
                ],
                "ai_reasoning": "Large deal ramp-ups validate client IT budget durability in enterprise software and provide strong fundamental tailwinds for TCS valuation multiples.",
                "duplicate_sources": []
            },
            {
                "id": 4,
                "title": "SEBI Releases Enhanced Risk Framework and Revised Lot Sizing for Index Options Derivatives",
                "summary": "The Securities and Exchange Board of India (SEBI) announced updated regulatory directives for equity derivatives trading, including rationalized contract multiplier values, mandatory upfront margin collection, and enhanced risk disclosure warnings to safeguard retail participants.",
                "source": "SEBI Official Press / Financial Express",
                "source_url": "https://www.sebi.gov.in/media-and-press.html",
                "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=60",
                "author": "SEBI Market Regulation Division",
                "published_at": (now - datetime.timedelta(hours=1, minutes=10)).isoformat() + "Z",
                "category": "SEBI_REGULATION",
                "symbols": ["NSE", "BSE", "NIFTY", "BANKNIFTY"],
                "companies": ["Securities and Exchange Board of India", "NSE", "BSE"],
                "topics": ["sebi_regulation", "financial_markets"],
                "sentiment": "NEUTRAL",
                "sentiment_score": 0.10,
                "sentiment_breakdown": {"positive": 30, "neutral": 55, "negative": 15},
                "source_sentiment": "NEUTRAL",
                "relevance_score": 98.0,
                "impact_score": 91.0,
                "importance": "CRITICAL",
                "is_breaking": False,
                "affected_assets": ["NIFTY", "BANKNIFTY", "BSE"],
                "ai_summary": "SEBI instituted refined regulatory guardrails for Indian index derivatives to protect retail capital and foster sustainable systemic market liquidity.",
                "ai_key_points": [
                    "Updated index options contract sizing and margin requirements effective next cycle",
                    "Surveillance measures aimed at orderly price discovery and retail capital preservation",
                    "Long-term structural maturation of Indian capital markets ecosystem"
                ],
                "ai_reasoning": "Regulatory discipline curtails excessive speculative leverage while cementing institutional trust in Indian market integrity.",
                "duplicate_sources": []
            },
            {
                "id": 5,
                "title": "HDFC Bank Reports 16.5% YoY Deposit Growth with Moderating Gross NPA at 1.24%",
                "summary": "HDFC Bank Ltd., India's largest private sector lender, shared its quarterly operational metrics highlighting accelerating branch deposit accretion, healthy loan book growth in retail segments, and stable net interest margins following post-merger integration completion.",
                "source": "HDFC Bank Investor Relations / CNBC-TV18",
                "source_url": "https://www.hdfcbank.com/personal/about-us/investor-relations",
                "image_url": "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&auto=format&fit=crop&q=60",
                "author": "Sashidhar Jagdishan / HDFC Bank Management",
                "published_at": (now - datetime.timedelta(hours=1, minutes=45)).isoformat() + "Z",
                "category": "INDIAN_BANKING",
                "symbols": ["HDFCBANK", "BANKNIFTY"],
                "companies": ["HDFC Bank Ltd."],
                "topics": ["earnings", "indian_banking", "finance"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.78,
                "sentiment_breakdown": {"positive": 78, "neutral": 18, "negative": 4},
                "source_sentiment": "POSITIVE",
                "relevance_score": 94.0,
                "impact_score": 86.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["HDFCBANK", "BANKNIFTY", "ICICIBANK"],
                "ai_summary": "HDFC Bank registered robust 16.5% YoY deposit expansion and pristine credit quality, reaffirming stability in India's leading private banking institution.",
                "ai_key_points": [
                    "Deposit franchise accretion expanded 16.5% year-over-year",
                    "Gross non-performing asset (GNPA) ratio improved to 1.24%",
                    "Credit-deposit ratio normalization progresses on track"
                ],
                "ai_reasoning": "Consistent deposit growth mitigates funding cost headwinds and supports sustained loan book expansion for HDFC Bank.",
                "duplicate_sources": []
            },
            {
                "id": 6,
                "title": "Federal Reserve Holds Benchmark Rate Steady at 5.25%-5.50%, Signals Measured Easing Path",
                "summary": "The Federal Open Market Committee concluded its policy meeting by voting to maintain the benchmark federal funds rate. Chair Powell noted inflation has eased toward the 2% objective but emphasized policymakers require further sustained confirmation before lowering borrowing costs.",
                "source": "Federal Reserve Press / Bloomberg",
                "source_url": "https://www.federalreserve.gov/newsevents/pressreleases/monetary2026.htm",
                "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
                "author": "Jerome Powell / FOMC Staff",
                "published_at": (now - datetime.timedelta(hours=2, minutes=15)).isoformat() + "Z",
                "category": "FEDERAL_RESERVE",
                "symbols": ["SPY", "QQQ", "TLT", "DXY", "JPM"],
                "companies": ["Federal Reserve", "JPMorgan Chase"],
                "topics": ["economy_monetary", "financial_markets", "economy_macro"],
                "sentiment": "NEUTRAL",
                "sentiment_score": 0.08,
                "sentiment_breakdown": {"positive": 30, "neutral": 60, "negative": 10},
                "source_sentiment": "NEUTRAL",
                "relevance_score": 92.0,
                "impact_score": 84.0,
                "importance": "MEDIUM",
                "is_breaking": False,
                "affected_assets": ["SPY", "QQQ", "BANKS", "USD", "BONDS"],
                "ai_summary": "The FOMC maintained interest rates at 5.25%-5.50%. Policymakers noted continued US labor resilience while tracking PCE disinflation trajectory.",
                "ai_key_points": [
                    "Benchmark rate kept unchanged at 5.25%-5.50% range",
                    "Inflation progress acknowledged with data-dependent outlook"
                ],
                "ai_reasoning": "Global monetary conditions influence international capital allocation and foreign portfolio investor flows into emerging markets.",
                "duplicate_sources": []
            },
            {
                "id": 2,
                "title": "Apple Reports Record Services Revenue and Stronger Gross Margins in Q3 Financial Results",
                "summary": "Apple Inc. announced revenue of $94.9 billion for its fiscal quarter, driven by an all-time record in Services revenue reaching $24.2 billion. Gross margins expanded to 46.2%, surpassing Wall Street estimates amid accelerated adoption of Apple Intelligence capabilities across newly launched iPhone models.",
                "source": "Apple Investor Relations / Reuters",
                "source_url": "https://www.apple.com/newsroom/2026/09/apple-reports-third-quarter-results/",
                "image_url": "https://images.unsplash.com/photo-1510519138161-58474ebf844b?w=800&auto=format&fit=crop&q=60",
                "author": "Tim Cook / Luca Maestri",
                "published_at": (now - datetime.timedelta(minutes=35)).isoformat() + "Z",
                "category": "EARNINGS",
                "symbols": ["AAPL", "QQQ"],
                "companies": ["Apple Inc."],
                "topics": ["earnings", "technology", "finance"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.84,
                "sentiment_breakdown": {"positive": 84, "neutral": 12, "negative": 4},
                "source_sentiment": "POSITIVE",
                "relevance_score": 96.0,
                "impact_score": 88.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["AAPL", "QQQ", "XLK", "TSM"],
                "ai_summary": "Apple delivered quarterly revenue of $94.9B with record Services intake of $24.2B. High gross margins (46.2%) and enterprise Apple Intelligence rollouts outperformed consensus expectations.",
                "ai_key_points": [
                    "Services segment generated record $24.2 billion quarterly revenue",
                    "Gross margin climbed to 46.2%, outperforming Street consensus",
                    "Active installed device base exceeded 2.2 billion units globally"
                ],
                "ai_reasoning": "Strong quarterly cash flow generation combined with expanding subscription margins strengthens Apple's medium-term balance sheet durability.",
                "duplicate_sources": [
                    {"source": "Wall Street Journal", "url": "https://wsj.com/tech/apple-earnings", "published_at": (now - datetime.timedelta(minutes=32)).isoformat() + "Z"}
                ]
            },
            {
                "id": 3,
                "title": "NVIDIA Expands Blackwell Enterprise AI Infrastructure with Tier-1 Cloud Hyperscalers",
                "summary": "NVIDIA announced that major hyperscale cloud service providers have finalized production deployments of its next-generation Blackwell B200 and GB200 NVL72 data center clusters, indicating robust enterprise demand for generative AI training and multi-token inference acceleration.",
                "source": "NVIDIA Newsroom / Financial Times",
                "source_url": "https://nvidianews.nvidia.com/news/blackwell-hyperscale-deployments",
                "image_url": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=60",
                "author": "Jensen Huang / Enterprise Systems",
                "published_at": (now - datetime.timedelta(minutes=52)).isoformat() + "Z",
                "category": "TECHNOLOGY",
                "symbols": ["NVDA", "MSFT", "AMZN", "GOOGL"],
                "companies": ["NVIDIA Corporation", "Microsoft", "Amazon", "Alphabet"],
                "topics": ["technology", "financial_markets", "earnings"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.88,
                "sentiment_breakdown": {"positive": 88, "neutral": 9, "negative": 3},
                "source_sentiment": "POSITIVE",
                "relevance_score": 94.0,
                "impact_score": 85.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["NVDA", "SMH", "SOXX", "MSFT", "AMZN"],
                "ai_summary": "NVIDIA verified full hyperscale commercial deployment schedules for its Blackwell B200 hardware. Hyperscaler capital expenditure momentum continues to support forward revenue projections.",
                "ai_key_points": [
                    "Blackwell enterprise architecture deployed across primary cloud tiers",
                    "Substantial energy-efficiency gains in multi-modal generative inference",
                    "Order book backlog signals sustained high fab capacity utilization"
                ],
                "ai_reasoning": "Sustained data center Capex commitments provide positive macro support for semiconductor momentum factors and AI hardware ecosystems.",
                "duplicate_sources": []
            },
            {
                "id": 4,
                "title": "Tesla Announces Commercial Rollout of Next-Gen Robotaxi Network Following Regulatory Safety Approvals",
                "summary": "Tesla Inc. has received formal metropolitan autonomous vehicle commercial permits in key operating zones, confirming targeted rollout timelines for its dedicated Cybercab fleet with vision-based FSD hardware suite.",
                "source": "Electrek / Bloomberg",
                "source_url": "https://electrek.co/2026/09/30/tesla-autonomous-network-rollout",
                "image_url": "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60",
                "author": "Fred Lambert / Auto Tech",
                "published_at": (now - datetime.timedelta(hours=1, minutes=15)).isoformat() + "Z",
                "category": "STOCK",
                "symbols": ["TSLA"],
                "companies": ["Tesla Inc."],
                "topics": ["technology", "financial_markets"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.72,
                "sentiment_breakdown": {"positive": 72, "neutral": 20, "negative": 8},
                "source_sentiment": "POSITIVE",
                "relevance_score": 92.0,
                "impact_score": 82.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["TSLA", "UBER", "CARZ"],
                "ai_summary": "Tesla cleared metropolitan commercial operating approvals for its dedicated Cybercab autonomous mobility fleet, expanding revenue visibility into software-driven recurring mobility services.",
                "ai_key_points": [
                    "Commercial autonomous transportation permit secured in urban corridors",
                    "Deployment targets uncrewed operations utilizing vision-only FSD",
                    "Analyst community model revisions initiate software margin inclusion"
                ],
                "ai_reasoning": "Regulatory de-risking of autonomous services introduces asymmetric upside potential to valuation models while carrying near-term execution volatility.",
                "duplicate_sources": []
            },
            {
                "id": 5,
                "title": "US Consumer Price Index (CPI) Cools to 2.4% Annualized Pace in Latest BLS Release",
                "summary": "The Bureau of Labor Statistics released consumer price data showing headline CPI rose 0.1% month-over-month and 2.4% over the prior twelve months, slightly cooler than the 2.5% consensus estimate. Core inflation held steady at 2.8%, easing bond yield pressure across global fixed income markets.",
                "source": "Bureau of Labor Statistics / MarketWatch",
                "source_url": "https://www.bls.gov/news.release/cpi.nr0.htm",
                "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=60",
                "author": "BLS Economic Data Division",
                "published_at": (now - datetime.timedelta(hours=2, minutes=5)).isoformat() + "Z",
                "category": "INFLATION",
                "symbols": ["SPY", "TLT", "DXY", "GLD"],
                "companies": ["Bureau of Labor Statistics"],
                "topics": ["economy_macro", "financial_markets", "economy_monetary"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.65,
                "sentiment_breakdown": {"positive": 65, "neutral": 25, "negative": 10},
                "source_sentiment": "POSITIVE",
                "relevance_score": 95.0,
                "impact_score": 89.0,
                "importance": "CRITICAL",
                "is_breaking": False,
                "affected_assets": ["SPY", "QQQ", "TLT", "DXY", "GOLD"],
                "ai_summary": "Headline US CPI softened to 2.4% YoY, slightly lower than projected. Shelter and used vehicle disinflation accounted for the marginal deceleration.",
                "ai_key_points": [
                    "Headline CPI increased 0.1% month-over-month (2.4% annual rate)",
                    "Core inflation printed at 2.8%, matching baseline trajectory",
                    "Ten-year Treasury yields compressed 6 basis points following the release"
                ],
                "ai_reasoning": "Disinflationary trends alleviate terminal discount rate burdens on growth equities and stimulate equity duration expansion.",
                "duplicate_sources": []
            },
            {
                "id": 6,
                "title": "Microsoft and OpenAI Finalize Expanded Enterprise Governance Structure and Revenue Sharing Framework",
                "summary": "Microsoft Corporation and OpenAI completed an updated enterprise licensing accord that establishes clear governance protocols for corporate computing clusters and confirms perpetual enterprise access rights to frontier reasoning models across Microsoft 365 Copilot platforms.",
                "source": "Wall Street Journal / PR Newswire",
                "source_url": "https://www.wsj.com/tech/microsoft-openai-enterprise-deal",
                "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
                "author": "Satya Nadella / Microsoft PR",
                "published_at": (now - datetime.timedelta(hours=3, minutes=20)).isoformat() + "Z",
                "category": "MERGER_ACQUISITION",
                "symbols": ["MSFT", "GOOGL"],
                "companies": ["Microsoft Corporation", "OpenAI"],
                "topics": ["mergers_and_acquisitions", "technology", "finance"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.76,
                "sentiment_breakdown": {"positive": 76, "neutral": 18, "negative": 6},
                "source_sentiment": "POSITIVE",
                "relevance_score": 91.0,
                "impact_score": 79.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["MSFT", "QQQ", "GOOGL"],
                "ai_summary": "Microsoft solidified intellectual property protections and compute allocation contracts with OpenAI, securing enterprise recurring revenue channels for its Azure AI catalog.",
                "ai_key_points": [
                    "Updated multi-year structure clarifies frontier model enterprise commercial rights",
                    "Azure remains exclusive cloud compute supplier for enterprise workloads",
                    "Reduces legal/governance ambiguity regarding capital deployments"
                ],
                "ai_reasoning": "Resolving strategic partnership questions strengthens Microsoft's enterprise SaaS moat against cloud rivals.",
                "duplicate_sources": []
            },
            {
                "id": 7,
                "title": "Bitcoin Surges Above $94,000 as Institutional Spot ETF Inflows Break Weekly Records",
                "summary": "Bitcoin reached fresh highs as global institutional asset managers registered net weekly inflows surpassing $2.8 billion across regulated spot digital asset exchange-traded products, supported by growing sovereign reserve legislative proposals.",
                "source": "CoinDesk / Cointelegraph",
                "source_url": "https://www.coindesk.com/markets/2026/09/30/bitcoin-institutional-inflows-record",
                "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
                "author": "Omkar Godbole / Crypto Markets",
                "published_at": (now - datetime.timedelta(hours=4, minutes=10)).isoformat() + "Z",
                "category": "CRYPTO",
                "symbols": ["BTC", "ETH", "COIN", "MSTR"],
                "companies": ["Coinbase Global", "MicroStrategy"],
                "topics": ["blockchain", "financial_markets", "finance"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.81,
                "sentiment_breakdown": {"positive": 81, "neutral": 14, "negative": 5},
                "source_sentiment": "POSITIVE",
                "relevance_score": 93.0,
                "impact_score": 78.0,
                "importance": "MEDIUM",
                "is_breaking": False,
                "affected_assets": ["BTC", "ETH", "COIN", "MSTR"],
                "ai_summary": "Institutional inflows into spot Bitcoin funds accelerated to record weekly heights, reflecting broad asset allocation diversification by pension funds and hedge vehicles.",
                "ai_key_points": [
                    "Net weekly ETF inflows eclipsed $2.8 billion across primary issuers",
                    "Exchange reserves reached lowest liquidity threshold in seven years",
                    "Correlation with traditional tech equities remains moderately positive"
                ],
                "ai_reasoning": "Institutional accumulation provides structural floor support but historical drawdowns advise rigorous position-sizing constraints.",
                "duplicate_sources": []
            },
            {
                "id": 8,
                "title": "Reliance Industries and Tata Motors Announce Joint Clean-Energy Battery Gigafactory in India",
                "summary": "Reliance Industries and Tata Motors have concluded a landmark joint venture agreement to establish a 40 GWh domestic lithium-ion and solid-state cell manufacturing hub in Gujarat under India's Production-Linked Incentive (PLI) scheme.",
                "source": "Economic Times / Mint",
                "source_url": "https://economictimes.indiatimes.com/industry/energy/reliance-tata-gigafactory",
                "image_url": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=60",
                "author": "Deepak Patel / Energy Bureau",
                "published_at": (now - datetime.timedelta(hours=5, minutes=30)).isoformat() + "Z",
                "category": "ENERGY",
                "symbols": ["RELIANCE", "TATAMOTORS", "NIFTY"],
                "companies": ["Reliance Industries", "Tata Motors"],
                "topics": ["energy_transportation", "mergers_and_acquisitions", "finance"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.77,
                "sentiment_breakdown": {"positive": 77, "neutral": 18, "negative": 5},
                "source_sentiment": "POSITIVE",
                "relevance_score": 90.0,
                "impact_score": 76.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["RELIANCE", "TATAMOTORS", "NIFTY", "SENSEX"],
                "ai_summary": "Two of India's largest industrial conglomerates launched a 40 GWh clean battery manufacturing venture with PLI subsidies, advancing domestic supply chain self-sufficiency.",
                "ai_key_points": [
                    "40 GWh cell production capacity targeted across two phases",
                    "Direct integration into Tata's EV passenger and commercial lineups",
                    "Expected to reduce import dependency by over 60% upon commissioning"
                ],
                "ai_reasoning": "Domestic battery manufacturing enhances operating margins for Indian commercial EV leaders and diversifies Reliance's energy cash flows.",
                "duplicate_sources": []
            },
            {
                "id": 9,
                "title": "Gold Touches All-Time High Amid Geopolitical Uncertainty and Central Bank De-Dollarization Purchases",
                "summary": "Spot gold bullion tested fresh records above $2,720 per troy ounce as central bank reserve accumulation and heightened safe-haven demand lifted commodities markets despite firm US real yields.",
                "source": "Reuters / World Gold Council",
                "source_url": "https://www.reuters.com/markets/commodities/gold-record-highs",
                "image_url": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=60",
                "author": "Commodities Desk",
                "published_at": (now - datetime.timedelta(hours=6, minutes=45)).isoformat() + "Z",
                "category": "MARKET",
                "symbols": ["GOLD", "GLD", "SLV"],
                "companies": ["World Gold Council"],
                "topics": ["financial_markets", "economy_macro"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.69,
                "sentiment_breakdown": {"positive": 69, "neutral": 24, "negative": 7},
                "source_sentiment": "POSITIVE",
                "relevance_score": 88.0,
                "impact_score": 75.0,
                "importance": "MEDIUM",
                "is_breaking": False,
                "affected_assets": ["GOLD", "GLD", "SLV", "USD"],
                "ai_summary": "Gold bullion touched record levels driven by relentless sovereign official reserve acquisition and hedge demand against potential sovereign debt stress.",
                "ai_key_points": [
                    "Spot bullion tested $2,720/oz with elevated physical buying volume",
                    "Central banks added over 300 net metric tons in consecutive quarters",
                    "Silver and platinum complex exhibited sympathetic positive beta"
                ],
                "ai_reasoning": "Bullion strength underscores underlying defensive positioning in institutional multi-asset portfolios despite broader equity momentum.",
                "duplicate_sources": []
            },
            {
                "id": 10,
                "title": "Amazon AWS Secures $10 Billion Defense & Intelligence Cloud Modernization Award",
                "summary": "The Department of Defense awarded Amazon Web Services a prime vehicle task order valued at up to $10 billion for multi-tenant high-security cloud fabric infrastructure and edge sovereign AI compute.",
                "source": "Bloomberg / Defense News",
                "source_url": "https://www.bloomberg.com/news/articles/2026-09-30/amazon-aws-defense-contract",
                "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
                "author": "Anthony Capaccio / Tech & Government",
                "published_at": (now - datetime.timedelta(hours=8, minutes=10)).isoformat() + "Z",
                "category": "STOCK",
                "symbols": ["AMZN", "MSFT", "GOOGL"],
                "companies": ["Amazon.com Inc.", "Department of Defense"],
                "topics": ["technology", "financial_markets"],
                "sentiment": "POSITIVE",
                "sentiment_score": 0.82,
                "sentiment_breakdown": {"positive": 82, "neutral": 15, "negative": 3},
                "source_sentiment": "POSITIVE",
                "relevance_score": 93.0,
                "impact_score": 77.0,
                "importance": "HIGH",
                "is_breaking": False,
                "affected_assets": ["AMZN", "QQQ"],
                "ai_summary": "Amazon Web Services secured a multi-year $10B public sector cloud mandate. The recurring high-margin contract bolsters AWS forward order pipeline visibility.",
                "ai_key_points": [
                    "$10B multi-year task order for sovereign intelligence cloud compute",
                    "Enhances defense sector enterprise revenue moat for AWS",
                    "Positive catalyst for AWS margin stabilization"
                ],
                "ai_reasoning": "High-margin public sector contracts support sustained operating margin expansion and cash flow predictability.",
                "duplicate_sources": []
            }
        ]

        normalized = []
        for item in raw_items:
            # Generate deterministic content hash
            h_input = f"{item['title']}:{item['source']}:{item['published_at']}"
            chash = hashlib.sha256(h_input.encode()).hexdigest()
            article = {
                **item,
                "content_hash": chash,
                "provider": "demo",
                "provider_article_id": f"demo-{item['id']}",
                "is_demo": True,
                "is_processed": True,
                "is_duplicate": False,
                "updated_at": item["published_at"],
                "created_at": item["published_at"]
            }
            normalized.append(article)
        return normalized

    async def get_latest_news(self, limit: int = 20, category: Optional[str] = None) -> List[Dict[str, Any]]:
        articles = self._articles
        if category and category.upper() != "ALL":
            articles = [a for a in articles if a.get("category", "").upper() == category.upper()]
        return articles[:limit]

    async def get_market_news(self, limit: int = 20) -> List[Dict[str, Any]]:
        market_cats = {"MARKET", "FEDERAL_RESERVE", "ECONOMY", "INFLATION", "GLOBAL_MARKETS"}
        filtered = [a for a in self._articles if a.get("category") in market_cats]
        return filtered[:limit] if filtered else self._articles[:limit]

    async def get_stock_news(self, symbol: str, limit: int = 15) -> List[Dict[str, Any]]:
        sym = symbol.upper().replace(".NS", "").replace("^NSEI", "NIFTY").replace("NSE:", "").replace("NASDAQ:", "")
        matches = [
            a for a in self._articles
            if any(sym in s.upper() for s in a.get("symbols", [])) or sym in a.get("title", "").upper()
        ]
        if not matches:
            # Return general market news as fallback so the UI never displays broken empty states
            return self._articles[:limit]
        return matches[:limit]

    async def get_company_news(self, company: str, limit: int = 15) -> List[Dict[str, Any]]:
        cmp = company.lower()
        matches = [
            a for a in self._articles
            if any(cmp in c.lower() for c in a.get("companies", [])) or cmp in a.get("title", "").lower()
        ]
        return matches[:limit] if matches else self._articles[:limit]

    async def get_news_by_topic(self, topic: str, limit: int = 20) -> List[Dict[str, Any]]:
        top = topic.lower()
        matches = [
            a for a in self._articles
            if any(top in t.lower() for t in a.get("topics", [])) or a.get("category", "").lower() == top
        ]
        return matches[:limit] if matches else self._articles[:limit]

    async def get_news_by_date_range(
        self, from_date: datetime.datetime, to_date: datetime.datetime, limit: int = 20
    ) -> List[Dict[str, Any]]:
        results = []
        for a in self._articles:
            pub = datetime.datetime.fromisoformat(a["published_at"].replace("Z", ""))
            if from_date <= pub <= to_date:
                results.append(a)
        return results[:limit]

    async def get_breaking_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        breaking = [a for a in self._articles if a.get("is_breaking") or a.get("importance") == "CRITICAL"]
        return breaking[:limit] if breaking else self._articles[:2]

    async def get_news_sentiment(self, symbol: Optional[str] = None) -> Dict[str, Any]:
        if symbol:
            articles = await self.get_stock_news(symbol, limit=10)
        else:
            articles = self._articles

        if not articles:
            return {
                "symbol": symbol or "MARKET",
                "sentiment": "NEUTRAL",
                "sentiment_score": 0.0,
                "breakdown": {"positive": 33, "neutral": 34, "negative": 33},
                "article_count": 0,
                "source": "DEMO DATA"
            }

        scores = [a.get("sentiment_score", 0.0) for a in articles]
        avg_score = round(sum(scores) / len(scores), 2)
        
        pos_cnt = sum(1 for s in scores if s > 0.15)
        neg_cnt = sum(1 for s in scores if s < -0.15)
        neu_cnt = len(scores) - pos_cnt - neg_cnt
        total = len(scores)

        pos_pct = round((pos_cnt / total) * 100)
        neg_pct = round((neg_cnt / total) * 100)
        neu_pct = max(0, 100 - pos_pct - neg_pct)

        dominant = "POSITIVE" if avg_score > 0.15 else ("NEGATIVE" if avg_score < -0.15 else "NEUTRAL")

        return {
            "symbol": symbol or "MARKET",
            "sentiment": dominant,
            "sentiment_score": avg_score,
            "breakdown": {"positive": pos_pct, "neutral": neu_pct, "negative": neg_pct},
            "article_count": total,
            "source": "DEMO DATA",
            "is_demo": True
        }
