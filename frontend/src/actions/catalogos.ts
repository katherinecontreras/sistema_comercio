import api from '@/services/api';

// Clientes
export const getClientes = async () => {
  const response = await api.get('/catalogos/clientes');
  return response.data;
};

export const addCliente = async (clienteData: { razon_social: string; cuit: string, actividad: string }) => {
  const response = await api.post('/catalogos/clientes', clienteData);
  return response.data;
};


