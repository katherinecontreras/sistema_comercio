import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, ChevronRight, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';

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

const ItemsStep: React.FC = () => {
  const { wizard, setStep, setItems } = useAppStore();
  const [items, setItemsLocal] = useState<ItemObra[]>(wizard.items);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedObra, setSelectedObra] = useState<string>('');
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion_tarea: '',
    especialidad: '',
    unidad: '',
    cantidad: 1
  });

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
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    // Eliminar el item y todos sus hijos
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
      <div key={item.id} className="border-l-2 border-gray-200 ml-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
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
                  <span className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.codigo}
                  </span>
                )}
                <span className="font-medium">{item.descripcion_tarea}</span>
                {item.especialidad && (
                  <span className="text-sm text-gray-500">({item.especialidad})</span>
                )}
              </div>
              <div className="text-sm text-gray-600">
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
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditItem(item.id)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteItem(item.id)}
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

  const handleContinue = () => {
    if (items.length > 0) {
      setStep('costos');
    }
  };

  const handleBack = () => {
    setStep('obras');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Estructurar Items de Obra</h3>
          <p className="text-muted-foreground">Crea la estructura jerárquica de tareas para cada obra</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? 's' : ''} agregado{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Selector de obra */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="obra">Obra</Label>
            <select
              id="obra"
              value={selectedObra}
              onChange={(e) => setSelectedObra(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecciona una obra</option>
              {wizard.obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombre}
                </option>
              ))}
            </select>
          </div>
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
              <div className="space-y-2">
                <Label htmlFor="especialidad">Especialidad</Label>
                <Input
                  id="especialidad"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  placeholder="Ej: Obra Civil, Piping, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad</Label>
                <Input
                  id="unidad"
                  value={formData.unidad}
                  onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                  placeholder="Ej: m3, un, m, etc."
                />
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
              <p className="text-sm text-muted-foreground">
                {obraItems.length} item{obraItems.length !== 1 ? 's' : ''}
              </p>
            </CardHeader>
            <CardContent>
              {obraItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
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

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          ← Anterior
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={items.length === 0}
        >
          Continuar →
        </Button>
      </div>
    </div>
  );
};

export default ItemsStep;
