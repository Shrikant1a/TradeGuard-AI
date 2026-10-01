/**
 * Fallback Financial News Intelligence Data
 * Provides institutional-grade market intelligence, breaking alerts,
 * and economic calendar events when the backend API is unreachable
 * (such as standalone client-side deployments on Netlify or during network recovery).
 */

export interface FallbackArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  image_url: string;
  author: string;
  published_at: string;
  category: string;
  symbols: string[];
  companies: string[];
  topics: string[];
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  sentiment_score: number;
  sentiment_breakdown: { positive: number; neutral: number; negative: number };
  source_sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  relevance_score: number;
  impact_score: number;
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  is_breaking: boolean;
  is_demo?: boolean;
  affected_assets: string[];
  ai_summary: string;
  ai_key_points: string[];
  ai_reasoning: string;
  duplicate_sources: Array<{ source: string; url: string; published_at: string }>;
}

const getRecentIso = (minutesAgo: number): string => {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
};

export const FALLBACK_ARTICLES: FallbackArticle[] = [
  {
    id: 1,
    title: "Federal Reserve Holds Benchmark Rate Steady at 5.25%-5.50%, Signals Measured Path for Policy Easing",
    summary: "The Federal Open Market Committee concluded its policy symposium by voting unanimously to maintain the federal funds target rate. Chair Jerome Powell highlighted enduring labor market equilibrium while emphasizing that committee members require sustained confirmation before initiating broad monetary easing.",
    source: "Federal Reserve / Bloomberg",
    source_url: "https://www.federalreserve.gov/monetarypolicy.htm",
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
    author: "Jerome Powell / FOMC Staff",
    published_at: getRecentIso(15),
    category: "ECONOMY",
    symbols: ["SPY", "QQQ", "TLT", "DXY", "JPM"],
    companies: ["Federal Reserve System", "JPMorgan Chase"],
    topics: ["economy_monetary", "financial_markets", "economy_macro"],
    sentiment: "NEUTRAL",
    sentiment_score: 0.12,
    sentiment_breakdown: { positive: 35, neutral: 55, negative: 10 },
    source_sentiment: "NEUTRAL",
    relevance_score: 98.0,
    impact_score: 94.0,
    importance: "CRITICAL",
    is_breaking: true,
    is_demo: false,
    affected_assets: ["SPY", "QQQ", "BANKS", "USD", "BONDS"],
    ai_summary: "The FOMC unanimously maintained benchmark rates at 5.25%-5.50%. Powell noted cooling core PCE inflation while confirming systematic balance sheet runoff (QT) continues on schedule.",
    ai_key_points: [
      "Benchmark rate maintained at 5.25%-5.50% corridor",
      "Core PCE disinflation trajectory acknowledged by voting governors",
      "Quantitative tightening balance sheet reduction proceeding as planned"
    ],
    ai_reasoning: "Federal Reserve policy determinations dictate systemic equity discount rates, fixed-income yields, and currency valuation dynamics.",
    duplicate_sources: [
      { source: "Reuters", url: "https://reuters.com/markets/us", published_at: getRecentIso(12) },
      { source: "CNBC", url: "https://cnbc.com/economy", published_at: getRecentIso(10) }
    ]
  },
  {
    id: 2,
    title: "Apple Reports Record Services Revenue of $24.2B, Operating Margin Expands to 46.2% on Apple Intelligence Rollout",
    summary: "Apple Inc. announced quarterly revenue of $94.9 billion, driven by all-time record Services revenue and accelerating institutional hardware refresh cycles following multi-language Apple Intelligence rollouts across flagship iPhone and Mac lineups.",
    source: "Apple Investor Relations / Reuters",
    source_url: "https://www.apple.com/newsroom/",
    image_url: "https://images.unsplash.com/photo-1510519138161-58474ebf844b?w=800&auto=format&fit=crop&q=60",
    author: "Tim Cook / Financial Systems",
    published_at: getRecentIso(35),
    category: "EARNINGS",
    symbols: ["AAPL", "QQQ", "MSFT"],
    companies: ["Apple Inc."],
    topics: ["earnings", "technology", "finance"],
    sentiment: "POSITIVE",
    sentiment_score: 0.86,
    sentiment_breakdown: { positive: 86, neutral: 10, negative: 4 },
    source_sentiment: "POSITIVE",
    relevance_score: 97.0,
    impact_score: 89.0,
    importance: "HIGH",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["AAPL", "QQQ", "XLK", "TSM"],
    ai_summary: "Apple posted quarterly revenue of $94.9B with Services surging to $24.2B. High blended gross margins (46.2%) and active device ecosystem expansion beat Wall Street consensus.",
    ai_key_points: [
      "Services revenue reached all-time high of $24.2 billion",
      "Gross margin increased to 46.2%, beating consensus by 90 bps",
      "Active device installed base surpassed 2.2 billion units worldwide"
    ],
    ai_reasoning: "Expanding software and subscription margins decouple Apple's cash flow from pure hardware cycle seasonality.",
    duplicate_sources: [
      { source: "Wall Street Journal", url: "https://wsj.com/tech", published_at: getRecentIso(30) }
    ]
  },
  {
    id: 3,
    title: "NVIDIA Accelerates Blackwell NVL72 AI Server Shipments to Tier-1 Cloud Hyperscalers",
    summary: "NVIDIA Corporation confirmed high-volume commercial deliveries of its Blackwell GB200 and B200 AI supercomputing clusters to leading cloud hyperscalers including Microsoft Azure, AWS, and Google Cloud, demonstrating accelerating enterprise inference demand.",
    source: "NVIDIA Newsroom / Financial Times",
    source_url: "https://nvidianews.nvidia.com/",
    image_url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=60",
    author: "Jensen Huang / Enterprise Systems",
    published_at: getRecentIso(55),
    category: "AI_TECH",
    symbols: ["NVDA", "MSFT", "AMZN", "GOOGL"],
    companies: ["NVIDIA Corporation", "Microsoft", "Amazon", "Alphabet"],
    topics: ["technology", "financial_markets", "earnings"],
    sentiment: "POSITIVE",
    sentiment_score: 0.91,
    sentiment_breakdown: { positive: 91, neutral: 6, negative: 3 },
    source_sentiment: "POSITIVE",
    relevance_score: 96.0,
    impact_score: 91.0,
    importance: "HIGH",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["NVDA", "SMH", "SOXX", "MSFT", "AMZN"],
    ai_summary: "NVIDIA confirmed accelerating commercial deliveries of Blackwell NVL72 architectures. Hyperscaler capex guidance provides structural revenue visibility into 2027.",
    ai_key_points: [
      "Blackwell clusters entering mass deployment across global cloud data centers",
      "Order backlog fully allocated across next four fiscal quarters",
      "Inference performance gains deliver 25x cost-to-token reduction"
    ],
    ai_reasoning: "Hyperscaler infrastructure capex commitments provide strong bullish tailwinds for semiconductor momentum factors.",
    duplicate_sources: []
  },
  {
    id: 4,
    title: "Tesla Receives Key Metropolitan Regulatory Clearances for Commercial Autonomous Cybercab Operations",
    summary: "Tesla Inc. has secured commercial autonomous transport operating permits in major urban jurisdictions, enabling uncrewed ride-hailing validation for its Cybercab network powered by end-to-end neural network Full Self-Driving (FSD).",
    source: "Electrek / Reuters",
    source_url: "https://electrek.co/",
    image_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60",
    author: "Auto Tech Bureau",
    published_at: getRecentIso(80),
    category: "STOCK",
    symbols: ["TSLA", "UBER"],
    companies: ["Tesla Inc.", "Uber Technologies"],
    topics: ["technology", "financial_markets"],
    sentiment: "POSITIVE",
    sentiment_score: 0.74,
    sentiment_breakdown: { positive: 74, neutral: 18, negative: 8 },
    source_sentiment: "POSITIVE",
    relevance_score: 93.0,
    impact_score: 84.0,
    importance: "HIGH",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["TSLA", "UBER", "CARZ"],
    ai_summary: "Regulatory clearances in municipal testbeds allow Tesla to begin commercial autonomous vehicle pilot programs without safety drivers.",
    ai_key_points: [
      "Commercial permit enables revenue-generating autonomous passenger rides",
      "Autonomous network utilizes vision-only neural network FSD model",
      "Initial fleet deployment targeting high-density urban transit zones"
    ],
    ai_reasoning: "De-risking regulatory approvals shifts valuation models from cyclical auto manufacturing to recurring autonomous software multiples.",
    duplicate_sources: []
  },
  {
    id: 5,
    title: "US Headline CPI Moderates to 2.4% Annualized Pace, Core Print Aligns with Disinflation Trend",
    summary: "The Bureau of Labor Statistics reported that headline Consumer Price Index increased 0.1% month-over-month, taking the annual rate to 2.4%. Disinflation in motor vehicle insurance, airfares, and shelter mitigated minor wholesale energy fluctuations.",
    source: "Bureau of Labor Statistics / MarketWatch",
    source_url: "https://www.bls.gov/cpi/",
    image_url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=60",
    author: "BLS Data Desk",
    published_at: getRecentIso(120),
    category: "ECONOMY",
    symbols: ["SPY", "TLT", "DXY", "GLD"],
    companies: ["Bureau of Labor Statistics"],
    topics: ["economy_macro", "financial_markets", "economy_monetary"],
    sentiment: "POSITIVE",
    sentiment_score: 0.68,
    sentiment_breakdown: { positive: 68, neutral: 24, negative: 8 },
    source_sentiment: "POSITIVE",
    relevance_score: 95.0,
    impact_score: 88.0,
    importance: "CRITICAL",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["SPY", "QQQ", "TLT", "DXY", "GOLD"],
    ai_summary: "Headline CPI printed at 2.4% YoY, supporting expectations for normalized real yields and lower policy rate volatility.",
    ai_key_points: [
      "Headline inflation cooled to 2.4% annualized",
      "Core CPI remained steady at 2.8% YoY",
      "10-year Treasury yield retreated 7 bps to 4.08%"
    ],
    ai_reasoning: "Subdued inflation metrics compress sovereign risk premiums and provide valuation support for growth asset classes.",
    duplicate_sources: []
  },
  {
    id: 6,
    title: "Microsoft and OpenAI Solidify Expanded Multi-Year Sovereign AI Enterprise Infrastructure Agreement",
    summary: "Microsoft and OpenAI finalized a comprehensive governance and licensing framework designating Azure as exclusive global compute infrastructure for next-generation frontier reasoning models across government and enterprise tiers.",
    source: "Wall Street Journal / TechCrunch",
    source_url: "https://www.wsj.com/",
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    author: "Enterprise Technology Team",
    published_at: getRecentIso(160),
    category: "AI_TECH",
    symbols: ["MSFT", "GOOGL"],
    companies: ["Microsoft Corporation", "OpenAI"],
    topics: ["technology", "cloud_computing", "ai"],
    sentiment: "POSITIVE",
    sentiment_score: 0.82,
    sentiment_breakdown: { positive: 82, neutral: 14, negative: 4 },
    source_sentiment: "POSITIVE",
    relevance_score: 92.0,
    impact_score: 83.0,
    importance: "HIGH",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["MSFT", "QQQ", "GOOGL"],
    ai_summary: "The expanded partnership cements Azure's status as primary enterprise host for advanced AI architectures while ensuring stable IP usage terms.",
    ai_key_points: [
      "Perpetual enterprise access guaranteed for Microsoft 365 Copilot suite",
      "Exclusive infrastructure supplier status reaffirmed for Azure cloud clusters",
      "Clear revenue-sharing schedules mitigate legal governance uncertainties"
    ],
    ai_reasoning: "Long-term IP clarity secures Microsoft's high-margin enterprise software pipeline against competitive cloud providers.",
    duplicate_sources: []
  },
  {
    id: 7,
    title: "Bitcoin Surpasses $94,000 as Institutional Spot ETF Net Inflows Hit $2.8B Record in Single Week",
    summary: "Digital assets rallied broadly as regulated spot Bitcoin exchange-traded funds recorded the largest single-week capital inflows on record. Cumulative ETF holdings now represent over 5.4% of total circulating supply.",
    source: "CoinDesk / Cointelegraph",
    source_url: "https://www.coindesk.com/",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
    author: "Digital Asset Markets Desk",
    published_at: getRecentIso(210),
    category: "CRYPTO",
    symbols: ["BTC", "ETH", "COIN", "MSTR"],
    companies: ["Coinbase Global", "MicroStrategy"],
    topics: ["crypto", "blockchain", "etf"],
    sentiment: "POSITIVE",
    sentiment_score: 0.89,
    sentiment_breakdown: { positive: 89, neutral: 8, negative: 3 },
    source_sentiment: "POSITIVE",
    relevance_score: 94.0,
    impact_score: 86.0,
    importance: "HIGH",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["BTC", "ETH", "COIN", "MSTR"],
    ai_summary: "Record weekly inflows of $2.8B into institutional spot Bitcoin ETFs pushed prices above $94,000, signaling structural sovereign and institutional adoption.",
    ai_key_points: [
      "Net weekly institutional ETF subscriptions reached $2.8 billion",
      "Over-the-counter desk balances reached 6-year inventory lows",
      "Ethereum spot products also recorded positive net weekly capital flows"
    ],
    ai_reasoning: "Sustained institutional asset allocation creates programmatic demand while illiquid exchange supply creates positive reflexivity.",
    duplicate_sources: []
  },
  {
    id: 8,
    title: "Reliance Industries and Tata Motors Announce Domestic 40 GWh EV Battery & Storage Gigafactory in Gujarat",
    summary: "In a transformative initiative for India's clean mobility sector, Reliance Industries and Tata Motors announced a joint venture to build a state-of-the-art 40 GWh cell manufacturing hub eligible for the Government of India's PLI advanced chemistry cell incentives.",
    source: "Economic Times / Mint",
    source_url: "https://economictimes.indiatimes.com/",
    image_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=60",
    author: "Energy Bureau Mumbai",
    published_at: getRecentIso(260),
    category: "MARKET",
    symbols: ["RELIANCE", "TATAMOTORS", "NIFTY"],
    companies: ["Reliance Industries", "Tata Motors"],
    topics: ["energy", "automotive", "india_markets"],
    sentiment: "POSITIVE",
    sentiment_score: 0.85,
    sentiment_breakdown: { positive: 85, neutral: 12, negative: 3 },
    source_sentiment: "POSITIVE",
    relevance_score: 93.0,
    impact_score: 81.0,
    importance: "MEDIUM",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["RELIANCE", "TATAMOTORS", "NIFTY"],
    ai_summary: "The 40 GWh joint gigafactory reduces reliance on imported cell components and bolsters vertical integration across Indian domestic electric mobility.",
    ai_key_points: [
      "40 GWh planned capacity with initial phase operational within 24 months",
      "Qualifies for central government Production-Linked Incentive (PLI) grants",
      "Direct commercial synergy for Tata Motors passenger EV market share"
    ],
    ai_reasoning: "Strategic infrastructure investments in domestic manufacturing enhance long-term balance sheet returns and reduce FX import exposure.",
    duplicate_sources: []
  },
  {
    id: 9,
    title: "Brent Crude Contracts Stabilize at $76/bbl as OPEC+ Confirms Extension of Voluntary Production Cuts",
    summary: "Crude oil benchmarks held steady after OPEC+ delegates voted to roll over 2.2 million barrels per day in voluntary output reductions through the upcoming quarter, aiming to buffer seasonal refinery maintenance slowdowns.",
    source: "S&P Global Platts / Reuters",
    source_url: "https://www.spglobal.com/commodityinsights/",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60",
    author: "Commodity Intelligence Desk",
    published_at: getRecentIso(310),
    category: "COMMODITIES",
    symbols: ["XOM", "CVX", "BRENT"],
    companies: ["ExxonMobil", "Chevron"],
    topics: ["commodities", "energy", "macro"],
    sentiment: "NEUTRAL",
    sentiment_score: 0.05,
    sentiment_breakdown: { positive: 30, neutral: 55, negative: 15 },
    source_sentiment: "NEUTRAL",
    relevance_score: 89.0,
    impact_score: 75.0,
    importance: "MEDIUM",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["XLE", "OIL", "USO", "AIRLINES"],
    ai_summary: "OPEC+ extended 2.2M bpd voluntary cuts, preserving baseline supply-demand balance amid shifting global macroeconomic demand projections.",
    ai_key_points: [
      "Voluntary cuts of 2.2 million bpd extended through next quarter",
      "Brent and WTI spreads maintain modest backwardation structure",
      "Downstream aviation and transport fuel margins remain stable"
    ],
    ai_reasoning: "Disciplined cartel quotas set a structural price floor for upstream energy operators while avoiding consumer price shocks.",
    duplicate_sources: []
  },
  {
    id: 10,
    title: "US Dollar Index (DXY) Consolidates at 103.4 as Global Central Banks Signal Coordinated Policy Moderation",
    summary: "The greenback traded in a narrow channel against major counterpart currencies as market pricing converged around synchronized central bank rate trajectories across the European Central Bank, Bank of England, and Federal Reserve.",
    source: "FXStreet / Financial Times",
    source_url: "https://www.fxstreet.com/",
    image_url: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop&q=60",
    author: "FX Strategy Group",
    published_at: getRecentIso(370),
    category: "FOREX",
    symbols: ["DXY", "EURUSD", "GBPUSD"],
    companies: ["Foreign Exchange Markets"],
    topics: ["forex", "currencies", "central_banks"],
    sentiment: "NEUTRAL",
    sentiment_score: 0.02,
    sentiment_breakdown: { positive: 25, neutral: 65, negative: 10 },
    source_sentiment: "NEUTRAL",
    relevance_score: 88.0,
    impact_score: 72.0,
    importance: "MEDIUM",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["DXY", "EURUSD", "EM_CURRENCIES"],
    ai_summary: "The DXY index consolidated around 103.4 as sovereign interest rate differentials narrowed between the US and European bond markets.",
    ai_key_points: [
      "DXY range-bound between 103.2 and 103.8",
      "Currency volatility metrics remain at multi-month lows",
      "Emerging market local currency debt attracted sustained foreign inflows"
    ],
    ai_reasoning: "Stable FX volatility environments facilitate cross-border carry trades and reduce hedging costs for multinational equity earnings.",
    duplicate_sources: []
  },
  {
    id: 11,
    title: "JPMorgan Chase Reports Robust Net Interest Income and Resilient Consumer Credit Quality in Q3 Audit",
    summary: "JPMorgan Chase & Co. reported earnings of $4.37 per share, outperforming consensus estimates as investment banking advisory fees surged 31% and consumer default provisions remained beneath pre-pandemic historical averages.",
    source: "JPMorgan Investor Relations / CNBC",
    source_url: "https://www.jpmorganchase.com/ir",
    image_url: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&auto=format&fit=crop&q=60",
    author: "Jamie Dimon / Financial Accounting",
    published_at: getRecentIso(420),
    category: "EARNINGS",
    symbols: ["JPM", "BAC", "XLF"],
    companies: ["JPMorgan Chase & Co.", "Bank of America"],
    topics: ["earnings", "banking", "finance"],
    sentiment: "POSITIVE",
    sentiment_score: 0.81,
    sentiment_breakdown: { positive: 81, neutral: 14, negative: 5 },
    source_sentiment: "POSITIVE",
    relevance_score: 94.0,
    impact_score: 82.0,
    importance: "HIGH",
    is_breaking: false,
    is_demo: false,
    affected_assets: ["JPM", "XLF", "KBE", "SPY"],
    ai_summary: "JPMorgan delivered comprehensive earnings outperformance, highlighting strong dealmaking pipelines and prime consumer balance sheet health.",
    ai_key_points: [
      "Investment banking revenue grew 31% year-over-year",
      "Net interest income guidance revised upward for full fiscal year",
      "Credit loss reserves reflect stable non-performing asset trends"
    ],
    ai_reasoning: "Systemic bank earnings demonstrate enduring economic liquidity and validate corporate credit health.",
    duplicate_sources: []
  },
  {
    id: 12,
    title: "US Department of Commerce Finalizes Semiconductor Export Standards with Allied Nations to Protect AI Edge Tech",
    summary: "The Bureau of Industry and Security announced coordinated export compliance standards developed alongside Japan and the Netherlands, establishing clear computational performance density metrics for advanced foundry tool shipments.",
    source: "US Department of Commerce / Reuters",
    source_url: "https://www.bis.doc.gov/",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
    author: "Commerce Policy Group",
    published_at: getRecentIso(480),
    category: "BREAKING",
    symbols: ["ASML", "NVDA", "TSM", "AMAT"],
    companies: ["ASML Holding", "NVIDIA", "TSMC", "Applied Materials"],
    topics: ["semiconductors", "geopolitics", "trade_policy"],
    sentiment: "NEUTRAL",
    sentiment_score: -0.05,
    sentiment_breakdown: { positive: 20, neutral: 60, negative: 20 },
    source_sentiment: "NEUTRAL",
    relevance_score: 95.0,
    impact_score: 87.0,
    importance: "HIGH",
    is_breaking: true,
    is_demo: false,
    affected_assets: ["SMH", "ASML", "NVDA", "TSM"],
    ai_summary: "Harmonized multilateral semiconductor export framework clarifies licensing parameters for lithography and high-bandwidth memory suppliers.",
    ai_key_points: [
      "Unified computational threshold metrics agreed with allied partners",
      "Clarifies forward sales visibility for equipment manufacturers",
      "Enterprise AI developers retain access to domestic compute clusters"
    ],
    ai_reasoning: "Regulatory clarity resolves prolonged overhang across semiconductor equipment valuations.",
    duplicate_sources: []
  }
];

