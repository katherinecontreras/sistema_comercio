import api from '@/services/api';

// Obras
export const createTipoRecurso = async (tipoRecursoData: any) => {
  const response = await api.post('/recursos/tipoRecurso', tipoRecursoData);
  return response.data;
};

export const getTiposRecurso = async () => {
  const { data } = await api.get(`/recursos/tiposRecurso`);
  return data;
};

export const getTipoRecurso = async (id: number) => {
  const response = await api.get(`/recursos/tipoRecurso/${id}`);
  return response.data;
};

export const updateTipoRecurso = async (id: number, tipoRecursoData: any) => {
  const response = await api.put(`/recursos/tipoRecurso/${id}`, tipoRecursoData);
  return response.data;
};

// Recursos
export const getRecursos = async (tipoId?: number) => {
  const params = tipoId ? `?tipoId=${tipoId}` : '';
  const { data } = await api.get(`/recursos/${params}`);
  return data;
};

export const getRecurso = async (id: number) => {
  const response = await api.get(`/recursos/${id}`);
  return response.data;
};

export const createRecurso = async (recursoData: any) => {
  const response = await api.post('/recursos', recursoData);
  return response.data;
};

export const updateRecurso = async (id: number, recursoData: any) => {
  const response = await api.put(`/recursos/${id}`, recursoData);
  return response.data;
};