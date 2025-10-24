from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import Obra, Partida, SubPartida, PartidaCosto, SubPartidaCosto, Incremento, TipoTiempo
from app.schemas.obras import (
    ObraCreate, ObraRead,
    PartidaCreate, PartidaRead,
    SubPartidaCreate, SubPartidaRead,
    PartidaCostoCreate, PartidaCostoRead,
    SubPartidaCostoCreate, SubPartidaCostoRead,
    IncrementoCreate, IncrementoRead,
    TipoTiempoCreate, TipoTiempoRead
)

router = APIRouter(prefix="/obras", tags=["obras"])


# Obras
@router.post("", response_model=ObraRead, status_code=status.HTTP_201_CREATED)
def crear_obra(payload: ObraCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    obra = Obra(**payload.dict())
    db.add(obra)
    db.commit()
    db.refresh(obra)
    return obra


@router.get("/{id_obra}", response_model=ObraRead)
def obtener_obra(id_obra: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    obra = db.get(Obra, id_obra)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    return obra

@router.put("/{id_obra}", response_model=ObraRead)
def actualizar_obra(id_obra: int, payload: ObraCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    obra = db.get(Obra, id_obra)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(obra, key, value)
    
    db.add(obra)
    db.commit()
    db.refresh(obra)
    return obra


@router.get("", response_model=List[ObraRead])
def listar_obras(db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    obras = db.scalars(select(Obra)).all()
    return list(obras)


# Partidas
@router.post("/{id_obra}/partidas", response_model=PartidaRead, status_code=status.HTTP_201_CREATED)
def crear_partida(id_obra: int, payload: PartidaCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    obra = db.get(Obra, id_obra)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    partida = Partida(**payload.dict(), id_obra=id_obra)
    db.add(partida)
    db.commit()
    db.refresh(partida)
    return partida


@router.get("/{id_obra}/partidas", response_model=List[PartidaRead])
def listar_partidas(id_obra: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    partidas = db.scalars(select(Partida).where(Partida.id_obra == id_obra)).all()
    return list(partidas)


# SubPartidas
@router.post("/partidas/{id_partida}/subpartidas", response_model=SubPartidaRead, status_code=status.HTTP_201_CREATED)
def crear_subpartida(id_partida: int, payload: SubPartidaCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    partida = db.get(Partida, id_partida)
    if not partida:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
    
    # Marcar que la partida tiene subpartidas
    partida.tiene_subpartidas = True
    
    subpartida = SubPartida(**payload.dict(), id_partida=id_partida)
    db.add(subpartida)
    db.commit()
    db.refresh(subpartida)
    return subpartida


@router.get("/partidas/{id_partida}/subpartidas", response_model=List[SubPartidaRead])
def listar_subpartidas(id_partida: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    subpartidas = db.scalars(select(SubPartida).where(SubPartida.id_partida == id_partida)).all()
    return list(subpartidas)


# Costos de Partidas
@router.post("/partidas/{id_partida}/costos", response_model=PartidaCostoRead, status_code=status.HTTP_201_CREATED)
def agregar_costo_partida(id_partida: int, payload: PartidaCostoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    partida = db.get(Partida, id_partida)
    if not partida:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
    
    if partida.tiene_subpartidas:
        raise HTTPException(status_code=400, detail="Esta partida tiene subpartidas, agregue costos a las subpartidas")
    
    costo = PartidaCosto(**payload.dict(), id_partida=id_partida)
    db.add(costo)
    db.commit()
    db.refresh(costo)
    return costo


@router.get("/partidas/{id_partida}/costos", response_model=List[PartidaCostoRead])
def listar_costos_partida(id_partida: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    return list(db.scalars(select(PartidaCosto).where(PartidaCosto.id_partida == id_partida)).all())


# Costos de SubPartidas
@router.post("/subpartidas/{id_subpartida}/costos", response_model=SubPartidaCostoRead, status_code=status.HTTP_201_CREATED)
def agregar_costo_subpartida(id_subpartida: int, payload: SubPartidaCostoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    subpartida = db.get(SubPartida, id_subpartida)
    if not subpartida:
        raise HTTPException(status_code=404, detail="SubPartida no encontrada")
    
    costo = SubPartidaCosto(**payload.dict(), id_subpartida=id_subpartida)
    db.add(costo)
    db.commit()
    db.refresh(costo)
    return costo


@router.get("/subpartidas/{id_subpartida}/costos", response_model=List[SubPartidaCostoRead])
def listar_costos_subpartida(id_subpartida: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    return list(db.scalars(select(SubPartidaCosto).where(SubPartidaCosto.id_subpartida == id_subpartida)).all())


# Incrementos
@router.post("/incrementos", response_model=IncrementoRead, status_code=status.HTTP_201_CREATED)
def crear_incremento(payload: IncrementoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    if payload.id_subpartida and payload.id_partida:
        raise HTTPException(status_code=400, detail="Un incremento no puede estar asociado a una Partida y SubPartida al mismo tiempo.")
    if not payload.id_subpartida and not payload.id_partida:
        raise HTTPException(status_code=400, detail="Un incremento debe estar asociado a una Partida o SubPartida.")

    if payload.id_subpartida:
        target = db.get(SubPartida, payload.id_subpartida)
        if not target:
            raise HTTPException(status_code=404, detail="SubPartida no encontrada")
    elif payload.id_partida:
        target = db.get(Partida, payload.id_partida)
        if not target:
            raise HTTPException(status_code=404, detail="Partida no encontrada")
    
    incremento = Incremento(**payload.dict())
    db.add(incremento)
    db.commit()
    db.refresh(incremento)
    return incremento


@router.get("/{id_obra}/incrementos", response_model=List[IncrementoRead])
def listar_incrementos(id_obra: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    # Obtener incrementos de partidas de esta obra
    partidas = db.scalars(select(Partida).where(Partida.id_obra == id_obra)).all()
    partida_ids = [p.id_partida for p in partidas]
    
    incrementos = db.scalars(
        select(Incremento).where(
            (Incremento.id_partida.in_(partida_ids)) |
            (Incremento.id_subpartida.in_(
                select(SubPartida.id_subpartida).where(SubPartida.id_partida.in_(partida_ids))
            ))
        )
    ).all()
    
    return list(incrementos)


# Tipos de Tiempo
@router.get("/tipos-tiempo", response_model=List[TipoTiempoRead])
def listar_tipos_tiempo(db: Session = Depends(get_db)):
    tipos = db.scalars(select(TipoTiempo)).all()
    return list(tipos)


@router.post("/tipos-tiempo", response_model=TipoTiempoRead, status_code=status.HTTP_201_CREATED)
def crear_tipo_tiempo(payload: TipoTiempoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    tipo = TipoTiempo(**payload.dict())
    db.add(tipo)
    db.commit()
    db.refresh(tipo)
    return tipo


# Incrementos
@router.get("/incrementos", response_model=List[IncrementoRead])
def obtener_incrementos(db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    incrementos = db.execute(select(Incremento)).scalars().all()
    return list(incrementos)


@router.get("/incrementos/{id_incremento}", response_model=IncrementoRead)
def obtener_incremento(id_incremento: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    incremento = db.get(Incremento, id_incremento)
    if not incremento:
        raise HTTPException(status_code=404, detail="Incremento no encontrado")
    return incremento


@router.post("/incrementos", response_model=IncrementoRead, status_code=status.HTTP_201_CREATED)
def crear_incremento(payload: IncrementoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    incremento = Incremento(**payload.dict())
    db.add(incremento)
    db.commit()
    db.refresh(incremento)
    return incremento


@router.put("/incrementos/{id_incremento}", response_model=IncrementoRead)
def actualizar_incremento(id_incremento: int, payload: IncrementoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    incremento = db.get(Incremento, id_incremento)
    if not incremento:
        raise HTTPException(status_code=404, detail="Incremento no encontrado")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(incremento, key, value)
    
    db.add(incremento)
    db.commit()
    db.refresh(incremento)
    return incremento


@router.delete("/incrementos/{id_incremento}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_incremento(id_incremento: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    incremento = db.get(Incremento, id_incremento)
    if not incremento:
        raise HTTPException(status_code=404, detail="Incremento no encontrado")
    
    db.delete(incremento)
    db.commit()
    return None


# Finalizar obra con cálculos
@router.post("/{id_obra}/finalizar", response_model=ObraRead)
def finalizar_obra(id_obra: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    obra = db.get(Obra, id_obra)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    # Calcular totales
    partidas = db.execute(select(Partida).where(Partida.id_obra == id_obra)).scalars().all()
    
    total_partidas = len(partidas)
    total_subpartidas = 0
    total_costo_sin_incremento = 0
    total_incrementos = 0
    total_duracion = 0
    costos_partidas = []
    
    for partida in partidas:
        # Contar subpartidas
        if partida.subpartidas:
            total_subpartidas += len(partida.subpartidas)
        
        # Calcular costos de partida
        costo_partida = 0
        subpartidas_data = []
        
        if partida.subpartidas:
            # Calcular costos de subpartidas
            for subpartida in partida.subpartidas:
                costo_subpartida = 0
                for costo in subpartida.costos:
                    costo_subpartida += float(costo.total_linea or 0)
                
                # Calcular incrementos de subpartida
                incrementos_subpartida = db.execute(
                    select(Incremento).where(Incremento.id_subpartida == subpartida.id_subpartida)
                ).scalars().all()
                
                total_incrementos_subpartida = sum(float(inc.monto_calculado or 0) for inc in incrementos_subpartida)
                total_incrementos += total_incrementos_subpartida
                
                subpartidas_data.append({
                    "idSubpartida": subpartida.id_subpartida,
                    "total_costo_subpartida": costo_subpartida,
                    "total_costo_incremento_subpartida": total_incrementos_subpartida,
                    "total_costo_subpartida_sin_incremento": costo_subpartida
                })
                
                costo_partida += costo_subpartida
        else:
            # Calcular costos de partida directa
            for costo in partida.costos:
                costo_partida += float(costo.total_linea or 0)
        
        # Calcular incrementos de partida
        incrementos_partida = db.execute(
            select(Incremento).where(Incremento.id_partida == partida.id_partida)
        ).scalars().all()
        
        total_incrementos_partida = sum(float(inc.monto_calculado or 0) for inc in incrementos_partida)
        total_incrementos += total_incrementos_partida
        
        costos_partidas.append({
            "idPartida": partida.id_partida,
            "total_costo_partida": costo_partida,
            "total_costo_incremento_partida": total_incrementos_partida,
            "total_costo_partida_sin_incremento": costo_partida,
            "subpartidas": subpartidas_data
        })
        
        total_costo_sin_incremento += costo_partida
        
        # Calcular duración
        if partida.duracion and partida.tipo_tiempo:
            duracion = float(partida.duracion)
            medida = partida.tipo_tiempo.medida
            
            # Convertir a horas para sumar
            if medida == "hrs":
                total_duracion += duracion
            elif medida == "ds":
                total_duracion += duracion * 8  # 8 horas por día
            elif medida == "ms":
                total_duracion += duracion * 160  # 160 horas por mes (20 días * 8 horas)
            elif medida == "as":
                total_duracion += duracion * 1920  # 1920 horas por año (12 meses * 160 horas)
    
    # Actualizar obra con los cálculos
    obra.total_partidas = total_partidas
    obra.total_subpartidas = total_subpartidas
    obra.total_costo_obra_sin_incremento = total_costo_sin_incremento
    obra.total_costo_obra_con_incrementos = total_costo_sin_incremento + total_incrementos
    obra.total_duracion_obra = total_duracion
    obra.total_incrementos = total_incrementos
    obra.costos_partidas = costos_partidas
    obra.estado = "nueva oferta"
    
    db.add(obra)
    db.commit()
    db.refresh(obra)
    
    return obra
