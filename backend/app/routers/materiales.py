from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Material, TipoMaterial
from app.db.session import get_db
from app.schemas.materiales import Calculo, HeaderAtributoCreate, MaterialCreate, MaterialRead, MaterialUpdate, TipoMaterialCreate, TipoMaterialRead


router = APIRouter(prefix="/materiales", tags=["Materiales"])


BASE_TITLE_FIELD_MAP = {
    "detalle": "detalle",
    "cantidad": "cantidad",
    "unidad": "unidad",
    "$unitario": "costo_unitario",
    "$total": "costo_total",
}

NUMERIC_BASE_TITLES = {"cantidad", "$unitario", "$total"}
BASE_HEADERS_DEFINITION = [
    (1, "Detalle"),
    (2, "Cantidad"),
    (3, "Unidad"),
    (4, "$Unitario"),
    (5, "$Total"),
]
REQUIRED_BASE_HEADERS = {1, 4, 5}


def _to_float(value: Any, field: str, allow_blank: bool = False) -> float:
    if value is None:
        if allow_blank:
            return 0.0
        raise HTTPException(status_code=400, detail=f"El campo {field} requiere un valor numérico")
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        stripped = value.strip()
        if stripped == "":
            if allow_blank:
                return 0.0
            raise HTTPException(status_code=400, detail=f"El campo {field} no puede estar vacío")
        normalized = stripped.replace(",", ".")
        try:
            return float(normalized)
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=f"El campo {field} debe ser numérico (valor recibido: '{value}')",
            ) from exc
    raise HTTPException(
        status_code=400,
        detail=f"El campo {field} debe ser numérico",
    )


def _normalize_headers_atributes(headers: Optional[List[HeaderAtributoCreate]]) -> Optional[List[Dict[str, Any]]]:
    if headers is None:
        return None
    normalized: List[Dict[str, Any]] = []
    for idx, header in enumerate(headers, start=1):
        calculo = header.calculo.dict() if header.calculo else Calculo().dict()
        normalized.append(
            {
                "id_header_atribute": idx,
                "titulo": header.titulo,
                "isCantidad": header.isCantidad,
                "calculo": calculo,
                "total_costo_header": 0.0,
            }
        )
    return normalized


def _build_headers_base(active_ids: Optional[List[int]] = None) -> List[Dict[str, Any]]:
    active_set = REQUIRED_BASE_HEADERS.union(active_ids or [])
    headers: List[Dict[str, Any]] = []
    for header_id, titulo in BASE_HEADERS_DEFINITION:
        is_active = header_id in active_set
        calculo = Calculo().dict()
        if titulo == "$Total":
            calculo = {
                "activo": True,
                "isMultiple": False,
                "operaciones": [
                    {
                        "tipo": "multiplicacion",
                        "headers_base": [base_id for base_id in (2, 4) if base_id in active_set],
                        "headers_atributes": [],
                    }
                ],
            }
        headers.append(
            {
                "id_header_base": header_id,
                "titulo": titulo,
                "active": is_active,
                "calculo": calculo,
            }
        )
    return headers


def _apply_base_calculations(
    headers_base: List[Dict[str, Any]],
    overrides: Optional[List[Dict[str, Any] | Any]],
) -> List[Dict[str, Any]]:
    if not overrides:
        return headers_base

    override_map: Dict[int, Dict[str, Any] | Any] = {}
    for entry in overrides:
        if isinstance(entry, dict):
            header_id = entry.get("id_header_base")
            calculo = entry.get("calculo")
        else:
            header_id = getattr(entry, "id_header_base", None)
            calculo = getattr(entry, "calculo", None)
        if header_id is None:
            continue
        override_map[header_id] = calculo

    for header in headers_base:
        header_id = header["id_header_base"]
        if header_id not in override_map:
            continue
        override = override_map[header_id]
        if override is None:
            header["calculo"] = Calculo().dict()
            continue
        if hasattr(override, "dict"):
            override = override.dict()
        header["calculo"] = override or Calculo().dict()
    return headers_base


def _initialize_total_cantidad(
    headers_base: List[Dict[str, Any]],
    headers_atributes: Optional[List[Dict[str, Any]]],
) -> List[Dict[str, Any]]:
    total_cantidad: List[Dict[str, Any]] = []

    for header in headers_base:
        if not header.get("active", True):
            continue
        titulo = header["titulo"].strip().lower()
        if titulo in NUMERIC_BASE_TITLES:
            total_cantidad.append(
                {"typeOfHeader": "base", "idHeader": header["id_header_base"], "total": 0.0}
            )

    for header in headers_atributes or []:
        calculo = header.get("calculo") or {}
        if header.get("isCantidad") or calculo.get("activo"):
            total_cantidad.append(
                {"typeOfHeader": "atribute", "idHeader": header["id_header_atribute"], "total": 0.0}
            )

    return total_cantidad


