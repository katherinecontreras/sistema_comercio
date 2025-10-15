from pydantic_settings import BaseSettings
from pydantic import computed_field, ConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "SistemaComercio"
    API_V1_PREFIX: str = "/api/v1"

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "1234"
    POSTGRES_DB: str = "SistemaComercio"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_SSL_MODE: str = "prefer"

    JWT_SECRET: str = "change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        ssl_part = f"?sslmode={self.DATABASE_SSL_MODE}" if self.DATABASE_SSL_MODE else ""
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}{ssl_part}"
        )

    model_config = ConfigDict(
        env_file=".env",        # carga variables desde .env
        case_sensitive=True,    # diferencia mayúsculas/minúsculas
        extra="ignore"          # permite valores extra sin error
    )


settings = Settings()




