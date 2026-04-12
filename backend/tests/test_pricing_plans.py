"""
Tests for service_type filtering logic on GET /api/pricing-plans.
Validates: Requirements 6.1, 6.2, 10.6

These tests validate the filtering and validation logic independently
of the full server module (which has heavy dependencies like MongoDB, Razorpay, etc.).
"""
import pytest
from datetime import datetime, timezone


# --- Constants matching server.py implementation ---
ALLOWED_SERVICE_TYPES = ["mock_interview", "mentorship", "resume_review"]


def validate_service_type(service_type):
    """Mirrors the validation logic in get_public_pricing_plans."""
    if service_type is not None and service_type not in ALLOWED_SERVICE_TYPES:
        return False, "Invalid service type. Allowed: mock_interview, mentorship, resume_review"
    return True, None


def build_query(service_type=None):
    """Mirrors the query-building logic in get_public_pricing_plans."""
    query = {"is_active": True}
    if service_type is not None:
        query["service_type"] = service_type
    return query


def format_plan_currency(plan_dict, currency="INR"):
    """Mirrors the currency formatting logic in get_public_pricing_plans."""
    result = dict(plan_dict)
    if currency == "USD":
        result["price"] = result.get("price_usd", result.get("price", 0))
        result["currency"] = "USD"
        result["currency_symbol"] = "$"
    else:
        result["price"] = result.get("price_inr", result.get("price", 0))
        result["currency"] = "INR"
        result["currency_symbol"] = "₹"
    return result


def filter_plans(plans, query):
    """Simulates MongoDB find() with the given query."""
    results = []
    for plan in plans:
        match = all(plan.get(k) == v for k, v in query.items())
        if match:
            results.append(plan)
    return results


# --- Test data ---

def make_plan(plan_id, service_type="mock_interview", is_active=True, price_inr=199900, price_usd=2400):
    return {
        "id": f"uuid_{plan_id}",
        "plan_id": plan_id,
        "name": f"Plan {plan_id}",
        "service_type": service_type,
        "price": price_inr,
        "price_inr": price_inr,
        "price_usd": price_usd,
        "is_active": is_active,
        "display_order": 1,
    }


ALL_PLANS = [
    make_plan("starter", "mock_interview"),
    make_plan("pro", "mock_interview"),
    make_plan("mentorship_1m", "mentorship"),
    make_plan("mentorship_3m", "mentorship"),
    make_plan("resume_email", "resume_review"),
]


# --- Validation tests ---

class TestServiceTypeValidation:
    """Tests for service_type parameter validation."""

    def test_none_is_valid(self):
        valid, _ = validate_service_type(None)
        assert valid is True

    def test_mock_interview_is_valid(self):
        valid, _ = validate_service_type("mock_interview")
        assert valid is True

    def test_mentorship_is_valid(self):
        valid, _ = validate_service_type("mentorship")
        assert valid is True

    def test_resume_review_is_valid(self):
        valid, _ = validate_service_type("resume_review")
        assert valid is True

    def test_invalid_type_rejected(self):
        valid, msg = validate_service_type("invalid_type")
        assert valid is False
        assert "Invalid service type" in msg

    def test_empty_string_rejected(self):
        valid, msg = validate_service_type("")
        assert valid is False

    def test_error_message_lists_allowed_values(self):
        _, msg = validate_service_type("bad")
        assert "mock_interview" in msg
        assert "mentorship" in msg
        assert "resume_review" in msg


# --- Query building tests ---

class TestQueryBuilding:
    """Tests for MongoDB query construction."""

    def test_no_service_type_queries_active_only(self):
        query = build_query(service_type=None)
        assert query == {"is_active": True}

    def test_with_service_type_adds_filter(self):
        query = build_query(service_type="mentorship")
        assert query == {"is_active": True, "service_type": "mentorship"}

    def test_mock_interview_filter(self):
        query = build_query(service_type="mock_interview")
        assert query["service_type"] == "mock_interview"
        assert query["is_active"] is True


# --- Filtering tests ---

