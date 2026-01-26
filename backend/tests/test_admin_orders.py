"""
Backend API Tests for Admin Orders and Revenue Features
Tests: Admin authentication, /admin/orders, /admin/revenue-stats, /payment/config endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "password"


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin can login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["role"] == "admin", f"Expected admin role, got {data['user']['role']}"
        assert data["user"]["email"] == ADMIN_EMAIL
    
    def test_admin_login_invalid_credentials(self):
        """Test login fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401


@pytest.fixture
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Admin authentication failed")


@pytest.fixture
def admin_headers(admin_token):
    """Headers with admin auth token"""
    return {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }


class TestAdminOrders:
    """Tests for /admin/orders endpoint"""
    
    def test_get_orders_requires_auth(self):
        """Test orders endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code in [401, 403], "Should require auth"
    
    def test_get_orders_success(self, admin_headers):
        """Test admin can get all orders"""
        response = requests.get(f"{BASE_URL}/api/admin/orders", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify order structure if orders exist
        if len(data) > 0:
            order = data[0]
            # Check expected fields exist
            expected_fields = ["id", "name", "email", "plan_id", "amount", "status", "created_at"]
            for field in expected_fields:
                assert field in order, f"Missing field: {field}"
    
    def test_orders_sorted_by_date(self, admin_headers):
        """Test orders are sorted by created_at descending"""
        response = requests.get(f"{BASE_URL}/api/admin/orders", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) >= 2:
            # Verify descending order
            for i in range(len(data) - 1):
                date1 = data[i].get("created_at", "")
                date2 = data[i + 1].get("created_at", "")
                assert date1 >= date2, "Orders should be sorted by date descending"


class TestRevenueStats:
    """Tests for /admin/revenue-stats endpoint"""
    
    def test_revenue_stats_requires_auth(self):
        """Test revenue stats endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/revenue-stats")
        assert response.status_code in [401, 403], "Should require auth"
    
    def test_revenue_stats_success(self, admin_headers):
        """Test admin can get revenue statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/revenue-stats", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "total_revenue" in data, "Missing total_revenue"
        assert "total_orders" in data, "Missing total_orders"
        assert "plan_revenue" in data, "Missing plan_revenue"
        assert "plan_counts" in data, "Missing plan_counts"
        assert "recent_orders" in data, "Missing recent_orders"
        
        # Verify data types
        assert isinstance(data["total_revenue"], (int, float)), "total_revenue should be numeric"
        assert isinstance(data["total_orders"], int), "total_orders should be int"
        assert isinstance(data["plan_revenue"], dict), "plan_revenue should be dict"
        assert isinstance(data["plan_counts"], dict), "plan_counts should be dict"
        assert isinstance(data["recent_orders"], list), "recent_orders should be list"
    
    def test_revenue_stats_values_non_negative(self, admin_headers):
        """Test revenue values are non-negative"""
        response = requests.get(f"{BASE_URL}/api/admin/revenue-stats", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_revenue"] >= 0, "Revenue should be non-negative"
        assert data["total_orders"] >= 0, "Order count should be non-negative"


class TestPaymentConfig:
    """Tests for /payment/config endpoint"""
    
    def test_payment_config_public(self):
        """Test payment config is publicly accessible"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200, f"Failed: {response.text}"
    
    def test_payment_config_returns_razorpay_key(self):
        """Test payment config returns Razorpay key ID"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        assert "razorpay_key_id" in data, "Missing razorpay_key_id"
        assert data["razorpay_key_id"] is not None, "razorpay_key_id should not be null"
        assert len(data["razorpay_key_id"]) > 0, "razorpay_key_id should not be empty"
    
    def test_payment_config_uses_live_key(self):
        """Test payment config uses live Razorpay key (rzp_live_*)"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        key = data.get("razorpay_key_id", "")
        assert key.startswith("rzp_live_"), f"Expected live key (rzp_live_*), got: {key}"


class TestNonAdminAccess:
    """Test that non-admin users cannot access admin endpoints"""
    
    def test_mentee_cannot_access_orders(self):
        """Test mentee role cannot access admin orders"""
        # First register a mentee
        import uuid
        test_email = f"test_mentee_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test Mentee",
            "email": test_email,
            "password": "testpass123",
            "role": "mentee"
        })
        
        if reg_response.status_code != 200:
            pytest.skip("Could not create test mentee")
        
        # Login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "testpass123"
        })
        
        if login_response.status_code != 200:
            pytest.skip("Could not login as test mentee")
        
        token = login_response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to access admin orders
        response = requests.get(f"{BASE_URL}/api/admin/orders", headers=headers)
        assert response.status_code == 403, "Mentee should not access admin orders"
    
    def test_mentee_cannot_access_revenue_stats(self):
        """Test mentee role cannot access admin revenue stats"""
        import uuid
        test_email = f"test_mentee2_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test Mentee 2",
            "email": test_email,
            "password": "testpass123",
            "role": "mentee"
        })
        
        if reg_response.status_code != 200:
            pytest.skip("Could not create test mentee")
        
        # Login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "testpass123"
        })
        
        if login_response.status_code != 200:
            pytest.skip("Could not login as test mentee")
        
        token = login_response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to access admin revenue stats
        response = requests.get(f"{BASE_URL}/api/admin/revenue-stats", headers=headers)
        assert response.status_code == 403, "Mentee should not access admin revenue stats"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
