import api from '@/services/api';

export const getPersonal = async () => {
  const { data } = await api.get('/personal');
  return data;
};

export const getPersonalById = async (id: number) => {
  const { data } = await api.get(`/personal/${id}`);
  return data;
};

export const createPersonal = async (personalData: any) => {
  const { data } = await api.post('/personal', personalData );
  return data;
};

export const updatePersonal = async (id: number, personalData: any) => {
  const { data } = await api.put(`/personal/${id}`, personalData );
  return data;
};

export const resetPersonalTable = async () => {
  const { data } = await api.delete('/personal/reset');
  return data;
};

export const importPersonalOriginal = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/personal/import-excel-original', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};


