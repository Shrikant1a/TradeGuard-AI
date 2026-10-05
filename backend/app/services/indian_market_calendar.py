"""
TradeGuard AI - Indian Market Hours & Exchange Calendar Service
Enforces Indian market hours (09:15 - 15:30 IST), pre-market, post-market,
and trading holiday calendar for the National Stock Exchange of India (NSE)
and Bombay Stock Exchange (BSE).
"""

import datetime
from typing import Dict, Any, Optional, Set
from zoneinfo import ZoneInfo
import logging

logger = logging.getLogger("tradeguard.market_calendar")

IST = ZoneInfo("Asia/Kolkata")

# Verified Indian Stock Exchange Holidays (NSE & BSE)
# Format: "YYYY-MM-DD": "Holiday Name"
DEFAULT_INDIAN_HOLIDAYS: Dict[str, str] = {
    # 2025 Holidays
    "2025-01-26": "Republic Day",
    "2025-02-26": "Maha Shivratri",
    "2025-03-14": "Holi",
    "2025-03-31": "Id-Ul-Fitr (Ramzan Id)",
    "2025-04-10": "Mahavir Jayanti",
    "2025-04-14": "Dr. Baba Saheb Ambedkar Jayanti",
    "2025-04-18": "Good Friday",
    "2025-05-01": "Maharashtra Day",
    "2025-06-07": "Bakri Id / Eid ul-Adha",
    "2025-08-15": "Independence Day",
    "2025-08-27": "Ganesh Chaturthi",
    "2025-10-02": "Mahatma Gandhi Jayanti",
    "2025-10-21": "Diwali Laxmi Pujan (Muhurat Trading only)",
    "2025-10-22": "Diwali Balipratipada",
    "2025-11-05": "Prakash Gurpurb Sri Guru Nanak Dev Jayanti",
    "2025-12-25": "Christmas",
    # 2026 Holidays
    "2026-01-26": "Republic Day",
    "2026-02-17": "Maha Shivratri",
    "2026-03-03": "Holi",
    "2026-03-20": "Id-Ul-Fitr",
    "2026-04-03": "Good Friday",
    "2026-04-14": "Dr. Ambedkar Jayanti",
    "2026-05-01": "Maharashtra Day",
    "2026-08-15": "Independence Day",
    "2026-10-02": "Mahatma Gandhi Jayanti",
    "2026-10-20": "Dussehra",
    "2026-11-08": "Diwali Laxmi Pujan (Muhurat Trading)",
    "2026-11-10": "Diwali Balipratipada",
    "2026-11-24": "Guru Nanak Jayanti",
    "2026-12-25": "Christmas",
    # 2027 Holidays
    "2027-01-26": "Republic Day",
    "2027-03-08": "Maha Shivratri",
    "2027-03-23": "Holi",
    "2027-03-26": "Good Friday",
    "2027-04-14": "Dr. Ambedkar Jayanti",
    "2027-05-01": "Maharashtra Day",
    "2027-08-15": "Independence Day",
    "2027-10-02": "Mahatma Gandhi Jayanti",
    "2027-12-25": "Christmas",
}


