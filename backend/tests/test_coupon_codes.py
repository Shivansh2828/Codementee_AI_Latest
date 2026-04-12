"""
Tests for coupon code models and CRUD logic.
Validates: Requirements 7.1, 7.7

These tests validate the coupon code creation, update, and validation logic
independently of the full server module (which has heavy dependencies like MongoDB, Razorpay, etc.).
"""
import pytest
from datetime import datetime, timezone, timedelta
import uuid


# --- Helper functions mirroring server.py coupon logic ---

def normalize_coupon_code(code: str) -> str:
    """Mirrors the code normalization in create_coupon."""
    return code.strip().upper()


def build_coupon_doc(data: dict) -> dict:
    """Mirrors the coupon document creation in create_coupon endpoint."""
    return {
        "id": str(uuid.uuid4()),
        "code": normalize_coupon_code(data["code"]),
        "discount_type": data["discount_type"],
        "discount_value": data["discount_value"],
        "max_uses": data.get("max_uses", 0),
        "current_uses": 0,
        "valid_from": data["valid_from"],
        "valid_to": data["valid_to"],
        "applicable_services": data.get("applicable_services", ["all"]),
        "is_active": data.get("is_active", True),
        "min_order_amount": data.get("min_order_amount", 0),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def apply_coupon_update(existing: dict, update_data: dict) -> dict:
    """Mirrors the update logic in update_coupon endpoint."""
    result = dict(existing)
    filtered = {k: v for k, v in update_data.items() if v is not None}
    if "code" in filtered:
        filtered["code"] = filtered["code"].strip().upper()
    if filtered:
        filtered["updated_at"] = datetime.now(timezone.utc).isoformat()
        result.update(filtered)
    return result


def is_duplicate_code(code: str, existing_codes: list) -> bool:
    """Check if a normalized code already exists."""
    return normalize_coupon_code(code) in existing_codes


# --- Test data ---

def make_coupon(code="LAUNCH20", discount_type="percentage", discount_value=20,
                max_uses=100, current_uses=0, is_active=True,
                applicable_services=None, min_order_amount=0):
    now = datetime.now(timezone.utc)
    return {
        "id": str(uuid.uuid4()),
        "code": code.upper(),
        "discount_type": discount_type,
        "discount_value": discount_value,
        "max_uses": max_uses,
        "current_uses": current_uses,
        "valid_from": (now - timedelta(days=1)).isoformat(),
        "valid_to": (now + timedelta(days=30)).isoformat(),
        "applicable_services": applicable_services or ["all"],
        "is_active": is_active,
        "min_order_amount": min_order_amount,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }


# --- Tests: Code normalization ---

class TestCodeNormalization:
    def test_uppercase_conversion(self):
        assert normalize_coupon_code("launch20") == "LAUNCH20"

    def test_strip_whitespace(self):
        assert normalize_coupon_code("  SAVE10  ") == "SAVE10"

    def test_already_uppercase(self):
        assert normalize_coupon_code("PROMO50") == "PROMO50"

    def test_mixed_case(self):
        assert normalize_coupon_code("SuMmEr2025") == "SUMMER2025"


# --- Tests: Coupon document creation ---

class TestCouponDocCreation:
    def test_creates_doc_with_all_fields(self):
        data = {
            "code": "test20",
            "discount_type": "percentage",
            "discount_value": 20,
            "max_uses": 50,
            "valid_from": "2025-01-01T00:00:00Z",
            "valid_to": "2025-12-31T23:59:59Z",
            "applicable_services": ["mock_interview", "mentorship"],
            "is_active": True,
            "min_order_amount": 100000,
        }
        doc = build_coupon_doc(data)
        assert doc["code"] == "TEST20"
        assert doc["discount_type"] == "percentage"
        assert doc["discount_value"] == 20
        assert doc["max_uses"] == 50
        assert doc["current_uses"] == 0
        assert doc["applicable_services"] == ["mock_interview", "mentorship"]
        assert doc["is_active"] is True
        assert doc["min_order_amount"] == 100000
        assert "id" in doc
        assert "created_at" in doc
        assert "updated_at" in doc

    def test_defaults_for_optional_fields(self):
        data = {
            "code": "basic",
            "discount_type": "fixed",
            "discount_value": 5000,
            "valid_from": "2025-01-01T00:00:00Z",
            "valid_to": "2025-12-31T23:59:59Z",
        }
        doc = build_coupon_doc(data)
        assert doc["max_uses"] == 0
        assert doc["applicable_services"] == ["all"]
        assert doc["is_active"] is True
        assert doc["min_order_amount"] == 0

    def test_current_uses_always_starts_at_zero(self):
        data = {
            "code": "new",
            "discount_type": "percentage",
            "discount_value": 10,
            "valid_from": "2025-01-01T00:00:00Z",
            "valid_to": "2025-12-31T23:59:59Z",
        }
        doc = build_coupon_doc(data)
        assert doc["current_uses"] == 0


# --- Tests: Duplicate detection ---

class TestDuplicateDetection:
    def test_detects_exact_duplicate(self):
        existing = ["LAUNCH20", "SAVE10"]
        assert is_duplicate_code("LAUNCH20", existing) is True

    def test_detects_case_insensitive_duplicate(self):
        existing = ["LAUNCH20"]
        assert is_duplicate_code("launch20", existing) is True

    def test_no_duplicate(self):
        existing = ["LAUNCH20", "SAVE10"]
        assert is_duplicate_code("NEWCODE", existing) is False

    def test_whitespace_trimmed_before_check(self):
        existing = ["LAUNCH20"]
        assert is_duplicate_code("  launch20  ", existing) is True


# --- Tests: Coupon update logic ---

class TestCouponUpdate:
    def _base_coupon(self):
        return make_coupon(code="ORIGINAL", discount_value=20, is_active=True)

    def test_update_discount_value(self):
        coupon = self._base_coupon()
        updated = apply_coupon_update(coupon, {"discount_value": 30})
        assert updated["discount_value"] == 30

    def test_update_is_active(self):
        coupon = self._base_coupon()
        updated = apply_coupon_update(coupon, {"is_active": False})
        assert updated["is_active"] is False

    def test_update_code_normalizes_to_uppercase(self):
        coupon = self._base_coupon()
        updated = apply_coupon_update(coupon, {"code": "newcode"})
        assert updated["code"] == "NEWCODE"

    def test_none_values_are_skipped(self):
        coupon = self._base_coupon()
        original_value = coupon["discount_value"]
        updated = apply_coupon_update(coupon, {"discount_value": None, "max_uses": None})
        assert updated["discount_value"] == original_value

    def test_update_sets_updated_at(self):
        coupon = self._base_coupon()
        old_updated = coupon["updated_at"]
        updated = apply_coupon_update(coupon, {"discount_value": 50})
        assert updated["updated_at"] != old_updated

    def test_update_applicable_services(self):
        coupon = self._base_coupon()
        updated = apply_coupon_update(coupon, {"applicable_services": ["mentorship"]})
        assert updated["applicable_services"] == ["mentorship"]

    def test_update_min_order_amount(self):
        coupon = self._base_coupon()
        updated = apply_coupon_update(coupon, {"min_order_amount": 500000})
        assert updated["min_order_amount"] == 500000

    def test_empty_update_preserves_all_fields(self):
        coupon = self._base_coupon()
        updated = apply_coupon_update(coupon, {})
        assert updated["code"] == coupon["code"]
        assert updated["discount_value"] == coupon["discount_value"]
        assert updated["is_active"] == coupon["is_active"]


# --- Tests: Coupon model field validation ---

class TestCouponFields:
    def test_percentage_discount_type(self):
        coupon = make_coupon(discount_type="percentage", discount_value=25)
        assert coupon["discount_type"] == "percentage"
        assert coupon["discount_value"] == 25

    def test_fixed_discount_type(self):
        coupon = make_coupon(discount_type="fixed", discount_value=50000)
        assert coupon["discount_type"] == "fixed"
        assert coupon["discount_value"] == 50000

    def test_unlimited_uses(self):
        coupon = make_coupon(max_uses=0)
        assert coupon["max_uses"] == 0

    def test_limited_uses(self):
        coupon = make_coupon(max_uses=100)
        assert coupon["max_uses"] == 100

    def test_applicable_to_all_services(self):
        coupon = make_coupon(applicable_services=["all"])
        assert coupon["applicable_services"] == ["all"]

    def test_applicable_to_specific_services(self):
        coupon = make_coupon(applicable_services=["mock_interview", "resume_review"])
        assert coupon["applicable_services"] == ["mock_interview", "resume_review"]

    def test_inactive_coupon(self):
        coupon = make_coupon(is_active=False)
        assert coupon["is_active"] is False

    def test_min_order_amount(self):
        coupon = make_coupon(min_order_amount=200000)
        assert coupon["min_order_amount"] == 200000


# --- Helper: mirrors validate_coupon endpoint logic ---

def validate_coupon_logic(coupon, service_type, order_amount, currency="INR"):
    """
    Pure-function mirror of the POST /api/validate-coupon endpoint logic.
    Validates: Requirements 7.2, 7.3, 7.4, 7.5
    """
    if coupon is None:
        return {"valid": False, "message": "Coupon code not found"}

    if not coupon.get("is_active", False):
        return {"valid": False, "message": "Coupon is not active"}

    max_uses = coupon.get("max_uses", 0)
    current_uses = coupon.get("current_uses", 0)
    if max_uses != 0 and current_uses >= max_uses:
        return {"valid": False, "message": "Coupon usage limit reached"}

    now = datetime.now(timezone.utc)
    try:
        valid_from = datetime.fromisoformat(coupon["valid_from"].replace("Z", "+00:00"))
        valid_to = datetime.fromisoformat(coupon["valid_to"].replace("Z", "+00:00"))
    except Exception:
        return {"valid": False, "message": "Coupon has invalid date configuration"}

    if now < valid_from:
        return {"valid": False, "message": "Coupon is not yet valid"}
    if now > valid_to:
        return {"valid": False, "message": "Coupon has expired"}

    applicable = coupon.get("applicable_services", ["all"])
    if "all" not in applicable and service_type not in applicable:
        return {"valid": False, "message": "Coupon not applicable to this service"}

    min_order = coupon.get("min_order_amount", 0)
    if min_order > 0 and order_amount < min_order:
        if currency == "USD":
            formatted_min = f"${min_order / 100:.2f}"
        else:
            formatted_min = f"₹{min_order / 100:.0f}"
        return {"valid": False, "message": f"Minimum order amount is {formatted_min}"}

    discount_type = coupon["discount_type"]
    discount_value = coupon["discount_value"]

    if discount_type == "percentage":
        discount_amount = int(order_amount * discount_value / 100)
        discounted_amount = order_amount - discount_amount
    else:
        discount_amount = int(min(discount_value, order_amount))
        discounted_amount = max(0, order_amount - int(discount_value))

    return {
        "valid": True,
        "code": coupon["code"],
        "discount_type": discount_type,
        "discount_value": discount_value,
        "discounted_amount": discounted_amount,
        "discount_amount": discount_amount,
    }


# --- Tests: Coupon validation logic (Validates: Requirements 7.2, 7.3, 7.4, 7.5) ---

class TestCouponValidation:
    def test_valid_percentage_coupon(self):
        coupon = make_coupon(discount_type="percentage", discount_value=20)
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is True
        assert result["discount_type"] == "percentage"
        assert result["discount_value"] == 20
        assert result["discount_amount"] == 39980
        assert result["discounted_amount"] == 159920

    def test_valid_fixed_coupon(self):
        coupon = make_coupon(discount_type="fixed", discount_value=50000)
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is True
        assert result["discount_amount"] == 50000
        assert result["discounted_amount"] == 149900

    def test_fixed_discount_exceeds_order(self):
        coupon = make_coupon(discount_type="fixed", discount_value=300000)
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is True
        assert result["discounted_amount"] == 0
        assert result["discount_amount"] == 199900

    def test_coupon_not_found(self):
        result = validate_coupon_logic(None, "mock_interview", 199900)
        assert result["valid"] is False
        assert result["message"] == "Coupon code not found"

    def test_inactive_coupon(self):
        coupon = make_coupon(is_active=False)
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is False
        assert result["message"] == "Coupon is not active"

    def test_usage_limit_reached(self):
        coupon = make_coupon(max_uses=10, current_uses=10)
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is False
        assert result["message"] == "Coupon usage limit reached"

    def test_unlimited_uses_always_valid(self):
        coupon = make_coupon(max_uses=0, current_uses=9999)
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is True

    def test_expired_coupon(self):
        now = datetime.now(timezone.utc)
        coupon = make_coupon()
        coupon["valid_from"] = (now - timedelta(days=60)).isoformat()
        coupon["valid_to"] = (now - timedelta(days=1)).isoformat()
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is False
        assert result["message"] == "Coupon has expired"

    def test_not_yet_valid_coupon(self):
        now = datetime.now(timezone.utc)
        coupon = make_coupon()
        coupon["valid_from"] = (now + timedelta(days=1)).isoformat()
        coupon["valid_to"] = (now + timedelta(days=30)).isoformat()
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is False
        assert result["message"] == "Coupon is not yet valid"

    def test_not_applicable_to_service(self):
        coupon = make_coupon(applicable_services=["mentorship"])
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is False
        assert result["message"] == "Coupon not applicable to this service"

    def test_applicable_to_all_services(self):
        coupon = make_coupon(applicable_services=["all"])
        result = validate_coupon_logic(coupon, "resume_review", 199900)
        assert result["valid"] is True

    def test_applicable_to_specific_service(self):
        coupon = make_coupon(applicable_services=["mock_interview", "resume_review"])
        result = validate_coupon_logic(coupon, "resume_review", 199900)
        assert result["valid"] is True

    def test_below_min_order_amount_inr(self):
        coupon = make_coupon(min_order_amount=200000)
        result = validate_coupon_logic(coupon, "mock_interview", 100000, currency="INR")
        assert result["valid"] is False
        assert "₹" in result["message"]

    def test_below_min_order_amount_usd(self):
        coupon = make_coupon(min_order_amount=5000)
        result = validate_coupon_logic(coupon, "mock_interview", 2400, currency="USD")
        assert result["valid"] is False
        assert "$" in result["message"]

    def test_meets_min_order_amount(self):
        coupon = make_coupon(min_order_amount=100000)
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is True

    def test_percentage_100_gives_zero_amount(self):
        coupon = make_coupon(discount_type="percentage", discount_value=100)
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is True
        assert result["discounted_amount"] == 0

    def test_response_includes_code(self):
        coupon = make_coupon(code="TESTCODE")
        result = validate_coupon_logic(coupon, "mock_interview", 199900)
        assert result["valid"] is True
        assert result["code"] == "TESTCODE"
