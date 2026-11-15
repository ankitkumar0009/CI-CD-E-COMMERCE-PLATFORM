from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Product title")
    description: Optional[str] = Field(default=None, description="Detailed product description")
    price: Decimal = Field(..., gt=0, description="Product unit price in INR", decimal_places=2)
    category: str = Field(..., min_length=2, max_length=100, description="Category/Department")
    image_url: Optional[str] = Field(default=None, max_length=500, description="Product image URL")


class ProductCreate(ProductBase):
    sku: str = Field(..., min_length=3, max_length=64, description="Unique Stock Keeping Unit")
    stock: int = Field(default=0, ge=0, description="Initial inventory count (must be >= 0)")


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, gt=0, decimal_places=2)
    category: Optional[str] = Field(default=None, min_length=2, max_length=100)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class StockUpdate(BaseModel):
    stock: Optional[int] = Field(default=None, ge=0, description="Set absolute stock quantity")
    adjustment: Optional[int] = Field(default=None, description="Increment or decrement stock (e.g. +10 or -5)")
    quantity: Optional[int] = Field(default=None, description="Quantity for adjustment")
    adjustment_type: Optional[str] = Field(default=None, description="add, subtract, or set")
    reason: Optional[str] = Field(default="Manual Admin Adjustment", max_length=255)


class ProductResponse(ProductBase):
    id: int
    sku: str
    stock: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    pages: int
    items: List[ProductResponse]

