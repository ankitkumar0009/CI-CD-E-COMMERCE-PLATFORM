from typing import Any, Dict, List, Optional, Tuple
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
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        actor_id: Optional[int] = None
    ) -> AuditLog:
        entry = AuditLog(
            actor_email=actor_email,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            details=details,
            ip_address=ip_address
        )
        db.add(entry)
        db.flush()
        return entry

    def list_logs(
        self,
        db: Session,
        action: Optional[str] = None,
        actor_email: Optional[str] = None,
        resource_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[AuditLog], int]:
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

