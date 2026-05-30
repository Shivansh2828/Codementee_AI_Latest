"""
Rate Limiter Middleware for FastAPI
In-memory sliding window rate limiting per IP address.
Provides granular control for sensitive endpoints.
"""
import time
import asyncio
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class RateLimitStore:
    """Thread-safe in-memory rate limit store using sliding window."""

    def __init__(self):
        self._requests = defaultdict(list)  # key -> [timestamps]
        self._cleanup_task = None

    async def start_cleanup(self):
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())

    async def _cleanup_loop(self):
        """Remove expired entries every 60 seconds."""
        while True:
            await asyncio.sleep(60)
            now = time.time()
            expired_keys = []
            for key, timestamps in list(self._requests.items()):
                # Remove timestamps older than 5 minutes
                self._requests[key] = [t for t in timestamps if now - t < 300]
                if not self._requests[key]:
                    expired_keys.append(key)
            for key in expired_keys:
                del self._requests[key]

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Check if key has exceeded rate limit. Returns True if limited."""
        now = time.time()
        # Remove expired timestamps
        self._requests[key] = [
            t for t in self._requests[key] if now - t < window_seconds
        ]
        if len(self._requests[key]) >= max_requests:
            return True
        self._requests[key].append(now)
        return False

    def get_remaining(self, key: str, max_requests: int, window_seconds: int) -> int:
        """Get remaining requests in current window."""
        now = time.time()
        active = [t for t in self._requests[key] if now - t < window_seconds]
        return max(0, max_requests - len(active))


# Singleton store
rate_store = RateLimitStore()

# Rate limit configurations per endpoint pattern
RATE_LIMITS = {
    # Auth endpoints — strict limits to prevent brute force
    "/api/auth/login": {"max": 5, "window": 60},        # 5 attempts per minute
    "/api/auth/register": {"max": 3, "window": 60},     # 3 registrations per minute
    "/api/forgot-password": {"max": 3, "window": 300},  # 3 per 5 minutes

    # Payment endpoints — moderate limits
    "/api/payment/create-order": {"max": 10, "window": 60},
    "/api/payment/verify": {"max": 10, "window": 60},

    # Terminal — prevent container spam
    "/api/terminal/create": {"max": 5, "window": 60},   # 5 sessions per minute

    # AI agents — expensive operations
    "/api/agents/job-search": {"max": 5, "window": 60},
    "/api/agents/referral": {"max": 5, "window": 60},

    # Admin endpoints — generous limits
    "/api/admin/": {"max": 60, "window": 60},

    # General API — default
    "_default": {"max": 100, "window": 60},  # 100 requests per minute
}


def get_client_ip(request: Request) -> str:
    """Extract real client IP, handling proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip
    return request.client.host if request.client else "unknown"


def get_rate_limit_for_path(path: str) -> dict:
    """Find the matching rate limit config for a given path."""
    for pattern, config in RATE_LIMITS.items():
        if pattern == "_default":
            continue
        if path.startswith(pattern):
            return config
    return RATE_LIMITS["_default"]


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and static files
        path = request.url.path
        if path in ("/", "/health") or not path.startswith("/api"):
            return await call_next(request)

        client_ip = get_client_ip(request)
        config = get_rate_limit_for_path(path)
        key = f"{client_ip}:{path}"

        if rate_store.is_rate_limited(key, config["max"], config["window"]):
            logger.warning(f"Rate limited: {client_ip} on {path}")
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please try again later.",
                    "retry_after": config["window"],
                },
                headers={
                    "Retry-After": str(config["window"]),
                    "X-RateLimit-Limit": str(config["max"]),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)

        # Add rate limit headers to response
        remaining = rate_store.get_remaining(key, config["max"], config["window"])
        response.headers["X-RateLimit-Limit"] = str(config["max"])
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response