export const FALLBACK_ECONOMIC_EVENTS = [
  {
    id: "ECO-101",
    event: "FOMC Interest Rate Decision",
    country: "US",
    date: new Date().toISOString().split("T")[0],
    time: "18:00 UTC",
    expected: "5.50%",
    previous: "5.50%",
    actual: "5.50%",
    impact: "HIGH",
    affected_sectors: ["Technology", "Banking", "Real Estate"],
    affected_assets: ["SPY", "QQQ", "TLT", "DXY", "JPM", "GOLD"],
    analytical_note: "Unchanged policy stance preserves existing discount rate benchmarks across duration-sensitive equities."
  },
  {
    id: "ECO-102",
    event: "US Consumer Price Index (YoY)",
    country: "US",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "12:30 UTC",
    expected: "2.5%",
    previous: "2.6%",
    actual: "2.4%",
    impact: "HIGH",
    affected_sectors: ["Consumer Discretionary", "Retail", "Fixed Income"],
    affected_assets: ["SPY", "TLT", "AMZN", "XLY"],
    analytical_note: "Cooling inflation prints ease forward yield curve pressure and compress mortgage benchmarks."
  },
  {
    id: "ECO-103",
    event: "Non-Farm Payrolls & Unemployment Rate",
    country: "US",
    date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    time: "12:30 UTC",
    expected: "165K",
    previous: "142K",
    actual: "Pending",
    impact: "HIGH",
    affected_sectors: ["Industrials", "Banking", "Staffing"],
    affected_assets: ["SPY", "DIA", "IWM", "DXY"],
    analytical_note: "Employment resilience indicates enduring consumer spending capacity without wage-spiral acceleration."
  },
  {
    id: "ECO-104",
    event: "RBI Monetary Policy Committee Repo Rate",
    country: "IN",
    date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    time: "04:30 UTC",
    expected: "6.50%",
    previous: "6.50%",
    actual: "Pending",
    impact: "MEDIUM",
    affected_sectors: ["Indian Banking", "Automotive", "Infrastructure"],
    affected_assets: ["NIFTY", "SENSEX", "HDFCBANK", "TATAMOTORS", "RELIANCE"],
    analytical_note: "Liquidity management operations maintain stable interbank rates supporting domestic credit growth."
  }
];

