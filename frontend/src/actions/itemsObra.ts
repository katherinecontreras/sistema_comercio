import api from '@/services/api';

// Obras
export const createItemsObra = async (itemsObraData: any) => {
  const response = await api.post('/itemsObra', itemsObraData);
  return response.data;
};

export const getItemsObra = async () => {
  const { data } = await api.get(`/itemsObra`);
  return data;
};

export const getItemObra = async (id: number) => {
  const response = await api.get(`/itemsObra/${id}`);
  return response.data;
};

export const updateItemObra = async (id: number, itemsObraData: any) => {
  const response = await api.put(`/itemsObra/${id}`, itemsObraData);
  return response.data;
};
