import uuid

from fastapi.testclient import TestClient


def test_order_creation_with_idempotency_key_replay(client: TestClient):
    """
    Submitting the exact same order with the same Idempotency-Key must return
    the identical cached response and deduct inventory only once.
    """
    idempotency_key = f"order-idem-{uuid.uuid4()}"
    headers = {"Idempotency-Key": idempotency_key}

    # Initial stock for product 1 is 10
    initial_stock = client.get("/api/products/1").json()["stock"]
    assert initial_stock == 10

    payload = {
        "customer_name": "Idempotent Buyer",
        "customer_email": "idem@example.com",
        "shipping_address": "42 Consistency Rd, Cache City",
        "items": [{"product_id": 1, "quantity": 3}],
    }

    # First request: Creates order, deducts 3 items (stock becomes 7)
    res1 = client.post("/api/orders", json=payload, headers=headers)
    assert res1.status_code == 201
    data1 = res1.json()
    order_id = data1["id"]
    order_number = data1["order_number"]
    assert float(data1["total_amount"]) == 24999.00 * 3

    # Check stock after first request
    assert client.get("/api/products/1").json()["stock"] == 7

    # Second request: Replayed with exact same payload and same Idempotency-Key
    res2 = client.post("/api/orders", json=payload, headers=headers)
    assert res2.status_code == 201
    data2 = res2.json()

    # Replayed response matches first response
    assert data2["id"] == order_id
    assert data2["order_number"] == order_number
    assert data2["total_amount"] == data1["total_amount"]
    assert len(data2["items"]) == 1

    # CRITICAL: Inventory MUST NOT be deducted a second time. Stock must still be 7!
    assert client.get("/api/products/1").json()["stock"] == 7


def test_order_creation_idempotency_conflict_on_payload_mismatch(client: TestClient):
    """
    Submitting a request with an already-used Idempotency-Key but different payload
    must be rejected with HTTP 409 Conflict.
    """
    idempotency_key = f"order-conflict-{uuid.uuid4()}"
    headers = {"Idempotency-Key": idempotency_key}

    payload_a = {
        "customer_name": "Buyer A",
        "customer_email": "buyer.a@example.com",
        "shipping_address": "Street A",
        "items": [{"product_id": 1, "quantity": 1}],
    }

    payload_b = {
        "customer_name": "Buyer B",
        "customer_email": "buyer.b@example.com",
        "shipping_address": "Street B",
        "items": [{"product_id": 1, "quantity": 2}],
    }

    # First request succeeds
    res1 = client.post("/api/orders", json=payload_a, headers=headers)
    assert res1.status_code == 201

    # Second request with same key but different payload fails with 409 Conflict
    res2 = client.post("/api/orders", json=payload_b, headers=headers)
    assert res2.status_code == 409
    assert "different" in res2.json()["detail"].lower()


def test_order_creation_without_idempotency_key(client: TestClient):
    """
    Submitting an order without Idempotency-Key header processes normally
    and creates an order each time.
    """
    payload = {
        "customer_name": "Standard Buyer",
        "customer_email": "standard@example.com",
        "shipping_address": "Standard Lane",
        "items": [{"product_id": 4, "quantity": 1}],
    }

    # Request 1 without header
    res1 = client.post("/api/orders", json=payload)
    assert res1.status_code == 201
    order1_num = res1.json()["order_number"]

    # Request 2 without header creates a distinct order
    res2 = client.post("/api/orders", json=payload)
    assert res2.status_code == 201
    order2_num = res2.json()["order_number"]

    assert order1_num != order2_num
