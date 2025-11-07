import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app';
import { getClientes } from '@/actions/catalogos';
import { 
  getMesResumenPorCliente, 
  getDiasMesPorMes, 
  updateDiaMes,
  type DiaMes,
  type MesResumen 
} from '@/actions/mesesJornada';
import MonthCalendar from '@/components/ui/calendar';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

const MesesJornadaPage = () => {
  const { client } = useAppStore();
  const [clientes, setClientes] = useState<any[]>([]);
  const [diasMes, setDiasMes] = useState<DiaMes[]>([]);
  const [mesResumen, setMesResumen] = useState<MesResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const { execute } = useAsyncOperation();

  const clienteSeleccionado = clientes.find(c => c.id_cliente === client.selectedClientId);

  // Cargar clientes
  useEffect(() => {
    execute(
      async () => {
        const data = await getClientes();
        setClientes(data);
      },
      { showErrorToast: false }
    );
  }, [execute]);

  // Cargar datos del mes cuando hay un cliente seleccionado
  useEffect(() => {
    if (!client.selectedClientId) return;

    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Obtener mesResumen del cliente
        const resumen = await getMesResumenPorCliente(client.selectedClientId!);
        setMesResumen(resumen);

        // Obtener días del mes
        if (resumen && resumen.id_mes) {
          const dias = await getDiasMesPorMes(resumen.id_mes);
          setDiasMes(dias);
        }
      } catch (error: any) {
        console.error('Error cargando datos:', error);
        // Si el error es 404, significa que no existe mesResumen para este cliente
        if (error?.response?.status === 404) {
          console.warn('No se encontró mesResumen para este cliente. Debe crearse uno primero.');
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [client.selectedClientId]);

  // Función para actualizar un día
  const handleUpdateDia = async (id_dia: number, data: Partial<DiaMes>) => {
    try {
      await updateDiaMes(id_dia, data);
      
      // Recargar datos para actualizar el resumen
      if (mesResumen) {
        const resumenActualizado = await getMesResumenPorCliente(client.selectedClientId!);
        setMesResumen(resumenActualizado);
        
        const diasActualizados = await getDiasMesPorMes(mesResumen.id_mes);
        setDiasMes(diasActualizados);
      }
    } catch (error) {
      console.error('Error actualizando día:', error);
      throw error;
    }
  };

  if (!client.selectedClientId) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">
            Por favor, selecciona un cliente para gestionar los meses jornada
          </p>
        </div>
      </div>
    );
  }

  if (loading && !mesResumen) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!mesResumen && !loading) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-red-400 text-lg mb-2">
            No se encontró un mes de resumen para este cliente
          </p>
          <p className="text-slate-400 text-sm">
            Por favor, contacta al administrador para crear el mes de resumen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Liquidación de Meses Jornales para el cliente {clienteSeleccionado?.razon_social || ''}
        </h1>
        <p className="text-slate-400 text-sm">
          Para gestionar el resumen del mes de liquidación, debe agregarle los datos a los días del mes, 
          seleccionando el día en el calendario y llenando los respectivos datos.
        </p>
      </div>

      {/* Contenido principal: Calendario (80%) y Tabla de Resumen (20%) */}
      <div className="flex gap-6">
        {/* Calendario - 80% */}
        <div className="w-[80%]">
          {loading ? (
            <div className="flex items-center justify-center h-[500px]">
              <p className="text-slate-400">Cargando...</p>
            </div>
          ) : (
            <MonthCalendar 
              diasMes={diasMes} 
              onUpdateDia={handleUpdateDia}
            />
          )}
        </div>

        {/* Tabla de Resumen - 20% */}
        <div className="w-[20%]">
          {mesResumen && (
            <div 
              className="rounded-2xl shadow-2xl border p-6"
              style={{ 
                background: 'linear-gradient(135deg, rgb(15 23 42) 0%, rgb(30 41 59) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-4 pb-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                Resumen del Mes
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Total Horas Normales</p>
                  <p className="text-white font-semibold">{mesResumen.total_horas_normales}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs mb-1">Total Horas 50%</p>
                  <p className="text-white font-semibold">{mesResumen.total_horas_50porc}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs mb-1">Total Horas 100%</p>
                  <p className="text-white font-semibold">{mesResumen.total_horas_100porc}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs mb-1">Total Horas Físicas</p>
                  <p className="text-white font-semibold">{mesResumen.total_horas_fisicas}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs mb-1">Total Días Trabajados</p>
                  <p className="text-white font-semibold">{mesResumen.total_dias_trabajados}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs mb-1">Horas Viaje</p>
                  <p className="text-white font-semibold">{mesResumen.horas_viaje}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MesesJornadaPage;

