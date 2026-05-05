from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
# The .env file is located in the server/ directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import workflow_router, app_router
from .routers import openai_router
from .settings import get_settings

app = FastAPI(title="工作流接口", version="1.0.0")

app.include_router(workflow_router.router, prefix="/api/workflow", tags=["workflow"])
app.include_router(app_router.router, prefix="/api/app", tags=["app"])
app.include_router(openai_router.router, prefix="/v1", tags=["openai"])

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.media_storage_dir.mkdir(parents=True, exist_ok=True)
app.mount(
    settings.media_base_url,
    StaticFiles(directory=settings.media_storage_dir, check_dir=False),
    name="media",
)

@app.get("/")
async def root():
    return {"message": "欢迎使用工作流接口"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
