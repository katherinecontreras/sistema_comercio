import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useObraStore } from '@/store/obra';
import { createObra, updateObra } from '@/actions/obras';

interface ActionButtonsProps {
  obra: any;
  onFinalizar: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ obra, onFinalizar }) => {
  const { saveToLocalStorage, clearLocalStorage, partidas , getIncremento, calcularResumenObra, ResumenObra} = useObraStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState<'finalizar' | 'guardar' | 'borrar' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      // Calcular campos de resumen
      const totalPartidas = ResumenObra.total_partidas;
      const totalSubpartidas = ResumenObra.total_subpartidas;
      const totalCostoSinIncremento = ResumenObra.total_costo_obra_sin_incremento;
      const totalDuracion = ResumenObra.total_duracion;

      // Crear objeto de resumen
      const costosPartidas = partidas.map(p => ({
        idPartida: p.id_partida,
        total_costo_partida: p.costos || 0,
        total_costo_incremento_partida: getIncremento(Number(p.id_partida))|| 0,
        total_costo_partida_sin_incremento: p.costo_total || 0,
        subpartidas: p.subpartidas?.map(sp => ({
          idSubpartida: sp.id_subpartida,
          total_costo_subpartida: sp.costo_total || 0,
          total_costo_incremento_subpartida: sp.incrementos?.reduce((sum, i) => sum + i.monto_calculado, 0) || 0,
          total_costo_subpartida_sin_incremento: sp.costo_total || 0
        })) || []
      }));

      const obraData = {
        ...obra,
        estado: 'nueva oferta',
        total_partidas: totalPartidas,
        total_subpartidas: totalSubpartidas,
        total_costo_obra_sin_incremento: totalCostoSinIncremento,
        total_costo_obra_con_incrementos: totalCostoSinIncremento, // Se calculará con incrementos
        total_duracion_obra: totalDuracion,
        total_incrementos: 0, // Se calculará
        costos_partidas: costosPartidas
      };

      if (obra.id_obra) {
        await updateObra(obra.id_obra, obraData);
      } else {
        await createObra(obraData);
      }

      // Limpiar almacenamiento local
      clearLocalStorage();
      onFinalizar();
    } catch (error) {
      console.error('Error finalizando obra:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarBorrador = async () => {
    setLoading(true);
    try {
      const obraData = {
        ...obra,
        estado: 'borrador'
      };

      if (obra.id_obra) {
        await updateObra(obra.id_obra, obraData);
      } else {
        await createObra(obraData);
      }

      // Guardar en localStorage
      saveToLocalStorage();
      alert('Borrador guardado exitosamente');
    } catch (error) {
      console.error('Error guardando borrador:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrarYSalir = () => {
    clearLocalStorage();
    alert('Datos eliminados. Regresando a la selección de cliente.');
    window.location.href = '/seleccionar-cliente';
  };

  const confirmAction = () => {
    setShowConfirm(false);
    switch (action) {
      case 'finalizar':
        handleFinalizar();
        break;
      case 'guardar':
        handleGuardarBorrador();
        break;
      case 'borrar':
        handleBorrarYSalir();
        break;
    }
    setAction(null);
  };

  const openConfirm = (actionType: 'finalizar' | 'guardar' | 'borrar') => {
    setAction(actionType);
    setShowConfirm(true);
  };

  return (
    <>
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => openConfirm('finalizar')}
            disabled={loading || partidas.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading && action === 'finalizar' ? 'Finalizando...' : 'Finalizar Oferta'}
          </Button>
          
          <Button
            onClick={() => openConfirm('guardar')}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading && action === 'guardar' ? 'Guardando...' : 'Guardar Borrador'}
          </Button>
          
          <Button
            onClick={() => openConfirm('borrar')}
            disabled={loading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && action === 'borrar' ? 'Eliminando...' : 'Borrar y Salir'}
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            <strong>Finalizar:</strong> Completa la oferta y la guarda en la base de datos<br/>
            <strong>Guardar Borrador:</strong> Guarda el progreso para continuar después<br/>
            <strong>Borrar y Salir:</strong> Elimina todos los datos y regresa al inicio
          </p>
        </div>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {action === 'finalizar' && 'Finalizar Oferta'}
              {action === 'guardar' && 'Guardar Borrador'}
              {action === 'borrar' && 'Borrar y Salir'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {action === 'finalizar' && '¿Estás seguro de que quieres finalizar esta oferta?'}
              {action === 'guardar' && '¿Guardar este borrador? Podrás continuar editándolo más tarde.'}
              {action === 'borrar' && '¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outline"
              className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              className={
                action === 'borrar' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : action === 'finalizar'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {action === 'finalizar' && 'Finalizar'}
              {action === 'guardar' && 'Guardar'}
              {action === 'borrar' && 'Borrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionButtons;
