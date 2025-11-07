from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.db.models import MesResumen, DiaMes, Cliente
from sqlalchemy import select

# Días de la semana para los 31 días del mes
DIAS_SEMANA = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados', 'Domingos',
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados', 'Domingos',
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados', 'Domingos',
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados', 'Domingos',
    'Lunes', 'Martes', 'Miércoles'
]


def crear_mes_resumen_para_cliente(id_cliente: int, db: Session) -> MesResumen:
    """
    Crea un mesResumen para un cliente y automáticamente crea los 31 días del mes.
    """
    # Verificar que el cliente existe
    cliente = db.get(Cliente, id_cliente)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Verificar que no exista ya un mesResumen para este cliente
    mes_resumen_existente = db.scalar(
        select(MesResumen).where(MesResumen.id_cliente == id_cliente)
    )
    if mes_resumen_existente:
        raise HTTPException(
            status_code=400, 
            detail="Ya existe un mesResumen para este cliente"
        )
    
    # Crear mesResumen
    mes_resumen = MesResumen(
        id_cliente=id_cliente,
        total_horas_normales=0,
        total_horas_50porc=0,
        total_horas_100porc=0,
        total_horas_fisicas=0,
        total_dias_trabajados=0,
        valor_mult_horas_viaje=2.5,
        horas_viaje=0
    )
    db.add(mes_resumen)
    db.flush()  # Para obtener el id_mes
    
    # Crear los 31 días del mes
    dias_mes_list = []
    for i, nombre_dia in enumerate(DIAS_SEMANA, start=1):
        dia_mes = DiaMes(
            id_mes=mes_resumen.id_mes,
            fecha=i,  # Número del día del mes (1-31)
            dia=nombre_dia,
            hs_normales=0,
            hs_50porc=0,
            hs_100porc=0,
            total_horas=0
        )
        dias_mes_list.append(dia_mes)
    
    db.add_all(dias_mes_list)
    db.commit()
    db.refresh(mes_resumen)
    
    return mes_resumen

