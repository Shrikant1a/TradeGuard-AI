import logging
from backend.app.config import settings
from backend.app.services.news.base import NewsProvider
from backend.app.services.news.alphavantage import AlphaVantageNewsProvider
from backend.app.services.news.gnews import GNewsProvider
from backend.app.services.news.demo_data import DemoNewsProvider

logger = logging.getLogger("tradeguard.news.factory")

class NewsProviderFactory:
    """
    Factory creating news provider instances based on configuration and credentials.
    Ensures safe fallback to DemoNewsProvider with clear labeling when live keys are absent.
    """

    _instance: NewsProvider = None

    @classmethod
    def get_provider(cls) -> NewsProvider:
        if cls._instance is not None:
            return cls._instance

        provider_name = (settings.NEWS_PROVIDER or "alphavantage").lower().strip()

        if provider_name == "alphavantage":
            if settings.ALPHAVANTAGE_API_KEY and settings.ALPHAVANTAGE_API_KEY.strip().lower() not in ["", "demo", "demo_or_your_key_here"]:
                logger.info("Initializing AlphaVantageNewsProvider with live API key.")
                cls._instance = AlphaVantageNewsProvider()
            else:
                logger.info("No Alpha Vantage key configured. Initializing DemoNewsProvider (clearly labeled demo data).")
                cls._instance = DemoNewsProvider()
        elif provider_name == "gnews":
            if settings.GNEWS_API_KEY:
                logger.info("Initializing GNewsProvider.")
                cls._instance = GNewsProvider()
            else:
                logger.info("No GNews key configured. Initializing DemoNewsProvider.")
                cls._instance = DemoNewsProvider()
        else:
            logger.info(f"Using default DemoNewsProvider for provider '{provider_name}'.")
            cls._instance = DemoNewsProvider()

        return cls._instance

    @classmethod
    def reset_provider(cls):
        """Allows test suites to reset or mock providers dynamically"""
        cls._instance = None
