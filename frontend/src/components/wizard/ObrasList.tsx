import React, { useEffect, useState } from 'react';
import { Obra, fetchObrasByCotizacion } from '@/api/obras';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface Props {
  id_cotizacion: number;
  onObraSelect?: (obra: Obra) => void;
}

const ObrasList: React.FC<Props> = ({ id_cotizacion, onObraSelect }) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(false);

  const loadObras = async () => {
    setLoading(true);
    try {
      const data = await fetchObrasByCotizacion(id_cotizacion);
      setObras(data);
    } catch (err) {
      console.error('Error al cargar obras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObras();
  }, [id_cotizacion]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Obras de la Cotización</h3>
      
      {loading ? (
        <p>Cargando obras...</p>
      ) : obras.length === 0 ? (
        <p className="text-muted-foreground">No hay obras agregadas aún.</p>
      ) : (
        <div className="space-y-2">
          {obras.map((obra) => (
            <div
              key={obra.id_obra}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => onObraSelect?.(obra)}
            >
              <div>
                <h4 className="font-medium">{obra.nombre_obra}</h4>
                {obra.descripcion && (
                  <p className="text-sm text-muted-foreground">{obra.descripcion}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObrasList;
