import pytest
import pytest_asyncio
import httpx
from backend.app.main import app

@pytest_asyncio.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as async_client:
        yield async_client
