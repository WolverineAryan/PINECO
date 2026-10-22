import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from pineco.config import settings
from pineco.database import Base, engine, SessionLocal
from pineco.models import BrandRule
from pineco.seed import seed_database
from pineco.routers import (
    health,
    rules,
    facts,
    submissions,
    reviews,
    decisions,
    audit,
    dashboard,
    auth,
    products,
    agent,
)

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
logger = logging.getLogger("pineco")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    # Seed demo data if database is empty
    db = SessionLocal()
    try:
        rule_count = db.query(BrandRule).filter(BrandRule.workspace_id == settings.DEFAULT_WORKSPACE_ID).count()
        if rule_count == 0:
            logger.info("Database empty for demo workspace. Seeding initial baseline...")
            seed_database(db)
            logger.info("Demo data seeding completed.")
    except Exception as exc:
        logger.error(f"Error checking or seeding database: {exc}")
    finally:
        db.close()

    yield


app = FastAPI(
    title="Pineco Brand Governance API",
    description="Intelligent Brand Governance Platform API combining deterministic policy matching and AI claim verification.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
)

# Configure CORS with explicit allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Global Consistent Error Envelope Middleware / Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    req_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": str(exc.detail),
                "request_id": req_id,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    errors = exc.errors()
    msg = "; ".join([f"{'.'.join(str(l) for l in e['loc'])}: {e['msg']}" for e in errors])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": msg,
                "request_id": req_id,
            }
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    req_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    logger.exception(f"Unhandled server error [request_id={req_id}]: {exc}")
    # Never leak internal stack traces or secrets to callers
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred. Please consult system logs.",
                "request_id": req_id,
            }
        },
    )


# Mount versioned API routes under /api/v1
app.include_router(health.router, prefix="/api/v1")
app.include_router(rules.router, prefix="/api/v1")
app.include_router(facts.router, prefix="/api/v1")
app.include_router(submissions.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(decisions.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(agent.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "name": "Pineco Brand Governance Platform API",
        "version": "1.0.0",
        "health": "/api/v1/health",
        "docs": "/docs" if settings.APP_ENV != "production" else "disabled in production",
    }
