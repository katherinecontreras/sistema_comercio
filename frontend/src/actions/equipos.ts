import api from '@/services/api';

export const getEquipos = async () => {
  const { data } = await api.get('/equipos/');
  return data;
};

export const getEquiposById = async (id: number) => {
  const { data } = await api.get(`/equipos/${id}`);
  return data;
};

export const createEquipos = async (equiposData: any) => {
  const { data } = await api.post('/equipos', equiposData);
  return data;
};

export const updateEquipos = async (id: number, equiposData: any) => {
  const { data } = await api.put(`/equipos/${id}`, equiposData);
  return data;
};

export const resetEquipos = async () => {
  const { data } = await api.delete('/equipos/reset');
  return data;
};

export const importEquiposOriginal = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/equipos/import-excel-original', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};


