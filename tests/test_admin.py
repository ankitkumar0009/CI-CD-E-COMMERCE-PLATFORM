from fastapi.testclient import TestClient


def test_admin_login_success(client: TestClient):
    response = client.post(
        "/api/admin/login",
        json={
            "username_or_email": "admin@ecommerce.local",
            "password": "AdminSecret2026!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["admin"]["username"] == "admin"
    assert data["admin"]["email"] == "admin@ecommerce.local"


def test_admin_login_invalid_credentials(client: TestClient):
    # Wrong password
    response = client.post(
        "/api/admin/login",
        json={
            "username_or_email": "admin@ecommerce.local",
            "password": "WrongPassword123",
        },
    )
    assert response.status_code == 401
    detail = response.json()["detail"].lower()
    assert "invalid" in detail and "password" in detail

    # Unknown user
    response_unknown = client.post(
        "/api/admin/login",
        json={
            "username_or_email": "nonexistent@ecommerce.local",
            "password": "Password123!",
        },
    )
    assert response_unknown.status_code == 401


def test_admin_unauthorized_access(client: TestClient):
    # No auth header
    response = client.post(
        "/api/admin/products",
        json={
            "sku": "UNAUTH-01",
            "name": "Unauthorized Item",
            "price": "99.00",
            "stock": 5,
            "category": "Test",
        },
    )
    assert response.status_code == 401

    # Malformed token
    response_invalid = client.post(
        "/api/admin/products",
        json={
            "sku": "UNAUTH-01",
            "name": "Item",
            "price": "10.00",
            "stock": 1,
            "category": "Test",
        },
        headers={"Authorization": "Bearer invalid.jwt.token"},
    )
    assert response_invalid.status_code == 401


def test_admin_create_product(client: TestClient, admin_headers: dict):
    payload = {
        "sku": "TAB-001",
        "name": "Apple iPad Air M2",
        "description": "11-inch Liquid Retina display, M2 chip",
        "price": "59900.00",
        "stock": 15,
        "category": "Electronics",
        "is_active": True,
    }

    response = client.post("/api/admin/products", json=payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "TAB-001"
    assert data["name"] == "Apple iPad Air M2"
    assert float(data["price"]) == 59900.00
    assert data["stock"] == 15

    # Attempt duplicate SKU must fail with 400
    duplicate_res = client.post("/api/admin/products", json=payload, headers=admin_headers)
    assert duplicate_res.status_code == 400
    assert "already exists" in duplicate_res.json()["detail"].lower()


def test_admin_update_product(client: TestClient, admin_headers: dict):
    # Product 1 exists in seed data
    update_payload = {
        "name": "Sony WH-1000XM5 Premium Edition",
        "price": "26999.00",
        "description": "Updated noise-cancelling headphones",
        "is_active": True,
    }

    response = client.put("/api/admin/products/1", json=update_payload, headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Sony WH-1000XM5 Premium Edition"
    assert float(data["price"]) == 26999.00

    # Non-existent product update returns 404
    not_found = client.put("/api/admin/products/99999", json=update_payload, headers=admin_headers)
    assert not_found.status_code == 404


def test_admin_stock_adjustment_operations(client: TestClient, admin_headers: dict):
    # Product 1 starts with stock = 10
    # 1. Add stock
    add_res = client.patch(
        "/api/admin/products/1/stock",
        json={
            "quantity": 5,
            "adjustment_type": "add",
            "reason": "Restock shipment received",
        },
        headers=admin_headers,
    )
    assert add_res.status_code == 200
    assert add_res.json()["stock"] == 15

    # 2. Subtract stock
    sub_res = client.patch(
        "/api/admin/products/1/stock",
        json={
            "quantity": 3,
            "adjustment_type": "subtract",
            "reason": "Damaged goods return",
        },
        headers=admin_headers,
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["stock"] == 12

    # 3. Direct Set stock
    set_res = client.patch(
        "/api/admin/products/1/stock",
        json={
            "quantity": 25,
            "adjustment_type": "set",
            "reason": "Inventory audit sync",
        },
        headers=admin_headers,
    )
    assert set_res.status_code == 200
    assert set_res.json()["stock"] == 25

    # 4. Prevent negative inventory
    invalid_sub = client.patch(
        "/api/admin/products/1/stock",
        json={
            "quantity": 100,
            "adjustment_type": "subtract",
            "reason": "Invalid large deduction",
        },
        headers=admin_headers,
    )
    assert invalid_sub.status_code == 400
    assert "negative" in invalid_sub.json()["detail"].lower()
    # Stock remains 25
    assert client.get("/api/products/1").json()["stock"] == 25
