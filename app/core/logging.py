import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict


SENSITIVE_KEYS = {
    "password",
    "password_hash",
    "secret",
    "jwt_secret_key",
    "token",
    "access_token",
    "authorization",
    "credit_card",
    "cvv",
}


def mask_sensitive_data(data: Any) -> Any:
    """Recursively mask sensitive values in logs."""
    if isinstance(data, dict):
        masked = {}
        for k, v in data.items():
            if str(k).lower() in SENSITIVE_KEYS:
                masked[k] = "******"
            else:
                masked[k] = mask_sensitive_data(v)
        return masked
    elif isinstance(data, list):
        return [mask_sensitive_data(item) for item in data]
    return data


class JSONFormatter(logging.Formatter):
    """
    Structured JSON log formatter for DevOps observability,
    Prometheus/ELK/Fluentd parsing.
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Include custom request context if attached to record
        for attr in ["request_id", "method", "path", "status_code", "duration_ms", "client_ip", "user_id"]:
            if hasattr(record, attr):
                log_entry[attr] = getattr(record, attr)

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Mask sensitive keys
        masked_entry = mask_sensitive_data(log_entry)
        return json.dumps(masked_entry, default=str)


def setup_logging(log_level: str = "INFO") -> None:
    """Configure structured JSON logging for the entire application."""
    root_logger = logging.getLogger()
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    root_logger.setLevel(numeric_level)

    # Remove default handlers
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    # Attach JSON stream handler
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(JSONFormatter())
    stream_handler.setLevel(numeric_level)
    root_logger.addHandler(stream_handler)

    # Suppress verbose noise from uvicorn access/sqlalchemy echo
    logging.getLogger("uvicorn.access").handlers = [stream_handler]
    logging.getLogger("uvicorn.access").propagate = False

