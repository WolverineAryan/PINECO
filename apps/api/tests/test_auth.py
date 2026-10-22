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


def test_real_user_registration_and_jwt_login(client):
    # 1. Register a real brand reviewer account
    user_payload = {
        "name": "Thor Aryan",
        "email": "36thoraryan@gmail.com",
        "password": "SecurePassword2026!",
        "role": "brand_manager",
        "title": "Director of Brand Assurance",
        "department": "Global Brand Office",
    }
    resp = client.post("/api/v1/auth/register", json=user_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "36thoraryan@gmail.com"
    assert data["user"]["name"] == "Thor Aryan"
    assert data["user"]["role"] == "brand_manager"
    token = data["access_token"]

    # 2. Verify identity with signed JWT bearer against /me
    resp_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp_me.status_code == 200
    me = resp_me.json()
    assert me["email"] == "36thoraryan@gmail.com"
    assert me["name"] == "Thor Aryan"

    # 3. Sign in with the registered credentials
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "36thoraryan@gmail.com", "password": "SecurePassword2026!"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "36thoraryan@gmail.com"


def test_registration_duplicate_email_rejected(client):
    dup_payload = {
        "name": "Duplicate User",
        "email": "duplicate@enterprise.com",
        "password": "Password123!",
    }
    resp1 = client.post("/api/v1/auth/register", json=dup_payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/auth/register", json=dup_payload)
    assert resp2.status_code == 400
    err_body = resp2.json()
    msg = err_body.get("error", {}).get("message") or err_body.get("detail", "")
    assert "already exists" in msg


def test_login_wrong_password_rejected(client):
    reg_payload = {
        "name": "Security Tester",
        "email": "security@pineco.internal",
        "password": "CorrectPassword123",
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    wrong_login = client.post(
        "/api/v1/auth/login",
        json={"email": "security@pineco.internal", "password": "WrongPassword999"},
    )
    assert wrong_login.status_code == 401
    err_body = wrong_login.json()
    msg = err_body.get("error", {}).get("message") or err_body.get("detail", "")
    assert "Invalid email or password" in msg
