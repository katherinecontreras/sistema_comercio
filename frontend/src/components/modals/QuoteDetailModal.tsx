import React, { useEffect, useState } from 'react';
import { fetchCotizacionPlanilla } from '@/api/quotes';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  quoteId: number;
}

const QuoteDetailModal: React.FC<Props> = ({ open, onClose, quoteId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && quoteId) {
      setLoading(true);
      fetchCotizacionPlanilla(quoteId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, quoteId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Detalle de Cotización</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <strong>Subtotal General:</strong> ${data.subtotal_general?.toFixed(2)}
            </div>
            <div>
              <strong>Total General:</strong> ${data.total_general?.toFixed(2)}
            </div>
            <div>
              <strong>Items:</strong> {data.items?.length || 0}
            </div>
          </div>
        ) : (
          <p>Error al cargar datos</p>
        )}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailModal;
