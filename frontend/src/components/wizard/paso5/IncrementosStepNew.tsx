import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Check, Percent } from 'lucide-react';
import { useAppStore } from '@/store/app';
// Los tipos se importan desde el store global

const IncrementosStepNew: React.FC = () => {
  const { wizard } = useAppStore();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  const selectedItem = wizard.items.find(item => item.id === selectedItemId);
  const itemIncrementos = wizard.incrementos.filter(inc => inc.id_item_obra === selectedItemId);

  const getObraName = (obraId: string) => {
    const obra = wizard.obras.find(o => o.id === obraId);
    return obra?.nombre || 'Obra no encontrada';
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowForm(false);
  };

  const handleAddIncremento = () => {
    if (selectedItem) {
      setShowForm(true);
    }
  };

  const getTotalIncrementos = () => {
    return itemIncrementos.reduce((sum, inc) => sum + inc.porcentaje, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Aplicar Incrementos</h3>
          <p className="text-muted-foreground">Agrega incrementos porcentuales a los items de obra (opcional)</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {wizard.incrementos.length} incremento{wizard.incrementos.length !== 1 ? 's' : ''} aplicado{wizard.incrementos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Resumen de Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wizard.items.map((item) => {
              const itemIncs = wizard.incrementos.filter(inc => inc.id_item_obra === item.id);
              const totalIncs = itemIncs.reduce((sum, inc) => sum + inc.porcentaje, 0);
              const isSelected = selectedItemId === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemSelect(item.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-sky-600/20 border-sky-500' 
                      : 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">
                          {item.codigo && `${item.codigo} - `}{item.descripcion_tarea}
                        </h4>
                        {isSelected && <Check className="h-4 w-4 text-sky-400" />}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        📍 {getObraName(item.id_obra)}
                        {item.especialidad && ` • ${item.especialidad}`}
                        {item.unidad && ` • ${item.unidad}`}
                        {item.cantidad > 0 && ` • Cantidad: ${item.cantidad}`}
                        {item.precio_unitario > 0 && ` • Precio: $${item.precio_unitario}`}
                      </div>
                      {itemIncs.length > 0 && (
                        <div className="text-sm text-green-400 mt-1">
                          📊 {itemIncs.length} incremento{itemIncs.length !== 1 ? 's' : ''} • Total: {totalIncs.toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Incrementos */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Incrementos para: {selectedItem.codigo || selectedItem.descripcion_tarea}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showForm ? (
              <div className="space-y-4">
                {/* Aquí iría el formulario de incrementos */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <p className="text-slate-400">Formulario de incrementos aquí...</p>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => setShowForm(false)}
                      variant="outline"
                      className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => setShowForm(false)}
                      className="bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lista de incrementos existentes */}
                {itemIncrementos.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Incrementos Aplicados:</h4>
                    {itemIncrementos.map((incremento) => (
                      <div key={incremento.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
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
                        </div>
                      </div>
                    ))}
                    <div className="text-right">
                      <span className="text-sm text-slate-400">Total incrementos:</span>
                      <span className="ml-2 font-bold text-lg text-green-400">
                        {getTotalIncrementos().toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Percent className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No hay incrementos aplicados a este item</p>
                  </div>
                )}

                {/* Botón para agregar incremento */}
                <div className="flex justify-center">
                  <Button 
                    onClick={handleAddIncremento}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    <Percent className="h-4 w-4 mr-2" />
                    {itemIncrementos.length > 0 ? 'Agregar Otro Incremento' : 'Agregar Incremento'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen general */}
      {wizard.incrementos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Incrementos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{wizard.incrementos.length}</div>
                <div className="text-sm text-blue-500">Incrementos Totales</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(wizard.incrementos.map(inc => inc.id_item_obra)).size}
                </div>
                <div className="text-sm text-green-500">Items con Incrementos</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {wizard.incrementos.reduce((sum, inc) => sum + inc.porcentaje, 0).toFixed(1)}%
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

export default IncrementosStepNew;
