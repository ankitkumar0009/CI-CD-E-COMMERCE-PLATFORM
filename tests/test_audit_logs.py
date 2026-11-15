from fastapi.testclient import TestClient


def test_audit_logs_recorded_on_admin_actions(client: TestClient, admin_headers: dict):
    # 1. Perform product creation
    prod_payload = {
        "sku": "AUDIT-001",
        "name": "Audit Sample Item",
        "price": "1499.00",
        "stock": 50,
        "category": "Testing",
        "is_active": True,
    }
    create_res = client.post("/api/admin/products", json=prod_payload, headers=admin_headers)
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # 2. Perform stock adjustment
    stock_res = client.patch(
        f"/api/admin/products/{created_id}/stock",
        json={"quantity": 10, "adjustment_type": "add", "reason": "Audit restock test"},
        headers=admin_headers,
    )
    assert stock_res.status_code == 200

    # 3. Query audit logs as admin
    logs_res = client.get("/api/admin/audit-logs", headers=admin_headers)
    assert logs_res.status_code == 200
    data = logs_res.json()
    assert "items" in data
    assert data["total"] >= 2

    # Check actions present
    actions = [log["action"] for log in data["items"]]
    assert "PRODUCT_CREATE" in actions
    assert "STOCK_UPDATE" in actions


def test_audit_logs_filtering_by_action(client: TestClient, admin_headers: dict):
    # Query with action filter
    filter_res = client.get("/api/admin/audit-logs?action=PRODUCT_CREATE", headers=admin_headers)
    assert filter_res.status_code == 200
    logs = filter_res.json()["items"]
    for log in logs:
        assert log["action"] == "PRODUCT_CREATE"


def test_audit_logs_unauthorized_access(client: TestClient):
    response = client.get("/api/admin/audit-logs")
    assert response.status_code == 401
