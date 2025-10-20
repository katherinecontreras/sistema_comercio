import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, FileText, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { addCotizacion, addObras, addItems, addCostos, addIncrementos } from '@/actions';

interface BorradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BorradorModal: React.FC<BorradorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { wizard, client } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSaveDraft = async () => {
    if (!client.selectedClientId) {
      setError('No hay cliente seleccionado');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 1. Crear la cotización con estado borrador
      const cotizacionId = await addCotizacion({
        id_cliente: client.selectedClientId,
        nombre_proyecto: wizard.quoteFormData?.nombre_proyecto || 'Borrador sin nombre',
        descripcion_proyecto: '',
        fecha_inicio: wizard.quoteFormData?.fecha_creacion,
        fecha_vencimiento: wizard.quoteFormData?.fecha_creacion,
        moneda: 'USD',
        estado: 'borrador'
      });

      // 2. Crear las obras si existen
      if (wizard.obras.length > 0) {
        const obrasData = wizard.obras.map(obra => ({
          id_cotizacion: cotizacionId,
          nombre_obra: obra.nombre,
          descripcion: obra.descripcion,
          ubicacion: ''
        }));
        const idsObras = await addObras(obrasData);
        
        // Mapear IDs temporales a IDs reales
        const obraIdMap: { [tempId: string]: string } = {};
        wizard.obras.forEach((obra, index) => {
          obraIdMap[obra.id] = idsObras[index];
        });

        // 3. Crear los items si existen
        if (wizard.items.length > 0) {
          const itemsData = wizard.items.map(item => ({
            id_obra: obraIdMap[item.id_obra],
            codigo: item.codigo,
            descripcion_tarea: item.descripcion_tarea,
            id_especialidad: undefined,
            id_unidad: undefined,
            cantidad: item.cantidad,
            precio_unitario: 0
          }));
          const idsItems = await addItems(itemsData);
          
          // Mapear IDs temporales a IDs reales
          const itemIdMap: { [tempId: string]: string } = {};
          wizard.items.forEach((item, index) => {
            itemIdMap[item.id] = idsItems[index];
          });

          // 4. Crear los costos si existen
          if (wizard.costos.length > 0) {
            const costosData = wizard.costos.map(costo => ({
              id_item_obra: itemIdMap[costo.id_item_obra],
              id_recurso: costo.id_recurso,
              cantidad: costo.cantidad,
              precio_unitario_aplicado: costo.precio_unitario_aplicado,
              total_linea: costo.total_linea
            }));
            await addCostos(costosData);
          }

          // 5. Crear los incrementos si existen
          if (wizard.incrementos.length > 0) {
            const incrementosData = wizard.incrementos.map(incremento => ({
              id_item_obra: itemIdMap[incremento.id_item_obra],
              concepto: incremento.descripcion,
              descripcion: '',
              tipo_incremento: 'porcentaje' as const,
              valor: incremento.porcentaje,
              porcentaje: incremento.porcentaje,
              monto_calculado: 0
            }));
            await addIncrementos(incrementosData);
          }
        }
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error guardando borrador:', err);
      setError(err.response?.data?.detail || 'Error al guardar el borrador');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Guardar como Borrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen de lo que se va a guardar */}
          <div className="bg-slate-700/50 border border-slate-600 p-4 rounded-lg">
            <h4 className="font-medium text-amber-400 mb-2">Progreso Actual:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wizard.quoteFormData?.nombre_proyecto ? 'bg-green-500' : 'bg-slate-500'}`} />
                <span>Datos: {wizard.quoteFormData?.nombre_proyecto ? 'Completado' : 'Pendiente'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wizard.obras.length > 0 ? 'bg-green-500' : 'bg-slate-500'}`} />
                <span>Obras: {wizard.obras.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wizard.items.length > 0 ? 'bg-green-500' : 'bg-slate-500'}`} />
                <span>Items: {wizard.items.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wizard.costos.length > 0 ? 'bg-green-500' : 'bg-slate-500'}`} />
                <span>Costos: {wizard.costos.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wizard.incrementos.length > 0 ? 'bg-green-500' : 'bg-slate-500'}`} />
                <span>Incrementos: {wizard.incrementos.length}</span>
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="bg-blue-900/30 border border-blue-600/50 p-4 rounded-lg">
            <div className="flex items-start gap-2 text-blue-300">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium block">Guardar y Continuar Después</span>
                <p className="text-sm text-blue-200 mt-1">
                  Tu cotización se guardará como borrador. Podrás continuar editándola más tarde 
                  desde el listado de cotizaciones.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-600/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-red-200 mt-1">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={saving}
              className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveDraft} 
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Borrador
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BorradorModal;

