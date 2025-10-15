from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.roles import router as roles_router
from app.routers.usuarios import router as usuarios_router
from app.routers.catalogs import router as catalogs_router
from app.routers.quotes import router as quotes_router
from app.routers.configuracion import router as config_router
from app.db.session import get_db
from app.services.startup import seed_admin
from fastapi import Depends


app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(roles_router, prefix=settings.API_V1_PREFIX)
app.include_router(usuarios_router, prefix=settings.API_V1_PREFIX)
app.include_router(catalogs_router, prefix=settings.API_V1_PREFIX)
app.include_router(quotes_router, prefix=settings.API_V1_PREFIX)
app.include_router(config_router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
def on_startup():
    # Semilla de usuario administrador por defecto
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()


