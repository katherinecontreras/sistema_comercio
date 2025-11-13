import api from '@/services/api';

export const getTiposMaterial = async () => {
  const { data } = await api.get('/materiales/tipos');
  return data;
};

export const getTipoMaterialDetalle = async (id_tipo_material: number) => {
  const { data } = await api.get(`/materiales/tipos/${id_tipo_material}`);
  return data;
};

export const createTipoMaterial = async (payload: {
  titulo: string;
  headers_base_active?: number[];
  headers_base_calculations?: any;
  headers_atributes?: any;
}) => {
  const { data } = await api.post('/materiales/tipos', payload);
  return data;
};

export const updateTipoMaterial = async (
  id_tipo_material: number,
  payload: {
    titulo: string;
    headers_base_active?: number[];
    headers_base_calculations?: any;
    headers_atributes?: any;
  },
) => {
  const { data } = await api.put(`/materiales/tipos/${id_tipo_material}`, payload);
  return data;
};

export const getMateriales = async () => {
  const { data } = await api.get('/materiales');
  return data;
};

export const getMaterialesPorTipo = async (id_tipo_material: number) => {
  const { data } = await api.get(`/materiales/tipo/${id_tipo_material}`);
  return data;
};

export const downloadExcelTipoMaterial = async (id_tipo_material: number) => {
  const response = await api.get(`/materiales/tipos/${id_tipo_material}/excel`, {
    responseType: 'blob',
    headers: {
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
  return response.data as Blob;
};

export const createMaterial = async (payload: any) => {
  const { data } = await api.post('/materiales', payload);
  return data;
};

export const updateMaterial = async (id_material: number, payload: any) => {
  const { data } = await api.put(`/materiales/${id_material}`, payload);
  return data;
};

export const deleteMaterial = async (id_material: number) => {
  await api.delete(`/materiales/${id_material}`);
};


