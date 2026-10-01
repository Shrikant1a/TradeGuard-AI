import pytest
import pytest_asyncio
import httpx

@pytest_asyncio.fixture
async def client():
    async with httpx.AsyncClient(timeout=30.0) as async_client:
        yield async_client
