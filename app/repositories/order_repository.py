import uuid
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models.idempotency import IdempotencyRecord
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem


class OrderRepository:
    def get_by_id(self, db: Session, order_id: int) -> Optional[Order]:
        return db.scalar(
            select(Order)
            .options(joinedload(Order.items))
            .where(Order.id == order_id)
        )

    def get_by_number(self, db: Session, order_number: str) -> Optional[Order]:
        return db.scalar(
            select(Order)
            .options(joinedload(Order.items))
            .where(Order.order_number == order_number)
        )

    def get_by_idempotency_key(self, db: Session, idempotency_key: str) -> Optional[Order]:
        return db.scalar(
            select(Order)
            .options(joinedload(Order.items))
            .where(Order.idempotency_key == idempotency_key)
        )

    def get_idempotency_record(self, db: Session, key: str) -> Optional[IdempotencyRecord]:
        return db.scalar(
            select(IdempotencyRecord).where(IdempotencyRecord.idempotency_key == key)
        )

    def save_idempotency_record(
        self,
        db: Session,
        key: str,
        request_hash: str,
        response_code: int,
        response_body: Dict[str, Any],
        order_id: Optional[int] = None
    ) -> IdempotencyRecord:
        record = IdempotencyRecord(
            idempotency_key=key,
            request_hash=request_hash,
            response_code=response_code,
            response_body=response_body,
            order_id=order_id
        )
        db.add(record)
        db.flush()
        return record

    def create_order(
        self,
        db: Session,
        customer_name: str,
        customer_email: str,
        shipping_address: str,
        total_amount: Decimal,
        items_data: List[Dict[str, Any]],
        idempotency_key: Optional[str] = None
    ) -> Order:
        order_number = f"ORD-{uuid.uuid4().hex[:10].upper()}"
        order = Order(
            order_number=order_number,
            idempotency_key=idempotency_key,
            customer_name=customer_name,
            customer_email=customer_email,
            shipping_address=shipping_address,
            total_amount=total_amount,
            status=OrderStatus.CONFIRMED
        )
        db.add(order)
        db.flush()  # Generates order.id

        # Insert items
        for item_info in items_data:
            item = OrderItem(
                order_id=order.id,
                product_id=item_info["product_id"],
                product_name_snapshot=item_info["product_name"],
                unit_price_snapshot=item_info["unit_price"],
                quantity=item_info["quantity"],
                subtotal=item_info["subtotal"]
            )
            db.add(item)

        db.flush()
        db.refresh(order)
        return order

