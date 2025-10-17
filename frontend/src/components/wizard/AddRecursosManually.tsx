import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, Save, AlertTriangle, Package } from 'lucide-react';
import { generateTempId } from '@/utils/idGenerator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [newAtributo, setNewAtributo] = useState({ nombre: '', tipo: 'texto' as 'texto' | 'numerico' });
  
  // Paso 2
  const [recursosLocales, setRecursosLocales] = useState<RecursoLocal[]>([]);
  const [recursosBD, setRecursosBD] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingRecursoId, setEditingRecursoId] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [showUnidadesSuggestions, setShowUnidadesSuggestions] = useState(false);
  const [selectedUnidadIndex, setSelectedUnidadIndex] = useState(0);
  const [showAddUnidadModal, setShowAddUnidadModal] = useState(false);
  const [newUnidad, setNewUnidad] = useState({ nombre: '', simbolo: '', descripcion: '' });
  const [unidadInput, setUnidadInput] = useState('');
  const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<Record<string, number>>({});
  
  // Alertas
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [recursoToDelete, setRecursoToDelete] = useState<string | null>(null);
  const [recursoToEdit, setRecursoToEdit] = useState<RecursoLocal | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Cargar unidades y recursos de la BD
  React.useEffect(() => {
    loadUnidades();
    loadRecursosBD();
  }, []);

  const loadUnidades = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/catalogos/unidades');
      if (response.ok) {
        const data = await response.json();
        setUnidades(data);
      }
    } catch (error) {
      console.error('Error cargando unidades:', error);
    }
  };

  const loadRecursosBD = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/catalogos/recursos');
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo los de esta planilla
        const recursosPlanilla = data.filter((r: any) => r.id_tipo_recurso === planillaId);
        setRecursosBD(recursosPlanilla);
      }
    } catch (error) {
      console.error('Error cargando recursos:', error);
    }
  };

  const handleAddUnidad = async () => {
    if (!newUnidad.nombre.trim()) return;
    
    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('nombre', newUnidad.nombre.trim());
      formDataToSend.append('simbolo', newUnidad.simbolo.trim());
      formDataToSend.append('descripcion', newUnidad.descripcion.trim());

      const response = await fetch('http://localhost:8000/api/v1/catalogos/unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        await loadUnidades();
        setFormData({ ...formData, unidad: data.nombre });
        setUnidadInput(data.nombre);
        setNewUnidad({ nombre: '', simbolo: '', descripcion: '' });
        setShowAddUnidadModal(false);
      }
    } catch (error) {
      console.error('Error creando unidad:', error);
    }
  };

  // Paso 1: Manejo de atributos
  const toggleAtributo = (atributoId: string) => {
    // No permitir deseleccionar costo_unitario (costo_total se calcula automáticamente)
    if (atributoId === 'costo_unitario' && atributosSeleccionados.has(atributoId)) {
      return;
    }

    const newSelected = new Set(atributosSeleccionados);
    if (newSelected.has(atributoId)) {
      newSelected.delete(atributoId);
    } else {
      newSelected.add(atributoId);
    }
    setAtributosSeleccionados(newSelected);
  };

  const handleAddAtributo = () => {
    if (!newAtributo.nombre.trim()) return;

    const nuevoAtributo: Atributo = {
      id: generateTempId(),
      nombre: newAtributo.nombre.trim(),
      tipo: newAtributo.tipo,
      requerido: false
    };

    setAtributos([...atributos, nuevoAtributo]);
    setAtributosSeleccionados(new Set([...atributosSeleccionados, nuevoAtributo.id]));
    setNewAtributo({ nombre: '', tipo: 'texto' });
    setShowAddAtributo(false);
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

  const handleGuardarTodo = async () => {
    if (recursosLocales.length === 0) {
      alert('No hay recursos para guardar');
      return;
    }

    onSave(recursosLocales.map(r => r.datos));
  };

  const handleCancelar = () => {
    if (recursosLocales.length > 0 || Object.values(formData).some(v => v !== '' && v !== 0)) {
      setShowCancelAlert(true);
    } else {
      onCancel();
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
      {/* Botones de navegación modificados */}
      <div className="flex justify-between">
        <Button 
          variant="destructive" 
          onClick={handleCancelar}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        {paso === 2 && (
          <Button 
            onClick={handleGuardarTodo}
            disabled={recursosLocales.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Recursos ({recursosLocales.length})
          </Button>
        )}
      </div>

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
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left p-3 text-white text-sm">Estado</th>
                    <th className="text-left p-3 text-white text-sm">Atributo</th>
                    <th className="text-center p-3 text-white text-sm">Tipo de Dato</th>
                    <th className="text-center p-3 text-white text-sm">Obligatorio</th>
                    <th className="text-center p-3 text-white text-sm">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {atributos.map((attr) => {
                    const isSelected = atributosSeleccionados.has(attr.id);
                    const isLocked = attr.id === 'costo_unitario';
                    
                    return (
                      <tr 
                        key={attr.id}
                        className={`border-t border-slate-600 transition-colors ${
                          isSelected ? 'bg-green-900/20' : 'bg-slate-800/50'
                        }`}
                      >
                        <td className="p-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                            isSelected
                              ? 'bg-green-600 border-green-500'
                              : 'bg-slate-700 border-slate-600'
                          }`}>
                            {isSelected && <Check className="h-4 w-4 text-white" />}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-white font-medium">{attr.nombre}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                            {attr.tipo === 'numerico' ? 'Numérico' : 'Texto'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {isLocked && (
                            <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-700">
                              SÍ
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => toggleAtributo(attr.id)}
                            disabled={isLocked && isSelected}
                            className={`${
                              isSelected
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                            } ${isLocked && isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isSelected ? 'Quitar' : 'Agregar'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Botón para agregar nuevo atributo */}
            <Button
              onClick={() => setShowAddAtributo(!showAddAtributo)}
              className="bg-sky-600 hover:bg-sky-700 w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Nuevo Atributo Personalizado
            </Button>

            {/* Form para agregar nuevo atributo */}
            {showAddAtributo && (
              <div className="border border-slate-600 rounded-lg p-4 bg-slate-700/50 space-y-4">
                <h4 className="font-medium text-white">Nuevo Atributo Personalizado</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attr-nombre">Nombre del Atributo *</Label>
                    <Input
                      id="attr-nombre"
                      value={newAtributo.nombre}
                      onChange={(e) => setNewAtributo({ ...newAtributo, nombre: e.target.value })}
                      placeholder="Ej: Marca, Modelo, Potencia, etc."
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attr-tipo">Tipo de Dato</Label>
                    <select
                      id="attr-tipo"
                      value={newAtributo.tipo}
                      onChange={(e) => setNewAtributo({ ...newAtributo, tipo: e.target.value as 'texto' | 'numerico' })}
                      className="w-full h-10 rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
                    >
                      <option value="texto">Texto</option>
                      <option value="numerico">Numérico</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={handleAddAtributo}
                    disabled={!newAtributo.nombre.trim()}
                    className="bg-sky-600 hover:bg-sky-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Atributo
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddAtributo(false);
                      setNewAtributo({ nombre: '', tipo: 'texto' });
                    }}
                    className="bg-slate-600 hover:bg-slate-500 border-slate-500"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

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
                                    setNewUnidad({ nombre: unidadInput, simbolo: '', descripcion: '' });
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

      {/* Modal para agregar unidad */}
      <Dialog open={showAddUnidadModal} onOpenChange={setShowAddUnidadModal}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Unidad</DialogTitle>
            <DialogDescription className="text-slate-400">
              Completa los datos para agregar una nueva unidad al sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddUnidad(); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-unidad-nombre">Nombre *</Label>
                <Input
                  id="new-unidad-nombre"
                  value={newUnidad.nombre}
                  onChange={(e) => setNewUnidad({ ...newUnidad, nombre: e.target.value })}
                  placeholder="Nombre de la unidad"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-unidad-simbolo">Símbolo</Label>
                <Input
                  id="new-unidad-simbolo"
                  value={newUnidad.simbolo}
                  onChange={(e) => setNewUnidad({ ...newUnidad, simbolo: e.target.value })}
                  placeholder="Ej: m, kg, h"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-unidad-desc">Descripción</Label>
                <Input
                  id="new-unidad-desc"
                  value={newUnidad.descripcion}
                  onChange={(e) => setNewUnidad({ ...newUnidad, descripcion: e.target.value })}
                  placeholder="Descripción opcional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowAddUnidadModal(false)} 
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!newUnidad.nombre.trim()}
                className="bg-sky-600 hover:bg-sky-700"
              >
                Agregar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para cancelar */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ¿Cancelar y salir?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Si sales ahora, perderás todos los recursos que has agregado. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 border-slate-600">
              No, continuar editando
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowCancelAlert(false);
                onCancel();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, cancelar y salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog para eliminar recurso */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              ¿Eliminar recurso?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Se eliminará este recurso de la lista local. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 border-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRecurso}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog para editar recurso (cuando hay datos en el form) */}
      <AlertDialog open={showEditAlert} onOpenChange={setShowEditAlert}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ¿Reemplazar datos del formulario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Hay datos en el formulario que se perderán al cargar este recurso para editar. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 border-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => recursoToEdit && confirmEditRecurso(recursoToEdit)}
              className="bg-sky-600 hover:bg-sky-700"
            >
              Sí, cargar para editar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast/Notificación temporal */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <Check className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRecursosManually;
