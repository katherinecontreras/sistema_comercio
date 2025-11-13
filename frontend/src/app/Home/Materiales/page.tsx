import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getTiposMaterial } from '@/actions/materiales';
import { HeaderHome } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import MaterialTypeDetailOverlay from '@/components/modals/MaterialTypeDetailOverlay';
import { motion } from 'framer-motion';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useMaterialStore } from '@/store/material/materialStore';

const Materiales: React.FC = () => {
  const navigate = useNavigate();
  const { tipos, setTipos, loading, setLoading, error, setError } = useMaterialStore();
  const { execute: executeTipos, loading: loadingTipos } = useAsyncOperation();

  useEffect(() => {
    executeTipos(
      async () => {
        setLoading(true);
        setError(null);
        const data = await getTiposMaterial();
        const list = Array.isArray(data) ? data : [];
        setTipos(list);
        return list;
      },
      {
        errorMessage: 'Error al cargar los tipos de material',
        showErrorToast: true,
        onSuccess: () => setLoading(false),
        onError: (err) => {
          console.error('Error cargando tipos de material', err);
          setError('No se pudieron cargar los tipos de material');
          setLoading(false);
        },
      },
    );
  }, [executeTipos, setLoading, setTipos, setError]);

  const [selectedTipoId, setSelectedTipoId] = useState<number | null>(null);

  const isLoading = loading || loadingTipos;
  const isEmpty = !isLoading && tipos.length === 0;
  const selectedTipo = useMemo(
    () => tipos.find((tipo) => tipo.id_tipo_material === selectedTipoId) ?? null,
    [selectedTipoId, tipos],
  );

  useEffect(() => {
    if (!selectedTipo) {
      setSelectedTipoId(null);
    }
  }, [selectedTipo]);

  return (
    <div className="space-y-6">
      <HeaderHome
        title="Materiales – Gestión por Tipos"
        description="Visualiza un resumen de cada tabla de materiales y crea nuevas estructuras para mantener tus costos organizados."
        icon={Boxes}
        iconClassName="bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
        aside={
          <Button
            onClick={() => navigate('/materiales/tipoMaterial')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Agregar Nueva Tabla de Materiales
          </Button>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
      ) : null}

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-white">Aún no hay tablas de materiales</h2>
          <p className="mt-2 text-sm text-slate-400">
            Crea la primera tabla para comenzar a organizar tus materiales por tipo.
          </p>
        </div>
      ) : null}

      {!isEmpty && !isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tipos.map((tipo) => {
            const layoutId = `material-type-${tipo.id_tipo_material}`;
            return (
              <motion.div
                key={tipo.id_tipo_material}
                layoutId={layoutId}
                layout
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="focus-within:ring-2 focus-within:ring-emerald-500/60 focus:outline-none"
              >
                <button
                  type="button"
                  onClick={() => setSelectedTipoId(tipo.id_tipo_material)}
                  className="group w-full text-left"
                >
                  <Card className="border-slate-800/80 bg-slate-900/70 text-slate-100 transition-colors group-hover:border-emerald-600/60 group-hover:bg-slate-900/80">
                    <CardHeader className="py-6">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span className="text-wrap pr-4 font-semibold text-white">{tipo.titulo}</span>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : null}

      <MaterialTypeDetailOverlay
        isOpen={Boolean(selectedTipo)}
        tipo={selectedTipo}
        layoutId={selectedTipo ? `material-type-${selectedTipo.id_tipo_material}` : 'material-type-fallback'}
        onClose={() => setSelectedTipoId(null)}
      />
    </div>
  );
};

export default Materiales;


