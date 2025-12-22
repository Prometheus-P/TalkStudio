"""API endpoint tests."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


class TestHealthEndpoints:
    """Test health check endpoints."""

    def test_health_check(self, client):
        """Test basic health check."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_detailed_health_check(self, client):
        """Test detailed health check."""
        response = client.get("/api/v1/health/detailed")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data
        assert "rate_limits" in data

    def test_quota_endpoint(self, client):
        """Test quota status endpoint."""
        response = client.get("/api/v1/quota")
        assert response.status_code == 200
        data = response.json()
        assert "remaining" in data
        assert "limit" in data


class TestGenerateEndpoints:
    """Test generation endpoints."""

    def test_demo_conversation(self, client):
        """Test demo conversation generation."""
        response = client.post("/api/v1/generate/demo")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["messages"]) > 0
        assert data["provider"] == "demo"

    def test_generate_conversation_validation(self, client):
        """Test conversation generation validation."""
        # Too short prompt
        response = client.post(
            "/api/v1/generate/conversation",
            json={"prompt": "hi"},  # Less than 10 chars
        )
        assert response.status_code == 422

        # Invalid theme
        response = client.post(
            "/api/v1/generate/conversation",
            json={"prompt": "친구와의 대화를 생성해줘", "theme": "invalid_theme"},
        )
        assert response.status_code == 422


class TestRootEndpoint:
    """Test root endpoint."""

    def test_root(self, client):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "TalkStudio API"
        assert data["version"] == "2.0.0"
