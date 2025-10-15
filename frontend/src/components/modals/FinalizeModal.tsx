import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Save, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/app';
import api from '@/services/api';

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
      // 1. Crear la cotización
      const cotizacionResponse = await api.post('/cotizaciones', {
        id_cliente: client.selectedClientId,
        nombre_proyecto: 'Proyecto de Ejemplo', // Esto debería venir del wizard
        fecha_creacion: new Date().toISOString().split('T')[0]
      });

      const cotizacionId = cotizacionResponse.data.id_cotizacion;

      // 2. Crear las obras y mapear IDs temporales a reales
      const obraIdMap: { [tempId: string]: number } = {};
      for (const obra of wizard.obras) {
        const obraResponse = await api.post(`/cotizaciones/${cotizacionId}/obras`, {
          id_cotizacion: cotizacionId,
          nombre_obra: obra.nombre,
          descripcion: obra.descripcion
        });
        obraIdMap[obra.id] = obraResponse.data.id_obra;
      }

      // 3. Crear los items de obra usando los IDs reales de las obras
      const itemIdMap: { [tempId: string]: number } = {};
      for (const item of wizard.items) {
        const realObraId = obraIdMap[item.id_obra];
        const realItemPadreId = item.id_item_padre ? itemIdMap[item.id_item_padre] : null;
        
        const itemResponse = await api.post(`/cotizaciones/obras/${realObraId}/items`, {
          id_obra: realObraId,
          id_item_padre: realItemPadreId,
          codigo: item.codigo,
          descripcion_tarea: item.descripcion_tarea,
          especialidad: item.especialidad,
          unidad: item.unidad,
          cantidad: item.cantidad
        });
        itemIdMap[item.id] = itemResponse.data.id_item_obra;
      }

      // 4. Crear los costos usando los IDs reales de los items
      for (const costo of wizard.costos) {
        const realItemId = itemIdMap[costo.id_item_obra];
        await api.post(`/cotizaciones/items/${realItemId}/costos`, {
          id_item_obra: realItemId,
          id_recurso: costo.id_recurso,
          cantidad: costo.cantidad,
          precio_unitario_aplicado: costo.precio_unitario_aplicado
        });
      }

      // 5. Crear los incrementos usando los IDs reales de los items
      for (const incremento of wizard.incrementos) {
        const realItemId = itemIdMap[incremento.id_item_obra];
        await api.post(`/cotizaciones/items/${realItemId}/incrementos`, {
          id_item_obra: realItemId,
          descripcion: incremento.descripcion,
          porcentaje: incremento.porcentaje
        });
      }

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
