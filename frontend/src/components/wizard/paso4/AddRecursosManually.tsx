import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, AlertTriangle, Package } from 'lucide-react';
import { generateTempId } from '@/utils/idGenerator';
import { useCatalogos } from '@/hooks';
import { AddUnidadModal } from '@/components/modals';
import { ConfirmDialog, Toast } from '@/components/notifications';
import AtributosTable from '@/components/tables/AtributosTable';
import { AgregarAtributoForm } from '@/components/forms/wizard/AgregarAtributoForm';

interface Atributo {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numerico' | 'entero';
  requerido: boolean;
}

interface RecursoLocal {
  id: string;
  datos: Record<string, any>;
}

interface Unidad {
  id_unidad: number;
  nombre: string;
  simbolo?: string;
  descripcion?: string;
}

interface Props {
  planillaNombre: string;
  planillaId: number;
  itemId: string;
  onCancel: () => void;
  onSave: (recursos: any[]) => void;
}

const AddRecursosManually: React.FC<Props> = ({ planillaNombre, planillaId, onCancel, onSave }) => {
  const { loadUnidades, loadRecursosFrom, handleAddUnidad, handleAddRecursos } = useCatalogos();
  
  const [paso, setPaso] = useState<1 | 2>(1);
  const [atributos, setAtributos] = useState<Atributo[]>([
    { id: 'descripcion', nombre: 'Descripción', tipo: 'texto', requerido: true },
    { id: 'unidad', nombre: 'Unidad', tipo: 'texto', requerido: true },
    { id: 'cantidad', nombre: 'Cantidad', tipo: 'entero', requerido: true },
    { id: 'costo_unitario', nombre: 'Costo Unitario', tipo: 'numerico', requerido: true },
  ]);
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<Set<string>>(
    new Set(['descripcion', 'unidad', 'cantidad', 'costo_unitario'])
  );
  const [showAddAtributo, setShowAddAtributo] = useState(false);
  
  // Paso 2
  const [recursosLocales, setRecursosLocales] = useState<RecursoLocal[]>([]);
  const [recursosBD, setRecursosBD] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingRecursoId, setEditingRecursoId] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [showUnidadesSuggestions, setShowUnidadesSuggestions] = useState(false);
  const [selectedUnidadIndex, setSelectedUnidadIndex] = useState(0);
  const [showAddUnidadModal, setShowAddUnidadModal] = useState(false);
  const [unidadInput, setUnidadInput] = useState('');
  const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<Record<string, number>>({});
  
  // Alertas y notificaciones
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [recursoToDelete, setRecursoToDelete] = useState<string | null>(null);
  const [recursoToEdit, setRecursoToEdit] = useState<RecursoLocal | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Cargar unidades y recursos de la BD
  React.useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [unidadesData, recursosData] = await Promise.all([
          loadUnidades(),
          loadRecursosFrom(planillaId)
        ]);
        setUnidades(unidadesData);
        setRecursosBD(recursosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    cargarDatos();
  }, [loadUnidades, loadRecursosFrom, planillaId]);

  const handleAddUnidadLocal = async (data: { nombre: string; simbolo: string; descripcion?: string }) => {
    try {
      const response = await handleAddUnidad(data);
      
      if (response) {
        // Recargar unidades
        const unidadesData = await loadUnidades();
        setUnidades(unidadesData);
        
        setFormData({ ...formData, unidad: response.nombre });
        setUnidadInput(response.nombre);
        
        setToastMessage(`Unidad "${response.nombre}" creada exitosamente`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Error creando unidad:', error);
      setToastMessage('Error al crear unidad');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleContinuarPaso1 = () => {
    // Inicializar formData con los atributos seleccionados
    const initialData: Record<string, any> = {};
    atributos.forEach(attr => {
      if (atributosSeleccionados.has(attr.id)) {
        initialData[attr.id] = attr.tipo === 'numerico' ? 0 : '';
      }
    });
    setFormData(initialData);
    setPaso(2);
  };

  // Calcular costo total automáticamente
  const calcularCostoTotal = () => {
    const cantidad = parseFloat(formData.cantidad) || 0;
    const costoUnitario = parseFloat(formData.costo_unitario) || 0;
    return cantidad * costoUnitario;
  };

  // Paso 2: Manejo de recursos
  const handleAgregarRecurso = () => {
    // Validar campos requeridos
    const atributosRequeridos = atributos.filter(a => atributosSeleccionados.has(a.id) && a.requerido);
    const faltantes = atributosRequeridos.filter(a => !formData[a.id] || formData[a.id] === '');
    
    if (faltantes.length > 0) {
      setToastMessage(`Faltan campos requeridos: ${faltantes.map(a => a.nombre).join(', ')}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // Calcular costo total automáticamente
    const costoTotal = calcularCostoTotal();

    const nuevoRecurso: RecursoLocal = {
      id: editingRecursoId || generateTempId(),
      datos: { 
        ...formData,
        costo_total: costoTotal // Siempre calculado
      }
    };

    if (editingRecursoId) {
      // Actualizar recurso existente
      setRecursosLocales(recursosLocales.map(r => r.id === editingRecursoId ? nuevoRecurso : r));
      setToastMessage('Recurso actualizado');
      setEditingRecursoId(null);
    } else {
      // Agregar nuevo recurso
      setRecursosLocales([...recursosLocales, nuevoRecurso]);
      setToastMessage('Recurso agregado a la tabla');
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Limpiar form
    const clearedData: Record<string, any> = {};
    atributos.forEach(attr => {
      if (atributosSeleccionados.has(attr.id)) {
        clearedData[attr.id] = attr.tipo === 'numerico' ? 0 : '';
      }
    });
    setFormData(clearedData);
    setUnidadInput('');
  };

  const handleEditRecurso = (recurso: RecursoLocal) => {
    // Si hay datos en el form, preguntar
    const hasData = Object.values(formData).some(v => v !== '' && v !== 0);
    
    if (hasData && !editingRecursoId) {
      setRecursoToEdit(recurso);
      setShowEditAlert(true);
    } else {
      confirmEditRecurso(recurso);
    }
  };

  const confirmEditRecurso = (recurso: RecursoLocal) => {
    setFormData(recurso.datos);
    setUnidadInput(recurso.datos.unidad || '');
    setEditingRecursoId(recurso.id);
    setShowEditAlert(false);
  };

  const handleDeleteRecurso = (id: string) => {
    setRecursoToDelete(id);
    setShowDeleteAlert(true);
  };

  const confirmDeleteRecurso = () => {
    if (recursoToDelete) {
      setRecursosLocales(recursosLocales.filter(r => r.id !== recursoToDelete));
      setRecursoToDelete(null);
      setShowDeleteAlert(false);
    }
  };

  // Función para guardar recursos y volver
  const handleGuardarYVolver = async () => {
    if (recursosLocales.length === 0) {
      setToastMessage('Debes agregar al menos un recurso antes de guardar');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      // Guardar cada recurso en la BD
      const recursosGuardados = [];
      
      for (const recursoLocal of recursosLocales) {
        // Buscar id_unidad por nombre
        const unidadEncontrada = unidades.find((u: any) => u.nombre === recursoLocal.datos.unidad);
        
        if (!unidadEncontrada) {
          console.error('Unidad no encontrada:', recursoLocal.datos.unidad);
          continue;
        }

        // Preparar datos del recurso para la BD
        const recursoData = {
          id_tipo_recurso: planillaId,
          descripcion: recursoLocal.datos.descripcion,
          id_unidad: unidadEncontrada.id_unidad,
          cantidad: parseFloat(recursoLocal.datos.cantidad) || 0,
          costo_unitario_predeterminado: parseFloat(recursoLocal.datos.costo_unitario) || 0,
          costo_total: parseFloat(recursoLocal.datos.costo_total) || 0,
          atributos: {} as Record<string, any>
        };

        // Agregar atributos personalizados
        Object.keys(recursoLocal.datos).forEach(key => {
          if (!['descripcion', 'unidad', 'cantidad', 'costo_unitario', 'costo_total'].includes(key)) {
            recursoData.atributos[key] = recursoLocal.datos[key];
          }
        });

        // Guardar en BD usando handleAddRecursos del hook
        const recursoGuardado = await handleAddRecursos(recursoData);
        recursosGuardados.push({
          ...recursoGuardado,
          cantidad: recursoLocal.datos.cantidad,
          costo_unitario: recursoLocal.datos.costo_unitario,
          unidad: recursoLocal.datos.unidad
        });
      }

      // Llamar al callback onSave con los recursos guardados
      onSave(recursosGuardados);
    } catch (error) {
      console.error('Error guardando recursos:', error);
      setToastMessage('Error al guardar los recursos en la base de datos');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };
  // Autocompletado - busca en recursos locales Y en la BD
  const getSuggestions = (atributoId: string, value: string) => {
    if (!value || value.length < 2) return [];
    
    // Obtener valores de recursos locales
    const valoresLocales = recursosLocales
      .map(r => r.datos[atributoId])
      .filter(v => v && typeof v === 'string' && v.toLowerCase().includes(value.toLowerCase()));
    
    // Obtener valores de recursos de la BD
    let valoresBD: string[] = [];
    if (atributoId === 'descripcion') {
      // Para descripción, buscar en el campo descripcion de los recursos de BD
      valoresBD = recursosBD
        .map(r => r.descripcion)
        .filter(v => v && v.toLowerCase().includes(value.toLowerCase()));
    } else if (recursosBD.length > 0 && recursosBD[0].atributos) {
      // Para atributos personalizados, buscar en el campo atributos (JSONB)
      valoresBD = recursosBD
        .map(r => r.atributos?.[atributoId])
        .filter(v => v && typeof v === 'string' && v.toLowerCase().includes(value.toLowerCase()));
    }
    
    // Combinar y eliminar duplicados
    const todosCombinados = [...valoresLocales, ...valoresBD];
    const unicos = todosCombinados.filter((v, i, arr) => arr.indexOf(v) === i);
    
    return unicos.slice(0, 8); // Mostrar hasta 8 sugerencias
  };

  const handleSelectSuggestion = (atributoId: string, value: string) => {
    // Si es descripción y viene de la BD, autocompletar todos los datos
    if (atributoId === 'descripcion') {
      const recursoBD = recursosBD.find((r: any) => r.descripcion === value);
      if (recursoBD) {
        // Autocompletar datos del recurso de la BD
        const newFormData: Record<string, any> = { ...formData };
        
        newFormData.descripcion = value;
        
        // Autocompletar unidad
        if (recursoBD.unidad) {
          newFormData.unidad = recursoBD.unidad;
          setUnidadInput(recursoBD.unidad);
        }
        
        // Autocompletar cantidad
        if (recursoBD.cantidad) {
          newFormData.cantidad = recursoBD.cantidad;
        }
        
        // Autocompletar costo unitario
        if (recursoBD.costo_unitario_predeterminado) {
          newFormData.costo_unitario = recursoBD.costo_unitario_predeterminado;
        }
        
        // Autocompletar atributos personalizados si existen
        if (recursoBD.atributos && typeof recursoBD.atributos === 'object') {
          Object.keys(recursoBD.atributos).forEach(key => {
            if (atributosSeleccionados.has(key)) {
              newFormData[key] = recursoBD.atributos[key];
            }
          });
        }
        
        setFormData(newFormData);
        setActiveSuggestionField(null);
        return;
      }
      
      // Si viene de recursos locales, también autocompletar
      const recursoLocal = recursosLocales.find(r => r.datos.descripcion === value);
      if (recursoLocal) {
        const newFormData = { ...formData, ...recursoLocal.datos };
        setFormData(newFormData);
        if (recursoLocal.datos.unidad) {
          setUnidadInput(recursoLocal.datos.unidad);
        }
        setActiveSuggestionField(null);
        return;
      }
    }
    
    // Para otros atributos, solo actualizar el campo
    setFormData({ ...formData, [atributoId]: value });
    setActiveSuggestionField(null);
  };

  const handleSuggestionKeyDown = (e: React.KeyboardEvent, atributoId: string, suggestions: string[]) => {
    if (!activeSuggestionField || activeSuggestionField !== atributoId || suggestions.length === 0) return;

    const currentIndex = selectedSuggestionIndex[atributoId] || 0;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : currentIndex;
      setSelectedSuggestionIndex({ ...selectedSuggestionIndex, [atributoId]: newIndex });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      setSelectedSuggestionIndex({ ...selectedSuggestionIndex, [atributoId]: newIndex });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectSuggestion(atributoId, suggestions[currentIndex]);
    } else if (e.key === 'Escape') {
      setActiveSuggestionField(null);
    }
  };

  const calcularTotales = () => {
    const totalCosto = recursosLocales.reduce((sum, r) => {
      return sum + (parseFloat(r.datos.costo_total) || 0);
    }, 0);
    
    const sumaCantidades = recursosLocales.reduce((sum, r) => {
      return sum + (parseFloat(r.datos.cantidad) || 0);
    }, 0);
    
    return {
      cantidadRecursos: recursosLocales.length,
      sumaCantidades: sumaCantidades,
      totalCosto
    };
  };

  const totales = calcularTotales();

  // Filtrar unidades
  const filteredUnidades = unidades.filter(uni =>
    unidadInput && uni.nombre.toLowerCase().includes(unidadInput.toLowerCase())
  );

  const unidadExists = unidades.some(
    uni => uni.nombre.toLowerCase() === unidadInput.toLowerCase()
  );

  const handleUnidadChange = (value: string) => {
    setUnidadInput(value);
    setFormData({ ...formData, unidad: value });
    setShowUnidadesSuggestions(value.length > 0);
    setSelectedUnidadIndex(0);
  };

  const handleSelectUnidad = (nombre: string) => {
    setUnidadInput(nombre);
    setFormData({ ...formData, unidad: nombre });
    setShowUnidadesSuggestions(false);
  };

  const handleUnidadKeyDown = (e: React.KeyboardEvent) => {
    if (!showUnidadesSuggestions || filteredUnidades.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedUnidadIndex((prev) => prev < filteredUnidades.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedUnidadIndex((prev) => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && showUnidadesSuggestions) {
      e.preventDefault();
      handleSelectUnidad(filteredUnidades[selectedUnidadIndex].nombre);
    } else if (e.key === 'Escape') {
      setShowUnidadesSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Agregar Recursos Manualmente</h3>
          <p className="text-slate-400">Planilla: {planillaNombre}</p>
        </div>
        <div className="text-sm text-slate-400">
          Paso {paso} de 2
        </div>
      </div>

      {/* PASO 1: Selección de Atributos */}
      {paso === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Seleccionar Atributos de los Recursos</CardTitle>
            <p className="text-sm text-slate-400">
              Selecciona qué información tendrán tus recursos. <span className="text-red-400 font-semibold">Costo Unitario es obligatorio.</span> El Costo Total se calculará automáticamente.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tabla visual de atributos */}
            <div className="border border-slate-600 rounded-lg overflow-hidden">
              <AtributosTable
                atributos={atributos}
                atributosSeleccionados={atributosSeleccionados}
                onToggleAtributo={(id) => {
                  // tu lógica existente: evita deseleccionar costo_unitario
                  if (id === 'costo_unitario' && atributosSeleccionados.has(id)) return;
                  setAtributosSeleccionados(prev => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
                eliminarAtributo={(id) => {
                  // opcional: si querés permitir borrar atributos personalizados
                  setAtributos(prev => prev.filter(a => a.id !== id));
                  setAtributosSeleccionados(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                  });
                }}
                extraForm={
                  showAddAtributo ? (
                    <AgregarAtributoForm
                      onAdd={(nuevo) => {
                        const newAttr = {
                          id: generateTempId(),
                          nombre: nuevo.nombre.trim(),
                          tipo: nuevo.tipo,
                          requerido: false,
                        };
                        setAtributos(prev => [...prev, newAttr]);
                        setAtributosSeleccionados(prev => new Set([...Array.from(prev), newAttr.id]));
                        setShowAddAtributo(false);
                      }}
                      onCancel={() => setShowAddAtributo(false)}
                    />
                  ) : (
                    <div className="p-2">
                      <Button onClick={() => setShowAddAtributo(true)} className="w-full bg-sky-600 hover:bg-sky-700">
                        <Plus className="h-4 w-4 mr-2" /> Agregar Nuevo Atributo Personalizado
                      </Button>
                    </div>
                  )
                }
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleContinuarPaso1}
                disabled={atributosSeleccionados.size === 0}
                className="bg-sky-600 hover:bg-sky-700"
              >
                Continuar al Paso 2 →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 2: Carga de Recursos */}
      {paso === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Izquierda: Formulario */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingRecursoId ? 'Editar Recurso' : 'Agregar Nuevo Recurso'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {atributos
                .filter(attr => atributosSeleccionados.has(attr.id) && attr.id !== 'costo_total')
                .map((attr) => {
                  // Campo especial para Unidad con búsqueda
                  if (attr.id === 'unidad') {
                    return (
                      <div key={attr.id} className="space-y-2 relative">
                        <Label htmlFor={attr.id}>{attr.nombre} {attr.requerido && '*'}</Label>
                        <Input
                          id={attr.id}
                          value={unidadInput}
                          onChange={(e) => handleUnidadChange(e.target.value)}
                          onKeyDown={handleUnidadKeyDown}
                          onFocus={() => setShowUnidadesSuggestions(unidadInput.length > 0)}
                          onBlur={() => setTimeout(() => setShowUnidadesSuggestions(false), 200)}
                          placeholder="Buscar o escribir unidad..."
                          autoComplete="off"
                        />
                        
                        {/* Sugerencias de unidades */}
                        {showUnidadesSuggestions && (
                          <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredUnidades.length > 0 ? (
                              <div className="py-1">
                                {filteredUnidades.map((uni, index) => (
                                  <button
                                    key={uni.id_unidad}
                                    onClick={() => handleSelectUnidad(uni.nombre)}
                                    className={`w-full text-left px-4 py-2 text-white transition-colors ${
                                      index === selectedUnidadIndex ? 'bg-sky-600' : 'hover:bg-slate-700'
                                    }`}
                                  >
                                    {uni.nombre} {uni.simbolo && <span className="text-slate-400">({uni.simbolo})</span>}
                                    {uni.descripcion && (
                                      <span className="text-xs text-slate-400 block">{uni.descripcion}</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : unidadInput.trim() && !unidadExists ? (
                              <div className="p-4 text-center">
                                <p className="text-sm text-slate-400 mb-2">No se encontró la unidad</p>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setShowAddUnidadModal(true);
                                    setShowUnidadesSuggestions(false);
                                  }}
                                  className="bg-sky-600 hover:bg-sky-700"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Agregar "{unidadInput}"
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Otros campos con autocompletado
                  const suggestions = getSuggestions(attr.id, formData[attr.id] || '');
                  const showSuggestions = activeSuggestionField === attr.id && suggestions.length > 0 && attr.tipo === 'texto';
                  const currentSuggestionIndex = selectedSuggestionIndex[attr.id] || 0;
                  
                  return (
                    <div key={attr.id} className="space-y-2 relative">
                      <Label htmlFor={attr.id}>{attr.nombre} {attr.requerido && '*'}</Label>
                      <Input
                        id={attr.id}
                        type={attr.tipo === 'numerico' || attr.tipo === 'entero' ? 'number' : 'text'}
                        value={formData[attr.id] || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, [attr.id]: e.target.value });
                          if (attr.tipo === 'texto' && e.target.value.length >= 2) {
                            setActiveSuggestionField(attr.id);
                            setSelectedSuggestionIndex({ ...selectedSuggestionIndex, [attr.id]: 0 });
                          }
                        }}
                        onKeyDown={(e) => handleSuggestionKeyDown(e, attr.id, suggestions)}
                        onFocus={() => {
                          if (attr.tipo === 'texto' && (formData[attr.id] || '').length >= 2) {
                            setActiveSuggestionField(attr.id);
                          }
                        }}
                        onBlur={() => setTimeout(() => setActiveSuggestionField(null), 200)}
                        placeholder={`Ingrese ${attr.nombre.toLowerCase()}`}
                        step={attr.tipo === 'entero' ? '1' : attr.tipo === 'numerico' ? '0.01' : undefined}
                        min={attr.tipo === 'numerico' || attr.tipo === 'entero' ? '0' : undefined}
                        autoComplete="off"
                      />
                      
                      {/* Sugerencias de autocompletado */}
                      {showSuggestions && (
                        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                          <div className="py-1">
                            {suggestions.map((sugg, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSelectSuggestion(attr.id, sugg)}
                                className={`w-full text-left px-4 py-2 text-white transition-colors ${
                                  idx === currentSuggestionIndex
                                    ? 'bg-sky-600'
                                    : 'hover:bg-slate-700'
                                }`}
                              >
                                {sugg}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Mostrar costo total calculado */}
              <div className="border-t border-slate-600 pt-4 mt-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">Costo Total Calculado</div>
                      <div className="text-xs text-slate-500">
                        {formData.cantidad || 0} × ${formData.costo_unitario || 0}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      ${calcularCostoTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {editingRecursoId ? (
                  <>
                    <Button onClick={handleAgregarRecurso} className="bg-green-600 hover:bg-green-700 flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingRecursoId(null);
                        const clearedData: Record<string, any> = {};
                        atributos.forEach(attr => {
                          if (atributosSeleccionados.has(attr.id)) {
                            clearedData[attr.id] = attr.tipo === 'numerico' ? 0 : '';
                          }
                        });
                        setFormData(clearedData);
                        setUnidadInput('');
                      }}
                      className="bg-slate-600 hover:bg-slate-500 border-slate-500"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Edición
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAgregarRecurso} className="bg-sky-600 hover:bg-sky-700 w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Recurso
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card Derecha: Tabla de Recursos */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Agregados ({recursosLocales.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {recursosLocales.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay recursos agregados aún</p>
                  <p className="text-sm">Completa el formulario y agrega recursos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tabla de recursos */}
                  <div className="border border-slate-600 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-700 sticky top-0">
                          <tr>
                            <th className="text-center p-2 text-white font-medium">Acciones</th>
                            {atributos
                              .filter(attr => atributosSeleccionados.has(attr.id))
                              .map(attr => (
                                <th key={attr.id} className="text-left p-2 text-white font-medium">
                                  {attr.nombre}
                                </th>
                              ))}
                            <th className="text-right p-2 text-white font-medium">Costo Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recursosLocales.map((recurso) => (
                            <tr 
                              key={recurso.id}
                              className={`border-t border-slate-600 transition-colors ${
                                editingRecursoId === recurso.id
                                  ? 'bg-sky-900/30'
                                  : 'hover:bg-slate-700/50'
                              }`}
                            >
                              <td className="p-2 text-center">
                                <div className="flex gap-1 justify-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRecurso(recurso)}
                                    className="h-8 w-8 p-0"
                                    title="Editar"
                                  >
                                    <Edit2 className="h-4 w-4 text-sky-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRecurso(recurso.id)}
                                    className="h-8 w-8 p-0"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                  </Button>
                                </div>
                              </td>
                              {atributos
                                .filter(attr => atributosSeleccionados.has(attr.id))
                                .map(attr => (
                                  <td key={attr.id} className="p-2 text-white">
                                    {recurso.datos[attr.id] || '-'}
                                  </td>
                                ))}
                              <td className="p-2 text-right">
                                <span className="font-semibold text-green-400">
                                  ${(parseFloat(recurso.datos.costo_total) || 0).toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card de Resumen */}
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-base">Resumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-sky-400">{totales.cantidadRecursos}</div>
                          <div className="text-xs text-slate-400">Recursos</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-400">{Math.round(totales.sumaCantidades)}</div>
                          <div className="text-xs text-slate-400">Cantidad Total</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">${totales.totalCosto.toFixed(2)}</div>
                          <div className="text-xs text-slate-400">Costo Total</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botones de navegación para el paso 2 */}
      {paso === 2 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setShowCancelAlert(true)}
            className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar y Salir
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPaso(1)}
              className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
            >
              Volver al Paso 1
            </Button>
            <Button
              onClick={handleGuardarYVolver}
              disabled={recursosLocales.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Guardar y Volver ({recursosLocales.length} recurso{recursosLocales.length !== 1 ? 's' : ''})
            </Button>
          </div>
        </div>
      )}

      {/* Modal para agregar unidad */}
      <AddUnidadModal
        open={showAddUnidadModal}
        onClose={() => setShowAddUnidadModal(false)}
        onAdd={handleAddUnidadLocal}
        initialNombre={unidadInput}
      />

      {/* Diálogo para cancelar y salir */}
      <ConfirmDialog
        open={showCancelAlert}
        onClose={() => setShowCancelAlert(false)}
        onConfirm={onCancel}
        title={<span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />¿Cancelar y salir?</span>}
        description="Si sales ahora, perderás todos los recursos que has agregado. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar y salir"
        cancelLabel="No, continuar editando"
        variant="destructive"
      />

      {/* Diálogo para eliminar recurso */}
      <ConfirmDialog
        open={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={confirmDeleteRecurso}
        title={<span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" />¿Eliminar recurso?</span>}
        description="Se eliminará este recurso de la lista local. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
      />

      {/* Diálogo para editar recurso */}
      <ConfirmDialog
        open={showEditAlert}
        onClose={() => setShowEditAlert(false)}
        onConfirm={() => recursoToEdit && confirmEditRecurso(recursoToEdit)}
        title={<span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />¿Reemplazar datos del formulario?</span>}
        description="Hay datos en el formulario que se perderán al cargar este recurso para editar. ¿Deseas continuar?"
        confirmLabel="Sí, cargar para editar"
        cancelLabel="Cancelar"
        variant="default" 
      />

      {/* Toast/Notificación temporal */}
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default AddRecursosManually;
