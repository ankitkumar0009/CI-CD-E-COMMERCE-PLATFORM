from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.order import OrderStatus


class OrderItemRequest(BaseModel):
    product_id: int = Field(..., gt=0, description="Target product primary key")
    quantity: int = Field(..., gt=0, description="Desired order quantity (must be >= 1)")


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name_snapshot: str
    unit_price_snapshot: Decimal
    quantity: int
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150, description="Customer full name")
    customer_email: EmailStr = Field(..., description="Customer contact email")
    shipping_address: str = Field(..., min_length=5, description="Full delivery address")
    items: List[OrderItemRequest] = Field(..., min_length=1, description="List of items to order")


class OrderResponse(BaseModel):
    id: int
    order_number: str
    idempotency_key: Optional[str] = None
    customer_name: str
    customer_email: str
    shipping_address: str
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)


class OrderStatusResponse(BaseModel):
    order_number: str
    status: OrderStatus
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

