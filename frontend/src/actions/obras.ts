import api from '@/services/api';

// Obras

export const getObras = async () => {
  const { data } = await api.get('/obras/');
  return data;
};

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
