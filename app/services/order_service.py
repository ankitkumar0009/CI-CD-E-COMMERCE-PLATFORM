import hashlib
import json
from decimal import Decimal
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.order import OrderCreate, OrderResponse


def calculate_request_hash(payload: dict[str, Any]) -> str:
    """Calculate deterministic SHA-256 hash of order creation payload."""
    serialized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


class OrderService:
    def __init__(self):
        self.order_repo = OrderRepository()
        self.product_repo = ProductRepository()

    def get_order(self, db: Session, order_id: int) -> Order:
        order = self.order_repo.get_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found.",
            )
        return order

    def create_order(
        self,
        db: Session,
        order_data: OrderCreate,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        """
        Create customer order with atomic inventory deduction and idempotency guarantee.
        """
        request_dict = order_data.model_dump()
        request_hash = calculate_request_hash(request_dict)

        # 1. Check Idempotency Record
        if idempotency_key:
            idempotency_key = idempotency_key.strip()
            existing_record = self.order_repo.get_idempotency_record(db, idempotency_key)

            if existing_record:
                # Key reused: verify payload hash
                if existing_record.request_hash == request_hash:
                    # Same payload: return cached response without double deduction
                    return {
                        "status_code": existing_record.response_code,
                        "data": existing_record.response_body,
                        "is_cached": True,
                    }
                else:
                    # Same key, different payload: reject
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            f"Idempotency conflict: Key '{idempotency_key}' was previously used "
                            "with a different order request payload."
                        ),
                    )

        # 2. Validate Items & Quantities
        if not order_data.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order must contain at least one product.",
            )

        # Deduplicate requested product IDs within order
        aggregated_quantities: dict[int, int] = {}
        for item in order_data.items:
            if item.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid quantity {item.quantity} for product ID {item.product_id}. Quantity must be positive.",
                )
            aggregated_quantities[item.product_id] = (
                aggregated_quantities.get(item.product_id, 0) + item.quantity
            )

        items_to_create: list[dict[str, Any]] = []
        total_amount = Decimal("0.00")

        # 3. Lock products and check stock availability
        # Sort keys to prevent database deadlocks on concurrent requests
        for product_id in sorted(aggregated_quantities.keys()):
            quantity = aggregated_quantities[product_id]
            product = self.product_repo.get_by_id_for_update(db, product_id)

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {product_id} does not exist.",
                )

            if not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{product.name}' (ID {product_id}) is inactive and cannot be ordered.",
                )

            if product.stock < quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient inventory for '{product.name}' (SKU: {product.sku}). "
                        f"Requested: {quantity}, Available in stock: {product.stock}."
                    ),
                )

            # Deduct inventory safely
            product.stock -= quantity

            unit_price = Decimal(str(product.price))
            subtotal = unit_price * quantity
            total_amount += subtotal

            items_to_create.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "subtotal": subtotal,
                }
            )

        # 4. Create Order & Items
        order = self.order_repo.create_order(
            db=db,
            customer_name=order_data.customer_name,
            customer_email=order_data.customer_email,
            shipping_address=order_data.shipping_address,
            total_amount=total_amount,
            items_data=items_to_create,
            idempotency_key=idempotency_key,
        )

        response_data = OrderResponse.model_validate(order).model_dump(mode="json")

        # 5. Record Idempotency Entry
        if idempotency_key:
            self.order_repo.save_idempotency_record(
                db=db,
                key=idempotency_key,
                request_hash=request_hash,
                response_code=status.HTTP_201_CREATED,
                response_body=response_data,
                order_id=order.id,
            )

        db.commit()

        return {
            "status_code": status.HTTP_201_CREATED,
            "data": response_data,
            "is_cached": False,
        }
