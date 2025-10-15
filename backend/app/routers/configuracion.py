from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import Base
from sqlalchemy import text


router = APIRouter(prefix="/configuracion", tags=["configuracion"]) 


@router.get("")
def listar_config(db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    rows = db.execute(text("SELECT clave, valor FROM configuracion ORDER BY clave")).fetchall()
    return [{"clave": r[0], "valor": r[1]} for r in rows]


@router.post("")
def guardar_config(pares: list[dict], db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    for par in pares:
        db.execute(text("INSERT INTO configuracion (clave, valor) VALUES (:c, :v) ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor"), {"c": par["clave"], "v": par["valor"]})
    db.commit()
    return {"actualizado": True}




