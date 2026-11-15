import math
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.user import AdminUser
from app.repositories.audit_repository import AuditRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
    StockUpdate,
)


class ProductService:
    def __init__(self):
        self.repo = ProductRepository()
        self.audit_repo = AuditRepository()

    def list_products(
        self,
        db: Session,
        search: str | None = None,
        category: str | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
        page: int = 1,
        page_size: int = 20,
        active_only: bool = True,
    ) -> ProductListResponse:
        page = max(1, page)
        page_size = min(max(1, page_size), 100)
        skip = (page - 1) * page_size

        items, total = self.repo.list_products(
            db=db,
            search=search,
            category=category,
            min_price=min_price,
            max_price=max_price,
            skip=skip,
            limit=page_size,
            active_only=active_only,
        )

        pages = math.ceil(total / page_size) if total > 0 else 1

        return ProductListResponse(
            total=total,
            page=page,
            page_size=page_size,
            pages=pages,
            items=[ProductResponse.model_validate(item) for item in items],
        )

    def get_product(self, db: Session, product_id: int) -> Product:
        product = self.repo.get_by_id(db, product_id)
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found.",
            )
        return product

    def create_product(
        self,
        db: Session,
        data: ProductCreate,
        admin: AdminUser,
        ip_address: str | None = None,
    ) -> Product:
        # Check SKU uniqueness
        existing = self.repo.get_by_sku(db, data.sku)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{data.sku}' already exists.",
            )

        product = self.repo.create(db, data)

        # Audit Log
        self.audit_repo.log(
            db=db,
            actor_email=admin.email,
            actor_id=admin.id,
            action="PRODUCT_CREATE",
            resource_type="PRODUCT",
            resource_id=str(product.id),
            details={
                "sku": product.sku,
                "name": product.name,
                "price": str(product.price),
                "stock": product.stock,
                "category": product.category,
            },
            ip_address=ip_address,
        )
        db.commit()
        return product

    def update_product(
        self,
        db: Session,
        product_id: int,
        data: ProductUpdate,
        admin: AdminUser,
        ip_address: str | None = None,
    ) -> Product:
        product = self.repo.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found.",
            )

        old_state = {
            "name": product.name,
            "price": str(product.price),
            "category": product.category,
            "is_active": product.is_active,
        }

        updated = self.repo.update(db, product, data)

        # Audit Log
        self.audit_repo.log(
            db=db,
            actor_email=admin.email,
            actor_id=admin.id,
            action="PRODUCT_UPDATE",
            resource_type="PRODUCT",
            resource_id=str(product.id),
            details={
                "before": old_state,
                "after": data.model_dump(exclude_unset=True, mode="json"),
            },
            ip_address=ip_address,
        )
        db.commit()
        return updated

    def update_stock(
        self,
        db: Session,
        product_id: int,
        data: StockUpdate,
        admin: AdminUser,
        ip_address: str | None = None,
    ) -> Product:
        product = self.repo.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found.",
            )

        old_stock = product.stock

        if data.stock is not None:
            new_stock = data.stock
        elif data.adjustment is not None:
            new_stock = old_stock + data.adjustment
        elif data.quantity is not None and data.adjustment_type:
            adj = data.adjustment_type.lower()
            if adj == "add":
                new_stock = old_stock + data.quantity
            elif adj == "subtract":
                new_stock = old_stock - data.quantity
            elif adj == "set":
                new_stock = data.quantity
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid adjustment_type '{data.adjustment_type}'. Must be 'add', 'subtract', or 'set'.",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either 'stock', 'adjustment', or 'quantity' with 'adjustment_type'.",
            )

        if new_stock < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock cannot be negative. Current: {old_stock}, requested adjustment: {data.adjustment}",
            )

        updated = self.repo.update_stock(db, product, new_stock)

        # Audit Log
        self.audit_repo.log(
            db=db,
            actor_email=admin.email,
            actor_id=admin.id,
            action="STOCK_UPDATE",
            resource_type="PRODUCT",
            resource_id=str(product.id),
            details={
                "old_stock": old_stock,
                "new_stock": new_stock,
                "change": new_stock - old_stock,
                "reason": data.reason,
            },
            ip_address=ip_address,
        )
        db.commit()
        return updated
