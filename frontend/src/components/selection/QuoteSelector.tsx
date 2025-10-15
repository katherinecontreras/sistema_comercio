import React, { useEffect, useState } from 'react';
import { Cotizacion, fetchCotizaciones } from '@/api/quotes';
import { Button } from '@/components/ui/button';
import QuoteDetailModal from '@/components/modals/QuoteDetailModal';
import { useAppStore } from '@/store/app';

interface Props {
  onFinalize: (quoteId: number) => void;
  onCreateNew: () => void;
}

const QuoteSelector: React.FC<Props> = ({ onFinalize, onCreateNew }) => {
  const [rows, setRows] = useState<Cotizacion[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const selectedClientId = useAppStore((s) => s.client.selectedClientId);

  const load = async () => {
    const data = await fetchCotizaciones();
    const filtered = selectedClientId ? data.filter(c => c.id_cliente === selectedClientId) : data;
    setRows(filtered);
  };

  useEffect(() => {
    load();
  }, [selectedClientId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Seleccionar Cotización</h3>
        <Button onClick={onCreateNew}>Generar Nueva Cotización</Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-left p-3">Proyecto</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const active = selectedId === c.id_cotizacion;
              return (
                <tr
                  key={c.id_cotizacion}
                  className={`cursor-pointer ${active ? 'bg-primary/10' : 'hover:bg-accent'}`}
                  onClick={() => setSelectedId(c.id_cotizacion)}
                >
                  <td className="p-3">{c.nombre_proyecto}</td>
                  <td className="p-3">{c.fecha_creacion}</td>
                  <td className="p-3">{c.estado}</td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailOpen(true);
                      }}
                    >
                      Ver Detalle
                    </Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="p-3" colSpan={4}>Sin cotizaciones para este cliente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button disabled={!selectedId} onClick={() => selectedId && onFinalize(selectedId)}>
          Finalizar
        </Button>
      </div>
      <QuoteDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        quoteId={selectedId || 0}
      />
    </div>
  );
};

export default QuoteSelector;
