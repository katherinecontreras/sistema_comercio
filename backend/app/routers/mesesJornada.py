from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.db.models import MesResumen, DiaMes, Cliente
from app.schemas.mesesJornada import (
    MesResumenRead,
    MesResumenCreate,
    MesResumenUpdate,
    DiaMesRead,
    DiaMesUpdate,
)
from app.services.meses_jornada import crear_mes_resumen_para_cliente

router = APIRouter(prefix="/meses-jornada", tags=["Meses Jornada"])


def calcular_mes_resumen(id_mes: int, db: Session) -> MesResumen:
    """
    Calcula el mesResumen basado en los datos de todos los diasMes de un mes específico.
    """
    # Obtener el mesResumen
    mes_resumen = db.get(MesResumen, id_mes)
    if not mes_resumen:
        raise HTTPException(status_code=404, detail="MesResumen no encontrado")
    
    # Obtener todos los diasMes de este mes
    dias_mes = db.scalars(
        select(DiaMes).where(DiaMes.id_mes == id_mes)
    ).all()
    
    # Calcular totales
    total_horas_normales = sum(dia.hs_normales for dia in dias_mes)
    total_horas_50porc = sum(dia.hs_50porc for dia in dias_mes)
    total_horas_100porc = sum(dia.hs_100porc for dia in dias_mes)
    total_horas_fisicas = sum(dia.total_horas for dia in dias_mes)
    total_dias_trabajados = sum(1 for dia in dias_mes if dia.total_horas > 0)
    
    # Actualizar mesResumen
    mes_resumen.total_horas_normales = total_horas_normales
    mes_resumen.total_horas_50porc = total_horas_50porc
    mes_resumen.total_horas_100porc = total_horas_100porc
    mes_resumen.total_horas_fisicas = total_horas_fisicas
    mes_resumen.total_dias_trabajados = total_dias_trabajados
    
    # Calcular horas_viaje: total_dias_trabajados * valor_mult_horas_viaje
    mes_resumen.horas_viaje = int(mes_resumen.total_dias_trabajados * mes_resumen.valor_mult_horas_viaje)
    
    db.commit()
    db.refresh(mes_resumen)
    return mes_resumen


# ==================== RUTAS PARA MESRESUMEN ====================

@router.post("/mes-resumen", response_model=MesResumenRead, status_code=status.HTTP_201_CREATED)
def crear_mes_resumen(payload: MesResumenCreate, db: Session = Depends(get_db)):
    """Crear un mesResumen para un cliente con sus 31 días automáticamente"""
    return crear_mes_resumen_para_cliente(payload.id_cliente, db)


@router.get("/mes-resumen/cliente/{id_cliente}", response_model=MesResumenRead)
def obtener_mes_resumen_por_cliente(id_cliente: int, db: Session = Depends(get_db)):
    """Obtener el mesResumen de un cliente específico"""
    mes_resumen = db.scalar(
        select(MesResumen).where(MesResumen.id_cliente == id_cliente)
    )
    if not mes_resumen:
        raise HTTPException(
            status_code=404, 
            detail="No se encontró mesResumen para este cliente"
        )
    return mes_resumen


@router.get("/mes-resumen/{id_mes}", response_model=MesResumenRead)
def obtener_mes_resumen(id_mes: int, db: Session = Depends(get_db)):
    """Obtener un mesResumen por ID"""
    mes_resumen = db.get(MesResumen, id_mes)
    if not mes_resumen:
        raise HTTPException(status_code=404, detail="MesResumen no encontrado")
    return mes_resumen


@router.put("/mes-resumen/{id_mes}", response_model=MesResumenRead)
def actualizar_mes_resumen(
    id_mes: int, 
    payload: MesResumenUpdate, 
    db: Session = Depends(get_db)
):
    """Actualizar MesResumen. Solo se puede editar valor_mult_horas_viaje."""
    mes_resumen = db.get(MesResumen, id_mes)
    if not mes_resumen:
        raise HTTPException(status_code=404, detail="MesResumen no encontrado")
    
    # Solo permitir actualizar valor_mult_horas_viaje
    if payload.valor_mult_horas_viaje is not None:
        mes_resumen.valor_mult_horas_viaje = payload.valor_mult_horas_viaje
        # Recalcular horas_viaje
        mes_resumen.horas_viaje = int(mes_resumen.total_dias_trabajados * mes_resumen.valor_mult_horas_viaje)
    
    db.commit()
    db.refresh(mes_resumen)
    return mes_resumen


# ==================== RUTAS PARA DIASMES ====================

@router.get("/dias-mes/mes/{id_mes}", response_model=List[DiaMesRead])
def listar_dias_mes_por_mes(id_mes: int, db: Session = Depends(get_db)):
    """Listar todos los diasMes de un mes específico"""
    # Verificar que el mes existe
    mes_resumen = db.get(MesResumen, id_mes)
    if not mes_resumen:
        raise HTTPException(status_code=404, detail="MesResumen no encontrado")
    
    try:
        dias_mes = db.scalars(
            select(DiaMes)
            .where(DiaMes.id_mes == id_mes)
            .order_by(DiaMes.fecha)
        ).all()
        return list(dias_mes)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener días del mes: {str(e)}"
        )


@router.get("/dias-mes/{id_dia}", response_model=DiaMesRead)
def obtener_dia_mes(id_dia: int, db: Session = Depends(get_db)):
    """Obtener un diaMes específico por id_dia"""
    dia_mes = db.get(DiaMes, id_dia)
    if not dia_mes:
        raise HTTPException(status_code=404, detail="DiaMes no encontrado")
    return dia_mes


@router.put("/dias-mes/{id_dia}", response_model=DiaMesRead)
def actualizar_dia_mes(
    id_dia: int, 
    payload: DiaMesUpdate, 
    db: Session = Depends(get_db)
):
    """Actualizar un diaMes. Esto recalcula automáticamente el mesResumen."""
    dia_mes = db.get(DiaMes, id_dia)
    if not dia_mes:
        raise HTTPException(status_code=404, detail="DiaMes no encontrado")
    
    try:
        # Actualizar campos, convirtiendo valores a int
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            # Convertir valores numéricos a int
            if field in ['hs_normales', 'hs_50porc', 'hs_100porc', 'total_horas']:
                if value is not None:
                    # Asegurar que el valor sea un entero
                    try:
                        int_value = int(float(value))  # Convertir float a int si viene como float
                        setattr(dia_mes, field, int_value)
                    except (ValueError, TypeError):
                        raise HTTPException(
                            status_code=422, 
                            detail=f"El campo {field} debe ser un número entero"
                        )
            else:
                setattr(dia_mes, field, value)
        
        db.commit()
        db.refresh(dia_mes)
        
        # Recalcular mesResumen automáticamente
        calcular_mes_resumen(dia_mes.id_mes, db)
        
        return dia_mes
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar día: {str(e)}"
        )
