from decimal import Decimal
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import get_password_hash
from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models.product import Product
from app.models.user import AdminUser

# Isolated SQLite in-memory engine with StaticPool for thread-safe test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create fresh database schema per test function and seed initial test records."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Seed Admin User
    admin = AdminUser(
        username="admin",
        email="admin@ecommerce.local",
        password_hash=get_password_hash("AdminSecret2026!"),
        full_name="Test Super Admin",
        is_active=True,
        is_superuser=True
    )
    session.add(admin)

    # Seed Sample Products
    sample_products = [
        Product(
            sku="ELEC-001",
            name="Sony WH-1000XM5 Headphones",
            description="Premium noise cancelling headphones",
            price=Decimal("24999.00"),
            stock=10,
            category="Electronics",
            is_active=True
        ),
        Product(
            sku="LAPT-001",
            name="Apple MacBook Air M3",
            description="13-inch lightweight laptop",
            price=Decimal("114900.00"),
            stock=5,
            category="Laptops",
            is_active=True
        ),
        Product(
            sku="MOBI-001",
            name="Samsung Galaxy S24",
            description="Flagship smartphone",
            price=Decimal("79999.00"),
            stock=8,
            category="Mobile Phones",
            is_active=True
        ),
        Product(
            sku="APPA-001",
            name="Nike Air Max Sneakers",
            description="Athletic running shoes",
            price=Decimal("8995.00"),
            stock=20,
            category="Shoes",
            is_active=True
        ),
        Product(
            sku="INAC-001",
            name="Discontinued Retro Player",
            description="Outdated product",
            price=Decimal("1999.00"),
            stock=0,
            category="Electronics",
            is_active=False
        ),
    ]
    session.add_all(sample_products)
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """TestClient fixture with overridden database dependency."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_token(client: TestClient) -> str:
    """Fixture that logs in the default admin user and returns the JWT token."""
    response = client.post(
        "/api/admin/login",
        json={
            "username_or_email": "admin@ecommerce.local",
            "password": "AdminSecret2026!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]


@pytest.fixture(scope="function")
def admin_headers(admin_token: str) -> dict:
    """Fixture that returns HTTP authorization headers with the admin token."""
    return {"Authorization": f"Bearer {admin_token}"}

