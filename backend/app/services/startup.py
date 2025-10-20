from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.models import Usuario, Rol


def seed_admin(db: Session):
    # Los roles ya se crean desde el SQL, solo verificamos que existan
    admin_role = db.scalar(select(Rol).where(Rol.nombre == "Administrador"))
    if not admin_role:
        admin_role = Rol(nombre="Administrador", descripcion="Acceso completo al sistema")
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)

    # El usuario admin ya se crea desde el SQL
    existing = db.scalar(select(Usuario).where(Usuario.dni == "12345678"))
    if existing:
        return  # Ya existe, no hacer nada
    
    # Si no existe, crear usuario admin (backup)
    admin = Usuario(
        dni="12345678",
        nombre="Admin",
        apellido="Sistema",
        email="admin@sistema.com",
        password_hash=get_password_hash("admin123"),
        id_rol=admin_role.id_rol,
        activo=True,
    )
    db.add(admin)
    db.commit()





