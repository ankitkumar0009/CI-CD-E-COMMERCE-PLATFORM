from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Commerce Product and Order Management API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/ecommerce_db",
        description="PostgreSQL Database URL with psycopg driver",
    )

    # JWT Authentication
    JWT_SECRET_KEY: str = Field(
        default="94c2e64627885b59e38e83bfa867201c7471927c34b6e5b5e7d581c81ef4f1d2",
        description="Cryptographic secret key for signing JWT tokens",
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Initial Admin Seed
    ADMIN_DEFAULT_EMAIL: str = "admin@ecommerce.local"
    ADMIN_DEFAULT_PASSWORD: str = "AdminSecret2026!"

    # Logging & Monitoring
    LOG_LEVEL: str = "INFO"
    ENABLE_PROMETHEUS: bool = True

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
