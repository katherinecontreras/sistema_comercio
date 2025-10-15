import api from '@/services/api';

export interface Cliente {
  id_cliente: number;
  razon_social: string;
  cuit: string;
  direccion?: string;
}

export interface ClienteCreate {
  razon_social: string;
  cuit: string;
  direccion?: string;
}

export async function fetchClientes(): Promise<Cliente[]> {
  const { data } = await api.get('/catalogos/clientes');
  return data;
}

export async function createCliente(payload: ClienteCreate): Promise<Cliente> {
  const { data } = await api.post('/catalogos/clientes', payload);
  return data;
}



