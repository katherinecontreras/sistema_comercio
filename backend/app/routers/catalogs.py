from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import Cliente
from app.schemas.catalogs import ClienteCreate, ClienteRead
from app.services.meses_jornada import crear_mes_resumen_para_cliente


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
    
    # Crear automáticamente el mesResumen con sus 31 días
    try:
        crear_mes_resumen_para_cliente(c.id_cliente, db)
    except HTTPException as e:
        # Si ya existe un mesResumen, no es un error crítico
        if e.status_code == 400:
            pass  # Ya existe, no hacer nada
        else:
            raise  # Re-lanzar otros errores HTTP
    except Exception as e:
        # Si hay un error al crear el mesResumen, no fallar la creación del cliente
        # pero registrar el error (en producción usar logging)
        print(f"Error al crear mesResumen para cliente {c.id_cliente}: {str(e)}")
        pass
    
    return c