def _ensure_total_cantidad_entry(
    total_cantidad: List[Dict[str, Any]],
    tipo_header: str,
    header_id: int,
) -> Dict[str, Any]:
    for entry in total_cantidad:
        if entry["typeOfHeader"] == tipo_header and entry["idHeader"] == header_id:
            return entry
    entry = {"typeOfHeader": tipo_header, "idHeader": header_id, "total": 0.0}
    total_cantidad.append(entry)
    return entry


def _get_base_header_map(tipo: TipoMaterial) -> Dict[int, Dict[str, Any]]:
    return {hb["id_header_base"]: hb for hb in tipo.headers_base or []}


def _get_attribute_header_map(tipo: TipoMaterial) -> Dict[int, Dict[str, Any]]:
    headers = tipo.headers_atributes or []
    return {ha["id_header_atribute"]: ha for ha in headers}


def _get_material_attribute_map(material: Material) -> Dict[int, Dict[str, Any]]:
    atributos = material.atributos or []
    return {attr["id_header_atribute"]: attr for attr in atributos}


def _extract_base_value(material: Material, header: Dict[str, Any]) -> Optional[Any]:
    titulo = header["titulo"].strip().lower()
    field = BASE_TITLE_FIELD_MAP.get(titulo)
    if not field:
        return None
    return getattr(material, field)


def _compute_operacion(
    tipo: TipoMaterial,
    material: Material,
    attr_map: Dict[int, Dict[str, Any]],
    operacion: Dict[str, Any],
) -> Optional[float]:
    base_ids = operacion.get("headers_base") or []
    attr_ids = operacion.get("headers_atributes") or []
    valores: List[float] = []

    base_map = _get_base_header_map(tipo)
    for base_id in base_ids:
        base_header = base_map.get(base_id)
        if not base_header:
            raise HTTPException(status_code=400, detail=f"No existe el header base con id {base_id}")
        valor = _extract_base_value(material, base_header)
        field = base_header["titulo"]
        valor_float = _to_float(valor, field)
        valores.append(valor_float)

    for attr_id in attr_ids:
        attr = attr_map.get(attr_id)
        if not attr:
            raise HTTPException(status_code=400, detail=f"No existe el header atributo con id {attr_id}")
        valor_float = _to_float(attr.get("value"), f"atributo {attr_id}")
        valores.append(valor_float)

    if not valores:
        return None

    producto = 1.0
    for val in valores:
        producto *= val
    return producto


def _calculate_calculo(
    tipo: TipoMaterial,
    material: Material,
    header: Dict[str, Any],
    attr_map: Dict[int, Dict[str, Any]],
) -> Optional[float]:
    calculo: Dict[str, Any] = header.get("calculo") or {}
    if not calculo.get("activo"):
        return None

    operaciones = calculo.get("operaciones") or []
    if not operaciones:
        return None

    is_multiple = bool(calculo.get("isMultiple"))
    ops_iterable = operaciones if is_multiple else operaciones[:1]

    resultado: Optional[float] = None

    for operacion in ops_iterable:
        tipo_op = (operacion.get("tipo") or "multiplicacion").lower()
        valor_operacion = _compute_operacion(tipo, material, attr_map, operacion)
        if valor_operacion is None:
            continue

        if resultado is None:
            if tipo_op == "division":
                if valor_operacion == 0:
                    raise HTTPException(status_code=400, detail="División por cero en cálculo de header base/atributo.")
                resultado = 1.0 / valor_operacion
            else:
                resultado = valor_operacion
            continue

        if tipo_op == "division":
            if valor_operacion == 0:
                raise HTTPException(status_code=400, detail="División por cero en cálculo de header base/atributo.")
            resultado /= valor_operacion
        else:
            resultado *= valor_operacion

    return resultado


