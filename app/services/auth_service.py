from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token, verify_password
from app.database.session import get_db
from app.models.user import AdminUser
from app.repositories.audit_repository import AuditRepository
from app.schemas.auth import AdminUserResponse, TokenResponse

security_scheme = HTTPBearer(auto_error=True)


class AuthService:
    def __init__(self):
        self.audit_repo = AuditRepository()

    def authenticate_admin(
        self,
        db: Session,
        username_or_email: str,
        password: str,
        ip_address: str | None = None,
    ) -> TokenResponse:
        user = db.scalar(
            select(AdminUser).where(
                or_(
                    AdminUser.username == username_or_email.strip(),
                    AdminUser.email == username_or_email.strip().lower(),
                )
            )
        )

        if not user or not verify_password(password, user.password_hash):
            # Record failed login attempt if user exists
            if user:
                self.audit_repo.log(
                    db=db,
                    actor_email=user.email,
                    actor_id=user.id,
                    action="ADMIN_LOGIN_FAILED",
                    resource_type="AUTH",
                    resource_id=str(user.id),
                    details={"reason": "Invalid password"},
                    ip_address=ip_address,
                )
                db.commit()

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin account is disabled.",
            )

        # Generate JWT
        token = create_access_token(
            subject=user.id,
            claims={
                "email": user.email,
                "username": user.username,
                "is_superuser": user.is_superuser,
            },
        )

        # Audit Log successful login
        self.audit_repo.log(
            db=db,
            actor_email=user.email,
            actor_id=user.id,
            action="ADMIN_LOGIN_SUCCESS",
            resource_type="AUTH",
            resource_id=str(user.id),
            details={"username": user.username},
            ip_address=ip_address,
        )
        db.commit()

        admin_resp = AdminUserResponse.model_validate(user)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in_minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
            user=admin_resp,
            admin=admin_resp,
        )


auth_service = AuthService()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    """Dependency protecting admin-only endpoints."""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token missing subject identifier.")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.scalar(select(AdminUser).where(AdminUser.id == int(user_id)))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated admin user not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin user account is inactive.",
        )

    return user
