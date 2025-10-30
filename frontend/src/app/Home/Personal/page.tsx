import { useEffect } from 'react';
import { getPersonal } from '@/actions/personal';
import { usePersonalBaseStore } from '@/store/personal/personalStore';
import PersonalTable from '@/components/tables/PersonalTable';

const PersonalPage = () => {
  const { personales, setPersonales, loading, setLoading, setError } = usePersonalBaseStore();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPersonal();
        setPersonales(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || 'Error cargando personal');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setLoading, setError, setPersonales]);

  return (
    <div className="p-4">
      <div className="relative flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-900/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Personal – Vista por Secciones
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Visualiza y filtra sueldos, costos, descuentos, cargas sociales y otros conceptos.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">
            Exportar
          </button>
          <button className="rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700">
            Actualizar
          </button>
        </div>
      </div>
      {/* Tu tabla debajo */}
      <div>
        <PersonalTable rows={personales} loading={loading} />
      </div>
    </div>
  );
};

export default PersonalPage;