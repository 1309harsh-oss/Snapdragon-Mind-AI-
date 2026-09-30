import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine, Base

@pytest_asyncio.fixture(scope="function", autouse=True)
async def prepare_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "architecture" in data

@pytest.mark.asyncio
async def test_auth_workflow():
    transport = ASGITransport(app=app)
    unique_email = f"snapdragon_test_{uuid.uuid4().hex[:6]}@example.com"
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register
        reg_data = {
            "email": unique_email,
            "full_name": "Snapdragon Engineer",
            "password": "SecurePassword123!"
        }
        res_reg = await ac.post("/api/v1/auth/register", json=reg_data)
        assert res_reg.status_code == 201
        
        # Login
        login_data = {
            "email": unique_email,
            "password": "SecurePassword123!"
        }
        res_login = await ac.post("/api/v1/auth/login", json=login_data)
        assert res_login.status_code == 200
        token_data = res_login.json()
        assert "access_token" in token_data
        
        # Profile
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        res_me = await ac.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == unique_email

@pytest.mark.asyncio
async def test_snapdragon_device_and_capabilities():
    transport = ASGITransport(app=app)
    unique_email = f"snap_dev_{uuid.uuid4().hex[:6]}@example.com"
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        reg_data = {"email": unique_email, "full_name": "Dev", "password": "pass"}
        await ac.post("/api/v1/auth/register", json=reg_data)
        res_login = await ac.post("/api/v1/auth/login", json=reg_data)
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res_dev = await ac.get("/api/v1/snapdragon/device", headers=headers)
        assert res_dev.status_code == 200
        assert "os_system" in res_dev.json()

        res_caps = await ac.get("/api/v1/snapdragon/capabilities", headers=headers)
        assert res_caps.status_code == 200
        assert "arm64_native" in res_caps.json()

@pytest.mark.asyncio
async def test_benchmark_execution():
    transport = ASGITransport(app=app)
    unique_email = f"bench_user_{uuid.uuid4().hex[:6]}@example.com"
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        reg_data = {"email": unique_email, "full_name": "Bench", "password": "pass"}
        await ac.post("/api/v1/auth/register", json=reg_data)
        res_login = await ac.post("/api/v1/auth/login", json=reg_data)
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res_bench = await ac.post("/api/v1/performance/benchmark", json={"suite": "full"}, headers=headers)
        assert res_bench.status_code == 200
        bench_data = res_bench.json()
        assert bench_data["throughput"] > 0
        assert bench_data["success_count"] > 0
