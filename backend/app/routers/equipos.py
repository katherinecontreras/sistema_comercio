from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from typing import List

from app.db.session import get_db
from app.db.models import Equipo
from app.schemas.equipos import EquipoCreate, EquipoUpdate, EquipoRead
try:
    from app.services.limpiar_y_convertir_datos_equipos import (
        limpiar_y_convertir_datos_equipos,
        COLUMNAS_FINALES_EQUIPOS,
    )
    _PANDAS_AVAILABLE = True
except Exception:
    _PANDAS_AVAILABLE = False


router = APIRouter(prefix="/equipos", tags=["Equipo"])


@router.get("/", response_model=List[EquipoRead])
def listar_equipos(db: Session = Depends(get_db)):
    return db.scalars(select(Equipo)).all()


@router.get("/{id_equipos}", response_model=EquipoRead)
def obtener_equipo(id_equipos: int, db: Session = Depends(get_db)):
    equipos = db.get(Equipo, id_equipos)
    if not equipos:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipos


@router.post("/", response_model=EquipoRead, status_code=status.HTTP_201_CREATED)
def crear_equipos(payload: EquipoCreate, db: Session = Depends(get_db)):
    # Evitar duplicados por detalle
    existente = db.scalar(select(Equipo).where(Equipo.detalle == payload.detalle))
    if existente:
        raise HTTPException(status_code=409, detail="Ya existe un registro con ese detalle")

    nuevo = Equipo(**payload.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{id_equipos}", response_model=EquipoRead)
def actualizar_equipos(id_equipos: int, payload: EquipoUpdate, db: Session = Depends(get_db)):
    equipos = db.get(Equipo, id_equipos)
    if not equipos:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(equipos, field, value)

    db.commit()
    db.refresh(equipos)
    return equipos


@router.post("/import-excel-original", summary="Importar Excel original de equipos (limpieza + upsert - pandas)")
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
        csv_stream = limpiar_y_convertir_datos_equipos(stream_or_path, formato_salida='csv')
    except Exception as e:
        import traceback
        error_detail = f"Error transformando Excel con pandas: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR EN LIMPIEZA: {error_detail}")  # Log para debugging
        raise HTTPException(status_code=400, detail=error_detail)

    # Parsear el CSV limpio resultante y upsert por 'detalle'
    csv_stream.seek(0)
    # El csv_stream es un StringIO, necesitamos leerlo como texto
    csv_text = csv_stream.read()
    csv_stream.seek(0)
    reader = csv.DictReader(io.StringIO(csv_text))

    def to_float(v):
        try:
            return float(v)
        except Exception:
            return 0.0

    insertados = 0
    actualizados = 0
    procesados = 0

    try:
        for row in reader:
            # Asegurar sólo las columnas finales esperadas
            data = {k: row.get(k) for k in COLUMNAS_FINALES_EQUIPOS}
            detalle = (data.get('detalle') or '').strip()
            if not detalle or detalle.lower() in ['nan', 'none', '']:
                continue

            # Normalizar numéricos
            for k in COLUMNAS_FINALES_EQUIPOS:
                if k == 'detalle':
                    continue
                data[k] = to_float(data.get(k))

            existente = db.scalar(select(Equipo).where(Equipo.detalle == detalle))
            if existente:
                for field, value in data.items():
                    setattr(existente, field, value)
                actualizados += 1
            else:
                nuevo = Equipo(**data)  # type: ignore[arg-type]
                db.add(nuevo)
                insertados += 1
            procesados += 1

        db.commit()
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = f"Error procesando datos: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR EN PROCESAMIENTO: {error_detail}")  # Log para debugging
        raise HTTPException(status_code=400, detail=error_detail)

    return {
        "success": True,
        "procesados": procesados,
        "insertados": insertados,
        "actualizados": actualizados,
    }


@router.delete("/reset", summary="Borrar todos los registros de equipos y reiniciar IDs")
def reset_equipos(db: Session = Depends(get_db)):
    try:
        # PostgreSQL: TRUNCATE + RESTART IDENTITY
        db.execute(text("TRUNCATE TABLE equipos RESTART IDENTITY CASCADE"))
        db.commit()
        return {"success": True, "message": "Tabla equipos vaciada y secuencia reiniciada"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al reiniciar equipos: {str(e)}")


