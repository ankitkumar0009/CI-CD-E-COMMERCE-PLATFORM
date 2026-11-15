from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductRepository:
    def get_by_id(self, db: Session, product_id: int) -> Optional[Product]:
        return db.scalar(select(Product).where(Product.id == product_id))

    def get_by_id_for_update(self, db: Session, product_id: int) -> Optional[Product]:
        """Row-level lock for safe concurrent inventory deduction."""
        stmt = select(Product).where(Product.id == product_id)
        # SQLite does not support FOR UPDATE; postgresql does
        if db.bind and db.bind.dialect.name == "postgresql":
            stmt = stmt.with_for_update()
        return db.scalar(stmt)

    def get_by_sku(self, db: Session, sku: str) -> Optional[Product]:
        return db.scalar(select(Product).where(Product.sku == sku))

    def list_products(
        self,
        db: Session,
        search: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        skip: int = 0,
        limit: int = 20,
        active_only: bool = True
    ) -> Tuple[List[Product], int]:
        stmt = select(Product)
        if active_only:
            stmt = stmt.where(Product.is_active.is_(True))

        if search:
            stmt = stmt.where(Product.name.ilike(f"%{search.strip()}%"))

        if category:
            stmt = stmt.where(Product.category.ilike(category.strip()))

        if min_price is not None:
            stmt = stmt.where(Product.price >= min_price)

        if max_price is not None:
            stmt = stmt.where(Product.price <= max_price)

        # Count query
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.scalar(count_stmt) or 0

        # Paginated results
        items = db.scalars(
            stmt.order_by(Product.id.asc()).offset(skip).limit(limit)
        ).all()

        return list(items), total

    def create(self, db: Session, data: ProductCreate) -> Product:
        product = Product(
            sku=data.sku,
            name=data.name,
            description=data.description,
            price=data.price,
            stock=data.stock,
            category=data.category,
            image_url=data.image_url,
            is_active=True
        )
        db.add(product)
        db.flush()
        db.refresh(product)
        return product

    def update(self, db: Session, product: Product, data: ProductUpdate) -> Product:
        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(product, key, value)
        db.flush()
        db.refresh(product)
        return product

    def update_stock(self, db: Session, product: Product, new_stock: int) -> Product:
        product.stock = new_stock
        db.flush()
        db.refresh(product)
        return product

