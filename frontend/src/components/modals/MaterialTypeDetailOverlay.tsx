import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { downloadExcelTipoMaterial, getTipoMaterialDetalle } from '@/actions/materiales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TipoMaterial } from '@/store/material/materialStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { OPERATOR_LABEL_MAP, OPERATOR_SYMBOL_MAP } from '@/utils/materiales';
import { useToastHelpers } from '@/components/notifications/ToastProvider';
import UploadExcelModal from './UploadExcelModal';

interface MaterialTypeDetailOverlayProps {
  tipo: TipoMaterial | null;
  onClose: () => void;
  layoutId: string;
  isOpen: boolean;
}

const formatCurrency = (value: number) =>
  value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  });

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'tipo-material';

const MaterialTypeDetailOverlay: React.FC<MaterialTypeDetailOverlayProps> = ({
  tipo: initialTipo,
  onClose,
  layoutId,
  isOpen,
}) => {
  const isActive = Boolean(isOpen && initialTipo);
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastHelpers();
  const [downloading, setDownloading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [tipo, setTipo] = useState<TipoMaterial | null>(initialTipo);
  const [refreshing, setRefreshing] = useState(false);

  // Actualizar tipo cuando cambia el prop
  useEffect(() => {
    setTipo(initialTipo);
  }, [initialTipo]);

  const atributos = useMemo(() => tipo?.headers_atributes ?? [], [tipo]);

  const baseMap = useMemo(
    () =>
      tipo
        ? new Map(tipo.headers_base.map((header) => [header.id_header_base, header]))
        : new Map<number, TipoMaterial['headers_base'][number]>(),
    [tipo],
  );

  const atributoMap = useMemo(() => new Map(atributos.map((header) => [header.id_header_atribute, header])), [atributos]);

  const formatOperacionDescripcion = (
    operacion: TipoMaterial['headers_base'][number]['calculo']['operaciones'][number],
  ) => {
    const operandosBase =
      operacion.headers_base?.map((id) => baseMap.get(id)?.titulo ?? `Base #${id}`) ?? [];
    const operandosAtributo =
      operacion.headers_atributes?.map((id) => atributoMap.get(id)?.titulo ?? `Atributo #${id}`) ?? [];
    const operandos = [...operandosBase, ...operandosAtributo];

    const operacionTipo = operacion.tipo as keyof typeof OPERATOR_SYMBOL_MAP;
    const operacionBaseLabel = OPERATOR_LABEL_MAP[operacionTipo] ?? 'operación';
    const operacionLabel =
      operacionBaseLabel.charAt(0).toUpperCase() + operacionBaseLabel.slice(1);
    const operadorSimbolo = OPERATOR_SYMBOL_MAP[operacionTipo] ?? '×';

    if (!operandos.length) {
      return `${operacionLabel} definida sin operandos`;
    }

    return `${operacionLabel}: ${operandos.join(` ${operadorSimbolo} `)}`;
  };

  const buildUnifiedTable = () => {
    if (!tipo) return null;

    const baseMap = new Map((tipo.headers_base || []).map((header) => [header.id_header_base, header]));
    const attrMap = new Map((tipo.headers_atributes || []).map((header) => [header.id_header_atribute, header]));

    const normalizeType = (value?: string | null) => {
      if (!value) return 'base';
      const lowered = value.toLowerCase();
      if (lowered.startsWith('atr')) return 'atribute';
      return 'base';
    };

    const sortedOrderEntries = (tipo.order_headers || [])
      .slice()
      .sort((a, b) => a.order - b.order);

    const orderedHeaders: Array<{
      type: 'base' | 'atribute';
      header: (typeof tipo.headers_base)[number] | NonNullable<typeof tipo.headers_atributes>[number];
      id: number;
    }> = [];

    const seenBase = new Set<number>();
    const seenAttr = new Set<number>();

    sortedOrderEntries.forEach((entry) => {
      const normalizedType = normalizeType(entry.type);
      if (normalizedType === 'base') {
        const header = baseMap.get(entry.id);
        if (header && (header.active ?? true)) {
          orderedHeaders.push({ type: 'base', header, id: header.id_header_base });
          seenBase.add(header.id_header_base);
        }
      } else {
        const header = attrMap.get(entry.id);
        if (header) {
          orderedHeaders.push({ type: 'atribute', header, id: header.id_header_atribute });
          seenAttr.add(header.id_header_atribute);
        }
      }
    });

    const remainingBaseHeaders = (tipo.headers_base || [])
      .filter((header) => (header.active ?? true) && !seenBase.has(header.id_header_base))
      .sort((a, b) => (a.order ?? a.id_header_base) - (b.order ?? b.id_header_base));

    const remainingAttrHeaders = (tipo.headers_atributes || [])
      ?.filter((header) => !seenAttr.has(header.id_header_atribute))
      .sort((a, b) => (a.order ?? a.id_header_atribute) - (b.order ?? b.id_header_atribute)) ?? [];

    remainingBaseHeaders.forEach((header) => {
      orderedHeaders.push({ type: 'base', header, id: header.id_header_base });
    });

    remainingAttrHeaders.forEach((header) => {
      orderedHeaders.push({ type: 'atribute', header, id: header.id_header_atribute });
    });

    if (!orderedHeaders.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-6 py-12 text-center text-sm text-slate-400">
          Aún no hay headers configurados para este tipo de material.
        </div>
      );
    }

    const cantidadValoresPorHeader = orderedHeaders.map(({ header }) => {
      const operaciones = header.calculo?.operaciones ?? [];
      return operaciones.reduce(
        (acc, operacion) =>
          acc + (operacion.headers_base?.length ?? 0) + (operacion.headers_atributes?.length ?? 0),
        0,
      );
    });

    const operacionesPorHeader = orderedHeaders.map(({ header }) => {
      const operaciones = header.calculo?.operaciones ?? [];
      const descripcion = operaciones.map((operacion) => formatOperacionDescripcion(operacion));
      return descripcion.length ? descripcion : ['Sin operaciones definidas'];
    });

    const totalEntries = tipo.total_cantidad?.cantidades ?? [];

    const totalesPorHeader = orderedHeaders.map(({ type, id }) => {
      const totalEntry = totalEntries.find(
        (entry) => entry.typeOfHeader === type && entry.idHeader === id,
      );

      if (typeof totalEntry?.total === 'number') {
        return totalEntry.total.toLocaleString('es-AR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      }

      // Mostrar el total general de cantidades cuando corresponda
      if (type === 'base' && id === 2) {
        const totalGeneral = tipo.total_cantidad?.total_cantidades ?? 0;
        return totalGeneral.toLocaleString('es-AR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      }

      return '—';
    });

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70">
        <div className="overflow-x-auto">
          <Table className="min-w-[720px] text-sm text-slate-300">
            <TableHeader>
              <TableRow className="bg-slate-900/80">
                <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  tipo de Dato
                </TableHead>
                {orderedHeaders.map(({ type, header, id }) => (
                  <TableHead
                    key={`${type}-${id}`}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{header.titulo}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow className="border-b border-slate-800/60">
                <TableCell className="px-4 py-3 font-medium text-slate-200">Cantidad de valores:</TableCell>
                {cantidadValoresPorHeader.map((valor, index) => (
                  <TableCell key={index} className="px-4 py-3 text-left font-semibold text-white">
                    {valor}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-b border-slate-800/60 align-top">
                <TableCell className="px-4 py-3 font-medium text-slate-200">
                  Operaciones configuradas:
                </TableCell>
                {operacionesPorHeader.map((descripcion, index) => (
                  <TableCell key={index} className="px-4 py-3 text-left">
                    <ul className="space-y-1">
                      {descripcion.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell className="px-4 py-3 font-medium text-slate-200">Totales de cantidad:</TableCell>
                {totalesPorHeader.map((total, index) => (
                  <TableCell key={index} className="px-4 py-3 text-left font-semibold text-emerald-300">
                    {total}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const handleDownloadExcel = async () => {
    if (!tipo || downloading) return;
    setDownloading(true);
    try {
      const blob = await downloadExcelTipoMaterial(tipo.id_tipo_material);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `materiales-${slugify(tipo.titulo || 'tabla')}.xlsx`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Descarga completada', `El Excel de ${tipo.titulo} está listo.`);
    } catch (error) {
      console.error('Error descargando Excel de materiales', error);
      showError('No se pudo descargar el Excel', 'Por favor, vuelve a intentarlo.');
    } finally {
      setDownloading(false);
    }
  };

  const handleUploadSuccess = async () => {
    if (!tipo) return;
    
    setRefreshing(true);
    try {
      // Recargar los datos del tipo de material
      const updatedTipo = await getTipoMaterialDetalle(tipo.id_tipo_material);
      setTipo(updatedTipo);
      showSuccess('Datos actualizados', 'La tabla de materiales se ha recargado correctamente.');
    } catch (error) {
      console.error('Error al recargar datos:', error);
      showError('Error al actualizar', 'No se pudieron recargar los datos.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose]);

  return (
    <>
      <AnimatePresence>
        {isActive && tipo ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 h-screen bg-slate-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            <motion.div
              layout
              layoutId={layoutId}
              className="fixed inset-0 z-50 flex items-center justify-end p-4 sm:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="relative h-[85vh] w-[90vw] max-w-5xl overflow-hidden border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-lg sm:w-[85vw] lg:w-[80vw]">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-300 transition hover:border-slate-500 hover:text-white"
                  aria-label="Cerrar"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>

                <CardHeader className="space-y-2 border-b border-slate-800/60 pb-6">
                  <div className="flex flex-col gap-4 pr-10 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-2xl font-semibold text-white">{tipo.titulo}</CardTitle>
                      <p className="text-xs text-slate-400">
                        Valor del dólar vigente: ${' '}
                        {tipo.valor_dolar.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}.
                      </p>
                      <p className="text-sm text-slate-400">ID de tipo: #{tipo.id_tipo_material}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-700/40 bg-emerald-900/20 px-4 py-2">
                        <p className="text-sm text-emerald-200/80">Costo unitario acumulado</p>
                        <p className="text-2xl font-semibold text-emerald-100">
                          {formatCurrency(tipo.total_costo_unitario)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-700/40 bg-emerald-900/20 px-4 py-2">
                        <p className="text-sm text-emerald-200/80">Costo total acumulado</p>
                        <p className="text-2xl font-semibold text-emerald-100">
                          {formatCurrency(tipo.total_costo_total)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-700/40 bg-emerald-900/20 px-4 py-2">
                        <p className="text-sm text-emerald-200/80">Total USD convertido</p>
                        <p className="text-2xl font-semibold text-emerald-100">
                          {formatCurrency(tipo.total_USD)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex h-full flex-col gap-6 overflow-hidden p-6">
                  <div className="flex-1 space-y-6 overflow-y-auto pr-1 sm:pr-2">
                    <section className="space-y-4">
                      <header className="space-y-1">
                        <h3 className="text-lg font-semibold text-white">Resumen Tabla de Material</h3>
                        <p className="text-sm text-slate-400">
                          Visualiza el resumen de los totales de la tabla, si quieres ver los datos presionar descargar excel
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3">
                          <Button
                            type="button"
                            onClick={handleDownloadExcel}
                            variant="outline"
                            className="border-emerald-500/50 bg-emerald-600/10 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100"
                            disabled={downloading}
                          >
                            {downloading ? 'Descargando...' : 'Descargar Excel'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowUploadModal(true)}
                            variant="outline"
                            className="border-blue-500/50 bg-blue-600/10 text-sm font-medium text-blue-200 hover:bg-blue-500/20 hover:text-blue-100"
                            disabled={refreshing}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {refreshing ? 'Actualizando...' : 'Cargar Excel'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-slate-600/60 bg-slate-800/60 text-sm font-medium text-slate-200 hover:bg-slate-800"
                            onClick={() => {
                              onClose();
                              navigate(`/materiales/tipoMaterial/${tipo.id_tipo_material}`);
                            }}
                          >
                            Editar tabla
                          </Button>
                        </div>
                      </header>
                      {buildUnifiedTable()}
                    </section>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {/* Modal de carga de Excel */}
      {tipo && (
        <UploadExcelModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          tipoMaterialId={tipo.id_tipo_material}
          tipoMaterialTitulo={tipo.titulo}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default MaterialTypeDetailOverlay;