class IndianMarketCalendar:
    """
    Official calendar and trading hours abstraction for NSE and BSE.
    Supports dynamic holiday updates, trading day checks, and pre/post market detection.
    """

    def __init__(self, custom_holidays: Optional[Dict[str, str]] = None):
        self.holidays: Dict[str, str] = dict(DEFAULT_INDIAN_HOLIDAYS)
        if custom_holidays:
            self.holidays.update(custom_holidays)

    def add_holiday(self, date_str: str, name: str) -> None:
        """Add or update an exchange holiday dynamically (YYYY-MM-DD)."""
        self.holidays[date_str] = name

    def is_holiday(self, check_date: datetime.date) -> Optional[str]:
        """Returns holiday name if the date is an exchange holiday, else None."""
        date_str = check_date.strftime("%Y-%m-%d")
        return self.holidays.get(date_str)

    def is_trading_day(self, check_date: datetime.date) -> bool:
        """Trading occurs Monday through Friday, excluding official exchange holidays."""
        if isinstance(check_date, datetime.datetime):
            check_date = check_date.date()
        if check_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            return False
        return self.is_holiday(check_date) is None

    def is_market_open(self, now: Optional[datetime.datetime] = None) -> bool:
        """Returns True if the Indian market regular session is currently open."""
        return self.get_market_status(now)["is_open"]

    def get_market_status(self, now: Optional[datetime.datetime] = None) -> Dict[str, Any]:
        """
        Calculates current Indian market session status:
        - PRE-MARKET: 09:00 AM - 09:15 AM IST
        - OPEN: 09:15 AM - 03:30 PM IST
        - POST-MARKET: 03:30 PM - 04:00 PM IST
        - CLOSED: All other times, weekends, and holidays
        """
        if now is None:
            now = datetime.datetime.now(IST)
        elif now.tzinfo is None:
            now = now.replace(tzinfo=IST)
        else:
            now = now.astimezone(IST)

        today = now.date()
        current_time = now.time()

        holiday_name = self.is_holiday(today)
        is_weekend = today.weekday() >= 5

        # Define IST session boundaries
        pre_market_start = datetime.time(9, 0)
        market_open_time = datetime.time(9, 15)
        market_close_time = datetime.time(15, 30)
        post_market_end = datetime.time(16, 0)

        # Base status info
        current_time_str = now.strftime("%Y-%m-%d %H:%M:%S IST")

        if is_weekend:
            day_name = "Saturday" if today.weekday() == 5 else "Sunday"
            msg = f"NSE & BSE Closed (Weekend: {day_name}). Opens Monday at 09:15 AM IST."
            return {
                "market": "India",
                "exchange": "NSE",
                "companion_exchange": "BSE",
                "status": "CLOSED",
                "is_open": False,
                "is_trading_day": False,
                "reason": f"Weekend ({day_name})",
                "holiday": None,
                "current_time_ist": current_time_str,
                "ist_time": current_time_str,
                "trading_hours": "09:15 - 15:30 IST",
                "status_message": msg,
                "message": msg,
            }

        if holiday_name:
            msg = f"NSE & BSE Closed for {holiday_name}. Regular trading resumes next business day at 09:15 AM IST."
            return {
                "market": "India",
                "exchange": "NSE",
                "companion_exchange": "BSE",
                "status": "CLOSED",
                "is_open": False,
                "is_trading_day": False,
                "reason": f"Exchange Holiday ({holiday_name})",
                "holiday": holiday_name,
                "current_time_ist": current_time_str,
                "ist_time": current_time_str,
                "trading_hours": "09:15 - 15:30 IST",
                "status_message": msg,
                "message": msg,
            }

        # Trading day evaluation
        if pre_market_start <= current_time < market_open_time:
            msg = "NSE & BSE in Pre-Market Session. Regular trading opens at 09:15 AM IST."
            return {
                "market": "India",
                "exchange": "NSE",
                "companion_exchange": "BSE",
                "status": "PRE-MARKET",
                "is_open": False,
                "is_trading_day": True,
                "reason": "Pre-Market Order Collection Session (09:00 - 09:15 IST)",
                "holiday": None,
                "current_time_ist": current_time_str,
                "ist_time": current_time_str,
                "trading_hours": "09:15 - 15:30 IST",
                "status_message": msg,
                "message": msg,
            }
        elif market_open_time <= current_time <= market_close_time:
            msg = "NSE & BSE Equity Markets are LIVE and Trading (09:15 - 15:30 IST)."
            return {
                "market": "India",
                "exchange": "NSE",
                "companion_exchange": "BSE",
                "status": "OPEN",
                "is_open": True,
                "is_trading_day": True,
                "reason": "Regular Equity Trading Session Active",
                "holiday": None,
                "current_time_ist": current_time_str,
                "ist_time": current_time_str,
                "trading_hours": "09:15 - 15:30 IST",
                "status_message": msg,
                "message": msg,
            }
        elif market_close_time < current_time <= post_market_end:
            msg = "NSE & BSE Post-Market Closing Session. Trading closed for today."
            return {
                "market": "India",
                "exchange": "NSE",
                "companion_exchange": "BSE",
                "status": "POST-MARKET",
                "is_open": False,
                "is_trading_day": True,
                "reason": "Post-Market Closing Session (15:30 - 16:00 IST)",
                "holiday": None,
                "current_time_ist": current_time_str,
                "ist_time": current_time_str,
                "trading_hours": "09:15 - 15:30 IST",
                "status_message": msg,
                "message": msg,
            }
        else:
            msg = "NSE & BSE Closed. Trading session: 09:15 - 15:30 IST."
            return {
                "market": "India",
                "exchange": "NSE",
                "companion_exchange": "BSE",
                "status": "CLOSED",
                "is_open": False,
                "is_trading_day": True,
                "reason": "Outside Regular Trading Hours",
                "holiday": None,
                "current_time_ist": current_time_str,
                "ist_time": current_time_str,
                "trading_hours": "09:15 - 15:30 IST",
                "status_message": msg,
                "message": msg,
            }


# Singleton calendar instance
indian_market_calendar = IndianMarketCalendar()
