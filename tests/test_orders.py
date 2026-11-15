from fastapi.testclient import TestClient


def test_create_order_single_item_success(client: TestClient):
    # Product 1 has price 24999.00 and stock 10
    payload = {
        "customer_name": "John Doe",
        "customer_email": "john.doe@example.com",
        "shipping_address": "123 Innovation Way, Tech Park, Bangalore 560103",
        "items": [
            {"product_id": 1, "quantity": 2}
        ]
    }

    response = client.post("/api/orders", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["order_number"].startswith("ORD-")
    assert data["customer_name"] == "John Doe"
    assert float(data["total_amount"]) == 49998.00  # 24999 * 2
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2
    assert float(data["items"][0]["unit_price_snapshot"]) == 24999.00

    # Verify inventory was safely deducted from 10 to 8
    prod_res = client.get("/api/products/1")
    assert prod_res.status_code == 200
    assert prod_res.json()["stock"] == 8


def test_create_order_multiple_items_price_calculation(client: TestClient):
    # Product 1: 24999 * 1 = 24999
    # Product 4: 8995 * 2 = 17990
    # Total = 42989.00
    payload = {
        "customer_name": "Jane Smith",
        "customer_email": "jane@example.com",
        "shipping_address": "456 Market St, Mumbai 400001",
        "items": [
            {"product_id": 1, "quantity": 1},
            {"product_id": 4, "quantity": 2}
        ]
    }

    response = client.post("/api/orders", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert float(data["total_amount"]) == 42989.00
    assert len(data["items"]) == 2

    # Verify stock deductions
    assert client.get("/api/products/1").json()["stock"] == 9  # 10 - 1
    assert client.get("/api/products/4").json()["stock"] == 18  # 20 - 2


def test_order_creation_insufficient_inventory(client: TestClient):
    # Product 2 has stock = 5
    payload = {
        "customer_name": "Overbuyer",
        "customer_email": "over@example.com",
        "shipping_address": "789 Highway, Delhi",
        "items": [
            {"product_id": 2, "quantity": 10}  # Demands 10, only 5 available
        ]
    }

    response = client.post("/api/orders", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "insufficient inventory" in data["detail"].lower()

    # Verify stock was NOT deducted
    assert client.get("/api/products/2").json()["stock"] == 5


def test_order_creation_invalid_product_id(client: TestClient):
    payload = {
        "customer_name": "Tester",
        "customer_email": "test@example.com",
        "shipping_address": "Test Road",
        "items": [
            {"product_id": 99999, "quantity": 1}
        ]
    }

    response = client.post("/api/orders", json=payload)
    assert response.status_code == 404
    assert "does not exist" in response.json()["detail"].lower()


def test_order_creation_invalid_quantity(client: TestClient):
    payload = {
        "customer_name": "Tester",
        "customer_email": "test@example.com",
        "shipping_address": "Test Road",
        "items": [
            {"product_id": 1, "quantity": 0}  # Must be >= 1
        ]
    }

    response = client.post("/api/orders", json=payload)
    assert response.status_code in [400, 422]


def test_get_order_by_id(client: TestClient):
    create_res = client.post("/api/orders", json={
        "customer_name": "Alice Wonderland",
        "customer_email": "alice@wonder.com",
        "shipping_address": "Rabbit Hole 1",
        "items": [{"product_id": 1, "quantity": 1}]
    })
    assert create_res.status_code == 201
    order_id = create_res.json()["id"]

    get_res = client.get(f"/api/orders/{order_id}")
    assert get_res.status_code == 200
    assert get_res.json()["customer_name"] == "Alice Wonderland"

