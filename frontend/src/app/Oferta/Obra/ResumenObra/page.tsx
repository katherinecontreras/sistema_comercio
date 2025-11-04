import React, { useMemo } from 'react';
import useObraBaseStore from '@/store/obra/obraStore';
import useItemObraBaseStore from '@/store/itemObra/itemObraStore';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumenObra: React.FC = () => {
  const { obra, setEditObra } = useObraBaseStore();
  const { itemsObra, setItemCreate } = useItemObraBaseStore();
  const navigate = useNavigate();

  const totalItems = useMemo(() => {
    if (!obra?.id_obra) return 0;
    return (itemsObra || []).filter(i => i.id_obra === obra.id_obra).length;
  }, [itemsObra, obra?.id_obra]);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {obra?.nombre_proyecto || 'Obra sin nombre'}
          </h1>
          {obra?.codigo_proyecto && (
            <p className="mt-1 text-sm text-slate-400">Código: {obra.codigo_proyecto}</p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setEditObra(true)}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          title="Editar obra"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {/* Tarjeta Items de Obra */}
      <div className="px-2">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-white">Items de Obra</h2>
              <p className="text-sm text-slate-400">Cantidad total de ítems vinculados a esta obra</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-sky-400">{totalItems}</div>
              <Button
                onClick={() => { setItemCreate(true); navigate('/oferta/items'); }}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                Agregar nuevo item
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenObra;



