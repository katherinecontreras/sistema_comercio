import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { useObraStore } from '@/store/obra';

interface PartidaOption {
  id: number;
  nombre: string;
  tipo: 'partida' | 'subpartida';
  parentId?: number;
}

interface IncrementData {
  concepto: string;
  descripcion: string;
  tipo_incremento: 'porcentaje' | 'monto_fijo';
  valor: number;
  porcentaje: number;
  monto_calculado: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (increment: any) => void;
}

const AddIncrementModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const { partidas } = useObraStore();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedItem, setSelectedItem] = useState<PartidaOption | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<IncrementData>({
    concepto: '',
    descripcion: '',
    tipo_incremento: 'porcentaje',
    valor: 0,
    porcentaje: 0,
    monto_calculado: 0
  });

  // Obtener opciones de partidas y subpartidas
  const getPartidaOptions = (): PartidaOption[] => {
    const options: PartidaOption[] = [];
    
    partidas.forEach(partida => {
      if (partida.tiene_subpartidas && partida.subpartidas) {
        // Si tiene subpartidas, agregar las subpartidas
        partida.subpartidas.forEach(subpartida => {
          options.push({
            id: subpartida.id_subpartida!,
            nombre: `${partida.nombre_partida} - ${subpartida.descripcion_tarea}`,
            tipo: 'subpartida',
            parentId: partida.id_partida
          });
        });
      } else {
        // Si no tiene subpartidas, agregar la partida directamente
        options.push({
          id: partida.id_partida!,
          nombre: partida.nombre_partida,
          tipo: 'partida'
        });
      }
    });
    
    return options;
  };

  const partidaOptions = getPartidaOptions();

  // Calcular monto calculado cuando cambian los valores
  useEffect(() => {
    if (selectedItem && formData.tipo_incremento === 'porcentaje' && formData.porcentaje > 0) {
      // Calcular el costo total del item seleccionado
      let costoTotal = 0;
      
      if (selectedItem.tipo === 'partida') {
        const partida = partidas.find(p => p.id_partida === selectedItem.id);
        console.log('AddIncrementModal: Calculando costo para partida:', partida);
        if (partida?.planillas) {
          partida.planillas.forEach(planilla => {
            console.log('AddIncrementModal: Planilla:', planilla);
            if (planilla.recursos) {
              planilla.recursos.forEach(recurso => {
                const cantidad = parseFloat(recurso.cantidad) || 0;
                const costoUnitario = parseFloat(recurso.costo_unitario_predeterminado) || 0;
                const subtotal = cantidad * costoUnitario;
                console.log('AddIncrementModal: Recurso:', recurso.descripcion, 'Cantidad:', cantidad, 'Costo:', costoUnitario, 'Subtotal:', subtotal);
                costoTotal += subtotal;
              });
            }
          });
        }
      } else if (selectedItem.tipo === 'subpartida') {
        const partida = partidas.find(p => p.id_partida === selectedItem.parentId);
        const subpartida = partida?.subpartidas?.find(sp => sp.id_subpartida === selectedItem.id);
        console.log('AddIncrementModal: Calculando costo para subpartida:', subpartida);
        if (subpartida?.planillas) {
          subpartida.planillas.forEach(planilla => {
            console.log('AddIncrementModal: Planilla subpartida:', planilla);
            if (planilla.recursos) {
              planilla.recursos.forEach(recurso => {
                const cantidad = parseFloat(recurso.cantidad) || 0;
                const costoUnitario = parseFloat(recurso.costo_unitario_predeterminado) || 0;
                const subtotal = cantidad * costoUnitario;
                console.log('AddIncrementModal: Recurso subpartida:', recurso.descripcion, 'Cantidad:', cantidad, 'Costo:', costoUnitario, 'Subtotal:', subtotal);
                costoTotal += subtotal;
              });
            }
          });
        }
      }
      
      console.log('AddIncrementModal: Costo total calculado:', costoTotal);
      const montoCalculado = (costoTotal * formData.porcentaje) / 100;
      console.log('AddIncrementModal: Monto calculado:', montoCalculado, 'Porcentaje:', formData.porcentaje);
      setFormData(prev => ({ ...prev, monto_calculado: montoCalculado }));
    } else if (formData.tipo_incremento === 'monto_fijo') {
      setFormData(prev => ({ ...prev, monto_calculado: formData.valor }));
    }
  }, [selectedItem, formData.tipo_incremento, formData.porcentaje, formData.valor, partidas]);

  const handleStep1Continue = () => {
    if (selectedItem) {
      setStep('form');
    }
  };

  const handleStep2Back = () => {
    setStep('select');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const incrementData = {
        id_incremento: Date.now(), // ID temporal
        id_partida: selectedItem?.tipo === 'partida' ? selectedItem.id : null,
        id_subpartida: selectedItem?.tipo === 'subpartida' ? selectedItem.id : null,
        concepto: formData.concepto,
        descripcion: formData.descripcion,
        tipo_incremento: formData.tipo_incremento,
        valor: formData.valor,
        porcentaje: formData.porcentaje,
        monto_calculado: formData.monto_calculado
      };
      
      onSave(incrementData);
      onClose();
    } catch (error) {
      console.error('Error guardando incremento:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('select');
    setSelectedItem(null);
    setFormData({
      concepto: '',
      descripcion: '',
      tipo_incremento: 'porcentaje',
      valor: 0,
      porcentaje: 0,
      monto_calculado: 0
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {step === 'select' ? 'Seleccionar Item' : 'Agregar Incremento'}
          </h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {step === 'select' ? (
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">
                Selecciona la partida o subpartida para agregar el incremento:
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {partidaOptions.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">
                    No hay partidas o subpartidas disponibles
                  </p>
                ) : (
                  partidaOptions.map(option => (
                    <Card
                      key={`${option.tipo}-${option.id}`}
                      className={`cursor-pointer transition-colors ${
                        selectedItem?.id === option.id && selectedItem?.tipo === option.tipo
                          ? 'bg-sky-600 border-sky-500'
                          : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                      }`}
                      onClick={() => setSelectedItem(option)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{option.nombre}</p>
                            <p className="text-slate-300 text-sm">
                              {option.tipo === 'partida' ? 'Partida' : 'SubPartida'}
                            </p>
                          </div>
                          {selectedItem?.id === option.id && selectedItem?.tipo === option.tipo && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStep1Continue}
                disabled={!selectedItem}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                type="button"
                onClick={handleStep2Back}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <p className="text-slate-300">
                Agregando incremento a: <span className="text-white font-medium">{selectedItem?.nombre}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Concepto *</Label>
                <Input
                  value={formData.concepto}
                  onChange={(e) => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
                  placeholder="Ej: Gastos generales, Utilidad, etc."
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div>
                <Label className="text-white">Tipo de Incremento *</Label>
                <Select
                  value={formData.tipo_incremento}
                  onValueChange={(value: 'porcentaje' | 'monto_fijo') => 
                    setFormData(prev => ({ ...prev, tipo_incremento: value }))
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentaje">Porcentaje</SelectItem>
                    <SelectItem value="monto_fijo">Monto Fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción detallada del incremento..."
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.tipo_incremento === 'porcentaje' ? (
                <div>
                  <Label className="text-white">Porcentaje (%) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.porcentaje}
                    onChange={(e) => setFormData(prev => ({ ...prev, porcentaje: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-white">Monto Fijo ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
              )}

              <div>
                <Label className="text-white">Monto Calculado ($)</Label>
                <Input
                  value={formData.monto_calculado.toFixed(2)}
                  readOnly
                  className="bg-slate-600 border-slate-500 text-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                onClick={handleStep2Back}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.concepto || (formData.tipo_incremento === 'porcentaje' ? !formData.porcentaje : !formData.valor)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Agregar Incremento'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddIncrementModal;
