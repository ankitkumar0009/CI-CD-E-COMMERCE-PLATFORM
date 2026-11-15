import math

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import AdminUser
from app.repositories.audit_repository import AuditRepository
from app.schemas.audit_log import AuditLogListResponse, AuditLogResponse
from app.schemas.auth import AdminLoginRequest, TokenResponse
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    StockUpdate,
)
from app.services.auth_service import auth_service, get_current_admin
from app.services.product_service import ProductService

router = APIRouter(prefix="/admin", tags=["Admin Operations"])
product_service = ProductService()
audit_repo = AuditRepository()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Admin Authentication Login",
    description="Authenticates admin credentials and returns a secure JWT bearer token with audit logging.",
)
def admin_login(
    credentials: AdminLoginRequest, request: Request, db: Session = Depends(get_db)
) -> TokenResponse:
    client_ip = request.client.host if request.client else None
    return auth_service.authenticate_admin(
        db=db,
        username_or_email=credentials.username_or_email,
        password=credentials.password,
        ip_address=client_ip,
    )


@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Product (Admin Only)",
    description="Adds a new product to the catalog and creates an audit log entry.",
)
def create_product(
    data: ProductCreate,
    request: Request,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ProductResponse:
    client_ip = request.client.host if request.client else None
    product = product_service.create_product(
        db=db, data=data, admin=current_admin, ip_address=client_ip
    )
    return ProductResponse.model_validate(product)


@router.put(
    "/products/{product_id}",
    response_model=ProductResponse,
    summary="Update Product Details (Admin Only)",
    description="Modifies product title, description, category, or price with audit history.",
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    request: Request,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ProductResponse:
    client_ip = request.client.host if request.client else None
    product = product_service.update_product(
        db=db,
        product_id=product_id,
        data=data,
        admin=current_admin,
        ip_address=client_ip,
    )
    return ProductResponse.model_validate(product)


@router.patch(
    "/products/{product_id}/stock",
    response_model=ProductResponse,
    summary="Adjust Product Inventory (Admin Only)",
    description="Updates stock level (absolute or relative) and logs the inventory change audit record.",
)
def update_product_stock(
    product_id: int,
    data: StockUpdate,
    request: Request,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ProductResponse:
    client_ip = request.client.host if request.client else None
    product = product_service.update_stock(
        db=db,
        product_id=product_id,
        data=data,
        admin=current_admin,
        ip_address=client_ip,
    )
    return ProductResponse.model_validate(product)


@router.get(
    "/audit-logs",
    response_model=AuditLogListResponse,
    summary="List System Audit Logs (Admin Only)",
    description="Inspect security and operational audit trail: logins, product updates, and inventory changes.",
)
def list_audit_logs(
    action: str | None = Query(
        None,
        description="Filter by action code, e.g. ADMIN_LOGIN_SUCCESS, PRODUCT_CREATE",
    ),
    actor_email: str | None = Query(None, description="Filter by actor email"),
    resource_type: str | None = Query(None, description="Filter by resource type: PRODUCT, AUTH"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:
    skip = (page - 1) * page_size
    items, total = audit_repo.list_logs(
        db=db,
        action=action,
        actor_email=actor_email,
        resource_type=resource_type,
        skip=skip,
        limit=page_size,
    )

    pages = math.ceil(total / page_size) if total > 0 else 1

    return AuditLogListResponse(
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
        items=[AuditLogResponse.model_validate(item) for item in items],
    )
