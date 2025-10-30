from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import Cliente
from app.schemas.catalogs import ClienteCreate, ClienteRead


router = APIRouter(prefix="/catalogos", tags=["catalogos"]) 

# Clientes
@router.get("/clientes", response_model=list[ClienteRead])
def list_clientes(db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador", "Cotizador"]))):
    return list(db.scalars(select(Cliente)).all())


@router.post("/clientes", response_model=ClienteRead, status_code=status.HTTP_201_CREATED)
def create_cliente(payload: ClienteCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    c = Cliente(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
