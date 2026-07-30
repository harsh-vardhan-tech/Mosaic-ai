from fastapi import Header, HTTPException

import firebase_init  # noqa: F401 - import ensures firebase_admin is initialized before use
from firebase_admin import auth as firebase_auth
from logger import get_logger

log = get_logger("auth")


async def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    """Verifies 'Authorization: Bearer <firebase_id_token>' sent by the Next.js
    frontend after Firebase Auth sign-in. Use as a route dependency:

        @app.get("/items")
        async def list_items(user: dict = Depends(get_current_user)):
            ...

    Returns {"uid": ..., "email": ...} on success. Raises 401 otherwise.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Empty bearer token")

    try:
        decoded = firebase_auth.verify_id_token(token)
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired — sign in again")
    except Exception as e:
        log.warning("Token verification failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    return {"uid": decoded["uid"], "email": decoded.get("email")}
