import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import {
  Costo,
  TipoCosto,
} from '@/store/costo/costoStore';
import { ButtonGroup } from '../ui/button-group';

interface CostosTableProps {
  costos: Costo[];
  tiposCosto: TipoCosto[];
}

const numberFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatNumber = (value: number | string | null | undefined) =>
  numberFormatter.format(Number(value || 0));

const CostosTable: React.FC<CostosTableProps> = ({
  costos,
  tiposCosto,
}) => {
  const [selectedTipoId, setSelectedTipoId] = useState<number>(() => {
    const tipoPersonal = tiposCosto.find((tipo) => tipo.tipo.toLowerCase() === 'personal');
    return tipoPersonal?.id_tipo_costo ?? tiposCosto[0]?.id_tipo_costo ?? 0;
  });
  const [showValues, setShowValues] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  useEffect(() => {
    if (!tiposCosto.some((tipo) => tipo.id_tipo_costo === selectedTipoId)) {
      const tipoPersonal = tiposCosto.find((tipo) => tipo.tipo.toLowerCase() === 'personal');
      setSelectedTipoId(tipoPersonal?.id_tipo_costo ?? tiposCosto[0]?.id_tipo_costo ?? 0);
    }
  }, [tiposCosto, selectedTipoId]);

  const selectedTipo = useMemo(
    () => tiposCosto.find((tipo) => tipo.id_tipo_costo === selectedTipoId),
    [tiposCosto, selectedTipoId]
  );

  const filteredCostos = useMemo(
    () => costos.filter((costo) => costo.id_tipo_costo === selectedTipoId),
    [costos, selectedTipoId]
  );

  const valueColumns = useMemo(() => {
    if (!showValues || selectedItemId !== null) return [] as string[];
    const names = new Set<string>();
    filteredCostos.forEach((costo) => {
      costo.values.forEach((value) => names.add(value.name));
    });
    return Array.from(names.values());
  }, [filteredCostos, showValues, selectedItemId]);

  const selectedItemInfo = useMemo(() => {
    if (selectedItemId === null) return null;
    const descripcion =
      selectedTipo?.items.find((item) => item.id === selectedItemId)?.desc ??
      `Item ${selectedItemId}`;
    return {
      id: selectedItemId,
      descripcion,
    };
  }, [selectedItemId, selectedTipo]);

  const handleSelectItem = (itemId: number) => {
    setSelectedItemId(itemId);
    setShowValues(false);
  };

  const handleClearItem = () => {
    setSelectedItemId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-row items-center justify-between">
        {selectedItemId === null ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <Select
                value={selectedTipoId ? String(selectedTipoId) : undefined}
                onValueChange={(value) => setSelectedTipoId(Number(value))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Selecciona tipo de costo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-slate-100 border border-slate-700">
                  {tiposCosto.map((tipo) => (
                    <SelectItem key={tipo.id_tipo_costo} value={String(tipo.id_tipo_costo)}>
                      {tipo.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={showValues}
                onCheckedChange={(checked) => setShowValues(Boolean(checked))}
                className="border-slate-500 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
              />
              {showValues ? 'Ver costos' : 'Ver valores'}
            </label>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
            <span>
              Para volver a ver las opciones de selección, limpia la tabla de los items.
            </span>
          </div>
        )}
        {/*buttons items */}
        <div className="flex flex-wrap gap-2">
          <ButtonGroup>
            {selectedItemId && (
              <Button
                variant="outline"
                className="border-red-800 text-slate-200 hover:bg-red-800/60 bg-red-800/30"
                onClick={handleClearItem}
              >
                Limpiar tabla
              </Button>
            )}
            {selectedTipo?.items.map((item) => {
              const descripcion = item.desc ?? `Item ${item.id}`;
              const isActive = selectedItemId === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'outline'}
                  className={
                    isActive
                      ? 'bg-sky-600 hover:bg-sky-700 text-white'
                      : 'border-slate-600 text-slate-200 hover:bg-slate-800/60 bg-slate-900/60'
                  }
                  onClick={() => handleSelectItem(item.id)}
                >
                  {descripcion}
                </Button>
              );
            })}
          </ButtonGroup>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedTipoId}-${showValues}-${selectedItemId}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`rounded-xl border relative border-slate-700 bg-slate-900/60 backdrop-blur ${selectedItemId && "mt-16 transition-all ease-in"}`}
        >
          {selectedItemInfo ? (
            <div className="bg-slate-900 -top-13 right-0 rounded-t-xl absolute w-[450px] border-t border-slate-700 px-6 py-4 text-sm text-center text-slate-200/80 uppercase font-bold">
              {selectedItemInfo.descripcion}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-slate-900/80 rounded-t-xl border-b border-slate-700 px-6 py-4 text-sm text-slate-200">
              <span>
                Costos de {selectedTipo?.tipo ?? '—'}
              </span>
              <span className="font-semibold text-emerald-300">
                Total costo {selectedTipo?.tipo ?? '—'}: ${formatNumber(selectedTipo?.costo_total ?? 0)}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table className="min-w-full text-slate-200">
              <TableHeader>
                <TableRow className="bg-slate-900/80">
                  <TableHead className="min-w-[180px]">Detalle</TableHead>
                  {selectedItemInfo ? (
                    <>
                      <TableHead className="min-w-[120px]">Cantidad</TableHead>
                      <TableHead className="min-w-[140px]">$ Unitario</TableHead>
                      <TableHead className="min-w-[120px]">Cantidad</TableHead>
                      <TableHead className="min-w-[120px]">% Item</TableHead>
                      <TableHead className="min-w-[140px]">$ Total</TableHead>
                    </>
                  ) : showValues ? (
                    <>
                      {valueColumns.map((name) => (
                        <TableHead key={name} className="min-w-[120px]">
                          {name}
                        </TableHead>
                      ))}
                    </>
                  ) : (
                    <>
                      <TableHead className="min-w-[100px]">Unidad</TableHead>
                      <TableHead className="min-w-[120px]">Cantidad</TableHead>
                      <TableHead className="min-w-[140px]">$ Unitario</TableHead>
                      <TableHead className="min-w-[140px]">$ Total</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCostos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        selectedItemInfo
                          ? 6
                          : showValues
                          ? 1 + valueColumns.length
                          : 5
                      }
                      className="py-10 text-center text-slate-400"
                    >
                      No hay costos registrados para este tipo.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCostos.map((costo) => (
                    <TableRow key={costo.id_costo} className="transition hover:bg-slate-800/40">
                      <TableCell className="font-medium text-slate-100">{costo.detalle}</TableCell>
                      {selectedItemInfo ? (
                        <>
                          <TableCell>{formatNumber(costo.cantidad)}</TableCell>
                          <TableCell>${formatNumber(costo.costo_unitario)}</TableCell>
                          {(() => {
                            const item = costo.itemsObra.find((entry) => entry.idItem === selectedItemInfo.id);
                            const cantidad = item?.cantidad ?? 0;
                            const porcentaje = item?.porcentaje ?? 0;
                            const total = item?.total ?? 0;
                            return (
                              <>
                                <TableCell>{formatNumber(cantidad)}</TableCell>
                                <TableCell>{numberFormatter.format(porcentaje)}</TableCell>
                                <TableCell>${formatNumber(total)}</TableCell>
                              </>
                            );
                          })()}
                        </>
                      ) : showValues ? (
                        <>
                          {valueColumns.map((name) => {
                            const value = costo.values.find((value) => value.name === name)?.value ?? 0;
                            return (
                              <TableCell key={`${costo.id_costo}-${name}`}>{formatNumber(value)}</TableCell>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          <TableCell>{costo.unidad}</TableCell>
                          <TableCell>{formatNumber(costo.cantidad)}</TableCell>
                          <TableCell>${formatNumber(costo.costo_unitario)}</TableCell>
                          <TableCell className="font-semibold text-emerald-300">
                            ${formatNumber(costo.costo_total)}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CostosTable;

