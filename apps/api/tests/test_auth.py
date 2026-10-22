def test_demo_accounts_and_login(client):
    # 1. Fetch demo accounts
    resp = client.get("/api/v1/auth/demo-accounts")
    assert resp.status_code == 200
    accounts = resp.json()
    assert len(accounts) == 4
    roles = [a["role"] for a in accounts]
    assert "creator" in roles
    assert "reviewer" in roles
    assert "brand_manager" in roles
    assert "admin" in roles

    # 2. Login via role
    resp = client.post("/api/v1/auth/login", json={"role": "reviewer"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    token = data["access_token"]
    assert data["user"]["name"] == "Elena Rostova"

    # 3. Authenticate with JWT token against /me
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    me = resp.json()
    assert me["email"] == "reviewer@pineco.internal"
    assert me["role"] == "reviewer"


def test_invalid_token_rejected(client):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.signature"})
    assert resp.status_code == 401
