import api from '@/services/api';

// Tipos de Recursos (Planillas)
export const getTypesOfRecursos = async () => {
  const response = await api.get('/catalogos/tipos_recurso');
  return response.data;
};

export const addNewPlanilla = async (formData: { nombre: string; icono: string }) => {
  const response = await api.post('/catalogos/tipos_recurso', formData);
  return response.data;
};

// Recursos
export const getRecursosFrom = async (idTipoRecurso: number) => {
  const response = await api.get('/catalogos/recursos');
  return response.data.filter((r: any) => r.id_tipo_recurso === idTipoRecurso);
};

export const addRecursos = async (recursoData: any) => {
  const response = await api.post('/catalogos/recursos', recursoData);
  return response.data;
};

// Unidades
export const getUnidades = async () => {
  const response = await api.get('/catalogos/unidades');
  return response.data;
};

export const addUnidad = async (formDataToSend: { nombre: string; abreviatura: string }) => {
  const response = await api.post('/catalogos/unidades', formDataToSend);
  return response.data;
};

// Especialidades
export const getEspecialidades = async () => {
  const response = await api.get('/catalogos/especialidades');
  return response.data;
};

export const addEspecialidad = async (formData: { nombre: string; descripcion?: string }) => {
  const response = await api.post('/catalogos/especialidades', formData);
  return response.data;
};


