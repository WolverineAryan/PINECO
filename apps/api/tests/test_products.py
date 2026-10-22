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
