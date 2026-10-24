import pytest
from pineco.models import Product, BrandRule, ApprovedFact, Submission


def test_product_crud_and_scoping(client, db_session):
    # 1. Create a product
    payload = {
        "name": "Alpha Analytics Suite",
        "description": "Enterprise financial intelligence product",
        "category": "Analytics",
        "workspace_id": "ws-test-products",
    }
    resp = client.post("/api/v1/products", json=payload)
    assert resp.status_code == 201
    prod_data = resp.json()
    assert prod_data["name"] == "Alpha Analytics Suite"
    prod_id = prod_data["id"]

    # 2. List products
    list_resp = client.get("/api/v1/products?workspace_id=ws-test-products")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) == 1
    assert items[0]["id"] == prod_id

    # 3. Create a rule scoped to this product
    rule_payload = {
        "name": "Prohibited: 'cheap'",
        "category": "terminology",
        "description": "Never use cheap",
        "pattern": "cheap",
        "preferred_replacement": "affordable",
        "severity": "medium",
        "channel_scope": "all",
        "enabled": True,
        "workspace_id": "ws-test-products",
        "product_id": prod_id,
    }
    r_resp = client.post("/api/v1/rules", json=rule_payload)
    assert r_resp.status_code == 201
    assert r_resp.json()["product_id"] == prod_id

    # 4. Verify list rules filters by product_id
    scoped_rules = client.get(f"/api/v1/rules?workspace_id=ws-test-products&product_id={prod_id}").json()
    assert len(scoped_rules) == 1

    other_rules = client.get("/api/v1/rules?workspace_id=ws-test-products&product_id=prod-other").json()
    assert len(other_rules) == 0

    # 5. Delete product
    del_resp = client.delete(f"/api/v1/products/{prod_id}")
    assert del_resp.status_code == 204


def test_create_product_authenticated_new_user(client):
    # Register a new user
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jordan Brand Specialist",
            "email": "jordan.brand@test.internal",
            "password": "Password123!",
            "role": "brand_manager",
        },
    )
    assert reg_resp.status_code == 201
    auth_data = reg_resp.json()
    token = auth_data["access_token"]
    user_ws = auth_data["user"]["workspace_id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify newly registered user starts with 0 products
    init_list = client.get("/api/v1/products", headers=headers).json()
    assert len(init_list) == 0

    # User creates their first product folder without specifying workspace_id
    create_resp = client.post(
        "/api/v1/products",
        json={
            "name": "Omni Brand Campaign",
            "category": "Corporate Brand",
            "description": "2026 Core Product Line",
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    new_prod = create_resp.json()
    assert new_prod["name"] == "Omni Brand Campaign"
    assert new_prod["workspace_id"] == user_ws

    # Verify list products now contains exactly 1 product
    updated_list = client.get("/api/v1/products", headers=headers).json()
    assert len(updated_list) == 1
    assert updated_list[0]["id"] == new_prod["id"]
