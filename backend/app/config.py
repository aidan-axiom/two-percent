from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://chef:chef@localhost:5432/chef"
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    secret_key: str = "dev-only-secret"
    access_token_ttl_hours: int = 24 * 7
    # Production (set via Fly env/secrets)
    static_dir: str = ""  # path to the built frontend; empty = API only (dev)
    cookie_secure: bool = False

    @field_validator("database_url")
    @classmethod
    def _use_psycopg_driver(cls, url: str) -> str:
        """Normalize hosted-Postgres URLs (Neon etc.) to SQLAlchemy's psycopg3 form."""
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg://", 1)
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


settings = Settings()