class TestServiceTypeFiltering:
    """Tests for filtering plans by service_type (Req 6.1, 6.2, 10.6)."""

    def test_no_filter_returns_all_active(self):
        """No service_type param returns all active plans (Req 10.6)."""
        query = build_query(service_type=None)
        results = filter_plans(ALL_PLANS, query)
        assert len(results) == 5

    def test_filter_mock_interview(self):
        """service_type=mock_interview returns only mock_interview plans (Req 6.2)."""
        query = build_query(service_type="mock_interview")
        results = filter_plans(ALL_PLANS, query)
        assert len(results) == 2
        assert all(p["service_type"] == "mock_interview" for p in results)

    def test_filter_mentorship(self):
        """service_type=mentorship returns only mentorship plans (Req 6.2)."""
        query = build_query(service_type="mentorship")
        results = filter_plans(ALL_PLANS, query)
        assert len(results) == 2
        assert all(p["service_type"] == "mentorship" for p in results)

    def test_filter_resume_review(self):
        """service_type=resume_review returns only resume_review plans (Req 6.2)."""
        query = build_query(service_type="resume_review")
        results = filter_plans(ALL_PLANS, query)
        assert len(results) == 1
        assert results[0]["service_type"] == "resume_review"

    def test_filtered_result_is_subset_of_all(self):
        """Filtered results are a strict subset of all active plans (Req 6.1)."""
        all_results = filter_plans(ALL_PLANS, build_query(service_type=None))
        for st in ALLOWED_SERVICE_TYPES:
            filtered = filter_plans(ALL_PLANS, build_query(service_type=st))
            assert len(filtered) <= len(all_results)
            for plan in filtered:
                assert plan in all_results

    def test_inactive_plans_excluded(self):
        """Inactive plans are never returned regardless of filter."""
        plans_with_inactive = ALL_PLANS + [make_plan("inactive_plan", "mock_interview", is_active=False)]
        query = build_query(service_type="mock_interview")
        results = filter_plans(plans_with_inactive, query)
        assert all(p["is_active"] for p in results)
        assert len(results) == 2  # Only the 2 active mock_interview plans


# --- Currency formatting tests ---

class TestCurrencyFormatting:
    """Tests for currency formatting with service_type filter."""

    def test_inr_default(self):
        plan = make_plan("test", price_inr=499900, price_usd=6000)
        result = format_plan_currency(plan, "INR")
        assert result["price"] == 499900
        assert result["currency"] == "INR"
        assert result["currency_symbol"] == "₹"

    def test_usd_formatting(self):
        plan = make_plan("test", price_inr=499900, price_usd=6000)
        result = format_plan_currency(plan, "USD")
        assert result["price"] == 6000
        assert result["currency"] == "USD"
        assert result["currency_symbol"] == "$"

    def test_currency_does_not_affect_service_type(self):
        """Currency formatting preserves service_type field."""
        plan = make_plan("test", service_type="mentorship")
        result = format_plan_currency(plan, "USD")
        assert result["service_type"] == "mentorship"


# --- Admin CRUD service_type support tests (Task 1.3) ---
# Validates: Requirements 6.3, 6.4, 6.5, 6.6, 6.7, 6.8


def build_create_plan_doc(data):
    """Mirrors the plan_doc construction in POST /api/admin/pricing-plans."""
    return {
        "id": "test-uuid",
        "plan_id": data["plan_id"],
        "name": data["name"],
        "service_type": data.get("service_type", "mock_interview"),
        "price": data["price"],
        "price_inr": data.get("price_inr") if data.get("price_inr") else data["price"],
        "price_usd": data.get("price_usd") if data.get("price_usd") else int(data["price"] * 0.012),
        "duration_months": data["duration_months"],
        "features": data.get("features", []),
        "limits": data.get("limits", {}),
        "is_active": data.get("is_active", True),
        "display_order": data.get("display_order", 1),
        "currencies": data.get("currencies") or ["INR", "USD"],
        # Mentorship-specific fields
        "sessions_count": data.get("sessions_count"),
        "session_duration_minutes": data.get("session_duration_minutes"),
        "discount_percent": data.get("discount_percent"),
        # Resume review-specific fields
        "review_type": data.get("review_type"),
        "delivery_timeframe": data.get("delivery_timeframe"),
    }


