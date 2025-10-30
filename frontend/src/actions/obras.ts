import api from '@/services/api';

// Obras
export const createObra = async (obraData: any) => {
  const response = await api.post('/obras', obraData);
  return response.data;
};

export const getObra = async (id: number) => {
  const response = await api.get(`/obras/${id}`);
  return response.data;
};

export const updateObra = async (id: number, obraData: any) => {
  const response = await api.put(`/obras/${id}`, obraData);
  return response.data;
};

export const finalizarObra = async (id: number) => {
  const response = await api.post(`/obras/${id}/finalizar`);
  return response.data;
};
