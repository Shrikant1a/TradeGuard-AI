from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class NewsProvider(ABC):
    """
    Abstract interface for financial news providers (Alpha Vantage, GNews, Demo, etc.).
    Ensures provider-agnostic architecture without tight coupling to any single data source.
    """

    @abstractmethod
    async def get_latest_news(self, limit: int = 20, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch latest financial news across markets."""
        pass

    @abstractmethod
    async def get_market_news(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch general macro and market-moving news."""
        pass

    @abstractmethod
    async def get_stock_news(self, symbol: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Fetch company/ticker-specific news."""
        pass

    @abstractmethod
    async def get_company_news(self, company: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Fetch news by company name."""
        pass

    @abstractmethod
    async def get_news_by_topic(self, topic: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch news by financial topic/category."""
        pass

    @abstractmethod
    async def get_news_by_date_range(
        self, from_date: datetime, to_date: datetime, limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Fetch news within a specified time window."""
        pass

    @abstractmethod
    async def get_breaking_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch urgent market-moving breaking news."""
        pass

    @abstractmethod
    async def get_news_sentiment(self, symbol: Optional[str] = None) -> Dict[str, Any]:
        """Fetch aggregated sentiment score and distribution for symbol or market."""
        pass
