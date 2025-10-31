from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.roles import router as roles_router
from app.routers.usuarios import router as usuarios_router
from app.routers.catalogs import router as catalogs_router
from app.routers.obras import router as obras_router
from app.routers.configuracion import router as config_router
from app.routers.personal import router as personal_router
from app.routers.equipos import router as equipos_router
from app.routers.itemsObra import router as itemsObra_router
from app.services.startup import seed_admin


app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1420",
        "http://127.0.0.1:1420",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(roles_router, prefix=settings.API_V1_PREFIX)
app.include_router(usuarios_router, prefix=settings.API_V1_PREFIX)
app.include_router(catalogs_router, prefix=settings.API_V1_PREFIX)
app.include_router(obras_router, prefix=settings.API_V1_PREFIX)
app.include_router(config_router, prefix=settings.API_V1_PREFIX)
app.include_router(personal_router, prefix=settings.API_V1_PREFIX)
app.include_router(equipos_router, prefix=settings.API_V1_PREFIX)
app.include_router(itemsObra_router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
def on_startup():
    # Semilla de usuario administrador por defecto
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()


