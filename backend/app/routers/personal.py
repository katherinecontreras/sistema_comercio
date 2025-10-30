from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from typing import List
from openpyxl import load_workbook
from io import BytesIO

from app.db.session import get_db
from app.db.models import Personal
from app.schemas.personal import PersonalCreate, PersonalUpdate, PersonalRead
try:
    # Algoritmo basado en pandas pedido por el cliente
    from app.services.excel_to_clean_csv_converter import limpiar_y_convertir_datos_personal, COLUMNAS_FINALES  # type: ignore
    _PANDAS_AVAILABLE = True
except Exception:
    _PANDAS_AVAILABLE = False


router = APIRouter(prefix="/personal", tags=["Personal"])


@router.get("/", response_model=List[PersonalRead])
def listar_personal(db: Session = Depends(get_db)):
    return db.scalars(select(Personal)).all()


@router.get("/{id_personal}", response_model=PersonalRead)
def obtener_personal(id_personal: int, db: Session = Depends(get_db)):
    personal = db.get(Personal, id_personal)
    if not personal:
        raise HTTPException(status_code=404, detail="Personal no encontrado")
    return personal


@router.post("/", response_model=PersonalRead, status_code=status.HTTP_201_CREATED)
def crear_personal(payload: PersonalCreate, db: Session = Depends(get_db)):
    # Evitar duplicados por funcion
    existente = db.scalar(select(Personal).where(Personal.funcion == payload.funcion))
    if existente:
        raise HTTPException(status_code=409, detail="Ya existe un registro con esa función")

    nuevo = Personal(**payload.model_dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{id_personal}", response_model=PersonalRead)
def actualizar_personal(id_personal: int, payload: PersonalUpdate, db: Session = Depends(get_db)):
    personal = db.get(Personal, id_personal)
    if not personal:
        raise HTTPException(status_code=404, detail="Personal no encontrado")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(personal, field, value)

    db.commit()
    db.refresh(personal)
    return personal


@router.post("/import-excel-original", summary="Importar Excel original de personal (limpieza + upsert - pandas)")
async def importar_excel_original(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith((".xlsx", ".xlsm", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Archivo inválido. Acepte .xlsx/.xls/.csv")

    if not _PANDAS_AVAILABLE:
        raise HTTPException(status_code=500, detail="Procesamiento con pandas no disponible en el servidor")

    import csv, io

    content = await file.read()

    # Usar el algoritmo pandas para limpiar y convertir a CSV limpio en memoria
    try:
        # Si viene binario (UploadFile), pasamos un BytesIO al limpiador
        stream_or_path = io.BytesIO(content)
        csv_stream = limpiar_y_convertir_datos_personal(stream_or_path, formato_salida='csv')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error transformando Excel con pandas: {str(e)}")

    # Parsear el CSV limpio resultante y upsert por funcion
    csv_stream.seek(0)
    reader = csv.DictReader(csv_stream)

    def to_float(v):
        try:
            return float(v)
        except Exception:
            return 0.0

    insertados = 0
    actualizados = 0
    procesados = 0

    for row in reader:
        # Asegurar sólo las columnas finales esperadas
        data = {k: row.get(k) for k in COLUMNAS_FINALES}
        funcion = (data.get('funcion') or '').strip()
        if not funcion:
            continue

        # Normalizar numéricos
        for k in COLUMNAS_FINALES:
            if k == 'funcion':
                continue
            data[k] = to_float(data.get(k))

        existente = db.scalar(select(Personal).where(Personal.funcion == funcion))
        if existente:
            for field, value in data.items():
                setattr(existente, field, value)
            actualizados += 1
        else:
            nuevo = Personal(**data)  # type: ignore[arg-type]
            db.add(nuevo)
            insertados += 1
        procesados += 1

    db.commit()

    return {
        "success": True,
        "procesados": procesados,
        "insertados": insertados,
        "actualizados": actualizados,
    }


@router.delete("/reset", summary="Borrar todos los registros de personal y reiniciar IDs")
def reset_personal(db: Session = Depends(get_db)):
    try:
        # PostgreSQL: TRUNCATE + RESTART IDENTITY
        db.execute(text("TRUNCATE TABLE personal RESTART IDENTITY CASCADE"))
        db.commit()
        return {"success": True, "message": "Tabla personal vaciada y secuencia reiniciada"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al reiniciar personal: {str(e)}")


