from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin


class Product(Base, TimestampMixin):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("stock >= 0", name="check_product_stock_non_negative"),
        CheckConstraint("price >= 0", name="check_product_price_non_negative"),
        Index("idx_products_category", "category"),
        Index("idx_products_name", "name"),
        Index("idx_products_sku", "sku", unique=True),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    sku: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int] = mapped_column(nullable=False, default=0)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product")