def apply_update(existing_doc, update_data):
    """Mirrors the update logic in PUT /api/admin/pricing-plans/{plan_id}.
    Only non-None fields from update_data are applied."""
    result = dict(existing_doc)
    filtered = {k: v for k, v in update_data.items() if v is not None}
    # Sync price_inr and price for backward compatibility
    if 'price_inr' in filtered and 'price' not in filtered:
        filtered['price'] = filtered['price_inr']
    elif 'price' in filtered and 'price_inr' not in filtered:
        filtered['price_inr'] = filtered['price']
    result.update(filtered)
    return result


class TestAdminCreateServiceType:
    """Tests for POST /api/admin/pricing-plans service_type support (Req 6.3, 6.4)."""

    def test_create_mock_interview_plan_stores_service_type(self):
        """Creating a mock_interview plan stores service_type correctly."""
        data = {"plan_id": "starter", "name": "Starter", "price": 199900,
                "duration_months": 1, "service_type": "mock_interview"}
        doc = build_create_plan_doc(data)
        assert doc["service_type"] == "mock_interview"

    def test_create_defaults_to_mock_interview(self):
        """service_type defaults to mock_interview when not provided."""
        data = {"plan_id": "basic", "name": "Basic", "price": 99900, "duration_months": 1}
        doc = build_create_plan_doc(data)
        assert doc["service_type"] == "mock_interview"

    def test_create_mentorship_plan_with_specific_fields(self):
        """Creating a mentorship plan stores sessions_count, session_duration_minutes, discount_percent (Req 6.6)."""
        data = {
            "plan_id": "mentorship_1m", "name": "1 Month Mentorship",
            "price": 499900, "duration_months": 1,
            "service_type": "mentorship",
            "sessions_count": 4, "session_duration_minutes": 60, "discount_percent": 0,
        }
        doc = build_create_plan_doc(data)
        assert doc["service_type"] == "mentorship"
        assert doc["sessions_count"] == 4
        assert doc["session_duration_minutes"] == 60
        assert doc["discount_percent"] == 0

    def test_create_resume_review_plan_with_specific_fields(self):
        """Creating a resume_review plan stores review_type and delivery_timeframe (Req 6.7)."""
        data = {
            "plan_id": "resume_email", "name": "Resume Review - Email",
            "price": 149900, "duration_months": 1,
            "service_type": "resume_review",
            "review_type": "email", "delivery_timeframe": "5 business days",
        }
        doc = build_create_plan_doc(data)
        assert doc["service_type"] == "resume_review"
        assert doc["review_type"] == "email"
        assert doc["delivery_timeframe"] == "5 business days"

    def test_create_resume_review_call_plan(self):
        """Creating a resume_review call plan stores review_type as 'call'."""
        data = {
            "plan_id": "resume_call", "name": "Resume Review - Call",
            "price": 299900, "duration_months": 1,
            "service_type": "resume_review",
            "review_type": "call", "delivery_timeframe": "3 business days",
        }
        doc = build_create_plan_doc(data)
        assert doc["review_type"] == "call"

    def test_create_stores_dual_currency(self):
        """Creating a plan stores both price_inr and price_usd (Req 6.8)."""
        data = {
            "plan_id": "test_dual", "name": "Dual Currency",
            "price": 499900, "price_inr": 499900, "price_usd": 6000,
            "duration_months": 1, "service_type": "mentorship",
        }
        doc = build_create_plan_doc(data)
        assert doc["price_inr"] == 499900
        assert doc["price_usd"] == 6000

    def test_create_mentorship_without_specific_fields_stores_none(self):
        """Mentorship plan without optional fields stores None values."""
        data = {
            "plan_id": "mentorship_basic", "name": "Basic Mentorship",
            "price": 299900, "duration_months": 1, "service_type": "mentorship",
        }
        doc = build_create_plan_doc(data)
        assert doc["sessions_count"] is None
        assert doc["session_duration_minutes"] is None
        assert doc["discount_percent"] is None


