from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditRepository:
    def log(
        self,
        db: Session,
        actor_email: str,
        action: str,
        resource_type: str,
        resource_id: str | None = None,
        details: dict[str, Any] | None = None,
        ip_address: str | None = None,
        actor_id: int | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            actor_email=actor_email,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            details=details,
            ip_address=ip_address,
        )
        db.add(entry)
        db.flush()
        return entry

    def list_logs(
        self,
        db: Session,
        action: str | None = None,
        actor_email: str | None = None,
        resource_type: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[AuditLog], int]:
        stmt = select(AuditLog)
        if action:
            stmt = stmt.where(AuditLog.action == action)
        if actor_email:
            stmt = stmt.where(AuditLog.actor_email.ilike(f"%{actor_email.strip()}%"))
        if resource_type:
            stmt = stmt.where(AuditLog.resource_type == resource_type)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.scalar(count_stmt) or 0

        items = db.scalars(
            stmt.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
        ).all()

        return list(items), total
