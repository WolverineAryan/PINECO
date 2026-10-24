from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from pineco.config import settings

db_url = settings.DATABASE_URL
# Render and other PaaS providers provide postgres:// which SQLAlchemy 2.0 requires as postgresql+psycopg:// or postgresql+psycopg2://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url.startswith("postgresql://") and not any(
    driver in db_url for driver in ["+psycopg", "+asyncpg", "+pg8000"]
):
    try:
        import psycopg  # psycopg v3
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
    except ImportError:
        try:
            import psycopg2  # psycopg2 fallback
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        except ImportError:
            pass

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

# Enable foreign key constraint enforcement and WAL mode for high volume & concurrency
if db_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=10000")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
