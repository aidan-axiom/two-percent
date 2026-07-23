from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://chef:chef@localhost:5432/chef"
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    secret_key: str = "dev-only-secret"
    access_token_ttl_hours: int = 24 * 7


settings = Settings()
