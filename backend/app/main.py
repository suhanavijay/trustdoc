import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import init_db
from app.routes.issue import router as issue_router
from app.routes.verify import router as verify_router
from app.routes.revoke import router as revoke_router


def setup_app():
    os.makedirs(settings.KEYS_DIR, exist_ok=True)
    init_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure keys directory and initialize database
    setup_app()
    yield


app = FastAPI(
    title="TrustDoc API",
    description="Cryptographic Document Verification System API",
    version="1.0.0",
    lifespan=lifespan,
)


@app.on_event("startup")
def on_startup():
    setup_app()

# CORS middleware configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(issue_router)
app.include_router(verify_router)
app.include_router(revoke_router)


@app.get("/", summary="Root API Info")
def root():
    return {
        "name": "TrustDoc API",
        "description": "Cryptographic Document Verification System API",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
    }


@app.get("/api/v1/health", summary="Health check endpoint")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
