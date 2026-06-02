from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "backend/.env"), env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Shiwar Samvad API"
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"

    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "shiwar_samvad"

    jwt_secret_key: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    vit_model_dir: Path = Path("checkpoints/vit-coco-weed")
    ml_site_packages: Path | None = None
    confidence_threshold: float = 0.0
    blur_threshold: float = 100.0

    realesrgan_archive_dir: Path = Path("backend/models/RealESRGAN_x4plus.pth")
    materialized_esrgan_path: Path = Path("backend/models/RealESRGAN_x4plus.materialized.pth")
    realesrgan_cpu_enabled: bool = False
    realesrgan_max_input_pixels: int = 800_000
    realesrgan_max_input_side: int = 1024
    enhancement_max_output_side: int = 2048
    upload_dir: Path = Path("backend/uploads")
    enhanced_dir: Path = Path("backend/uploads/enhanced")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
