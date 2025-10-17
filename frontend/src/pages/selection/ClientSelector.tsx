import React, { useEffect, useState } from 'react';
import { Cliente, fetchClientes } from '@/api/clients';
import { Button } from '@/components/ui/button';
import AddClientModal from '@/components/modals/AddClientModal';
import { useAppStore } from '@/store/app';

interface Props {
  onGenerarCotizacion: () => void;
  onIngresarSistema: () => void;
}

const ClientSelector: React.FC<Props> = ({ onGenerarCotizacion, onIngresarSistema }) => {
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
        <h3 className="text-xl font-semibold text-white">Seleccionar Cliente</h3>
        <Button onClick={() => setOpen(true)} className="bg-sky-600 hover:bg-sky-700">
          Agregar Nuevo Cliente
        </Button>
      </div>
      <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-3 text-white">Razón Social</th>
              <th className="text-left p-3 text-white">CUIT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const active = selectedId === c.id_cliente;
              return (
                <tr
                  key={c.id_cliente}
                  className={`cursor-pointer transition-colors ${
                    active ? 'bg-sky-900/50' : 'hover:bg-slate-700'
                  }`}
                  onClick={() => {
                    setSelectedId(c.id_cliente);
                    selectClient(c.id_cliente);
                  }}
                >
                  <td className="p-3 text-white">{c.razon_social}</td>
                  <td className="p-3 text-white">{c.cuit}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-slate-400 text-center" colSpan={2}>
                  Sin clientes cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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



