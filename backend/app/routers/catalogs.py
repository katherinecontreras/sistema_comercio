from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from sqlalchemy.orm import Session
from sqlalchemy import select
from openpyxl import load_workbook

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models_catalogs import Cliente, Proveedor, TipoRecurso, Recurso, Especialidad, Unidad
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
    EspecialidadCreate,
    EspecialidadRead,
    UnidadCreate,
    UnidadRead,
)


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
def list_tipos(db: Session = Depends(get_db)):
    return list(db.scalars(select(TipoRecurso)).all())


@router.post("/tipos_recurso", response_model=TipoRecursoRead, status_code=status.HTTP_201_CREATED)
def create_tipo(nombre: str = Form(...), db: Session = Depends(get_db)):
    existing = db.scalar(select(TipoRecurso).where(TipoRecurso.nombre == nombre))
    if existing:
        raise HTTPException(status_code=400, detail="El tipo ya existe")
    t = TipoRecurso(nombre=nombre)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


# Recursos
@router.get("/recursos")
def list_recursos(db: Session = Depends(get_db)):
    recursos = db.scalars(select(Recurso)).all()
    result = []
    for recurso in recursos:
        unidad_obj = db.get(Unidad, recurso.id_unidad) if recurso.id_unidad else None
        result.append({
            "id_recurso": recurso.id_recurso,
            "id_tipo_recurso": recurso.id_tipo_recurso,
            "descripcion": recurso.descripcion,
            "id_unidad": recurso.id_unidad,
            "cantidad": float(recurso.cantidad),
            "costo_unitario_predeterminado": float(recurso.costo_unitario_predeterminado),
            "costo_total": float(recurso.costo_total),
            "id_proveedor_preferido": recurso.id_proveedor_preferido,
            "atributos": recurso.atributos,
            "unidad": unidad_obj.nombre if unidad_obj else ""
        })
    return result


@router.post("/recursos", status_code=status.HTTP_201_CREATED)
def create_recurso(payload: RecursoCreate, db: Session = Depends(get_db)):
    # Crear el recurso en la base de datos
    r = Recurso(**payload.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    
    # Obtener el nombre de la unidad para devolverlo
    unidad_obj = db.get(Unidad, r.id_unidad) if r.id_unidad else None
    
    return {
        "id_recurso": r.id_recurso,
        "id_tipo_recurso": r.id_tipo_recurso,
        "descripcion": r.descripcion,
        "id_unidad": r.id_unidad,
        "cantidad": float(r.cantidad),
        "costo_unitario_predeterminado": float(r.costo_unitario_predeterminado),
        "costo_total": float(r.costo_total),
        "id_proveedor_preferido": r.id_proveedor_preferido,
        "atributos": r.atributos,
        "unidad": unidad_obj.nombre if unidad_obj else ""
    }


@router.patch("/recursos/{id_recurso}")
def update_recurso(id_recurso: int, payload: RecursoUpdate, db: Session = Depends(get_db)):
    r = db.get(Recurso, id_recurso)
    if not r:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    
    # Obtener el nombre de la unidad para devolverlo
    unidad_obj = db.get(Unidad, r.id_unidad) if r.id_unidad else None
    
    return {
        "id_recurso": r.id_recurso,
        "id_tipo_recurso": r.id_tipo_recurso,
        "descripcion": r.descripcion,
        "id_unidad": r.id_unidad,
        "cantidad": float(r.cantidad),
        "costo_unitario_predeterminado": float(r.costo_unitario_predeterminado),
        "costo_total": float(r.costo_total),
        "id_proveedor_preferido": r.id_proveedor_preferido,
        "atributos": r.atributos,
        "unidad": unidad_obj.nombre if unidad_obj else ""
    }


# Carga masiva desde Excel (hoja activa con columnas: descripcion, tipo, unidad, costo + columnas adicionales)
@router.post("/recursos/carga_masiva")
def carga_masiva(file: UploadFile = File(...), db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    if not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Archivo Excel inválido")
    wb = load_workbook(file.file, read_only=True, data_only=True)
    ws = wb.active
    
    # Obtener todos los headers de la primera fila
    headers = [str(c.value).strip().lower() if c.value else "" for c in next(ws.iter_rows(min_row=1, max_row=1))]
    expected_basic = ["descripcion", "tipo", "unidad", "costo"]
    
    # Verificar que las primeras 4 columnas sean las esperadas
    if headers[:4] != expected_basic:
        raise HTTPException(status_code=400, detail=f"Las primeras 4 columnas deben ser: {expected_basic}")
    
    # Obtener columnas adicionales (después de las 4 básicas)
    additional_columns = headers[4:] if len(headers) > 4 else []

    tipos_cache: dict[str, int] = {}
    count_inserted = 0
    for row in ws.iter_rows(min_row=2):
        descripcion = (row[0].value or "").strip()
        tipo = (row[1].value or "").strip()
        unidad = (row[2].value or "").strip()
        costo = float(row[3].value or 0)
        
        if not descripcion or not tipo or not unidad:
            continue
            
        # Crear diccionario de atributos adicionales
        atributos = {}
        for i, col_name in enumerate(additional_columns):
            if col_name and i + 4 < len(row):
                cell_value = row[i + 4].value
                if cell_value is not None:
                    # Convertir a string y limpiar
                    atributos[col_name] = str(cell_value).strip()
        
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
            atributos=atributos if atributos else None
        )
        db.add(recurso)
        count_inserted += 1
        if count_inserted % 200 == 0:
            db.commit()

    db.commit()
    return {"insertados": count_inserted}


# Especialidades
@router.get("/especialidades", response_model=list[EspecialidadRead])
def listar_especialidades(db: Session = Depends(get_db)):
    """Listar todas las especialidades"""
    return list(db.scalars(select(Especialidad).order_by(Especialidad.nombre)).all())


@router.post("/especialidades", response_model=EspecialidadRead, status_code=status.HTTP_201_CREATED)
def crear_especialidad(
    nombre: str = Form(...), 
    descripcion: str = Form(""), 
    db: Session = Depends(get_db)
):
    """Crear una nueva especialidad"""
    # Verificar si ya existe
    existing = db.scalar(select(Especialidad).where(Especialidad.nombre == nombre))
    if existing:
        raise HTTPException(status_code=400, detail="La especialidad ya existe")
    
    especialidad = Especialidad(nombre=nombre, descripcion=descripcion if descripcion else None)
    db.add(especialidad)
    db.commit()
    db.refresh(especialidad)
    return especialidad


# Unidades
@router.get("/unidades", response_model=list[UnidadRead])
def listar_unidades(db: Session = Depends(get_db)):
    """Listar todas las unidades"""
    return list(db.scalars(select(Unidad).order_by(Unidad.nombre)).all())


@router.post("/unidades", response_model=UnidadRead, status_code=status.HTTP_201_CREATED)
def crear_unidad(
    nombre: str = Form(...), 
    simbolo: str = Form(""), 
    descripcion: str = Form(""), 
    db: Session = Depends(get_db)
):
    """Crear una nueva unidad"""
    # Verificar si ya existe
    existing = db.scalar(select(Unidad).where(Unidad.nombre == nombre))
    if existing:
        raise HTTPException(status_code=400, detail="La unidad ya existe")
    
    unidad = Unidad(
        nombre=nombre,
        simbolo=simbolo if simbolo else None,
        descripcion=descripcion if descripcion else None
    )
    db.add(unidad)
    db.commit()
    db.refresh(unidad)
    return unidad


