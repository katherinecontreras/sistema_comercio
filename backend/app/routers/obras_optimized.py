from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from typing import List, Optional
import json

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import (
    Obra, Partida, SubPartida, PartidaCosto, SubPartidaCosto, 
    Incremento, TipoTiempo, Recurso, TipoRecurso, Unidad
)
from app.schemas.obras import (
    ObraCreate, ObraRead, ObraUpdate,
    PartidaCreate, PartidaRead, PartidaUpdate,
    SubPartidaCreate, SubPartidaRead, SubPartidaUpdate,
    PartidaCostoCreate, PartidaCostoRead, PartidaCostoUpdate,
    SubPartidaCostoCreate, SubPartidaCostoRead, SubPartidaCostoUpdate,
    IncrementoCreate, IncrementoRead, IncrementoUpdate,
    TipoTiempoCreate, TipoTiempoRead,
    ObraResumenRead
)

router = APIRouter(prefix="/obras", tags=["obras"])


# ============================================================================
# ENDPOINTS DE OBRAS OPTIMIZADOS
# ============================================================================

@router.post("", response_model=ObraRead, status_code=status.HTTP_201_CREATED)
def crear_obra(
    payload: ObraCreate, 
    db: Session = Depends(get_db), 
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Crear una nueva obra con campos de resumen inicializados"""
    obra_data = payload.dict()
    obra_data.update({
        'total_partidas': 0,
        'total_subpartidas': 0,
        'total_costo_obra_sin_incremento': 0,
        'total_costo_obra_con_incrementos': 0,
        'total_duracion_obra': 0,
        'total_incrementos': 0,
        'costos_partidas': {}
    })
    
    obra = Obra(**obra_data)
    db.add(obra)
    db.commit()
    db.refresh(obra)
    return obra


@router.get("/{id}", response_model=ObraRead)
def obtener_obra(
    id: int, 
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Obtener una obra por ID con datos completos"""
    obra = db.scalar(select(Obra).where(Obra.id_obra == id))
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    return obra


@router.put("/{id}", response_model=ObraRead)
def actualizar_obra(
    id: int,
    payload: ObraUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Actualizar una obra"""
    obra = db.scalar(select(Obra).where(Obra.id_obra == id))
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(obra, field, value)
    
    db.commit()
    db.refresh(obra)
    return obra


@router.get("/{id}/resumen", response_model=ObraResumenRead)
def obtener_resumen_obra(
    id: int,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Obtener resumen detallado de una obra"""
    obra = db.scalar(select(Obra).where(Obra.id_obra == id))
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    # Calcular estadísticas adicionales
    partidas = db.scalars(select(Partida).where(Partida.id_obra == id)).all()
    
    # Contar recursos por planilla
    recursos_por_planilla = {}
    for partida in partidas:
        if partida.costos:
            for costo in partida.costos:
                tipo_recurso_id = costo.id_tipo_recurso
                if tipo_recurso_id not in recursos_por_planilla:
                    recursos_por_planilla[tipo_recurso_id] = 0
                recursos_por_planilla[tipo_recurso_id] += 1
    
    return {
        **obra.__dict__,
        'recursos_por_planilla': recursos_por_planilla,
        'estadisticas_detalladas': {
            'partidas_con_subpartidas': len([p for p in partidas if p.tiene_subpartidas]),
            'partidas_sin_subpartidas': len([p for p in partidas if not p.tiene_subpartidas]),
            'total_planillas': len(recursos_por_planilla)
        }
    }


@router.post("/{id}/finalizar", response_model=ObraRead)
def finalizar_obra(
    id: int,
    obra_data: dict,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Finalizar una obra con datos completos del frontend"""
    obra = db.scalar(select(Obra).where(Obra.id_obra == id))
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    # Usar datos del frontend si están disponibles
    if obra_data:
        # Actualizar obra con datos del frontend
        for field, value in obra_data.items():
            if hasattr(obra, field) and field not in ['id_obra', 'id_cliente']:
                setattr(obra, field, value)
        
        # Actualizar campos de resumen si vienen del frontend
        if 'resumen' in obra_data:
            resumen = obra_data['resumen']
            obra.total_partidas = resumen.get('cantidad_partidas', 0)
            obra.total_subpartidas = resumen.get('cantidad_subpartidas', 0)
            obra.total_costo_obra_sin_incremento = resumen.get('costo_total_oferta_sin_incremento', 0)
            obra.total_costo_obra_con_incrementos = resumen.get('costo_total_oferta_con_incremento', 0)
            obra.total_incrementos = resumen.get('costo_total_incrementos', 0)
            obra.costos_partidas = resumen.get('costos_detallados', [])
        
        # Procesar partidas del frontend
        if 'partidas' in obra_data:
            partidas_data = obra_data['partidas']
            for partida_data in partidas_data:
                # Crear o actualizar partida
                partida = db.scalar(select(Partida).where(Partida.id_partida == partida_data.get('id_partida')))
                if not partida:
                    partida = Partida(id_obra=id, **partida_data)
                    db.add(partida)
                else:
                    for field, value in partida_data.items():
                        if hasattr(partida, field):
                            setattr(partida, field, value)
                
                # Procesar subpartidas
                if 'subpartidas' in partida_data:
                    for subpartida_data in partida_data['subpartidas']:
                        subpartida = db.scalar(select(SubPartida).where(SubPartida.id_subpartida == subpartida_data.get('id_subpartida')))
                        if not subpartida:
                            subpartida = SubPartida(id_partida=partida.id_partida, **subpartida_data)
                            db.add(subpartida)
                        else:
                            for field, value in subpartida_data.items():
                                if hasattr(subpartida, field):
                                    setattr(subpartida, field, value)
        
        # Procesar incrementos del frontend
        if 'incrementos' in obra_data:
            incrementos_data = obra_data['incrementos']
            for incremento_data in incrementos_data:
                incremento = db.scalar(select(Incremento).where(Incremento.id_incremento == incremento_data.get('id_incremento')))
                if not incremento:
                    incremento = Incremento(id_obra=id, **incremento_data)
                    db.add(incremento)
                else:
                    for field, value in incremento_data.items():
                        if hasattr(incremento, field):
                            setattr(incremento, field, value)
    
    # Marcar como finalizada
    obra.estado = "finalizada"
    
    db.commit()
    db.refresh(obra)
    return obra


# ============================================================================
# ENDPOINTS DE PARTIDAS OPTIMIZADOS
# ============================================================================

@router.post("/partidas", response_model=PartidaRead, status_code=status.HTTP_201_CREATED)
def crear_partida(
    payload: PartidaCreate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Crear una nueva partida"""
    partida_data = payload.dict()
    
    # Validar que la obra existe
    obra = db.scalar(select(Obra).where(Obra.id_obra == partida_data['id_obra']))
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    # Validar tipo de tiempo si se proporciona
    if partida_data.get('id_tipo_tiempo'):
        tipo_tiempo = db.scalar(select(TipoTiempo).where(TipoTiempo.id_tipo_tiempo == partida_data['id_tipo_tiempo']))
        if not tipo_tiempo:
            raise HTTPException(status_code=404, detail="Tipo de tiempo no encontrado")
    
    partida = Partida(**partida_data)
    db.add(partida)
    db.commit()
    db.refresh(partida)
    
    # Actualizar resumen de obra
    actualizar_resumen_obra(db, partida.id_obra)
    
    return partida


@router.get("/{id_obra}/partidas", response_model=List[PartidaRead])
def listar_partidas(
    id_obra: int,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Listar partidas de una obra con datos completos"""
    partidas = db.scalars(
        select(Partida)
        .where(Partida.id_obra == id_obra)
        .order_by(Partida.id_partida)
    ).all()
    return partidas


@router.put("/partidas/{id}", response_model=PartidaRead)
def actualizar_partida(
    id: int,
    payload: PartidaUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Actualizar una partida"""
    partida = db.scalar(select(Partida).where(Partida.id_partida == id))
    if not partida:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(partida, field, value)
    
    db.commit()
    db.refresh(partida)
    
    # Actualizar resumen de obra
    actualizar_resumen_obra(db, partida.id_obra)
    
    return partida


@router.delete("/partidas/{id}")
def eliminar_partida(
    id: int,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Eliminar una partida"""
    partida = db.scalar(select(Partida).where(Partida.id_partida == id))
    if not partida:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
    
    obra_id = partida.id_obra
    db.delete(partida)
    db.commit()
    
    # Actualizar resumen de obra
    actualizar_resumen_obra(db, obra_id)
    
    return {"message": "Partida eliminada correctamente"}


# ============================================================================
# ENDPOINTS DE SUBPARTIDAS OPTIMIZADOS
# ============================================================================

@router.post("/subpartidas", response_model=SubPartidaRead, status_code=status.HTTP_201_CREATED)
def crear_subpartida(
    payload: SubPartidaCreate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Crear una nueva subpartida"""
    subpartida_data = payload.dict()
    
    # Validar que la partida existe
    partida = db.scalar(select(Partida).where(Partida.id_partida == subpartida_data['id_partida']))
    if not partida:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
    
    # Validar tipo de tiempo si se proporciona
    if subpartida_data.get('id_tipo_tiempo'):
        tipo_tiempo = db.scalar(select(TipoTiempo).where(TipoTiempo.id_tipo_tiempo == subpartida_data['id_tipo_tiempo']))
        if not tipo_tiempo:
            raise HTTPException(status_code=404, detail="Tipo de tiempo no encontrado")
    
    subpartida = SubPartida(**subpartida_data)
    db.add(subpartida)
    
    # Actualizar flag de partida
    partida.tiene_subpartidas = True
    
    db.commit()
    db.refresh(subpartida)
    
    # Actualizar resumen de obra
    actualizar_resumen_obra(db, partida.id_obra)
    
    return subpartida


@router.get("/partidas/{id_partida}/subpartidas", response_model=List[SubPartidaRead])
def listar_subpartidas(
    id_partida: int,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Listar subpartidas de una partida"""
    subpartidas = db.scalars(
        select(SubPartida)
        .where(SubPartida.id_partida == id_partida)
        .order_by(SubPartida.id_subpartida)
    ).all()
    return subpartidas


# ============================================================================
# ENDPOINTS DE RECURSOS OPTIMIZADOS
# ============================================================================

@router.get("/recursos/tipo/{id_tipo_recurso}")
def obtener_recursos_por_tipo(
    id_tipo_recurso: int,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Obtener recursos por tipo con datos completos"""
    recursos = db.scalars(
        select(Recurso)
        .where(Recurso.id_tipo_recurso == id_tipo_recurso)
        .order_by(Recurso.descripcion)
    ).all()
    
    # Incluir datos relacionados
    recursos_con_relaciones = []
    for recurso in recursos:
        recurso_dict = recurso.__dict__.copy()
        if recurso.unidad:
            recurso_dict['unidad'] = {
                'id_unidad': recurso.unidad.id_unidad,
                'nombre': recurso.unidad.nombre,
                'simbolo': recurso.unidad.simbolo
            }
        if recurso.tipo_recurso:
            recurso_dict['tipo_recurso'] = {
                'id_tipo_recurso': recurso.tipo_recurso.id_tipo_recurso,
                'nombre': recurso.tipo_recurso.nombre,
                'icono': recurso.tipo_recurso.icono
            }
        recursos_con_relaciones.append(recurso_dict)
    
    return recursos_con_relaciones


# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def actualizar_resumen_obra(db: Session, obra_id: int):
    """Actualizar resumen de obra después de cambios"""
    obra = db.scalar(select(Obra).where(Obra.id_obra == obra_id))
    if not obra:
        return
    
    # Contar partidas y subpartidas
    total_partidas = db.scalar(
        select(func.count(Partida.id_partida))
        .where(Partida.id_obra == obra_id)
    ) or 0
    
    total_subpartidas = db.scalar(
        select(func.count(SubPartida.id_subpartida))
        .join(Partida)
        .where(Partida.id_obra == obra_id)
    ) or 0
    
    # Calcular costos totales
    total_costo_sin_incremento = db.scalar(
        select(func.coalesce(func.sum(PartidaCosto.costo_total), 0))
        .join(Partida)
        .where(Partida.id_obra == obra_id)
    ) or 0
    
    total_costo_sin_incremento += db.scalar(
        select(func.coalesce(func.sum(SubPartidaCosto.costo_total), 0))
        .join(SubPartida)
        .join(Partida)
        .where(Partida.id_obra == obra_id)
    ) or 0
    
    # Calcular incrementos totales
    total_incrementos = db.scalar(
        select(func.coalesce(func.sum(Incremento.monto_calculado), 0))
        .where(Incremento.id_obra == obra_id)
    ) or 0
    
    # Calcular duración total
    total_duracion = db.scalar(
        select(func.coalesce(func.sum(Partida.duracion), 0))
        .where(Partida.id_obra == obra_id)
    ) or 0
    
    # Actualizar obra
    obra.total_partidas = total_partidas
    obra.total_subpartidas = total_subpartidas
    obra.total_costo_obra_sin_incremento = total_costo_sin_incremento
    obra.total_costo_obra_con_incrementos = total_costo_sin_incremento + total_incrementos
    obra.total_duracion_obra = total_duracion
    obra.total_incrementos = total_incrementos
    
    db.commit()
