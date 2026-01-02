"""Mock Authentication API."""
from fastapi import FastAPI
from datetime import datetime

app = FastAPI(
    title="Pulse Mock Auth API",
    version="0.1.0",
    description="Mock Authentication API for Performance Management System",
)


@app.get("/api/v1/auth/me")
async def get_current_user():
    """
    Get current user information.
    
    Returns mock user data for development and testing purposes.
    """
    return {
        "email": "ajay@sidgs.com",
        "name": "Ajay Yeluri",
        "roles": ["admin", "user", "epm_admin"],
        "permissions": [],
        "groups": [],
        "tenantId": "localhost"
    }


@app.get("/api/v1/auth/jwt")
async def get_jwt_token():
    """
    Get JWT token.
    
    Returns mock JWT token for development and testing purposes.
    """
    
    return {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhamF5QHNpZGdzLmNvbSIsImVtYWlsIjoiYWpheUBzaWRncy5jb20iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhamF5QHNpZGdzLmNvbSIsImlhdCI6MTc2NzM5NDAwNSwiZXhwIjoxNzY3Mzk3NjA1LCJpc3MiOiJzYW1pLXgtYXV0aC1hcGkiLCJhdWQiOiJzYW1pLXgtcG9ydGFsIiwicm9sZXMiOlsiYWRtaW4iLCJzYW1pX3hfYWRtaW4iLCJ1c2VyIl0sImdyb3VwcyI6W10sInRlbmFudF9pZCI6ImxvY2FsaG9zdCIsImdpdmVuX25hbWUiOiJBamF5IiwiZmFtaWx5X25hbWUiOiJZZWx1cmkiLCJuYW1lIjoiQWpheSBZZWx1cmkifQ.wtTUbysSs6mP8zDCVznosEEXZq7J0xV7QZO-iPrU4Oc",
        "expiresAt": f"{datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')}"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

