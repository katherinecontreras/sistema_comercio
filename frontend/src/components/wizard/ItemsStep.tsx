import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/app';
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ItemObra {
  id: string;
  id_obra: string;
  id_item_padre: string | null;
  codigo: string;
  descripcion_tarea: string;
  especialidad: string;
  unidad: string;
  cantidad: number;
  nivel: number;
  expanded: boolean;
}

interface Especialidad {
  id_especialidad: number;
  nombre: string;
  descripcion?: string;
}

interface Unidad {
  id_unidad: number;
  nombre: string;
  simbolo?: string;
  descripcion?: string;
}

const ItemsStep: React.FC = () => {
  const { wizard, setStep, setItems } = useAppStore();
  const [items, setItemsLocal] = useState<ItemObra[]>(wizard.items);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedObra, setSelectedObra] = useState<string>('');
  
  // Estados para especialidades y unidades
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [showEspecialidadesSuggestions, setShowEspecialidadesSuggestions] = useState(false);
  const [showUnidadesSuggestions, setShowUnidadesSuggestions] = useState(false);
  const [especialidadInput, setEspecialidadInput] = useState('');
  const [unidadInput, setUnidadInput] = useState('');
  const [selectedEspecialidadIndex, setSelectedEspecialidadIndex] = useState(0);
  const [selectedUnidadIndex, setSelectedUnidadIndex] = useState(0);
  
  // Estados para modales
  const [showAddEspecialidadModal, setShowAddEspecialidadModal] = useState(false);
  const [showAddUnidadModal, setShowAddUnidadModal] = useState(false);
  const [newEspecialidad, setNewEspecialidad] = useState({ nombre: '', descripcion: '' });
  const [newUnidad, setNewUnidad] = useState({ nombre: '', simbolo: '', descripcion: '' });
  
  // Estado para alertas
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [obrasWithoutItems, setObrasWithoutItems] = useState<string[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion_tarea: '',
    especialidad: '',
    unidad: '',
    cantidad: 1
  });

  // Cargar especialidades y unidades desde la API
  useEffect(() => {
    loadEspecialidades();
    loadUnidades();
  }, []);

  const loadEspecialidades = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/catalogos/especialidades');
      if (response.ok) {
        const data = await response.json();
        setEspecialidades(data);
      }
    } catch (error) {
      console.error('Error cargando especialidades:', error);
    }
  };

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

  const handleAddEspecialidad = async () => {
    if (!newEspecialidad.nombre.trim()) return;
    
    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('nombre', newEspecialidad.nombre.trim());
      formDataToSend.append('descripcion', newEspecialidad.descripcion.trim());

      const response = await fetch('http://localhost:8000/api/v1/catalogos/especialidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        await loadEspecialidades(); // Recargar lista
        setFormData({ ...formData, especialidad: data.nombre });
        setEspecialidadInput(data.nombre);
        setNewEspecialidad({ nombre: '', descripcion: '' });
        setShowAddEspecialidadModal(false);
        setSuccessMessage(`Especialidad "${data.nombre}" creada exitosamente`);
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error('Error creando especialidad:', error);
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
        await loadUnidades(); // Recargar lista
        setFormData({ ...formData, unidad: data.nombre });
        setUnidadInput(data.nombre);
        setNewUnidad({ nombre: '', simbolo: '', descripcion: '' });
        setShowAddUnidadModal(false);
        setSuccessMessage(`Unidad "${data.nombre}" creada exitosamente`);
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error('Error creando unidad:', error);
    }
  };

  const handleEspecialidadChange = (value: string) => {
    setEspecialidadInput(value);
    setFormData({ ...formData, especialidad: value });
    setShowEspecialidadesSuggestions(value.length > 0);
    setSelectedEspecialidadIndex(0);
  };

  const handleSelectEspecialidad = (nombre: string) => {
    setEspecialidadInput(nombre);
    setFormData({ ...formData, especialidad: nombre });
    setShowEspecialidadesSuggestions(false);
  };

  const handleEspecialidadKeyDown = (e: React.KeyboardEvent, filteredEsps: Especialidad[]) => {
    if (!showEspecialidadesSuggestions || filteredEsps.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedEspecialidadIndex((prev) => 
        prev < filteredEsps.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedEspecialidadIndex((prev) => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectEspecialidad(filteredEsps[selectedEspecialidadIndex].nombre);
    } else if (e.key === 'Escape') {
      setShowEspecialidadesSuggestions(false);
    }
  };

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

  const handleUnidadKeyDown = (e: React.KeyboardEvent, filteredUnis: Unidad[]) => {
    if (!showUnidadesSuggestions || filteredUnis.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedUnidadIndex((prev) => 
        prev < filteredUnis.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedUnidadIndex((prev) => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectUnidad(filteredUnis[selectedUnidadIndex].nombre);
    } else if (e.key === 'Escape') {
      setShowUnidadesSuggestions(false);
    }
  };

  const handleAddItem = (parentId?: string) => {
    if (!selectedObra || !formData.descripcion_tarea.trim()) return;

    const parentItem = parentId ? items.find(item => item.id === parentId) : null;
    const nivel = parentItem ? parentItem.nivel + 1 : 0;
    
    const newItem: ItemObra = {
      id: generateTempId(),
      id_obra: selectedObra,
      id_item_padre: parentId || null,
      codigo: formData.codigo.trim() || '',
      descripcion_tarea: formData.descripcion_tarea.trim(),
      especialidad: formData.especialidad.trim() || '',
      unidad: formData.unidad.trim() || '',
      cantidad: formData.cantidad,
      nivel,
      expanded: true
    };

    const updatedItems = [...items, newItem];
    setItemsLocal(updatedItems);
    setItems(updatedItems);
    setFormData({
      codigo: '',
      descripcion_tarea: '',
      especialidad: '',
      unidad: '',
      cantidad: 1
    });
    setEspecialidadInput('');
    setUnidadInput('');
  };

  const handleEditItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setFormData({
        codigo: item.codigo,
        descripcion_tarea: item.descripcion_tarea,
        especialidad: item.especialidad,
        unidad: item.unidad,
        cantidad: item.cantidad
      });
      setEspecialidadInput(item.especialidad);
      setUnidadInput(item.unidad);
      setEditingItem(id);
    }
  };

  const handleUpdateItem = () => {
    if (editingItem && formData.descripcion_tarea.trim()) {
      const updatedItems = items.map(item => 
        item.id === editingItem 
          ? { 
              ...item, 
              codigo: formData.codigo.trim(),
              descripcion_tarea: formData.descripcion_tarea.trim(),
              especialidad: formData.especialidad.trim(),
              unidad: formData.unidad.trim(),
              cantidad: formData.cantidad
            }
          : item
      );
      setItemsLocal(updatedItems);
      setItems(updatedItems);
      setFormData({
        codigo: '',
        descripcion_tarea: '',
        especialidad: '',
        unidad: '',
        cantidad: 1
      });
      setEspecialidadInput('');
      setUnidadInput('');
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    const deleteItemAndChildren = (itemId: string) => {
      const children = items.filter(item => item.id_item_padre === itemId);
      children.forEach(child => deleteItemAndChildren(child.id));
      return items.filter(item => item.id !== itemId);
    };
    
    const updatedItems = deleteItemAndChildren(id);
    setItemsLocal(updatedItems);
    setItems(updatedItems);
  };

  const toggleExpanded = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, expanded: !item.expanded } : item
    );
    setItemsLocal(updatedItems);
    setItems(updatedItems);
  };

  const getChildItems = (parentId: string) => {
    return items.filter(item => item.id_item_padre === parentId);
  };

  const renderItem = (item: ItemObra) => {
    const children = getChildItems(item.id);
    const hasChildren = children.length > 0;

    return (
      <div key={item.id} className="border-l-2 border-slate-600 ml-4">
        <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg mb-2">
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(item.id)}
                className="p-1 h-6 w-6"
              >
                {item.expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {item.codigo && (
                  <span className="text-sm font-mono bg-sky-900/50 text-sky-300 px-2 py-1 rounded">
                    {item.codigo}
                  </span>
                )}
                <span className="font-medium text-white">{item.descripcion_tarea}</span>
                {item.especialidad && (
                  <span className="text-sm text-slate-400">({item.especialidad})</span>
                )}
              </div>
              <div className="text-sm text-slate-400">
                {item.cantidad} {item.unidad || 'unidades'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(item.id)}
              title="Agregar sub-item"
              className="bg-slate-600 hover:bg-slate-500"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditItem(item.id)}
              className="bg-slate-600 hover:bg-slate-500"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteItem(item.id)}
              className="bg-slate-600 hover:bg-slate-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {hasChildren && item.expanded && (
          <div className="ml-4">
            {children.map(child => renderItem(child))}
          </div>
        )}
      </div>
    );
  };

  // Verificar el estado de cada obra
  const getObraStatus = (obraId: string) => {
    const obraItems = items.filter(item => item.id_obra === obraId);
    if (obraItems.length > 0) return 'complete'; // Verde con check
    if (selectedObra === obraId) return 'selected'; // Azul (seleccionada)
    return 'empty'; // Gris (sin items)
  };

  const handleContinue = () => {
    // Validar que todas las obras tengan al menos un item
    const obrasWithoutItemsList = wizard.obras.filter(obra => {
      const obraItems = items.filter(item => item.id_obra === obra.id);
      return obraItems.length === 0;
    });

    if (obrasWithoutItemsList.length > 0) {
      setObrasWithoutItems(obrasWithoutItemsList.map(o => o.id));
      setValidationMessage(
        `Las siguientes obras no tienen items: ${obrasWithoutItemsList.map(o => o.nombre).join(', ')}. Por favor, agrega al menos un item a cada obra antes de continuar.`
      );
      setShowValidationAlert(true);
      return;
    }

    setStep('costos');
  };

  const handleBack = () => {
    setStep('obras');
  };

  // Filtrar especialidades según búsqueda
  const filteredEspecialidades = especialidades.filter(esp =>
    esp.nombre.toLowerCase().includes(especialidadInput.toLowerCase())
  );

  // Filtrar unidades según búsqueda
  const filteredUnidades = unidades.filter(uni =>
    uni.nombre.toLowerCase().includes(unidadInput.toLowerCase())
  );

  // Verificar si el valor ingresado existe en la BD
  const especialidadExists = especialidades.some(
    esp => esp.nombre.toLowerCase() === especialidadInput.toLowerCase()
  );

  const unidadExists = unidades.some(
    uni => uni.nombre.toLowerCase() === unidadInput.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} className="bg-slate-700 hover:bg-slate-600 border-slate-600">
          ← Anterior
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={items.length === 0}
          className="bg-sky-600 hover:bg-sky-700"
        >
          Continuar →
        </Button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Estructurar Items de Obra</h3>
          <p className="text-slate-400">Crea la estructura jerárquica de tareas para cada obra</p>
        </div>
        <div className="text-sm text-slate-400">
          {items.length} item{items.length !== 1 ? 's' : ''} agregado{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Selector de obra con botones */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {wizard.obras.map((obra) => {
              const status = getObraStatus(obra.id);
              const obraItems = items.filter(item => item.id_obra === obra.id);
              const isInvalid = obrasWithoutItems.includes(obra.id);
              
              return (
                <Button
                  key={obra.id}
                  onClick={() => setSelectedObra(obra.id)}
                  className={`flex items-center gap-2 transition-all ${
                    isInvalid
                      ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-500'
                      : status === 'complete'
                      ? 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-500'
                      : status === 'selected'
                      ? 'bg-sky-500 hover:bg-sky-600 text-white border-2 border-sky-400'
                      : 'bg-slate-600 hover:bg-slate-500 text-white border-2 border-slate-500'
                  }`}
                  variant="outline"
                >
                  {status === 'complete' && <Check className="h-4 w-4" />}
                  {isInvalid && <AlertTriangle className="h-4 w-4" />}
                  <span>{obra.nombre}</span>
                  {obraItems.length > 0 && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">
                      {obraItems.length}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          {wizard.obras.length === 0 && (
            <Alert className="bg-yellow-900/20 border-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-200">
                No hay obras creadas. Ve al paso anterior para crear al menos una obra.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Formulario para agregar/editar item */}
      {selectedObra && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingItem ? 'Editar Item' : 'Agregar Nuevo Item'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ej: 1.1, 1.2.1, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion_tarea">Descripción de la Tarea *</Label>
                <Input
                  id="descripcion_tarea"
                  value={formData.descripcion_tarea}
                  onChange={(e) => setFormData({ ...formData, descripcion_tarea: e.target.value })}
                  placeholder="Descripción de la tarea"
                />
              </div>
              
              {/* Input de búsqueda para Especialidad */}
              <div className="space-y-2 relative">
                <Label htmlFor="especialidad">Especialidad</Label>
                <Input
                  id="especialidad"
                  value={especialidadInput}
                  onChange={(e) => handleEspecialidadChange(e.target.value)}
                  onKeyDown={(e) => handleEspecialidadKeyDown(e, filteredEspecialidades)}
                  onFocus={() => setShowEspecialidadesSuggestions(especialidadInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowEspecialidadesSuggestions(false), 200)}
                  placeholder="Buscar o escribir especialidad..."
                  autoComplete="off"
                />
                
                {/* Sugerencias de especialidades */}
                {showEspecialidadesSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredEspecialidades.length > 0 ? (
                      <div className="py-1">
                        {filteredEspecialidades.map((esp, index) => (
                          <button
                            key={esp.id_especialidad}
                            onClick={() => handleSelectEspecialidad(esp.nombre)}
                            className={`w-full text-left px-4 py-2 text-white transition-colors ${
                              index === selectedEspecialidadIndex
                                ? 'bg-sky-600'
                                : 'hover:bg-slate-700'
                            }`}
                          >
                            {esp.nombre}
                            {esp.descripcion && (
                              <span className="text-xs text-slate-400 block">{esp.descripcion}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : especialidadInput.trim() && !especialidadExists ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-400 mb-2">No se encontró la especialidad</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setNewEspecialidad({ nombre: especialidadInput, descripcion: '' });
                            setShowAddEspecialidadModal(true);
                            setShowEspecialidadesSuggestions(false);
                          }}
                          className="bg-sky-600 hover:bg-sky-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar "{especialidadInput}"
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Input de búsqueda para Unidad */}
              <div className="space-y-2 relative">
                <Label htmlFor="unidad">Unidad</Label>
                <Input
                  id="unidad"
                  value={unidadInput}
                  onChange={(e) => handleUnidadChange(e.target.value)}
                  onKeyDown={(e) => handleUnidadKeyDown(e, filteredUnidades)}
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
                              index === selectedUnidadIndex
                                ? 'bg-sky-600'
                                : 'hover:bg-slate-700'
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

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: parseFloat(e.target.value) || 1 })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {editingItem ? (
                <>
                  <Button onClick={handleUpdateItem} disabled={!formData.descripcion_tarea.trim()}>
                    <Check className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditingItem(null);
                    setFormData({
                      codigo: '',
                      descripcion_tarea: '',
                      especialidad: '',
                      unidad: '',
                      cantidad: 1
                    });
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={() => handleAddItem()} disabled={!formData.descripcion_tarea.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de items por obra */}
      {wizard.obras.map((obra) => {
        const obraItems = items.filter(item => item.id_obra === obra.id);
        return (
          <Card key={obra.id}>
            <CardHeader>
              <CardTitle>{obra.nombre}</CardTitle>
              <p className="text-sm text-slate-400">
                {obraItems.length} item{obraItems.length !== 1 ? 's' : ''}
              </p>
            </CardHeader>
            <CardContent>
              {obraItems.length === 0 ? (
                <p className="text-slate-400 text-center py-4">
                  No hay items agregados para esta obra
                </p>
              ) : (
                <div className="space-y-2">
                  {obraItems.filter(item => !item.id_item_padre).map(item => renderItem(item))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      

      {/* Modal para agregar especialidad */}
      <Dialog open={showAddEspecialidadModal} onOpenChange={setShowAddEspecialidadModal}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Especialidad</DialogTitle>
            <DialogDescription className="text-slate-400">
              Completa los datos para agregar una nueva especialidad al sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddEspecialidad(); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-especialidad-nombre">Nombre *</Label>
                <Input
                  id="new-especialidad-nombre"
                  value={newEspecialidad.nombre}
                  onChange={(e) => setNewEspecialidad({ ...newEspecialidad, nombre: e.target.value })}
                  placeholder="Nombre de la especialidad"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-especialidad-desc">Descripción</Label>
                <Input
                  id="new-especialidad-desc"
                  value={newEspecialidad.descripcion}
                  onChange={(e) => setNewEspecialidad({ ...newEspecialidad, descripcion: e.target.value })}
                  placeholder="Descripción opcional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowAddEspecialidadModal(false)} 
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!newEspecialidad.nombre.trim()}
                className="bg-sky-600 hover:bg-sky-700"
              >
                Agregar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      {/* AlertDialog para validación */}
      <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Obras sin items
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              {validationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowValidationAlert(false)}
              className="bg-sky-600 hover:bg-sky-700"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog de éxito */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              ¡Guardado exitoso!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowSuccessAlert(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemsStep;
