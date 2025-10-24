import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, FileText, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { createObra, createPartida, createSubPartida, addCostoPartida, addCostoSubPartida, createIncremento } from '@/actions';

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
      // 1. Crear la obra con estado borrador
      const obraId = await createObra({
        id_cliente: client.selectedClientId,
        codigo_proyecto: wizard.quoteFormData?.codigo_proyecto,
        nombre_proyecto: wizard.quoteFormData?.nombre_proyecto || 'Borrador sin nombre',
        descripcion_proyecto: wizard.quoteFormData?.descripcion_proyecto,
        fecha_creacion: wizard.quoteFormData?.fecha_creacion || new Date().toISOString().split('T')[0],
        fecha_entrega: wizard.quoteFormData?.fecha_entrega,
        fecha_recepcion: wizard.quoteFormData?.fecha_recepcion,
        moneda: wizard.quoteFormData?.moneda || 'USD',
        estado: 'borrador'
      });

      // 2. Crear las partidas si existen
      if (wizard.obras.length > 0) {
        const partidasData = wizard.obras.map(obra => ({
          nombre_partida: obra.nombre,
          descripcion: obra.descripcion,
          codigo: obra.codigo,
          duracion: obra.duracion,
          id_tipo_tiempo: obra.id_tipo_tiempo,
          especialidad: obra.especialidad,
          tiene_subpartidas: obra.tiene_subpartidas || false
        }));
        
        // Crear partidas una por una
        const partidaIdMap: { [tempId: string]: string } = {};
        for (let i = 0; i < wizard.obras.length; i++) {
          const obra = wizard.obras[i];
          const partidaData = partidasData[i];
          const partidaId = await createPartida(obraId, partidaData);
          partidaIdMap[obra.id] = partidaId;
        }

        // 3. Crear las subpartidas si existen
        if (wizard.items.length > 0) {
          // Crear subpartidas una por una
          const subpartidaIdMap: { [tempId: string]: string } = {};
          for (const item of wizard.items) {
            const subpartidaData = {
              codigo: item.codigo,
              descripcion_tarea: item.descripcion_tarea,
              id_especialidad: item.id_especialidad,
              id_unidad: item.id_unidad,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario
            };
            const partidaId = partidaIdMap[item.id_obra];
            const subpartidaId = await createSubPartida(partidaId, subpartidaData);
            subpartidaIdMap[item.id] = subpartidaId;
          }

          // 4. Crear los costos si existen
          if (wizard.costos.length > 0) {
            for (const costo of wizard.costos) {
              const costoData = {
                id_recurso: costo.id_recurso,
                cantidad: costo.cantidad,
                precio_unitario_aplicado: costo.precio_unitario_aplicado,
                total_linea: costo.total_linea
              };
              const subpartidaId = subpartidaIdMap[costo.id_item_obra];
              await addCostoSubPartida(subpartidaId, costoData);
            }
          }

          // 5. Crear los incrementos si existen
          if (wizard.incrementos.length > 0) {
            for (const incremento of wizard.incrementos) {
              const incrementoData = {
                id_subpartida: subpartidaIdMap[incremento.id_item_obra],
                concepto: incremento.concepto,
                descripcion: incremento.descripcion,
                tipo_incremento: incremento.tipo_incremento,
                valor: incremento.valor,
                porcentaje: incremento.porcentaje,
                monto_calculado: incremento.monto_calculado
              };
              await createIncremento(incrementoData);
            }
          }
        }
      }

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

