from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from backend.app.config import settings

# Normalize DATABASE_URL for async engines (e.g. Supabase postgres:// -> postgresql+asyncpg://)
raw_db_url = settings.DATABASE_URL
if raw_db_url.startswith("postgres://"):
    db_url = raw_db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+"):
    db_url = raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    db_url = raw_db_url

is_sqlite = "sqlite" in db_url.lower()

# Production Engine Configuration
engine_kwargs = {
    "echo": False,
    "future": True,
}

if is_sqlite:
    engine_kwargs["connect_args"] = {
        "check_same_thread": False,
        "timeout": 30.0,
    }
else:
    # Production connection pool for PostgreSQL / Supabase
    engine_kwargs.update({
        "pool_size": 25,
        "max_overflow": 15,
        "pool_recycle": 1800,
        "pool_timeout": 30.0,
        "pool_pre_ping": True,
    })

engine = create_async_engine(db_url, **engine_kwargs)

# For SQLite, enforce WAL mode, busy timeout, and normal synchronous writes for concurrency
if is_sqlite:
    @event.listens_for(engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.execute("PRAGMA cache_size=-64000")
            cursor.close()
        except Exception:
            pass

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
