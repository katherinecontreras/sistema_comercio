import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Save, X, Check, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { useNavigate } from 'react-router-dom';
import FinalizeModal from '@/components/modals/FinalizeModal';

const VerificationPage: React.FC = () => {
  const { wizard, setStep } = useAppStore();
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingObra, setEditingObra] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // Datos de la cotización
  const quoteData = {
    nombre_proyecto: 'Proyecto de Ejemplo',
    fecha_creacion: new Date().toISOString().split('T')[0],
    cliente: 'Cliente Ejemplo S.A.',
    estado: 'Borrador'
  };

  // Calcular totales
  const calculateItemTotal = (itemId: string) => {
    const itemCostos = wizard.costos.filter(c => c.id_item_obra === itemId);
    const itemIncrementos = wizard.incrementos.filter(i => i.id_item_obra === itemId);
    
    const subtotalCostos = itemCostos.reduce((sum, c) => sum + c.total_linea, 0);
    const totalIncrementos = itemIncrementos.reduce((sum, i) => sum + (subtotalCostos * i.porcentaje / 100), 0);
    
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

  const handleEditItem = (itemId: string) => {
    setEditingItem(itemId);
  };

  const handleEditObra = (obraId: string) => {
    setEditingObra(obraId);
  };

  const handleDeleteQuote = () => {
    // Lógica para eliminar cotización completa
    setShowDeleteConfirm(false);
    navigate('/seleccionar-cotizacion');
  };

  const handleFinalize = () => {
    setShowFinalizeModal(true);
  };

  const handleFinalizeSuccess = () => {
    setShowFinalizeModal(false);
    navigate('/dashboard');
  };

  const handleBack = () => {
    setStep('incrementos');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Verificación de Cotización</h2>
              <p className="text-muted-foreground">Revisa y edita todos los datos antes de finalizar</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                ← Volver a Editar
              </Button>
              <Button onClick={handleFinalize} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Finalizar Cotización
              </Button>
            </div>
          </div>

          {/* Datos Generales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Datos Generales
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Proyecto</Label>
                  <Input value={quoteData.nombre_proyecto} readOnly />
                </div>
                <div>
                  <Label>Fecha de Creación</Label>
                  <Input value={quoteData.fecha_creacion} readOnly />
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Input value={quoteData.cliente} readOnly />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input value={quoteData.estado} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Obras */}
          <Card>
            <CardHeader>
              <CardTitle>Obras ({wizard.obras.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wizard.obras.map((obra) => (
                  <div key={obra.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{obra.nombre}</h4>
                        {obra.descripcion && (
                          <p className="text-sm text-gray-600">{obra.descripcion}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditObra(obra.id)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Items de esta obra */}
                    <div className="mt-4 space-y-2">
                      {wizard.items.filter(item => item.id_obra === obra.id).map((item) => {
                        const totals = calculateItemTotal(item.id);
                        return (
                          <div key={item.id} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center justify-between">
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
                                
                                {/* Costos del item */}
                                <div className="mt-2 space-y-1">
                                  {wizard.costos.filter(c => c.id_item_obra === item.id).map((costo) => (
                                    <div key={costo.id} className="text-sm bg-white p-2 rounded border">
                                      <div className="flex justify-between">
                                        <span>{costo.recurso.descripcion}</span>
                                        <span className="font-medium">
                                          {costo.cantidad} {costo.recurso.unidad} × ${costo.precio_unitario_aplicado} = ${costo.total_linea.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Incrementos del item */}
                                {wizard.incrementos.filter(i => i.id_item_obra === item.id).length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {wizard.incrementos.filter(i => i.id_item_obra === item.id).map((inc) => (
                                      <div key={inc.id} className="text-sm bg-yellow-50 p-2 rounded border">
                                        <div className="flex justify-between">
                                          <span>{inc.descripcion}</span>
                                          <span className="font-medium">{inc.porcentaje}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-right ml-4">
                                <div className="text-sm text-gray-500">Subtotal: ${totals.subtotalCostos.toFixed(2)}</div>
                                <div className="text-sm text-gray-500">Incrementos: ${totals.totalIncrementos.toFixed(2)}</div>
                                <div className="font-bold text-lg">Total: ${totals.total.toFixed(2)}</div>
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
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{wizard.items.length}</div>
                  <div className="text-sm text-blue-500">Items Totales</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{wizard.costos.length}</div>
                  <div className="text-sm text-green-500">Costos Asignados</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${calculateGrandTotal().toFixed(2)}</div>
                  <div className="text-sm text-purple-500">Total General</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Peligrosas */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Acciones Peligrosas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Cotización Completa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Modal de confirmación de eliminación */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Confirmar Eliminación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    ¿Estás seguro de que quieres eliminar esta cotización completa? 
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteQuote}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar Definitivamente
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modal de finalización */}
          <FinalizeModal
            isOpen={showFinalizeModal}
            onClose={() => setShowFinalizeModal(false)}
            onSuccess={handleFinalizeSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
