import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, Percent } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';

interface Incremento {
  id: string;
  id_item_obra: string;
  concepto: string;
  descripcion: string;
  tipo_incremento: 'porcentaje' | 'monto_fijo';
  valor: number;
  porcentaje: number;
  monto_calculado: number;
}

const IncrementosStep: React.FC = () => {
  const { wizard, setIncrementos } = useAppStore();
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [incrementos, setIncrementosLocal] = useState<Incremento[]>(wizard.incrementos);
  const [editingIncremento, setEditingIncremento] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    concepto: '',
    descripcion: '',
    tipo_incremento: 'porcentaje' as 'porcentaje' | 'monto_fijo',
    valor: 0
  });

  // Obtener items de obra para selección
  const itemsObra = wizard.items;

  // Agrupar incrementos por item
  const incrementosPorItem = incrementos.reduce((acc, incremento) => {
    if (!acc[incremento.id_item_obra]) {
      acc[incremento.id_item_obra] = [];
    }
    acc[incremento.id_item_obra].push(incremento);
    return acc;
  }, {} as Record<string, Incremento[]>);

  const handleAddIncremento = () => {
    if (!selectedItem || !formData.concepto.trim() || formData.valor <= 0) return;

    // Calcular monto según el item seleccionado
    const item = wizard.items.find(i => i.id === selectedItem);
    const costosItem = wizard.costos.filter(c => c.id_item_obra === selectedItem);
    const subtotalItem = costosItem.reduce((sum, c) => sum + c.total_linea, 0);
    
    const monto_calculado = formData.tipo_incremento === 'porcentaje'
      ? (subtotalItem * formData.valor) / 100
      : formData.valor;

    const newIncremento: Incremento = {
      id: generateTempId(),
      id_item_obra: selectedItem,
      concepto: formData.concepto.trim(),
      descripcion: formData.descripcion.trim(),
      tipo_incremento: formData.tipo_incremento,
      valor: formData.valor,
      porcentaje: formData.tipo_incremento === 'porcentaje' ? formData.valor : 0,
      monto_calculado
    };

    const updatedIncrementos = [...incrementos, newIncremento];
    setIncrementosLocal(updatedIncrementos);
    setIncrementos(updatedIncrementos);
    setFormData({ concepto: '', descripcion: '', tipo_incremento: 'porcentaje', valor: 0 });
  };

  const handleEditIncremento = (id: string) => {
    const incremento = incrementos.find(i => i.id === id);
    if (incremento) {
      setFormData({
        concepto: incremento.concepto,
        descripcion: incremento.descripcion || '',
        tipo_incremento: incremento.tipo_incremento,
        valor: incremento.valor
      });
      setEditingIncremento(id);
    }
  };

  const handleUpdateIncremento = () => {
    if (editingIncremento && formData.concepto.trim() && formData.valor > 0) {
      const costosItem = wizard.costos.filter(c => c.id_item_obra === selectedItem);
      const subtotalItem = costosItem.reduce((sum, c) => sum + c.total_linea, 0);
      
      const monto_calculado = formData.tipo_incremento === 'porcentaje'
        ? (subtotalItem * formData.valor) / 100
        : formData.valor;

      const updatedIncrementos = incrementos.map(inc => 
        inc.id === editingIncremento 
          ? { 
              ...inc, 
              concepto: formData.concepto.trim(),
              descripcion: formData.descripcion.trim(),
              tipo_incremento: formData.tipo_incremento,
              valor: formData.valor,
              porcentaje: formData.tipo_incremento === 'porcentaje' ? formData.valor : 0,
              monto_calculado
            }
          : inc
      );
      setIncrementosLocal(updatedIncrementos);
      setIncrementos(updatedIncrementos);
      setFormData({ concepto: '', descripcion: '', tipo_incremento: 'porcentaje', valor: 0 });
      setEditingIncremento(null);
    }
  };

  const handleDeleteIncremento = (id: string) => {
    const updatedIncrementos = incrementos.filter(inc => inc.id !== id);
    setIncrementosLocal(updatedIncrementos);
    setIncrementos(updatedIncrementos);
  };

  const handleContinue = () => {
    setStep('verificacion');
  };

  const handleBack = () => {
    setStep('costos');
  };

  // Calcular total de incrementos por item
  const getTotalIncrementos = (itemId: string) => {
    const itemIncrementos = incrementosPorItem[itemId] || [];
    return itemIncrementos.reduce((sum, inc) => sum + inc.porcentaje, 0);
  };

  return (
    <div className="space-y-6">
      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          ← Anterior
        </Button>
        <Button onClick={handleContinue}>
          Continuar →
        </Button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Aplicar Incrementos</h3>
          <p className="text-muted-foreground">Agrega incrementos porcentuales a los items de obra (opcional)</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {incrementos.length} incremento{incrementos.length !== 1 ? 's' : ''} aplicado{incrementos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Selector de Item */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Item de Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="item">Item de Obra</Label>
            <select
              id="item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecciona un item</option>
              {itemsObra.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.codigo && `${item.codigo} - `}{item.descripcion_tarea}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Formulario para agregar/editar incremento */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              {editingIncremento ? 'Editar Incremento' : 'Agregar Incremento'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="concepto" className="text-slate-300">Concepto *</Label>
                <Input
                  id="concepto"
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  placeholder="Ej: IVA, Gastos Generales, etc."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-slate-300">Tipo de Incremento *</Label>
                <select
                  id="tipo"
                  value={formData.tipo_incremento}
                  onChange={(e) => setFormData({ ...formData, tipo_incremento: e.target.value as 'porcentaje' | 'monto_fijo' })}
                  className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto_fijo">Monto Fijo ($)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor" className="text-slate-300">
                  {formData.tipo_incremento === 'porcentaje' ? 'Porcentaje (%)' : 'Monto ($)'} *
                </Label>
                <Input
                  id="valor"
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max={formData.tipo_incremento === 'porcentaje' ? '1000' : undefined}
                  step="0.01"
                  placeholder={formData.tipo_incremento === 'porcentaje' ? 'Ej: 15.5' : 'Ej: 5000'}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-slate-300">Descripción Adicional</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles adicionales (opcional)"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {editingIncremento ? (
                <>
                  <Button 
                    onClick={handleUpdateIncremento} 
                    disabled={!formData.concepto.trim() || formData.valor <= 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingIncremento(null);
                      setFormData({ concepto: '', descripcion: '', tipo_incremento: 'porcentaje', valor: 0 });
                    }}
                    className="bg-slate-700 hover:bg-slate-600 border-slate-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleAddIncremento} 
                  disabled={!formData.concepto.trim() || formData.valor <= 0}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Incremento
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de incrementos por item */}
      {Object.keys(incrementosPorItem).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Incrementos Aplicados por Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(incrementosPorItem).map(([itemId, itemIncrementos]) => {
                const item = itemsObra.find(i => i.id === itemId);
                const totalPorcentaje = getTotalIncrementos(itemId);
                
                return (
                  <div key={itemId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        {item?.codigo && `${item.codigo} - `}{item?.descripcion_tarea}
                      </h4>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Total incrementos:</span>
                        <span className="ml-2 font-bold text-lg">{totalPorcentaje.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {itemIncrementos.map((incremento) => (
                        <div key={incremento.id} className="flex items-center justify-between bg-slate-700 p-3 rounded border border-slate-600">
                          <div className="flex-1">
                            <div className="font-medium text-white">{incremento.concepto}</div>
                            {incremento.descripcion && (
                              <div className="text-sm text-slate-400">{incremento.descripcion}</div>
                            )}
                            <div className="text-sm text-sky-400 mt-1">
                              {incremento.tipo_incremento === 'porcentaje' 
                                ? `${incremento.valor}%` 
                                : `$${incremento.valor.toFixed(2)}`
                              } = ${incremento.monto_calculado.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditIncremento(incremento.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIncremento(incremento.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen general */}
      {incrementos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Incrementos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{incrementos.length}</div>
                <div className="text-sm text-blue-500">Incrementos Totales</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(incrementosPorItem).length}
                </div>
                <div className="text-sm text-green-500">Items con Incrementos</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {incrementos.reduce((sum, inc) => sum + inc.porcentaje, 0).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-500">Suma Total de Porcentajes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncrementosStep;