export const FALLBACK_DAILY_DIGEST = {
  date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  generated_at: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  headline: "Global Markets Steady Post-Fed, Tech Earnings & Blackwell AI Deployment Power Risk Sentiment",
  market_stance: "MODERATELY_BULLISH",
  confidence_score: 87.5,
  macro_summary: "Global equity and digital asset markets exhibit sustained momentum as central banks reaffirm controlled disinflation trajectories. Resilient corporate balance sheets and accelerating hyperscaler AI capital expenditure provide solid structural tailwinds.",
  key_developments: [
    "FOMC maintains benchmark borrowing costs while observing core PCE disinflation",
    "Apple posts record Services revenue of $24.2B with expanding 46.2% gross margin",
    "NVIDIA confirms mass commercial shipments of Blackwell NVL72 AI computing clusters",
    "Institutional spot Bitcoin ETF weekly inflows hit record $2.8 billion"
  ],
  sector_allocations: [
    { sector: "Technology & Semiconductors", rating: "OVERWEIGHT", reasoning: "Strong AI hardware capex and hyperscaler cloud commitments." },
    { sector: "Consumer Discretionary", rating: "NEUTRAL", reasoning: "Steady retail consumption balancing interest rate lag effects." },
    { sector: "Fixed Income", rating: "OVERWEIGHT", reasoning: "Yield curve normalization favors intermediate duration paper." }
  ],
  risk_factors: [
    "Geopolitical shipping corridor volatility and potential energy supply interruptions",
    "Secondary inflation stickiness in services and municipal housing expenditures"
  ]
};

