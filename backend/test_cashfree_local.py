"""Test Cashfree order creation locally"""
import asyncio
import os
import uuid
import httpx
from dotenv import load_dotenv

load_dotenv()

CASHFREE_APP_ID = os.environ.get('CASHFREE_APP_ID')
CASHFREE_SECRET_KEY = os.environ.get('CASHFREE_SECRET_KEY')
CASHFREE_BASE_URL = os.environ.get('CASHFREE_BASE_URL', 'https://api.cashfree.com/pg')

async def test():
    print(f"APP_ID: {'SET (' + CASHFREE_APP_ID[:8] + '...)' if CASHFREE_APP_ID else 'MISSING'}")
    print(f"SECRET: {'SET (' + CASHFREE_SECRET_KEY[:8] + '...)' if CASHFREE_SECRET_KEY else 'MISSING'}")
    print(f"BASE_URL: {CASHFREE_BASE_URL}")
    print()

    order_id = f"test_{uuid.uuid4().hex[:10]}"
    payload = {
        "order_id": order_id,
        "order_amount": 19.00,
        "order_currency": "USD",
        "customer_details": {
            "customer_id": "test_user",
            "customer_email": "test@example.com",
            "customer_phone": "+10000000000",
            "customer_name": "Test User"
        },
        "order_meta": {
            "return_url": "https://codementee.io/payment/success?order_id=" + order_id,
            "notify_url": "https://codementee.io/api/payment/cashfree-webhook"
        },
        "order_note": "Test payment"
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY
    }

    print(f"Creating order: {order_id}")
    print(f"URL: {CASHFREE_BASE_URL}/orders")
    print()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CASHFREE_BASE_URL}/orders",
            json=payload,
            headers=headers,
            timeout=30.0
        )

        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code in [200, 201]:
            data = response.json()
            print(f"\n✅ SUCCESS!")
            print(f"  cf_order_id: {data.get('cf_order_id')}")
            print(f"  payment_session_id: {data.get('payment_session_id', 'N/A')}")
        else:
            print(f"\n❌ FAILED - Cashfree rejected the request")

asyncio.run(test())
