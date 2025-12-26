"""JWT authentication and validation functions."""
import jwt
import traceback
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple
from fastapi import Header, HTTPException
from app.config import JWT_SECRET_KEY, JWT_ALLOW_UNSIGNED, DEV_MODE


def validate_jwt_token(token: str) -> Tuple[Dict[str, Any], Optional[datetime]]:
    """
    Validate JWT token and extract claims and expiration.
    
    In dev mode, unsigned tokens (alg=none) are allowed.
    In production, tokens must be signed with the secret key.
    
    Returns:
        Tuple of (claims dict, expiration datetime or None)
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # First, decode without verification to check the algorithm
        unverified_header = jwt.get_unverified_header(token)
        algorithm = unverified_header.get("alg", "HS256")
        
        # Allow unsigned tokens (alg=none) if JWT_ALLOW_UNSIGNED is enabled or DEV_MODE is enabled
        # JWT_ALLOW_UNSIGNED takes precedence and can be used independently of DEV_MODE
        # This is intentional for development/testing purposes
        if (JWT_ALLOW_UNSIGNED or DEV_MODE) and algorithm == "none":
            # Decode without verification for unsigned tokens in dev mode
            # We still manually check expiration below
            decoded_token = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": False}  # noqa: S106
            )
        else:
            # Verify signature with secret key
            if not JWT_SECRET_KEY:
                raise HTTPException(
                    status_code=500,
                    detail="JWT_SECRET_KEY not configured. Required for signed tokens."
                )
            
            decoded_token = jwt.decode(
                token,
                JWT_SECRET_KEY,
                algorithms=["HS256", "HS512", "RS256", "RS512", algorithm] if algorithm != "none" else ["HS256", "HS512", "RS256", "RS512"]
            )
        
        # Extract expiration
        exp_timestamp = decoded_token.get("exp")
        if not exp_timestamp:
            raise HTTPException(
                status_code=401,
                detail="JWT token missing expiration (exp) claim"
            )
        
        # Convert expiration timestamp to datetime
        expiration = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        
        # Check if token is expired
        now = datetime.now(timezone.utc)
        if expiration < now:
            raise HTTPException(
                status_code=401,
                detail=f"JWT token expired at {expiration.isoformat()}"
            )
        
        return decoded_token, expiration
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="JWT token has expired")
    except jwt.InvalidTokenError as e:
        traceback.print_exc()
        logging.error(f"Invalid JWT token: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid JWT token: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        logging.error(f"JWT token validation failed: {e}")
        raise HTTPException(status_code=401, detail=f"JWT token validation failed: {str(e)}")


def extract_and_validate_bearer_token(authorization: Optional[str] = Header(None)) -> Tuple[str, Dict[str, Any], Optional[datetime]]:
    """
    Extract Bearer token from Authorization header and validate it.
    
    Returns:
        Tuple of (token string, claims dict, expiration datetime)
    
    Raises:
        HTTPException: If authorization header is missing, invalid, or token is invalid
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header must start with 'Bearer '")
    
    token = authorization[7:]  # Remove "Bearer " prefix
    if not token:
        raise HTTPException(status_code=401, detail="Token is required")
    
    # Validate token and get claims and expiration
    claims, expiration = validate_jwt_token(token)
    
    return token, claims, expiration


def check_token_expiration_from_session_state(session_state: dict) -> None:
    """
    Check if the JWT token stored in session state has expired.
    
    Raises:
        HTTPException: If token has expired
    """
    token_expiration_str = session_state.get("token_expiration")
    token_expires_at = session_state.get("token_expires_at")
    
    if token_expiration_str or token_expires_at:
        if token_expires_at:
            # Check using timestamp
            expiration_time = datetime.fromtimestamp(token_expires_at, tz=timezone.utc)
        else:
            # Parse ISO format string
            try:
                expiration_time = datetime.fromisoformat(token_expiration_str.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                # If we can't parse, skip expiration check
                return
        
        now = datetime.now(timezone.utc)
        if expiration_time < now:
            raise HTTPException(
                status_code=401,
                detail=f"JWT token in session has expired at {expiration_time.isoformat()}. Please create a new session."
            )