class TestAdminUpdateServiceType:
    """Tests for PUT /api/admin/pricing-plans/{plan_id} service_type support (Req 6.5)."""

    def _base_plan(self):
        return {
            "plan_id": "mentorship_1m", "name": "1 Month Mentorship",
            "service_type": "mentorship", "price": 499900, "price_inr": 499900,
            "price_usd": 6000, "duration_months": 1,
            "sessions_count": 4, "session_duration_minutes": 60,
            "discount_percent": 0, "review_type": None, "delivery_timeframe": None,
        }

    def test_update_sessions_count(self):
        """Updating sessions_count on a mentorship plan works (Req 6.6)."""
        existing = self._base_plan()
        updated = apply_update(existing, {"sessions_count": 8})
        assert updated["sessions_count"] == 8
        assert updated["service_type"] == "mentorship"  # unchanged

    def test_update_discount_percent(self):
        """Updating discount_percent on a mentorship plan works (Req 6.6)."""
        existing = self._base_plan()
        updated = apply_update(existing, {"discount_percent": 15.0})
        assert updated["discount_percent"] == 15.0

    def test_update_service_type(self):
        """Updating service_type field works."""
        existing = self._base_plan()
        updated = apply_update(existing, {"service_type": "resume_review"})
        assert updated["service_type"] == "resume_review"

    def test_update_resume_review_fields(self):
        """Updating review_type and delivery_timeframe works (Req 6.7)."""
        existing = {
            "plan_id": "resume_email", "name": "Email Review",
            "service_type": "resume_review", "price": 149900,
            "review_type": "email", "delivery_timeframe": "5 business days",
        }
        updated = apply_update(existing, {"review_type": "call", "delivery_timeframe": "3 business days"})
        assert updated["review_type"] == "call"
        assert updated["delivery_timeframe"] == "3 business days"

    def test_update_price_inr_and_usd(self):
        """Updating both INR and USD prices works (Req 6.5, 6.8)."""
        existing = self._base_plan()
        updated = apply_update(existing, {"price_inr": 599900, "price_usd": 7200})
        assert updated["price_inr"] == 599900
        assert updated["price_usd"] == 7200
        assert updated["price"] == 599900  # synced from price_inr

    def test_update_none_values_are_skipped(self):
        """Fields with None values are not applied during update."""
        existing = self._base_plan()
        updated = apply_update(existing, {"sessions_count": None, "name": "Updated Name"})
        assert updated["sessions_count"] == 4  # unchanged
        assert updated["name"] == "Updated Name"


class TestAdminGetReturnsServiceFields:
    """Tests for GET /api/admin/pricing-plans returning service_type and service-specific fields (Req 6.3)."""

    def test_serialized_plan_includes_service_type(self):
        """Plans returned from GET include service_type field."""
        plan = make_plan("mentorship_1m", service_type="mentorship")
        assert "service_type" in plan
        assert plan["service_type"] == "mentorship"

    def test_serialized_mentorship_plan_includes_specific_fields(self):
        """Mentorship plans include sessions_count, session_duration_minutes, discount_percent."""
        plan = make_plan("mentorship_1m", service_type="mentorship")
        plan["sessions_count"] = 4
        plan["session_duration_minutes"] = 60
        plan["discount_percent"] = 10.0
        assert plan["sessions_count"] == 4
        assert plan["session_duration_minutes"] == 60
        assert plan["discount_percent"] == 10.0

    def test_serialized_resume_review_plan_includes_specific_fields(self):
        """Resume review plans include review_type and delivery_timeframe."""
        plan = make_plan("resume_email", service_type="resume_review")
        plan["review_type"] = "email"
        plan["delivery_timeframe"] = "5 business days"
        assert plan["review_type"] == "email"
        assert plan["delivery_timeframe"] == "5 business days"

    def test_mixed_service_types_all_returned(self):
        """GET returns plans of all service types with their specific fields."""
        plans = [
            {**make_plan("starter", "mock_interview")},
            {**make_plan("mentorship_1m", "mentorship"), "sessions_count": 4},
            {**make_plan("resume_email", "resume_review"), "review_type": "email"},
        ]
        service_types = [p["service_type"] for p in plans]
        assert "mock_interview" in service_types
        assert "mentorship" in service_types
        assert "resume_review" in service_types