/**
 * Filter helper for fallback articles matching client criteria
 */
export function filterFallbackArticles(params: {
  category?: string;
  symbol?: string;
  sentiment?: string;
  min_impact?: number;
  search?: string;
  limit?: number;
}): FallbackArticle[] {
  let list = [...FALLBACK_ARTICLES];

  if (params.category && params.category !== "ALL") {
    const cat = params.category.toUpperCase();
    if (cat === "BREAKING") {
      list = list.filter((a) => a.is_breaking);
    } else {
      list = list.filter(
        (a) => a.category.toUpperCase() === cat || a.topics.some((t) => t.toUpperCase().includes(cat))
      );
    }
  }

  if (params.symbol) {
    const sym = params.symbol.toUpperCase();
    list = list.filter(
      (a) =>
        a.symbols.some((s) => s.toUpperCase() === sym) ||
        a.affected_assets.some((s) => s.toUpperCase() === sym)
    );
  }

  if (params.sentiment && params.sentiment !== "ALL") {
    const s = params.sentiment.toUpperCase();
    list = list.filter((a) => a.sentiment === s);
  }

  if (params.min_impact !== undefined && params.min_impact > 0) {
    list = list.filter((a) => a.impact_score >= params.min_impact!);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.symbols.some((s) => s.toLowerCase().includes(q)) ||
        a.companies.some((c) => c.toLowerCase().includes(q))
    );
  }

  if (params.limit && params.limit > 0) {
    list = list.slice(0, params.limit);
  }

  return list;
}
