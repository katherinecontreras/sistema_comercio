from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from openpyxl import load_workbook

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models_catalogs import Cliente, Proveedor, TipoRecurso, Recurso
from app.schemas.catalogs import (
    ClienteCreate,
    ClienteRead,
    ProveedorCreate,
    ProveedorRead,
    TipoRecursoCreate,
    TipoRecursoRead,
    RecursoCreate,
    RecursoUpdate,
    RecursoRead,
)


router = APIRouter(prefix="/catalogos", tags=["catalogos"]) 


# Clientes
@router.get("/clientes", response_model=list[ClienteRead])
def list_clientes(db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador", "Cotizador"]))):
    return list(db.scalars(select(Cliente)).all())


@router.post("/clientes", response_model=ClienteRead, status_code=status.HTTP_201_CREATED)
def create_cliente(payload: ClienteCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    c = Cliente(**payload.model_fields_set, **payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


# Proveedores
@router.get("/proveedores", response_model=list[ProveedorRead])
def list_proveedores(db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador", "Cotizador"]))):
    return list(db.scalars(select(Proveedor)).all())


@router.post("/proveedores", response_model=ProveedorRead, status_code=status.HTTP_201_CREATED)
def create_proveedor(payload: ProveedorCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    p = Proveedor(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


# Tipos de Recurso
@router.get("/tipos_recurso", response_model=list[TipoRecursoRead])
def list_tipos(db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador", "Cotizador"]))):
    return list(db.scalars(select(TipoRecurso)).all())


@router.post("/tipos_recurso", response_model=TipoRecursoRead, status_code=status.HTTP_201_CREATED)
def create_tipo(payload: TipoRecursoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    existing = db.scalar(select(TipoRecurso).where(TipoRecurso.nombre == payload.nombre))
    if existing:
        raise HTTPException(status_code=400, detail="El tipo ya existe")
    t = TipoRecurso(nombre=payload.nombre)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


# Recursos
@router.get("/recursos", response_model=list[RecursoRead])
def list_recursos(db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador", "Cotizador"]))):
    return list(db.scalars(select(Recurso)).all())


@router.post("/recursos", response_model=RecursoRead, status_code=status.HTTP_201_CREATED)
def create_recurso(payload: RecursoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    r = Recurso(**payload.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.patch("/recursos/{id_recurso}", response_model=RecursoRead)
def update_recurso(id_recurso: int, payload: RecursoUpdate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    r = db.get(Recurso, id_recurso)
    if not r:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r


# Carga masiva desde Excel (hoja activa con columnas: descripcion, tipo, unidad, costo)
@router.post("/recursos/carga_masiva")
def carga_masiva(file: UploadFile = File(...), db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    if not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Archivo Excel inválido")
    wb = load_workbook(file.file, read_only=True, data_only=True)
    ws = wb.active
    headers = [str(c.value).strip().lower() if c.value else "" for c in next(ws.iter_rows(min_row=1, max_row=1))[0:4]]
    expected = ["descripcion", "tipo", "unidad", "costo"]
    if headers[:4] != expected:
        raise HTTPException(status_code=400, detail=f"Encabezados esperados: {expected}")

    tipos_cache: dict[str, int] = {}
    count_inserted = 0
    for row in ws.iter_rows(min_row=2):
        descripcion = (row[0].value or "").strip()
        tipo = (row[1].value or "").strip()
        unidad = (row[2].value or "").strip()
        costo = float(row[3].value or 0)
        if not descripcion or not tipo or not unidad:
            continue
        if tipo not in tipos_cache:
            existing = db.scalar(select(TipoRecurso).where(TipoRecurso.nombre == tipo))
            if not existing:
                existing = TipoRecurso(nombre=tipo)
                db.add(existing)
                db.commit()
                db.refresh(existing)
            tipos_cache[tipo] = existing.id_tipo_recurso
        recurso = Recurso(
            id_tipo_recurso=tipos_cache[tipo],
            descripcion=descripcion,
            unidad=unidad,
            costo_unitario_predeterminado=costo,
        )
        db.add(recurso)
        count_inserted += 1
        if count_inserted % 200 == 0:
            db.commit()

    db.commit()
    return {"insertados": count_inserted}


