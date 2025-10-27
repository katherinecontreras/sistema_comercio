import React, { useEffect, useState } from 'react';
import { Cliente } from '@/store/cliente';
import { Button } from '@/components/ui/button';
import AddClientModal from '@/components/modals/AddClientModal';
import { useAppStore } from '@/store/app';
import { getClientes } from '@/actions/catalogos';
import { ModernTable } from '@/components/tables/ModernTable';

interface Props {
  onGenerarCotizacion: () => void;
  onIngresarSistema: () => void;
}

const ClientSelector: React.FC<Props> = ({ onGenerarCotizacion, onIngresarSistema }) => {
  const [rows, setRows] = useState<Cliente[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const selectClient = useAppStore((s) => s.selectClient);

  const headers = ["Razón Social", "CUIT"];

  const data = rows.map((c) => ({
    "Razón Social": c.razon_social,
    CUIT: c.cuit,
    id_cliente: c.id_cliente,
  }));

  const load = async () => {
    const data = await getClientes();
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Seleccionar Cliente</h3>
        <Button onClick={() => setOpen(true)} className="bg-sky-600 hover:bg-sky-700">
          Agregar Nuevo Cliente
        </Button>
      </div>
      <ModernTable
        headers={headers}
        data={data}
        idKey="id_cliente"
        selectedId={selectedId}
        onRowClick={(id: any) => {
          setSelectedId(id);
          selectClient(id);
        }}
        onAddNew={() => setOpen(true)}
        searchable={true}
        className="mt-6"
      />
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          disabled={!selectedId} 
          onClick={onIngresarSistema}
          className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
        >
          Ingresar al Sistema
        </Button>
        <Button 
          disabled={!selectedId} 
          onClick={onGenerarCotizacion}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          Generar Cotización
        </Button>
      </div>
      <AddClientModal open={open} onClose={() => setOpen(false)} onCreated={load} />
    </div>
  );
};

export default ClientSelector;



