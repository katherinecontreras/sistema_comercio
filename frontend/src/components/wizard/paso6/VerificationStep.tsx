import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Check } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { useNavigate } from 'react-router-dom';
import FinalizeModal from '@/components/modals/FinalizeModal';
import { FadeIn } from '@/components/animations';

const VerificationStep: React.FC = () => {
  const { wizard } = useAppStore();
  const navigate = useNavigate();
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // Calcular totales
  const calculateItemTotal = (itemId: string) => {
    const itemCostos = wizard.costos.filter(c => c.id_item_obra === itemId);
    const itemIncrementos = wizard.incrementos.filter(i => i.id_item_obra === itemId);
    
    const subtotalCostos = itemCostos.reduce((sum, c) => sum + c.total_linea, 0);
    const totalIncrementos = itemIncrementos.reduce((sum, i) => {
      // Calcular incremento como porcentaje
      return sum + (subtotalCostos * i.porcentaje / 100);
    }, 0);
    
    return {
      subtotalCostos,
      totalIncrementos,
      total: subtotalCostos + totalIncrementos
    };
  };

  const calculateGrandTotal = () => {
    const allItems = wizard.items;
    return allItems.reduce((sum, item) => {
      const totals = calculateItemTotal(item.id);
      return sum + totals.total;
    }, 0);
  };

  const handleFinalizeSuccess = () => {
    setShowFinalizeModal(false);
    navigate('/dashboard');
  };

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Datos Generales */}
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              Datos Generales
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Edit2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Nombre del Proyecto</Label>
                <Input 
                  value={wizard.quoteFormData?.nombre_proyecto || 'Sin nombre'} 
                  readOnly 
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Moneda</Label>
                <Input 
                  value="USD" 
                  readOnly 
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Fecha Creación</Label>
                <Input 
                  value={wizard.quoteFormData?.fecha_creacion || '-'} 
                  readOnly 
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Estado</Label>
                <Input 
                  value="Borrador" 
                  readOnly 
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Obras */}
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Obras ({wizard.obras.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wizard.obras.map((obra) => (
                <div key={obra.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{obra.nombre}</h4>
                      {obra.descripcion && (
                        <p className="text-sm text-slate-400">{obra.descripcion}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Items de esta obra */}
                  <div className="mt-4 space-y-2">
                    {wizard.items.filter(item => item.id_obra === obra.id).map((item) => {
                      const totals = calculateItemTotal(item.id);
                      return (
                        <div key={item.id} className="bg-slate-600/50 p-3 rounded">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {item.codigo && (
                                  <span className="text-xs font-mono bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-600/30">
                                    {item.codigo}
                                  </span>
                                )}
                                <span className="font-medium text-white">{item.descripcion_tarea}</span>
                              </div>
                              <div className="text-sm text-slate-400 mt-1">
                                {item.cantidad} unidades
                              </div>
                              
                              {/* Costos del item */}
                              <div className="mt-2 space-y-1">
                                {wizard.costos.filter(c => c.id_item_obra === item.id).map((costo) => (
                                  <div key={costo.id} className="text-sm bg-slate-700 p-2 rounded border border-slate-600">
                                    <div className="flex justify-between text-slate-200">
                                      <span>{costo.recurso?.descripcion || 'Recurso'}</span>
                                      <span className="font-medium">
                                        {costo.cantidad} × ${costo.precio_unitario_aplicado.toFixed(2)} = ${costo.total_linea.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Incrementos del item */}
                              {wizard.incrementos.filter(i => i.id_item_obra === item.id).length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {wizard.incrementos.filter(i => i.id_item_obra === item.id).map((inc) => (
                                    <div key={inc.id} className="text-sm bg-amber-900/30 p-2 rounded border border-amber-600/30">
                                      <div className="flex justify-between text-amber-200">
                                        <span>{inc.descripcion}</span>
                                        <span className="font-medium">{inc.porcentaje}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-xs text-slate-400">Subtotal: ${totals.subtotalCostos.toFixed(2)}</div>
                              {totals.totalIncrementos > 0 && (
                                <div className="text-xs text-amber-400">Incrementos: +${totals.totalIncrementos.toFixed(2)}</div>
                              )}
                              <div className="font-bold text-lg text-green-400">
                                ${totals.total.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Totales */}
        <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-600/50">
          <CardHeader>
            <CardTitle className="text-white">Resumen de Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
                <div className="text-3xl font-bold text-blue-400">{wizard.obras.length}</div>
                <div className="text-sm text-blue-300 mt-1">Obras</div>
              </div>
              <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-600/30">
                <div className="text-3xl font-bold text-purple-400">{wizard.items.length}</div>
                <div className="text-sm text-purple-300 mt-1">Items</div>
              </div>
              <div className="p-4 bg-amber-900/30 rounded-lg border border-amber-600/30">
                <div className="text-3xl font-bold text-amber-400">{wizard.costos.length}</div>
                <div className="text-sm text-amber-300 mt-1">Costos</div>
              </div>
              <div className="p-4 bg-green-900/30 rounded-lg border border-green-600/30">
                <div className="text-3xl font-bold text-green-400">${calculateGrandTotal().toFixed(2)}</div>
                <div className="text-sm text-green-300 mt-1">Total General</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón de Finalizar */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setShowFinalizeModal(true)}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
          >
            <Check className="h-6 w-6 mr-2" />
            Finalizar y Guardar Cotización
          </Button>
        </div>

        {/* Modal de finalización */}
        <FinalizeModal
          isOpen={showFinalizeModal}
          onClose={() => setShowFinalizeModal(false)}
          onSuccess={handleFinalizeSuccess}
        />
      </div>
    </FadeIn>
  );
};

export default VerificationStep;

