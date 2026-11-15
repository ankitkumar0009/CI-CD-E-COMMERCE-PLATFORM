from fastapi import APIRouter, Depends, Header, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.routes.health import ORDER_CREATIONS_TOTAL
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])
service = OrderService()


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Customer Order (Idempotent)",
    description=(
        "Places an order containing one or more items. Validates inventory, safe stock deduction, "
        "and supports the 'Idempotency-Key' HTTP header to prevent duplicate charges or orders."
    ),
)
def create_order(
    order_data: OrderCreate,
    response: Response,
    idempotency_key: str | None = Header(
        None,
        alias="Idempotency-Key",
        description="Optional unique idempotency identifier (UUID/string) for safe retries.",
    ),
    db: Session = Depends(get_db),
) -> OrderResponse:
    result = service.create_order(db=db, order_data=order_data, idempotency_key=idempotency_key)

    response.status_code = result["status_code"]
    if not result.get("is_cached", False):
        ORDER_CREATIONS_TOTAL.inc()

    return OrderResponse.model_validate(result["data"])


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get Order by ID",
    description="Retrieve order status, itemized list, prices, and tracking information.",
)
def get_order(order_id: int, db: Session = Depends(get_db)) -> OrderResponse:
    order = service.get_order(db=db, order_id=order_id)
    return OrderResponse.model_validate(order)
