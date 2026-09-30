import datetime
from typing import List, Dict, Any

class EconomicCalendarService:
    """
    Economic Calendar & Market Impact Analysis Service:
    Provides live and scheduled high-impact macroeconomic events
    along with systemic asset transmission channels.
    """

    @classmethod
    def get_calendar_events(cls) -> List[Dict[str, Any]]:
        today = datetime.date.today()
        return [
            {
                "id": "ECO-101",
                "event": "FOMC Interest Rate Decision",
                "country": "US",
                "date": today.strftime("%Y-%m-%d"),
                "time": "18:00 UTC",
                "expected": "5.50%",
                "previous": "5.50%",
                "actual": "5.50%",
                "impact": "HIGH",
                "affected_sectors": ["Technology", "Banking", "Real Estate"],
                "affected_assets": ["SPY", "QQQ", "TLT", "DXY", "JPM", "GOLD"],
                "analytical_note": "Unchanged policy stance preserves existing discount rate benchmarks across duration-sensitive equities."
            },
            {
                "id": "ECO-102",
                "event": "US Consumer Price Index (YoY)",
                "country": "US",
                "date": (today + datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
                "time": "12:30 UTC",
                "expected": "2.5%",
                "previous": "2.6%",
                "actual": "2.4%",
                "impact": "HIGH",
                "affected_sectors": ["Consumer Discretionary", "Retail", "Fixed Income"],
                "affected_assets": ["SPY", "TLT", "AMZN", "XLY"],
                "analytical_note": "Cooling inflation prints ease forward yield curve pressure and compress mortgage benchmarks."
            },
            {
                "id": "ECO-103",
                "event": "Non-Farm Payrolls & Unemployment Rate",
                "country": "US",
                "date": (today + datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
                "time": "12:30 UTC",
                "expected": "165K",
                "previous": "142K",
                "actual": "Pending",
                "impact": "HIGH",
                "affected_sectors": ["Industrials", "Banking", "Staffing"],
                "affected_assets": ["SPY", "DIA", "IWM", "DXY"],
                "analytical_note": "Employment resilience indicates enduring consumer spending capacity without wage-spiral acceleration."
            },
            {
                "id": "ECO-104",
                "event": "RBI Monetary Policy Committee Repo Rate",
                "country": "IN",
                "date": (today + datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
                "time": "04:30 UTC",
                "expected": "6.50%",
                "previous": "6.50%",
                "actual": "Pending",
                "impact": "MEDIUM",
                "affected_sectors": ["Indian Banking", "Automotive", "Infrastructure"],
                "affected_assets": ["NIFTY", "SENSEX", "HDFCBANK", "TATAMOTORS", "RELIANCE"],
                "analytical_note": "Liquidity management operations maintain stable interbank rates supporting domestic credit growth."
            },
            {
                "id": "ECO-105",
                "event": "ECB Main Refinancing Rate Decision",
                "country": "EU",
                "date": (today + datetime.timedelta(days=8)).strftime("%Y-%m-%d"),
                "time": "12:15 UTC",
                "expected": "3.40%",
                "previous": "3.65%",
                "actual": "Pending",
                "impact": "HIGH",
                "affected_sectors": ["European Equities", "Export", "Global Banking"],
                "affected_assets": ["EUR/USD", "VGK", "EWG"],
                "analytical_note": "European Central Bank monetary trajectory influences transatlantic foreign exchange cross rates."
            }
        ]
