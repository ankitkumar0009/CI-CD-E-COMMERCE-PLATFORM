import logging
import os
import sys
from decimal import Decimal

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.core.config import settings
from app.core.security import get_password_hash
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.product import Product
from app.models.user import AdminUser

logger = logging.getLogger("scripts.seed_data")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

SAMPLE_PRODUCTS = [
    {
        "sku": "ELEC-HEAD-001",
        "name": "Sony WH-1000XM5 Noise Cancelling Headphones",
        "description": "Industry-leading noise canceling wireless over-ear headphones with 30-hour battery life.",
        "price": Decimal("26999.00"),
        "stock": 50,
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "MOBI-APPL-015",
        "name": "Apple iPhone 15 Pro Max (256GB)",
        "description": "Forged in titanium with revolutionary A17 Pro chip and customizable Action button.",
        "price": Decimal("134900.00"),
        "stock": 25,
        "category": "Mobile Phones",
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "LAPT-DELL-X15",
        "name": "Dell XPS 15 OLED Laptop",
        "description": "15.6-inch 3.5K OLED touchscreen with Intel Core i9, 32GB RAM, 1TB SSD, and RTX 4070.",
        "price": Decimal("189990.00"),
        "stock": 15,
        "category": "Laptops",
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "LAPT-APPL-M3P",
        "name": "Apple MacBook Pro 14 (M3 Pro)",
        "description": "14-inch Liquid Retina XDR display with Apple M3 Pro 11-core CPU and 14-core GPU.",
        "price": Decimal("199900.00"),
        "stock": 20,
        "category": "Laptops",
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "ELEC-WATC-U2",
        "name": "Apple Watch Ultra 2 GPS + Cellular",
        "description": "Rugged 49mm titanium case, precision dual-frequency GPS, and up to 72 hours of battery life.",
        "price": Decimal("89900.00"),
        "stock": 30,
        "category": "Watches",
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "MOBI-SAMS-S24",
        "name": "Samsung Galaxy S24 Ultra 5G",
        "description": "Titanium exterior with Galaxy AI, 200MP camera, and embedded S Pen.",
        "price": Decimal("129999.00"),
        "stock": 35,
        "category": "Mobile Phones",
        "image_url": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "APPA-NIK-AF1",
        "name": "Nike Air Force 1 '07 Sneakers",
        "description": "The radiance lives on with pristine leather and crisp court style.",
        "price": Decimal("7495.00"),
        "stock": 60,
        "category": "Shoes",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "HOME-COFF-001",
        "name": "De'Longhi Magnifica S Espresso Machine",
        "description": "Bean-to-cup automated coffee maker with integrated silent burr grinder and milk frother.",
        "price": Decimal("48500.00"),
        "stock": 18,
        "category": "Home and Kitchen",
        "image_url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "FURN-ERGO-001",
        "name": "Herman Miller Aeron Ergonomic Chair",
        "description": "Benchmark ergonomic executive mesh office chair with PostureFit SL lumbar support.",
        "price": Decimal("98000.00"),
        "stock": 12,
        "category": "Furniture",
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "ELEC-KEYB-MEC",
        "name": "Keychron Q1 Pro Wireless Mechanical Keyboard",
        "description": "75% QMK/VIA custom wireless mechanical keyboard with CNC aluminum chassis.",
        "price": Decimal("16499.00"),
        "stock": 40,
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "BOOK-CLEA-ARCH",
        "name": "Clean Architecture by Robert C. Martin",
        "description": "A Craftsman's Guide to Software Structure and Design for professional engineers.",
        "price": Decimal("899.00"),
        "stock": 100,
        "category": "Books",
        "image_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80"
    },
    {
        "sku": "SPOR-DUMB-SET",
        "name": "Bowflex SelectTech 552 Adjustable Dumbbells",
        "description": "Replaces 15 sets of weights with rapid dial adjustment from 5 to 52.5 lbs.",
        "price": Decimal("38999.00"),
        "stock": 22,
        "category": "Sports",
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80"
    }
]


def seed_database():
    """Seed initial tables, products, and default admin user."""
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Default Admin User
        admin_email = settings.ADMIN_DEFAULT_EMAIL
        existing_admin = db.scalar(select(AdminUser).where(AdminUser.email == admin_email))
        if not existing_admin:
            admin = AdminUser(
                username="admin",
                email=admin_email,
                password_hash=get_password_hash(settings.ADMIN_DEFAULT_PASSWORD),
                full_name="Platform Super Admin",
                is_active=True,
                is_superuser=True
            )
            db.add(admin)
            db.commit()
            logger.info(f"✅ Created default admin user: {admin_email}")
        else:
            logger.info(f"ℹ️ Admin user '{admin_email}' already exists. Skipping.")

        # 2. Seed Products
        inserted_count = 0
        for prod_data in SAMPLE_PRODUCTS:
            existing = db.scalar(select(Product).where(Product.sku == prod_data["sku"]))
            if not existing:
                prod = Product(
                    sku=prod_data["sku"],
                    name=prod_data["name"],
                    description=prod_data["description"],
                    price=prod_data["price"],
                    stock=prod_data["stock"],
                    category=prod_data["category"],
                    image_url=prod_data.get("image_url"),
                    is_active=True
                )
                db.add(prod)
                inserted_count += 1

        db.commit()
        logger.info(f"✅ Successfully seeded {inserted_count} new products. Total catalog size: {len(SAMPLE_PRODUCTS)}")

    except Exception as exc:
        db.rollback()
        logger.error(f"❌ Seeding failed: {exc}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

