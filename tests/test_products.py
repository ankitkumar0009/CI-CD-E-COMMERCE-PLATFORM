from fastapi.testclient import TestClient


def test_list_products_default_pagination(client: TestClient):
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 4  # 4 active products seeded
    assert len(data["items"]) == 4
    assert data["page"] == 1
    assert data["page_size"] == 20


def test_search_products_by_name(client: TestClient):
    response = client.get("/api/products?search=Headphones")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Sony WH-1000XM5 Headphones"


def test_filter_products_by_category(client: TestClient):
    response = client.get("/api/products?category=Laptops")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["category"] == "Laptops"


def test_filter_products_by_price_range(client: TestClient):
    response = client.get("/api/products?min_price=10000&max_price=80000")
    assert response.status_code == 200
    data = response.json()
    # Sony (24999) and Samsung (79999) fall in this range
    assert data["total"] == 2


def test_get_product_by_id_success(client: TestClient):
    response = client.get("/api/products/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["sku"] == "ELEC-001"
    assert data["stock"] == 10


def test_get_product_by_id_not_found(client: TestClient):
    response = client.get("/api/products/999999")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


def test_inactive_product_hidden_from_public(client: TestClient):
    # Product ID 5 is inactive
    response = client.get("/api/products/5")
    assert response.status_code == 404
