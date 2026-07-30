from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import firebase_init  # noqa: F401 - initializes Firebase Admin on import, before routes load
from config import ALLOWED_ORIGINS, ALLOW_CREDENTIALS
from routes import items, search, generate, analytics, career
from logger import get_logger

log = get_logger("main")

app = FastAPI(
    title="Mosaic AI",
    description="AI-powered Digital Identity System",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    # Driven by ALLOWED_ORIGINS in .env — set it to your Vercel domain in prod.
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # HTTPException (404s, 401s, validation errors, etc.) is handled by
    # FastAPI's own default handler and never reaches here — this only
    # catches genuinely unexpected crashes, so clients get a clean 500
    # instead of a raw stack trace.
    log.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(items.router)
app.include_router(search.router)
app.include_router(generate.router)
app.include_router(analytics.router)
app.include_router(career.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
