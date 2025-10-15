import React, { useEffect, useState } from 'react';
import { Cliente, fetchClientes } from '@/api/clients';
import { Button } from '@/components/ui/button';
import AddClientModal from '@/components/modals/AddClientModal';
import { useAppStore } from '@/store/app';

interface Props {
  onContinue: () => void;
}

const ClientSelector: React.FC<Props> = ({ onContinue }) => {
  const [rows, setRows] = useState<Cliente[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const selectClient = useAppStore((s) => s.selectClient);

  const load = async () => {
    const data = await fetchClientes();
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Seleccionar Cliente</h3>
        <Button onClick={() => setOpen(true)}>Agregar Nuevo Cliente</Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-left p-3">Razón Social</th>
              <th className="text-left p-3">CUIT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const active = selectedId === c.id_cliente;
              return (
                <tr
                  key={c.id_cliente}
                  className={`cursor-pointer ${active ? 'bg-primary/10' : 'hover:bg-accent'}`}
                  onClick={() => {
                    setSelectedId(c.id_cliente);
                    selectClient(c.id_cliente);
                  }}
                >
                  <td className="p-3">{c.razon_social}</td>
                  <td className="p-3">{c.cuit}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="p-3" colSpan={2}>Sin clientes cargados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button disabled={!selectedId} onClick={onContinue}>Continuar</Button>
      </div>
      <AddClientModal open={open} onClose={() => setOpen(false)} onCreated={load} />
    </div>
  );
};

export default ClientSelector;



