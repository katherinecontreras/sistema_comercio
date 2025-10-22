import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';
import { useCatalogos } from '@/hooks';
import { addEspecialidad } from '@/actions';
import { AddEspecialidadModal, AddUnidadModal } from '@/components/modals';
import { InfoDialog, Toast } from '@/components/notifications';
import { ItemObra } from '@/store/obra';
import { Especialidad } from '@/store/especialidad';
import { Unidad } from '@/store/unidad';
import ItemForm from '@/components/forms/wizard/ItemsForm';

const ItemsStep: React.FC = () => {
  const { wizard, setItems } = useAppStore();
  const { loadEspecialidades, loadUnidades, handleAddUnidad } = useCatalogos();
  
  const [items, setItemsLocal] = useState<ItemObra[]>(wizard.items);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedObra, setSelectedObra] = useState<string>('');
  
  // Estados para especialidades y unidades
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  
  // Estados para modales
  const [showAddEspecialidadModal, setShowAddEspecialidadModal] = useState(false);
  const [showAddUnidadModal, setShowAddUnidadModal] = useState(false);
  
  // Estado para alertas y toast
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [obrasWithoutItems, setObrasWithoutItems] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Estados para inputs de autocompletado
  const [especialidadInput, setEspecialidadInput] = useState('');
  const [showEspecialidadesSuggestions, setShowEspecialidadesSuggestions] = useState(false);
  const [selectedEspecialidadIndex, setSelectedEspecialidadIndex] = useState(0);

  const [unidadInput, setUnidadInput] = useState('');
  const [showUnidadesSuggestions, setShowUnidadesSuggestions] = useState(false);
  const [selectedUnidadIndex, setSelectedUnidadIndex] = useState(0);

  // Estados para creación rápida
  const [newEspecialidad, setNewEspecialidad] = useState<{ nombre: string; descripcion: string }>({ nombre: '', descripcion: '' });
  const [newUnidad, setNewUnidad] = useState<{ nombre: string; simbolo: string; descripcion: string }>({ nombre: '', simbolo: '', descripcion: '' });



  const [formData, setFormData] = useState({
    codigo: '',
    descripcion_tarea: '',
    especialidad: '',
    unidad: '',
    cantidad: 1
  });

  // Cargar especialidades y unidades desde la API
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [especialidadesData, unidadesData] = await Promise.all([
          loadEspecialidades(),
          loadUnidades()
        ]);
        setEspecialidades(especialidadesData);
        setUnidades(unidadesData);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
      }
    };
    cargarCatalogos();
  }, [loadEspecialidades, loadUnidades]);

  const handleAddEspecialidad = async (data: { nombre: string; descripcion?: string }) => {
    try {
      const response = await addEspecialidad(data);
      
      if (response) {
        // Recargar especialidades
        const especialidadesData = await loadEspecialidades();
        setEspecialidades(especialidadesData);
        
        setFormData({ ...formData, especialidad: response.nombre });
        
        setToastMessage(`Especialidad "${response.nombre}" creada exitosamente`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Error creando especialidad:', error);
      setToastMessage('Error al crear especialidad');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleAddUnidadLocal = async (data: { nombre: string; simbolo: string; descripcion?: string }) => {
    try {
      const response = await handleAddUnidad(data);
      
      if (response) {
        // Recargar unidades
        const unidadesData = await loadUnidades();
        setUnidades(unidadesData);
        
        setFormData({ ...formData, unidad: response.nombre });
        
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
    
    // Buscar IDs de especialidad y unidad
    const especialidadObj = especialidades.find(e => e.nombre === formData.especialidad);
    const unidadObj = unidades.find(u => u.nombre === formData.unidad);
    
    const newItem: ItemObra = {
      id: generateTempId(),
      id_obra: selectedObra,
      id_item_padre: parentId || null,
      codigo: formData.codigo.trim() || '',
      descripcion_tarea: formData.descripcion_tarea.trim(),
      especialidad: formData.especialidad.trim() || '',
      unidad: formData.unidad.trim() || '',
      id_especialidad: especialidadObj?.id_especialidad,
      id_unidad: unidadObj?.id_unidad,
      cantidad: formData.cantidad,
      precio_unitario: 0,
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
    setShowEspecialidadesSuggestions(false);
    setShowUnidadesSuggestions(false);
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
        <ItemForm
          selectedObra={selectedObra}
          editingItem={editingItem}
          formData={formData}
          setFormData={setFormData}
          handleAddItem={handleAddItem}
          handleUpdateItem={handleUpdateItem}
          setEditingItem={setEditingItem}
          especialidadInput={especialidadInput}
          handleEspecialidadChange={handleEspecialidadChange}
          handleEspecialidadKeyDown={handleEspecialidadKeyDown}
          handleSelectEspecialidad={handleSelectEspecialidad}
          filteredEspecialidades={filteredEspecialidades}
          showEspecialidadesSuggestions={showEspecialidadesSuggestions}
          setShowEspecialidadesSuggestions={setShowEspecialidadesSuggestions}
          selectedEspecialidadIndex={selectedEspecialidadIndex}
          especialidadExists={especialidadExists}
          setNewEspecialidad={setNewEspecialidad}
          setShowAddEspecialidadModal={setShowAddEspecialidadModal}
          unidadInput={unidadInput}
          handleUnidadChange={handleUnidadChange}
          handleUnidadKeyDown={handleUnidadKeyDown}
          handleSelectUnidad={handleSelectUnidad}
          filteredUnidades={filteredUnidades}
          showUnidadesSuggestions={showUnidadesSuggestions}
          setShowUnidadesSuggestions={setShowUnidadesSuggestions}
          selectedUnidadIndex={selectedUnidadIndex}
          unidadExists={unidadExists}
          setNewUnidad={setNewUnidad}
          setShowAddUnidadModal={setShowAddUnidadModal}
        />
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
      <AddEspecialidadModal
        open={showAddEspecialidadModal}
        onClose={() => setShowAddEspecialidadModal(false)}
        onAdd={handleAddEspecialidad}
        initialNombre={especialidadInput}
      />

      {/* Modal para agregar unidad */}
      <AddUnidadModal
        open={showAddUnidadModal}
        onClose={() => setShowAddUnidadModal(false)}
        onAdd={handleAddUnidadLocal}
        initialNombre={unidadInput}
      />

      {/* AlertDialog para validación */}
      <InfoDialog
      open={showValidationAlert} 
      onClose={() => setShowValidationAlert(false)}
      title={<span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Obras sin items</span>}
      description={validationMessage} 
      actionLabel="Entendido"
      variant="primary"
    />

      {/* Toast de notificaciones */}
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ItemsStep;
