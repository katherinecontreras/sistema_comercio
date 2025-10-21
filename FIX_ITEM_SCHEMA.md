# 🔧 FIX: Error de Validación en ItemRead Schema

## ❌ Error Original

```
fastapi.exceptions.ResponseValidationError: 2 validation errors:
  {'type': 'missing', 'loc': ('response', 'especialidad'), 'msg': 'Field required'}
  {'type': 'missing', 'loc': ('response', 'unidad'), 'msg': 'Field required'}
```

## 🔍 Causa del Problema

El schema `ItemRead` estaba esperando campos `especialidad` y `unidad` como strings (nombres), pero el modelo `ItemObra` en la base de datos tiene:
- `id_especialidad` (int | None)
- `id_unidad` (int | None)

Estos son foreign keys a las tablas `especialidades` y `unidades`, no los nombres directamente.

## ✅ Solución Implementada

### 1. **Actualizado `backend/app/schemas/quotes.py`**

**Antes:**
```python
class ItemRead(BaseModel):
    id_item_obra: int
    id_obra: int
    id_item_padre: int | None
    codigo: str | None
    descripcion_tarea: str
    especialidad: str | None  # ❌ Campo que no existe en el modelo
    unidad: str | None        # ❌ Campo que no existe en el modelo
    cantidad: float
```

**Después:**
```python
class ItemRead(BaseModel):
    id_item_obra: int
    id_obra: int
    id_item_padre: int | None
    codigo: str | None
    descripcion_tarea: str
    id_especialidad: int | None  # ✅ Campo correcto del modelo
    id_unidad: int | None        # ✅ Campo correcto del modelo
    cantidad: float
    precio_unitario: float       # ✅ Campo agregado (faltaba)
```

### 2. **Agregadas Relaciones en `backend/app/db/models_quotes.py`**

Para poder acceder a los nombres cuando sea necesario (ej: en exportación PDF):

```python
class ItemObra(Base):
    # ... campos existentes ...
    
    obra = relationship("Obra", back_populates="items")
    padre = relationship("ItemObra", remote_side=[id_item_obra])
    especialidad = relationship("Especialidad")  # ✅ NUEVO
    unidad = relationship("Unidad")              # ✅ NUEVO
    costos = relationship("ItemObraCosto", back_populates="item", cascade="all, delete-orphan")
    incrementos = relationship("Incremento", back_populates="item", cascade="all, delete-orphan")
```

### 3. **Actualizado Exportación PDF en `backend/app/routers/quotes.py`**

**Antes:**
```python
"unidad": db.get(ItemObra, iid).unidad if db.get(ItemObra, iid) else "",
```

**Después:**
```python
"unidad": db.get(ItemObra, iid).unidad.nombre if db.get(ItemObra, iid) and db.get(ItemObra, iid).unidad else "",
```

## 📊 Beneficios

1. ✅ **Schema alineado con el modelo de BD:** Ya no hay campos fantasma
2. ✅ **Mayor flexibilidad:** Ahora el frontend recibe los IDs y puede hacer lookups según necesite
3. ✅ **Consistencia:** Todos los schemas usan el mismo patrón (IDs, no nombres)
4. ✅ **Exportación PDF funcional:** Puede acceder a los nombres a través de las relaciones

## 🧪 Probar el Fix

1. **Reiniciar el backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. **Intentar finalizar una cotización de nuevo:**
   - El error de validación ya no debería aparecer
   - Los items se crearán correctamente
   - Se guardarán en la BD sin problemas

## 📝 Notas

- El frontend ya estaba enviando `id_especialidad` e `id_unidad` correctamente
- El problema era solo en el schema de respuesta del backend
- No se requieren cambios en el frontend para este fix

