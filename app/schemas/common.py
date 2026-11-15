from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="Application status")
    version: str = Field(default="1.0.0", description="Application version")
    timestamp: datetime = Field(description="Current UTC timestamp")
    uptime_seconds: float = Field(description="Process uptime in seconds")


class ReadyResponse(BaseModel):
    status: str = Field(description="Readiness status ('ready' or 'unhealthy')")
    database: str = Field(description="Database connectivity status")
    details: Optional[str] = Field(default=None, description="Diagnostic details")
    timestamp: datetime = Field(description="Current UTC timestamp")

