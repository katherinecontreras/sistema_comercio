import React, { useEffect } from 'react';
import { Boxes, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getTiposMaterial } from '@/actions/materiales';
import { HeaderHome } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const isLoading = loading || loadingTipos;
  const isEmpty = !isLoading && tipos.length === 0;

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
            const baseMap = new Map(tipo.headers_base.map((header) => [header.id_header_base, header]));
            const atributoMap = new Map(
              (tipo.headers_atributes || []).map((header) => [header.id_header_atribute, header]),
            );
            const headersBaseActivos = tipo.headers_base
              .filter((header) => header.active)
              .map((header) => header.titulo)
              .join(', ');

            const resolveLabel = (entry: { typeOfHeader: string; idHeader: number }) => {
              if (entry.typeOfHeader === 'base') {
                return baseMap.get(entry.idHeader)?.titulo || `Base #${entry.idHeader}`;
              }
              return atributoMap.get(entry.idHeader)?.titulo || `Atributo #${entry.idHeader}`;
            };

            return (
              <Card key={tipo.id_tipo_material} className="border-slate-800 bg-slate-900/70 text-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{tipo.titulo}</span>
                    <span className="text-xs font-normal text-slate-400">ID #{tipo.id_tipo_material}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-lg bg-slate-900/60 p-3">
                    <p className="text-slate-400">Total costo unitario acumulado</p>
                    <p className="text-xl font-semibold text-white">
                      {tipo.total_costo_unitario.toLocaleString('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/60 p-3">
                    <p className="text-slate-400">Total costo total acumulado</p>
                    <p className="text-xl font-semibold text-emerald-300">
                      {tipo.total_costo_total.toLocaleString('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Headers base activos</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {headersBaseActivos || 'Sin headers base activos'}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Totales por cantidades</p>
                    <div className="space-y-1">
                      {(tipo.total_cantidad ?? []).slice(0, 4).map((entry) => (
                        <div
                          key={`${entry.typeOfHeader}-${entry.idHeader}`}
                          className="flex items-center justify-between rounded-md bg-slate-900/50 px-3 py-2"
                        >
                          <span className="text-slate-300">{resolveLabel(entry)}</span>
                          <span className="font-semibold text-white">
                            {entry.total.toLocaleString('es-AR', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                      {(tipo.total_cantidad ?? []).length === 0 && (
                        <p className="rounded-md bg-slate-900/50 px-3 py-2 text-center text-slate-500">
                          Sin valores registrados todavía.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default Materiales;


