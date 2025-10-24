import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Check, X, Edit, ArrowLeft } from 'lucide-react';
import { generateTempId } from '@/utils/idGenerator';
import { useCatalogos } from '@/hooks';
import { AddUnidadModal, ConfirmModal } from '@/components/modals';
import AttributeSelectionModal from './AttributeSelectionModal';
import { AtributoBase } from '@/store/atributo';
import { getRecursosByTipo } from '@/actions/catalogos';

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
  onCancel: () => void;
  onSave: (recursos: any[]) => void;
}

const AddRecursosManuallyImproved: React.FC<Props> = ({ planillaNombre, planillaId, onCancel, onSave }) => {
  const { loadUnidades, handleAddRecursos } = useCatalogos();
  
  // Estados principales
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<AtributoBase[]>([]);
  const [recursos, setRecursos] = useState<RecursoLocal[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUnidad, setShowAddUnidad] = useState(false);
  const [nuevaUnidad, setNuevaUnidad] = useState('');
  const [editingRecurso, setEditingRecurso] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recursoToDelete, setRecursoToDelete] = useState<string | null>(null);
  
  // Estados para el formulario actual
  const [formularioActual, setFormularioActual] = useState<Record<string, any>>({});
  const [unidadInput, setUnidadInput] = useState('');
  const [showUnidadesSuggestions, setShowUnidadesSuggestions] = useState(false);
  const [filteredUnidades, setFilteredUnidades] = useState<Unidad[]>([]);
  const [selectedUnidadIndex, setSelectedUnidadIndex] = useState(-1);
  
  // Estados para autocompletado de recursos
  const [recursosExistentes, setRecursosExistentes] = useState<any[]>([]);
  const [descripcionInput, setDescripcionInput] = useState('');
  const [showRecursosSuggestions, setShowRecursosSuggestions] = useState(false);
  const [selectedRecursoIndex, setSelectedRecursoIndex] = useState(-1);

  useEffect(() => {
    loadUnidades().then(setUnidades);
  }, [loadUnidades]);

  // Cargar recursos existentes cuando se seleccionan atributos
  useEffect(() => {
    if (atributosSeleccionados.length > 0) {
      cargarRecursosExistentes();
    }
  }, [atributosSeleccionados, planillaId]);

  // Inicializar formulario cuando se seleccionan atributos
  useEffect(() => {
    if (atributosSeleccionados.length > 0) {
      const datosIniciales: Record<string, any> = {};
      atributosSeleccionados.forEach(atributo => {
        if (atributo.id === 'cantidad') {
          datosIniciales[atributo.id] = 1;
        } else if (atributo.id === 'costo_unitario') {
          datosIniciales[atributo.id] = 0;
        } else {
          datosIniciales[atributo.id] = '';
        }
      });
      setFormularioActual(datosIniciales);
    }
  }, [atributosSeleccionados]);

  // Filtrar unidades
  useEffect(() => {
    const filtered = unidades.filter(unidad => 
      unidad.nombre.toLowerCase().includes(unidadInput.toLowerCase())
    );
    setFilteredUnidades(filtered);
  }, [unidades, unidadInput]);

  // Filtrar recursos (existentes + tabla local) usando useMemo
  const filteredRecursos = useMemo(() => {
    // Combinar recursos existentes con recursos de la tabla local
    const recursosLocales = recursos.map(recurso => ({
      id_recurso: `local_${recurso.id}`,
      descripcion: recurso.datos.descripcion || '',
      cantidad: recurso.datos.cantidad || 0,
      costo_unitario_predeterminado: recurso.datos.costo_unitario || 0,
      id_unidad: unidades.find(u => u.nombre === recurso.datos.unidad)?.id_unidad || null,
      atributos: Object.keys(recurso.datos).reduce((acc, key) => {
        if (!['descripcion', 'cantidad', 'costo_unitario', 'unidad'].includes(key)) {
          acc[key] = recurso.datos[key];
        }
        return acc;
      }, {} as Record<string, any>),
      esLocal: true
    }));

    const todosLosRecursos = [...recursosExistentes, ...recursosLocales];
    return todosLosRecursos.filter(recurso => 
      recurso.descripcion.toLowerCase().includes(descripcionInput.toLowerCase())
    );
  }, [recursosExistentes, descripcionInput, recursos, unidades]);

  // Función para cargar recursos existentes
  const cargarRecursosExistentes = async () => {
    try {
      const recursos = await getRecursosByTipo(planillaId);
      setRecursosExistentes(recursos);
    } catch (error) {
      console.error('Error cargando recursos existentes:', error);
    }
  };

  // Función para manejar la selección de atributos
  const handleAttributeSelection = (atributos: AtributoBase[]) => {
    setAtributosSeleccionados(atributos);
    setStep('form');
  };

  // Función para volver a la selección de atributos
  const handleBackToSelection = () => {
    setStep('select');
    setRecursos([]);
    setEditingRecurso(null);
    setFormularioActual({});
    setUnidadInput('');
  };

  // Funciones para manejar autocompletado de unidades
  const handleUnidadChange = (value: string) => {
    setUnidadInput(value);
    setShowUnidadesSuggestions(value.length > 0);
    setSelectedUnidadIndex(-1);
    setFormularioActual(prev => ({ ...prev, unidad: value }));
  };

  const handleUnidadKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedUnidadIndex(prev => 
        prev < filteredUnidades.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedUnidadIndex(prev => 
        prev > 0 ? prev - 1 : filteredUnidades.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedUnidadIndex >= 0 && filteredUnidades[selectedUnidadIndex]) {
        handleSelectUnidad(filteredUnidades[selectedUnidadIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowUnidadesSuggestions(false);
    }
  };

  const handleSelectUnidad = (unidad: Unidad) => {
    setUnidadInput(unidad.nombre);
    setFormularioActual(prev => ({ ...prev, unidad: unidad.nombre }));
    setShowUnidadesSuggestions(false);
    setSelectedUnidadIndex(-1);
  };

  // Funciones para manejar autocompletado de recursos
  const handleDescripcionChange = (value: string) => {
    setDescripcionInput(value);
    setShowRecursosSuggestions(value.length > 0);
    setSelectedRecursoIndex(-1);
    setFormularioActual(prev => ({ ...prev, descripcion: value }));
  };

  const handleRecursoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedRecursoIndex(prev => 
        prev < filteredRecursos.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedRecursoIndex(prev => 
        prev > 0 ? prev - 1 : filteredRecursos.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedRecursoIndex >= 0 && filteredRecursos[selectedRecursoIndex]) {
        handleSelectRecurso(filteredRecursos[selectedRecursoIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowRecursosSuggestions(false);
    }
  };

  const handleSelectRecurso = (recurso: any) => {
    setDescripcionInput(recurso.descripcion);
    
    // Llenar el formulario con los datos del recurso seleccionado
    const nuevosDatos: Record<string, any> = {};
    atributosSeleccionados.forEach(atributo => {
      if (atributo.id === 'descripcion') {
        nuevosDatos[atributo.id] = recurso.descripcion;
      } else if (atributo.id === 'unidad') {
        // Buscar la unidad por ID
        const unidad = unidades.find(u => u.id_unidad === recurso.id_unidad);
        nuevosDatos[atributo.id] = unidad?.nombre || '';
        setUnidadInput(unidad?.nombre || '');
      } else if (atributo.id === 'cantidad') {
        nuevosDatos[atributo.id] = recurso.cantidad || 1;
      } else if (atributo.id === 'costo_unitario') {
        nuevosDatos[atributo.id] = recurso.costo_unitario_predeterminado || 0;
      } else if (atributo.id === 'costo_total') {
        nuevosDatos[atributo.id] = recurso.costo_total || 0;
      } else {
        // Para atributos personalizados, buscar en los atributos del recurso
        nuevosDatos[atributo.id] = recurso.atributos?.[atributo.id] || '';
      }
    });
    
    setFormularioActual(nuevosDatos);
    setShowRecursosSuggestions(false);
    setSelectedRecursoIndex(-1);
  };

  // Función para agregar el recurso actual del formulario
  const agregarRecurso = () => {
    console.log('AddRecursosManuallyImproved: Intentando agregar recurso');
    console.log('AddRecursosManuallyImproved: formularioActual:', formularioActual);
    console.log('AddRecursosManuallyImproved: atributosSeleccionados:', atributosSeleccionados);
    
    // Validar que todos los campos requeridos estén llenos (excepto costo_total que se calcula automáticamente)
    const camposRequeridos = atributosSeleccionados.filter(a => a.requerido && a.id !== 'costo_total');
    const faltantes = camposRequeridos.filter(atributo => {
      const valor = formularioActual[atributo.id];
      return !valor || valor === '' || valor === null || valor === undefined;
    });

    console.log('AddRecursosManuallyImproved: camposRequeridos:', camposRequeridos);
    console.log('AddRecursosManuallyImproved: faltantes:', faltantes);

    if (faltantes.length > 0) {
      alert(`Por favor complete los campos requeridos: ${faltantes.map(a => a.nombre).join(', ')}`);
      return;
    }

    // Calcular costo total automáticamente
    const cantidad = parseFloat(formularioActual.cantidad) || 0;
    const costoUnitario = parseFloat(formularioActual.costo_unitario) || 0;
    const costoTotal = cantidad * costoUnitario;

    if (editingRecurso) {
      // Actualizar recurso existente
      const recursoActualizado: RecursoLocal = {
        id: editingRecurso,
        datos: { 
          ...formularioActual,
          costo_total: costoTotal
        }
      };
      console.log('AddRecursosManuallyImproved: actualizando recurso:', recursoActualizado);
      setRecursos(recursos.map(r => r.id === editingRecurso ? recursoActualizado : r));
      setEditingRecurso(null);
    } else {
      // Crear nuevo recurso
      const nuevoRecurso: RecursoLocal = {
        id: generateTempId(),
        datos: { 
          ...formularioActual,
          costo_total: costoTotal
        }
      };
      console.log('AddRecursosManuallyImproved: nuevoRecurso:', nuevoRecurso);
      console.log('AddRecursosManuallyImproved: recursos antes:', recursos);
      setRecursos([...recursos, nuevoRecurso]);
      console.log('AddRecursosManuallyImproved: recursos después:', [...recursos, nuevoRecurso]);
    }

    // Limpiar formulario
    const datosIniciales: Record<string, any> = {};
    atributosSeleccionados.forEach(atributo => {
      if (atributo.id === 'cantidad') {
        datosIniciales[atributo.id] = 1;
      } else if (atributo.id === 'costo_unitario') {
        datosIniciales[atributo.id] = 0;
      } else {
        datosIniciales[atributo.id] = '';
      }
    });
    setFormularioActual(datosIniciales);
    setUnidadInput('');
    setDescripcionInput(''); // Limpiar también el input de descripción
  };

  // Función para eliminar un recurso
  const eliminarRecurso = (id: string) => {
    setRecursoToDelete(id);
    setShowConfirmModal(true);
  };

  // Función para confirmar la eliminación
  const confirmarEliminacion = () => {
    if (recursoToDelete) {
      setRecursos(recursos.filter(r => r.id !== recursoToDelete));
      if (editingRecurso === recursoToDelete) {
        setEditingRecurso(null);
      }
      setRecursoToDelete(null);
    }
    setShowConfirmModal(false);
  };

  // Función para cancelar la eliminación
  const cancelarEliminacion = () => {
    setRecursoToDelete(null);
    setShowConfirmModal(false);
  };

  // Función para editar un recurso
  const editarRecurso = (id: string) => {
    const recurso = recursos.find(r => r.id === id);
    if (recurso) {
      setEditingRecurso(id);
      // Cargar los datos del recurso en el formulario
      setFormularioActual({ ...recurso.datos });
      setUnidadInput(recurso.datos.unidad || '');
      setDescripcionInput(recurso.datos.descripcion || '');
    }
  };


  // Función para validar un recurso
  const validarRecurso = (recurso: RecursoLocal): boolean => {
    return atributosSeleccionados.every(atributo => {
      if (atributo.requerido) {
        const valor = recurso.datos[atributo.id];
        return valor !== '' && valor !== null && valor !== undefined;
      }
      return true;
    });
  };

  // Función para validar todos los recursos
  const validarTodos = (): boolean => {
    return recursos.length > 0 && recursos.every(validarRecurso);
  };

  // Función para calcular el costo total
  const calcularCostoTotal = (recurso: RecursoLocal): number => {
    const cantidad = parseFloat(recurso.datos.cantidad) || 0;
    const costoUnitario = parseFloat(recurso.datos.costo_unitario) || 0;
    return cantidad * costoUnitario;
  };

  // Función para guardar recursos
  const handleSave = async () => {
    if (!validarTodos()) return;
    
    setLoading(true);
    try {
      const recursosParaEnviar = recursos.map(recurso => {
        const datosRecurso: any = {
          id_tipo_recurso: planillaId,
          descripcion: recurso.datos.descripcion,
          id_unidad: unidades.find(u => u.nombre === recurso.datos.unidad)?.id_unidad || null,
          cantidad: parseFloat(recurso.datos.cantidad) || 0,
          costo_unitario_predeterminado: parseFloat(recurso.datos.costo_unitario) || 0,
          costo_total: calcularCostoTotal(recurso),
          atributos: {}
        };

        // Agregar atributos personalizados
        atributosSeleccionados.forEach(atributo => {
          if (!atributo.base && recurso.datos[atributo.id] !== undefined) {
            datosRecurso.atributos[atributo.id] = recurso.datos[atributo.id];
          }
        });

        return datosRecurso;
      });

      await handleAddRecursos(recursosParaEnviar);
      onSave(recursosParaEnviar);
    } catch (error) {
      console.error('Error guardando recursos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar nueva unidad
  const handleAddUnidad = async (data: { nombre: string; simbolo: string; descripcion?: string }) => {
    try {
      const nuevaUnidad: Unidad = {
        id_unidad: Date.now(),
        nombre: data.nombre,
        simbolo: data.simbolo,
        descripcion: data.descripcion
      };
      setUnidades([...unidades, nuevaUnidad]);
      setShowAddUnidad(false);
      setNuevaUnidad('');
    } catch (error) {
      console.error('Error agregando unidad:', error);
    }
  };

  // Renderizar input según el tipo de atributo para el formulario actual
  const renderFormInput = (atributo: AtributoBase) => {
    const valor = formularioActual[atributo.id] || '';

    // No mostrar el campo de costo total
    if (atributo.id === 'costo_total') {
      return null;
    }

    if (atributo.id === 'unidad') {
      return (
        <div className="space-y-2 relative">
          <Label className="text-white">
            {atributo.nombre} {atributo.requerido && '*'}
          </Label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                value={unidadInput}
                onChange={(e) => handleUnidadChange(e.target.value)}
                onKeyDown={handleUnidadKeyDown}
                onFocus={() => setShowUnidadesSuggestions(unidadInput.length > 0)}
                onBlur={() => setTimeout(() => setShowUnidadesSuggestions(false), 200)}
                placeholder="Buscar o escribir unidad..."
                autoComplete="off"
                className="bg-slate-700 border-slate-600 text-white"
              />
              {showUnidadesSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredUnidades.length > 0 ? (
                    <div className="py-1">
                      {filteredUnidades.map((unidad, index) => (
                        <button
                          key={unidad.id_unidad}
                          onClick={() => handleSelectUnidad(unidad)}
                          className={`w-full text-left px-4 py-2 text-white transition-colors ${
                            index === selectedUnidadIndex
                              ? 'bg-sky-600'
                              : 'hover:bg-slate-700'
                          }`}
                        >
                          {unidad.nombre} ({unidad.simbolo})
                        </button>
                      ))}
                    </div>
                  ) : unidadInput.trim() && (
                    <div className="p-4 text-center">
                      <p className="text-sm text-slate-400 mb-2">No se encontró la unidad</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNuevaUnidad(unidadInput);
                          setShowAddUnidad(true);
                          setShowUnidadesSuggestions(false);
                        }}
                        className="bg-sky-600 hover:bg-sky-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar "{unidadInput}"
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowAddUnidad(true)}
              variant="outline"
              size="sm"
              className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    if (atributo.tipo === 'entero') {
      return (
        <div className="space-y-2">
          <Label className="text-white">
            {atributo.nombre} {atributo.requerido && '*'}
          </Label>
          <Input
            type="number"
            value={valor}
            onChange={(e) => setFormularioActual(prev => ({ ...prev, [atributo.id]: parseInt(e.target.value) || 0 }))}
            min="0"
            step="1"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      );
    }

    if (atributo.tipo === 'numerico') {
      return (
        <div className="space-y-2">
          <Label className="text-white">
            {atributo.nombre} {atributo.requerido && '*'}
          </Label>
          <Input
            type="number"
            value={valor}
            onChange={(e) => setFormularioActual(prev => ({ ...prev, [atributo.id]: parseFloat(e.target.value) || 0 }))}
            min="0"
            step="0.01"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      );
    }

    // Si es el campo de descripción, mostrar autocompletado de recursos
    if (atributo.id === 'descripcion') {
      return (
        <div className="space-y-2 relative">
          <Label className="text-white">
            {atributo.nombre} {atributo.requerido && '*'}
          </Label>
          <Input
            value={descripcionInput}
            onChange={(e) => handleDescripcionChange(e.target.value)}
            onKeyDown={handleRecursoKeyDown}
            onFocus={() => setShowRecursosSuggestions(descripcionInput.length > 0)}
            onBlur={() => setTimeout(() => setShowRecursosSuggestions(false), 200)}
            placeholder="Buscar recurso existente o escribir nueva descripción..."
            autoComplete="off"
            className="bg-slate-700 border-slate-600 text-white"
          />
          {showRecursosSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredRecursos.length > 0 ? (
                <div className="py-1">
                  {filteredRecursos.map((recurso, index) => (
                    <button
                      key={recurso.id_recurso}
                      onClick={() => handleSelectRecurso(recurso)}
                      className={`w-full text-left px-4 py-2 text-white transition-colors ${
                        index === selectedRecursoIndex
                          ? 'bg-sky-600'
                          : 'hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{recurso.descripcion}</div>
                        {recurso.esLocal && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Local
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {recurso.cantidad} {unidades.find(u => u.id_unidad === recurso.id_unidad)?.nombre || 'unidades'} - 
                        ${recurso.costo_unitario_predeterminado}
                      </div>
                    </button>
                  ))}
                </div>
              ) : descripcionInput.trim() && (
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-400">
                    No se encontraron recursos con esa descripción
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label className="text-white">
          {atributo.nombre} {atributo.requerido && '*'}
        </Label>
        <Input
          type="text"
          value={valor}
          onChange={(e) => setFormularioActual(prev => ({ ...prev, [atributo.id]: e.target.value }))}
          placeholder={`Ingrese ${atributo.nombre.toLowerCase()}`}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
    );
  };

  // Si estamos en el paso de selección de atributos
  if (step === 'select') {
    return (
      <AttributeSelectionModal
        onClose={onCancel}
        onConfirm={handleAttributeSelection}
        title="Seleccionar Atributos para Recursos Manuales"
        description="Selecciona los atributos que quieres incluir en el formulario de recursos"
        confirmButtonText="Continuar"
        confirmButtonIcon={<ArrowLeft className="h-4 w-4 mr-2" />}
      />
    );
  }

  // Paso del formulario
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Agregar Recursos Manualmente</h3>
          <p className="text-slate-400">Planilla: {planillaNombre}</p>
          <p className="text-slate-500 text-sm">Atributos seleccionados: {atributosSeleccionados.length}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleBackToSelection}
            variant="outline"
            className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cambiar Atributos
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>

      {/* Formulario para agregar recurso */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Agregar Nuevo Recurso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atributosSeleccionados.map((atributo) => (
              <div key={atributo.id}>
                {renderFormInput(atributo)}
              </div>
            ))}
          </div>

          {/* Mostrar costo total calculado automáticamente */}
          {atributosSeleccionados.some(a => a.id === 'cantidad') && atributosSeleccionados.some(a => a.id === 'costo_unitario') && (
            <div className="mt-4 p-3 bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Costo Total:</span>
                <span className="text-green-400 font-semibold">
                  ${((formularioActual.cantidad || 0) * (formularioActual.costo_unitario || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Botones para agregar/actualizar recurso */}
          <div className="flex justify-end gap-2 mt-4">
            {editingRecurso && (
              <Button
                onClick={() => {
                  setEditingRecurso(null);
                  // Limpiar formulario
                  const datosIniciales: Record<string, any> = {};
                  atributosSeleccionados.forEach(atributo => {
                    if (atributo.id === 'cantidad') {
                      datosIniciales[atributo.id] = 1;
                    } else if (atributo.id === 'costo_unitario') {
                      datosIniciales[atributo.id] = 0;
                    } else {
                      datosIniciales[atributo.id] = '';
                    }
                  });
                  setFormularioActual(datosIniciales);
                  setUnidadInput('');
                  setDescripcionInput('');
                }}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            <Button
              onClick={agregarRecurso}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {editingRecurso ? 'Actualizar Recurso' : 'Agregar Recurso'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de resumen */}
      {recursos.length > 0 && (
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Resumen de Recursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-slate-600 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left p-3 text-white font-medium">Acciones</th>
                    {atributosSeleccionados.map((atributo) => (
                      <th key={atributo.id} className="text-left p-3 text-white font-medium">
                        {atributo.nombre}
                      </th>
                    ))}
                    {atributosSeleccionados.some(a => a.id === 'costo_total') && (
                      <th className="text-right p-3 text-white font-medium">Total</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recursos.map((recurso) => (
                    <tr key={recurso.id} className="border-t border-slate-600">
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => editarRecurso(recurso.id)}
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => eliminarRecurso(recurso.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      {atributosSeleccionados.map((atributo) => (
                        <td key={atributo.id} className="p-3 text-white">
                          {recurso.datos[atributo.id] || '-'}
                        </td>
                      ))}
                      {atributosSeleccionados.some(a => a.id === 'costo_total') && (
                        <td className="p-3 text-right text-green-400 font-semibold">
                          ${calcularCostoTotal(recurso).toFixed(2)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2">
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!validarTodos() || loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Guardar Recursos ({recursos.length})
            </>
          )}
        </Button>
      </div>

      {/* Modal para agregar unidad */}
      <AddUnidadModal
        open={showAddUnidad}
        onClose={() => setShowAddUnidad(false)}
        onAdd={handleAddUnidad}
        initialNombre={nuevaUnidad}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        open={showConfirmModal}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar "${recursos.find(r => r.id === recursoToDelete)?.datos.descripcion || 'este recurso'}"?`}
        onConfirm={confirmarEliminacion}
        onCancel={cancelarEliminacion}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default AddRecursosManuallyImproved;
