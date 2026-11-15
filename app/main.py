import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.routes.admin import router as admin_router
from app.routes.health import router as health_router
from app.routes.orders import router as orders_router
from app.routes.products import router as products_router

# Configure structured JSON logging
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and graceful shutdown events."""
    logger.info(
        f"Starting {settings.PROJECT_NAME} v{settings.VERSION} "
        f"in [{settings.ENVIRONMENT.upper()}] mode on port {settings.PORT}"
    )
    yield
    logger.info("Application shutting down gracefully.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-ready E-Commerce Product & Order Management API with "
        "idempotent order processing, inventory locking, JWT admin auth, and full audit logging."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# Route registrations
# Health probes mounted directly at root
app.include_router(health_router)

# Core Business API mounted under /api
app.include_router(products_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
def root_summary():
    """Welcome endpoint providing service metadata and Swagger link."""
    return JSONResponse(
        content={
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "online",
            "environment": settings.ENVIRONMENT,
            "documentation": "/docs",
            "health_probe": "/health",
            "readiness_probe": "/ready",
            "metrics": "/metrics"
        }
    )

