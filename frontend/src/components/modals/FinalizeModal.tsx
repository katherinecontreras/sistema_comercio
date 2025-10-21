import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Save, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { addCotizacion, addObras, addItems, addCostos, addIncrementos } from '@/actions';

interface FinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FinalizeModal: React.FC<FinalizeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { wizard, client } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFinalize = async () => {
    if (!client.selectedClientId) {
      setError('No hay cliente seleccionado');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 1. Crear la cotización con estado finalizada
      const cotizacionId = await addCotizacion({
        id_cliente: client.selectedClientId,
        codigo_proyecto: wizard.quoteFormData?.codigo_proyecto,
        nombre_proyecto: wizard.quoteFormData?.nombre_proyecto || 'Proyecto sin nombre',
        descripcion_proyecto: wizard.quoteFormData?.descripcion_proyecto,
        fecha_creacion: wizard.quoteFormData?.fecha_creacion || new Date().toISOString().split('T')[0],
        fecha_entrega: wizard.quoteFormData?.fecha_entrega,
        fecha_recepcion: wizard.quoteFormData?.fecha_recepcion,
        moneda: wizard.quoteFormData?.moneda || 'USD',
        estado: 'finalizada'
      });

      // 2. Crear las obras y obtener mapeo de IDs
      const obrasData = wizard.obras.map(obra => ({
        id_cotizacion: cotizacionId,
        nombre_obra: obra.nombre,
        descripcion: obra.descripcion,
        ubicacion: obra.ubicacion
      }));
      const idsObras = await addObras(obrasData);
      
      // Mapear IDs temporales a IDs reales
      const obraIdMap: { [tempId: string]: string } = {};
      wizard.obras.forEach((obra, index) => {
        obraIdMap[obra.id] = idsObras[index];
      });

      // 3. Crear los items de obra
      const itemsData = wizard.items.map(item => ({
        id_obra: obraIdMap[item.id_obra],
        codigo: item.codigo,
        descripcion_tarea: item.descripcion_tarea,
        id_especialidad: item.id_especialidad,
        id_unidad: item.id_unidad,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));
      const idsItems = await addItems(itemsData);
      
      // Mapear IDs temporales a IDs reales
      const itemIdMap: { [tempId: string]: string } = {};
      wizard.items.forEach((item, index) => {
        itemIdMap[item.id] = idsItems[index];
      });

      // 4. Crear los costos (item-recursos)
      const costosData = wizard.costos.map(costo => ({
        id_item_obra: itemIdMap[costo.id_item_obra],
        id_recurso: costo.id_recurso,
        cantidad: costo.cantidad,
        precio_unitario_aplicado: costo.precio_unitario_aplicado,
        total_linea: costo.total_linea
      }));
      await addCostos(costosData);

      // 5. Crear los incrementos
      const incrementosData = wizard.incrementos.map(incremento => ({
        id_item_obra: itemIdMap[incremento.id_item_obra],
        concepto: incremento.concepto,
        tipo_incremento: incremento.tipo_incremento,
        valor: incremento.valor,
        monto_calculado: incremento.monto_calculado,
        porcentaje: incremento.porcentaje,
        descripcion: incremento.descripcion
      }));
      await addIncrementos(incrementosData);

      // Limpiar wizard después de guardar
      const { setStep, setQuoteFormData, setObras, setItems, setCostos, setIncrementos } = useAppStore.getState();
      setStep('cliente');
      setQuoteFormData({
        codigo_proyecto: '',
        nombre_proyecto: '',
        descripcion_proyecto: '',
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_entrega: '',
        fecha_recepcion: '',
        moneda: 'USD'
      });
      setObras([]);
      setItems([]);
      setCostos([]);
      setIncrementos([]);
      
      onSuccess();
    } catch (err: any) {
      console.error('Error finalizando cotización:', err);
      setError(err.response?.data?.detail || 'Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Finalizar Cotización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen de lo que se va a guardar */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Resumen de la Cotización:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Obras:</span> {wizard.obras.length}
              </div>
              <div>
                <span className="font-medium">Items:</span> {wizard.items.length}
              </div>
              <div>
                <span className="font-medium">Costos:</span> {wizard.costos.length}
              </div>
              <div>
                <span className="font-medium">Incrementos:</span> {wizard.incrementos.length}
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Advertencia</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Una vez finalizada, la cotización se guardará en la base de datos y no podrás editarla 
              desde este wizard. Asegúrate de revisar todos los datos antes de continuar.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleFinalize} 
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Confirmar y Guardar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalizeModal;
