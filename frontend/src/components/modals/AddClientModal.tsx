import React, { useState } from 'react';
import { createCliente } from '@/api/clients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AddClientModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [razon_social, setRazon] = useState('');
  const [cuit, setCuit] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createCliente({ razon_social, cuit, direccion });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Agregar Cliente</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm">Razón Social</label>
            <Input value={razon_social} onChange={(e) => setRazon(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">CUIT</label>
            <Input value={cuit} onChange={(e) => setCuit(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">Dirección</label>
            <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button disabled={loading} type="submit">{loading ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;



