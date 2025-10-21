import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';
import { useCatalogos } from '@/hooks';
import { addEspecialidad } from '@/actions';
import { AddEspecialidadModal, AddUnidadModal } from '@/components/modals';
import { Toast } from '@/components/notifications';
import { ItemObra } from '@/store/obra';
import { Especialidad } from '@/store/especialidad';
import { Unidad } from '@/store/unidad';
import { ItemsHeader } from './ItemsHeader';
import { ItemsList } from './ItemsList';
import { ItemsValidation } from './ItemsValidation';

const ItemsStepRefactored: React.FC = () => {
  const { wizard, setItems } = useAppStore();
  const { loadEspecialidades, loadUnidades, handleAddUnidad } = useCatalogos();
  
  const [items, setItemsLocal] = useState<ItemObra[]>(wizard.items);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedObra, setSelectedObra] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  
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

  // Estados para creación rápida (no utilizados por ahora)
  // const [showQuickCreate, setShowQuickCreate] = useState(false);
  // const [quickCreateData, setQuickCreateData] = useState({
  //   descripcion: '',
  //   cantidad: 1,
  //   precio_unitario: 0
  // });

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [especialidadesData, unidadesData] = await Promise.all([
          loadEspecialidades(),
          loadUnidades()
        ]);
        setEspecialidades(especialidadesData);
        setUnidades(unidadesData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    loadData();
  }, [loadEspecialidades, loadUnidades]);

  // Sincronizar con el estado global
  useEffect(() => {
    setItemsLocal(wizard.items);
  }, [wizard.items]);

  // Validar que todas las obras tengan al menos un item
  useEffect(() => {
    const obrasConItems = new Set(items.map(item => item.id_obra));
    const todasLasObras = wizard.obras.map(obra => obra.id);
    const obrasSinItems = todasLasObras.filter(obraId => !obrasConItems.has(obraId));
    
    setObrasWithoutItems(obrasSinItems);
    
    if (obrasSinItems.length > 0) {
      setShowValidationAlert(true);
      setValidationMessage(`Hay ${obrasSinItems.length} obra(s) sin items. Debes agregar al menos un item a cada obra.`);
    } else {
      setShowValidationAlert(false);
    }
  }, [items, wizard.obras]);

  const handleAddItem = () => {
    if (wizard.obras.length === 0) {
      setToastMessage('Debes agregar al menos una obra primero');
      setToastType('error');
      setShowToast(true);
      return;
    }
    setSelectedObra(wizard.obras[0].id);
    setShowForm(true);
  };

  const handleEditItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setSelectedObra(item.id_obra);
      setEditingItem(id);
      setShowForm(true);
    }
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItemsLocal(updatedItems);
    setItems(updatedItems);
  };

  const handleToggleExpand = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, expanded: !item.expanded } : item
    );
    setItemsLocal(updatedItems);
    setItems(updatedItems);
  };

  const handleFormSubmit = (formData: any) => {
    if (editingItem) {
      // Actualizar item existente
      const updatedItems = items.map(item => 
        item.id === editingItem 
          ? { 
              ...item, 
              ...formData,
              id_especialidad: formData.especialidadId,
              id_unidad: formData.unidadId
            }
          : item
      );
      setItemsLocal(updatedItems);
      setItems(updatedItems);
    } else {
      // Crear nuevo item
      const newItem: ItemObra = {
        id: generateTempId(),
        id_obra: selectedObra,
        id_item_padre: null,
        codigo: formData.codigo,
        descripcion_tarea: formData.descripcion_tarea,
        especialidad: formData.especialidad,
        unidad: formData.unidad,
        id_especialidad: formData.especialidadId,
        id_unidad: formData.unidadId,
        cantidad: formData.cantidad,
        precio_unitario: formData.precio_unitario,
        nivel: 0,
        expanded: false
      };
      const updatedItems = [...items, newItem];
      setItemsLocal(updatedItems);
      setItems(updatedItems);
    }
    
    setShowForm(false);
    setEditingItem(null);
    setSelectedObra('');
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setSelectedObra('');
  };

  const handleAddEspecialidad = async (data: { nombre: string; descripcion?: string }) => {
    try {
      const nuevaEspecialidad = await addEspecialidad(data);
      setEspecialidades([...especialidades, nuevaEspecialidad]);
      setShowAddEspecialidadModal(false);
      setToastMessage('Especialidad agregada correctamente');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al agregar especialidad');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleAddUnidadLocal = async (data: { nombre: string; abreviatura: string; descripcion?: string }) => {
    try {
      const nuevaUnidad = await handleAddUnidad(data);
      setUnidades([...unidades, nuevaUnidad]);
      setShowAddUnidadModal(false);
      setToastMessage('Unidad agregada correctamente');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al agregar unidad');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ItemsHeader 
        itemsCount={items.length}
        onAddItem={handleAddItem}
        showAddButton={wizard.obras.length > 0}
      />

      {/* Validación */}
      <ItemsValidation
        showValidationAlert={showValidationAlert}
        validationMessage={validationMessage}
        obrasWithoutItems={obrasWithoutItems}
        obras={wizard.obras}
      />

      {/* Formulario */}
      {showForm && (
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'Editar Item' : 'Agregar Nuevo Item'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Obra
              </label>
              <select
                value={selectedObra}
                onChange={(e) => setSelectedObra(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="">Seleccionar obra</option>
                {wizard.obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleFormSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editingItem ? 'Actualizar' : 'Agregar'}
              </Button>
              <Button
                onClick={handleFormCancel}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de items */}
      {items.length > 0 && (
        <ItemsList
          items={items}
          obras={wizard.obras}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onToggleExpand={handleToggleExpand}
        />
      )}

      {/* Modales */}
      <AddEspecialidadModal
        open={showAddEspecialidadModal}
        onClose={() => setShowAddEspecialidadModal(false)}
        onAdd={handleAddEspecialidad}
      />

      <AddUnidadModal
        open={showAddUnidadModal}
        onClose={() => setShowAddUnidadModal(false)}
        onAdd={handleAddUnidadLocal}
      />

      {/* Toast */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
};

export default ItemsStepRefactored;
