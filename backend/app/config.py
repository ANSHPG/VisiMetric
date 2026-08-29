from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./visimetric.db"
    model_version: str = "efficientnet_b0_v1"

    class Config:
        env_file = ".env"

settings = Settings()
