from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.models import Usuario, Rol


def seed_admin(db: Session):
    admin_role = db.scalar(select(Rol).where(Rol.nombre_rol == "Administrador"))
    if not admin_role:
        admin_role = Rol(nombre_rol="Administrador", descripcion="Acceso completo")
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)

    existing = db.scalar(select(Usuario).where(Usuario.dni == "00000000"))
    if not existing:
        admin = Usuario(
            nombre="Admin",
            dni="00000000",
            password_hash=get_password_hash("admin123"),
            id_rol=admin_role.id_rol,
            activo=True,
        )
        db.add(admin)
        db.commit()




