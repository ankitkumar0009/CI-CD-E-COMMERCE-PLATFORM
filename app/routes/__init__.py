from app.routes.admin import router as admin_router
from app.routes.health import router as health_router
from app.routes.orders import router as orders_router
from app.routes.products import router as products_router

__all__ = [
    "admin_router",
    "health_router",
    "orders_router",
    "products_router",
]

