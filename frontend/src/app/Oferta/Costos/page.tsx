import React, { useEffect } from 'react';
import { Coins } from 'lucide-react';

import useCostoStore from '@/store/costo/costoStore';

import HeaderOferta from '@/components/headers/HeaderOferta';
import CostosTable from '@/components/tables/CostosTable';

const CostosPage: React.FC = () => {
  const costos = useCostoStore((state) => state.costos);
  const tiposCosto = useCostoStore((state) => state.tiposCosto);
  const loadFromStorage = useCostoStore((state) => state.loadFromStorage);
  const setStoreLoading = useCostoStore((state) => state.setLoading);
  const loading = useCostoStore((state) => state.loading);
  const ready = useCostoStore((state) => state.ready);
  useEffect(() => {
    setStoreLoading(true);
    loadFromStorage();
    setStoreLoading(false);
  }, [loadFromStorage, setStoreLoading]);

  const tieneCostos = costos.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <HeaderOferta
          title="Costos calculados"
          subtitle="Los costos se generan a partir de los recursos de equipos y personal vinculados a cada ítem."
          icon={Coins}
        />

        {loading && (
          <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-300">
            Cargando información de costos...
          </div>
        )}
        {!loading && !ready && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/40 px-4 py-3 text-sm text-amber-200">
            Aún no se han generado costos. Finaliza la carga de recursos en los ítems para habilitar este resumen.
          </div>
        )}

        {ready && tieneCostos && (
          <CostosTable
            costos={costos}
            tiposCosto={tiposCosto}
          />
        )}

        {ready && !tieneCostos && (
          <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-6 text-center text-sm text-slate-300">
            No se encontraron costos calculados. Verifica que al menos un recurso de personal o
            equipo haya sido asignado a los ítems de la obra.
          </div>
        )}
      </div>
    </div>
  );
};

export default CostosPage;

