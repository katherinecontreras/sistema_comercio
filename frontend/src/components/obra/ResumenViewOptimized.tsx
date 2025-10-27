import React, { useState, useEffect } from 'react';
import { useObra } from '@/hooks/useObra';
import { useToastHelpers } from '@/components/notifications/ToastProvider';
import { ModernCard, StatsGrid, ModernButton, LoadingSpinner } from '@/components/ui/ModernComponents';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  FileText, 
  Users, 
  Clock, 
  TrendingUp, 
  Plus,
  Eye,
  Download
} from 'lucide-react';

const ResumenView: React.FC = () => {
  const { 
    obra, 
    resumen, 
    loading, 
    error,
    handleFinalizarObra,
    clearLocalStorage
  } = useObra();
  
  const { showSuccess, showError, showLoading } = useToastHelpers();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleFinalizar = async () => {
    if (!obra?.id_obra) {
      showError('Error', 'No hay obra seleccionada para finalizar');
      return;
    }

    setIsFinalizing(true);
    showLoading('Finalizando obra', 'Guardando todos los datos...');

    try {
      await handleFinalizarObra(obra.id_obra);
      showSuccess('¡Obra finalizada!', 'La obra se ha guardado correctamente en la base de datos');
    } catch (error) {
      showError('Error al finalizar', 'No se pudo guardar la obra. Intenta nuevamente.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleBorrarYSalir = () => {
    clearLocalStorage();
    showSuccess('Datos eliminados', 'Se han eliminado todos los datos locales');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando resumen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error al cargar el resumen</div>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!obra) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay obra seleccionada</h3>
        <p className="text-gray-500">Selecciona una obra para ver el resumen</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{obra.nombre_proyecto}</h1>
            <p className="text-blue-100">{obra.descripcion_proyecto}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span>Código: {obra.codigo_proyecto}</span>
              <span>•</span>
              <span>Moneda: {obra.moneda}</span>
              <span>•</span>
              <span>Estado: {obra.estado}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <ModernButton
              variant="secondary"
              onClick={handleBorrarYSalir}
              disabled={isFinalizing}
            >
              Borrar y Salir
            </ModernButton>
            <ModernButton
              onClick={handleFinalizar}
              loading={isFinalizing}
              disabled={isFinalizing}
            >
              Finalizar Obra
            </ModernButton>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <StatsGrid>
        <ModernCard
          title="Total Partidas"
          value={resumen.cantidad_partidas}
          icon={<FileText className="h-5 w-5" />}
          trend="up"
          trendValue={`+${resumen.cantidad_subpartidas} subpartidas`}
        />
        <ModernCard
          title="Costo Total"
          value={`$${resumen.costo_total_oferta_con_incremento.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          subtitle={`Sin incrementos: $${resumen.costo_total_oferta_sin_incremento.toLocaleString()}`}
        />
        <ModernCard
          title="Incrementos"
          value={resumen.cantidad_incrementos}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle={`Total: $${resumen.costo_total_incrementos.toLocaleString()}`}
        />
        <ModernCard
          title="Duración Total"
          value={`${resumen.total_duracion_oferta.horas}h`}
          icon={<Clock className="h-5 w-5" />}
          subtitle={`${resumen.total_duracion_oferta.dias}d ${resumen.total_duracion_oferta.meses}m`}
        />
      </StatsGrid>

      {/* Detalles de recursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard
          title="Recursos por Planilla"
          value={resumen.cantidad_recursos_por_planilla}
          subtitle={`Total recursos: ${resumen.total_recursos_por_planilla}`}
          icon={<Users className="h-5 w-5" />}
        />
        <ModernCard
          title="Planillas Utilizadas"
          value={resumen.cantidad_planillas_total}
          subtitle={`${resumen.planillas_por_oferta.length} únicas`}
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      {/* Costos detallados */}
      {resumen.costos_detallados && resumen.costos_detallados.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Costos por Partida</h3>
          <div className="space-y-4">
            {resumen.costos_detallados.map((costo, index) => (
              <motion.div
                key={costo.id_partida}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{costo.nombre_partida}</h4>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${costo.total_costo_partida.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Incrementos: ${costo.total_costo_incremento_partida.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {costo.subpartidas.length > 0 && (
                  <div className="ml-4 space-y-2">
                    {costo.subpartidas.map((subpartida) => (
                      <div key={subpartida.id_subpartida} className="flex justify-between text-sm">
                        <span className="text-gray-600">{subpartida.nombre_subpartida}</span>
                        <span className="font-medium">
                          ${subpartida.total_costo_subpartida.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Planillas utilizadas */}
      {resumen.planillas_por_oferta.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Planillas Utilizadas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {resumen.planillas_por_oferta.map((planilla) => (
              <div
                key={planilla.id}
                className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">{planilla.nombre}</div>
                <div className="text-xs text-gray-500">ID: {planilla.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ResumenView;
