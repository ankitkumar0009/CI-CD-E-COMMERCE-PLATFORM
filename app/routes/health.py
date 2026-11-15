import time
from datetime import UTC, datetime

from fastapi import APIRouter, Response, status
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

from app.core.config import settings
from app.database.session import check_database_connection
from app.schemas.common import HealthResponse, ReadyResponse

router = APIRouter(tags=["Health & Monitoring"])

_START_TIME = time.time()

# Prometheus Telemetry Counters & Histograms
HTTP_REQUESTS_TOTAL = Counter(
    "ecommerce_http_requests_total",
    "Total HTTP requests processed by endpoint and status code",
    ["method", "endpoint", "status"],
)

ORDER_CREATIONS_TOTAL = Counter(
    "ecommerce_orders_created_total", "Total orders created through the platform"
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "ecommerce_http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
)


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Application Liveness Probe",
    description="Returns HTTP 200 if the FastAPI application process is alive and responsive.",
)
def get_health() -> HealthResponse:
    uptime = time.time() - _START_TIME
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        timestamp=datetime.now(UTC),
        uptime_seconds=round(uptime, 2),
    )


@router.get(
    "/ready",
    response_model=ReadyResponse,
    summary="Database Readiness Probe",
    description="Tests active connection to PostgreSQL database. Returns 200 when ready, 503 when unhealthy.",
)
def get_readiness(response: Response) -> ReadyResponse:
    is_healthy, detail = check_database_connection()
    now = datetime.now(UTC)

    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return ReadyResponse(
            status="unhealthy", database="disconnected", details=detail, timestamp=now
        )

    return ReadyResponse(
        status="ready",
        database="connected",
        details="PostgreSQL database operational",
        timestamp=now,
    )


@router.get(
    "/metrics",
    summary="Prometheus Metrics Scrape Endpoint",
    description="Exposes application telemetry in official Prometheus text format.",
)
def get_metrics() -> Response:
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)
