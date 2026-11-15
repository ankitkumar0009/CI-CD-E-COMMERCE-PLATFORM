from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.product import ProductListResponse, ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])
service = ProductService()


@router.get(
    "",
    response_model=ProductListResponse,
    summary="List and Search Products",
    description="Retrieve paginated products with optional search query, category filtering, and price limits."
)
def list_products(
    search: Optional[str] = Query(None, description="Search term matching product name"),
    category: Optional[str] = Query(None, description="Filter by exact category name"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum price filter"),
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    db: Session = Depends(get_db)
) -> ProductListResponse:
    return service.list_products(
        db=db,
        search=search,
        category=category,
        min_price=min_price,
        max_price=max_price,
        page=page,
        page_size=page_size,
        active_only=True
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get Product Details by ID",
    description="Retrieve full specifications, stock availability, and price for a single product."
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
) -> ProductResponse:
    product = service.get_product(db=db, product_id=product_id)
    return ProductResponse.model_validate(product)