def _apply_calculo(tipo: TipoMaterial, material: Material) -> None:
    attr_map = _get_material_attribute_map(material)

    # Primero atributos para que las bases puedan tomar sus valores si dependen de ellos
    for attr_id, header in _get_attribute_header_map(tipo).items():
        if attr_id not in attr_map:
            continue
        resultado = _calculate_calculo(tipo, material, header, attr_map)
        if resultado is not None:
            attr_map[attr_id]["value"] = f"{resultado}"

    # Ahora headers base (por ejemplo $Total)
    base_map = _get_base_header_map(tipo)
    for header in base_map.values():
        resultado = _calculate_calculo(tipo, material, header, attr_map)
        if resultado is None:
            continue
        titulo = header["titulo"].strip().lower()
        if titulo in ("$total", "total"):
            material.costo_total = resultado
        elif titulo in ("$unitario",):
            material.costo_unitario = resultado
        elif titulo == "cantidad":
            material.cantidad = f"{resultado}"


def _accumulate_totals(tipo: TipoMaterial, material: Material, factor: float) -> None:
    base_map = _get_base_header_map(tipo)
    total_cantidad = tipo.total_cantidad or []

    for header in base_map.values():
        if not header.get("active", True):
            continue
        titulo = header["titulo"].strip().lower()
        if titulo not in NUMERIC_BASE_TITLES:
            continue
        valor = _extract_base_value(material, header)
        numerical = _to_float(valor, header["titulo"], allow_blank=True)
        entry = _ensure_total_cantidad_entry(total_cantidad, "base", header["id_header_base"])
        entry["total"] = float(entry.get("total", 0.0)) + (numerical * factor)

    attr_map = _get_attribute_header_map(tipo)
    for attr in material.atributos or []:
        header = attr_map.get(attr["id_header_atribute"])
        if not header:
            continue
        calculo = header.get("calculo") or {}
        if not (header.get("isCantidad") or calculo.get("activo")):
            continue
        numerical = _to_float(attr.get("value"), f"atributo {header['titulo']}", allow_blank=True)
        header["total_costo_header"] = float(header.get("total_costo_header", 0.0)) + (numerical * factor)
        entry = _ensure_total_cantidad_entry(total_cantidad, "atribute", header["id_header_atribute"])
        entry["total"] = float(entry.get("total", 0.0)) + (numerical * factor)

    tipo.total_cantidad = total_cantidad


def _add_material_to_totals(tipo: TipoMaterial, material: Material) -> None:
    tipo.total_costo_unitario += float(material.costo_unitario or 0.0)
    tipo.total_costo_total += float(material.costo_total or 0.0)
    _accumulate_totals(tipo, material, factor=1.0)


def _remove_material_from_totals(tipo: TipoMaterial, material: Material) -> None:
    tipo.total_costo_unitario -= float(material.costo_unitario or 0.0)
    tipo.total_costo_total -= float(material.costo_total or 0.0)
    _accumulate_totals(tipo, material, factor=-1.0)
    tipo.total_costo_unitario = max(tipo.total_costo_unitario, 0.0)
    tipo.total_costo_total = max(tipo.total_costo_total, 0.0)


def _normalize_material(
    tipo: TipoMaterial,
    payload: MaterialCreate | MaterialUpdate,
    material: Optional[Material] = None,
) -> Material:
    base_map = _get_base_header_map(tipo)

    detalle_header = next((hb for hb in base_map.values() if hb["titulo"].strip().lower() == "detalle"), None)
    cantidad_header = next((hb for hb in base_map.values() if hb["titulo"].strip().lower() == "cantidad"), None)
    unidad_header = next((hb for hb in base_map.values() if hb["titulo"].strip().lower() == "unidad"), None)

    if material is None:
        if detalle_header and (payload.detalle is None or str(payload.detalle).strip() == ""):
            raise HTTPException(status_code=400, detail="El detalle es obligatorio para el material")
        material = Material(id_tipo_material=tipo.id_tipo_material, detalle=payload.detalle)
    else:
        if payload.detalle is not None:
            material.detalle = payload.detalle

    if cantidad_header:
        if cantidad_header.get("active", True):
            if isinstance(payload, MaterialCreate):
                if payload.cantidad is None or str(payload.cantidad).strip() == "":
                    raise HTTPException(status_code=400, detail="La cantidad es obligatoria para este tipo de material")
            if payload.cantidad is not None:
                material.cantidad = str(payload.cantidad)
        else:
            material.cantidad = None
    elif payload.cantidad is not None:
        material.cantidad = str(payload.cantidad)

    if unidad_header:
        if unidad_header.get("active", True):
            if isinstance(payload, MaterialCreate):
                if payload.unidad is None or str(payload.unidad).strip() == "":
                    raise HTTPException(status_code=400, detail="La unidad es obligatoria para este tipo de material")
            if payload.unidad is not None:
                material.unidad = str(payload.unidad)
        else:
            material.unidad = None
    elif payload.unidad is not None:
        material.unidad = str(payload.unidad)

    if hasattr(payload, "costo_unitario") and payload.costo_unitario is not None:
        material.costo_unitario = float(payload.costo_unitario)

    atributo_headers = _get_attribute_header_map(tipo)

    if atributo_headers:
        if payload.atributos is None:
            if isinstance(payload, MaterialCreate):
                raise HTTPException(status_code=400, detail="Se requieren atributos para este tipo de material")
        else:
            attr_map = {a.id_header_atribute: a.value for a in payload.atributos}
            atributos: List[Dict[str, Any]] = []
            for attr_id, header in atributo_headers.items():
                if attr_id not in attr_map:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Falta el atributo '{header['titulo']}' en la carga del material",
                    )
                atributos.append({"id_header_atribute": attr_id, "value": str(attr_map[attr_id])})
            material.atributos = atributos
    else:
        material.atributos = []

    return material


