from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import get_settings
from backend.app.database import repository
from backend.app.routes import auth, chatbot, contact, detection, recommendations


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    settings.enhanced_dir.mkdir(parents=True, exist_ok=True)

    try:
        await repository.connect()
        app.state.mongodb_ready = True
        app.state.mongodb_error = ""
    except Exception as exc:
        app.state.mongodb_ready = False
        app.state.mongodb_error = str(exc)

    yield

    await repository.close()


settings = get_settings()

settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.enhanced_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory=str(settings.upload_dir)),
    name="uploads"
)

# Include routers
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(detection.router, prefix=settings.api_prefix)
app.include_router(recommendations.router, prefix=settings.api_prefix)
app.include_router(chatbot.router, prefix=settings.api_prefix)
app.include_router(contact.router, prefix=settings.api_prefix)


# Root endpoint (supports GET and HEAD)
@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "name": "Shiwar Samvad",
        "status": "running",
        "mongodb_ready": getattr(app.state, "mongodb_ready", False)
    }


# Health check endpoint (supports GET and HEAD)
@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {
        "status": "ok",
        "mongodb_ready": getattr(app.state, "mongodb_ready", False),
        "mongodb_error": getattr(app.state, "mongodb_error", ""),
        "vit_model_dir": str(settings.vit_model_dir),
    }
