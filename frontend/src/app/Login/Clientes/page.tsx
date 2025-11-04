import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AddClientModal from '@/components/modals/AddClientModal';
import { useAppStore } from '@/store/app';
import { getClientes } from '@/actions/catalogos';
import { DataTable } from '@/components';
import { useNavigate } from 'react-router-dom';
import {columnsClient} from '@/components/tables/Columns';
import { Cliente } from '@/components/tables/Columns';

const ClientSelector: React.FC = () => {
  const [rows, setRows] = useState<Cliente[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const selectClient = useAppStore((s) => s.selectClient);

  const navigate = useNavigate();
  
  const handleGenerarCotizacion = () => {
    navigate('/obra');
  };

  const handleIngresarSistema = () => {
    navigate('/dashboard');
  };

  const load = async () => {
    const data = await getClientes();
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4 ">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Seleccionar Cliente</h3>
        <Button onClick={() => setOpen(true)} className="bg-sky-600 hover:bg-sky-700">
          Agregar Nuevo Cliente
        </Button>
      </div>
      <DataTable
        data={rows}
        columns={columnsClient}
        searchable={true}
        searchPlaceholder="Buscar cliente..."
        selectedRow={rows.find(r => r.id_cliente === selectedId)}
        onRowClick={(row:any) => {
          setSelectedId(row.id_cliente);
          selectClient(row.id_cliente);
        }}
        rowKey="id_cliente"
        className="mt-6"
        emptyMessage="No hay clientes registrados"
      />
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          disabled={!selectedId} 
          onClick={handleIngresarSistema}
          className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
        >
          Ingresar al Sistema
        </Button>
        <Button 
          disabled={!selectedId} 
          onClick={handleGenerarCotizacion}
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