@router.get("/tipos", response_model=List[TipoMaterialRead])
def listar_tipos_material(db: Session = Depends(get_db)):
    return db.scalars(select(TipoMaterial)).all()


@router.post("/tipos", response_model=TipoMaterialRead, status_code=status.HTTP_201_CREATED)
def crear_tipo_material(payload: TipoMaterialCreate, db: Session = Depends(get_db)):
    existente = db.scalar(select(TipoMaterial).where(TipoMaterial.titulo == payload.titulo))
    if existente:
        raise HTTPException(status_code=409, detail="Ya existe un tipo de material con ese título")

    headers_base = _build_headers_base(payload.headers_base_active)
    headers_base = _apply_base_calculations(headers_base, getattr(payload, "headers_base_calculations", None))
    headers_atributes = _normalize_headers_atributes(payload.headers_atributes)
    total_cantidad = _initialize_total_cantidad(headers_base, headers_atributes)

    nuevo = TipoMaterial(
        titulo=payload.titulo,
        headers_base=headers_base,
        headers_atributes=headers_atributes,
        total_cantidad=total_cantidad,
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/tipos/{id_tipo_material}", response_model=TipoMaterialRead)
def obtener_tipo_material(id_tipo_material: int, db: Session = Depends(get_db)):
    tipo = db.get(TipoMaterial, id_tipo_material)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de material no encontrado")
    return tipo


@router.post("/", response_model=MaterialRead, status_code=status.HTTP_201_CREATED)
def crear_material(payload: MaterialCreate, db: Session = Depends(get_db)):
    tipo = db.get(TipoMaterial, payload.id_tipo_material)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de material asociado no existe")

    material = _normalize_material(tipo, payload)
    _apply_calculo(tipo, material)
    _add_material_to_totals(tipo, material)

    db.add(material)
    db.add(tipo)
    db.commit()
    db.refresh(material)
    return material


@router.get("/", response_model=List[MaterialRead])
def listar_materiales(db: Session = Depends(get_db)):
    return db.scalars(select(Material)).all()


@router.get("/tipo/{id_tipo_material}", response_model=List[MaterialRead])
def listar_materiales_por_tipo(id_tipo_material: int, db: Session = Depends(get_db)):
    tipo = db.get(TipoMaterial, id_tipo_material)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de material no encontrado")
    stmt = select(Material).where(Material.id_tipo_material == id_tipo_material)
    return db.scalars(stmt).all()


@router.get("/{id_material}", response_model=MaterialRead)
def obtener_material(id_material: int, db: Session = Depends(get_db)):
    material = db.get(Material, id_material)
    if not material:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    return material


@router.put("/{id_material}", response_model=MaterialRead)
def actualizar_material(id_material: int, payload: MaterialUpdate, db: Session = Depends(get_db)):
    material = db.get(Material, id_material)
    if not material:
        raise HTTPException(status_code=404, detail="Material no encontrado")

    tipo = material.tipo_material
    if not tipo:
        raise HTTPException(status_code=400, detail="El material no tiene un tipo asociado")

    db.refresh(tipo)

    _remove_material_from_totals(tipo, material)
    material = _normalize_material(tipo, payload, material)
    _apply_calculo(tipo, material)
    _add_material_to_totals(tipo, material)

    db.add(material)
    db.add(tipo)
    db.commit()
    db.refresh(material)
    return material


@router.delete("/{id_material}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_material(id_material: int, db: Session = Depends(get_db)):
    material = db.get(Material, id_material)
    if not material:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    tipo = material.tipo_material
    if tipo:
        _remove_material_from_totals(tipo, material)
        db.add(tipo)
    db.delete(material)
    db.commit()


