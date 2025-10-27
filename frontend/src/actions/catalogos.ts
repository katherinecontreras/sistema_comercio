import api from '@/services/api';

// Tipos de Tiempo
export const getTiposTiempo = async () => {
  const response = await api.get('/catalogos/tipos-tiempo');
  return response.data;
};

export const createTipoTiempo = async (tipoData: { nombre: string; medida: string }) => {
  const response = await api.post('/catalogos/tipos-tiempo', tipoData);
  return response.data;
};

// Tipos de Recursos (Planillas)
export const getTiposRecursos = async () => {
  const response = await api.get('/catalogos/tipos_recurso');
  return response.data;
};

export const createTipoRecurso = async (tipoData: { nombre: string; icono?: string }) => {
  const formData = new FormData();
  formData.append('nombre', tipoData.nombre);
  if (tipoData.icono) {
    formData.append('icono', tipoData.icono);
  }
  
  const response = await api.post('/catalogos/tipos_recurso', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateTipoRecurso = async (idTipo: number, tipoData: any) => {
  const response = await api.put(`/catalogos/tipos_recurso/${idTipo}`, tipoData);
  return response.data;
};

export const deleteTipoRecurso = async (idTipo: number) => {
  const response = await api.delete(`/catalogos/tipos_recurso/${idTipo}`);
  return response.data;
};

// Recursos
export const getRecursos = async () => {
  const response = await api.get('/catalogos/recursos');
  return response.data;
};

export const getRecursosByTipo = async (idTipoRecurso: number) => {
  const response = await api.get(`/catalogos/recursos/tipo/${idTipoRecurso}`);
  return response.data;
};

export const createRecurso = async (recursoData: any) => {
  const response = await api.post('/catalogos/recursos', recursoData);
  return response.data;
};

export const updateRecurso = async (idRecurso: number, recursoData: any) => {
  const response = await api.put(`/catalogos/recursos/${idRecurso}`, recursoData);
  return response.data;
};

export const deleteRecurso = async (idRecurso: number) => {
  const response = await api.delete(`/catalogos/recursos/${idRecurso}`);
  return response.data;
};


// Unidades
export const getUnidades = async () => {
  const response = await api.get('/catalogos/unidades');
  return response.data;
};

export const addUnidad = async (formDataToSend: { nombre: string; simbolo: string; descripcion?: string }) => {
  const formData = new FormData();
  formData.append('nombre', formDataToSend.nombre);
  formData.append('simbolo', formDataToSend.simbolo);
  formData.append('descripcion', formDataToSend.descripcion || '');
  
  const response = await api.post('/catalogos/unidades', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Especialidades
export const getEspecialidades = async () => {
  const response = await api.get('/catalogos/especialidades');
  return response.data;
};

export const addEspecialidad = async (formData: { nombre: string; descripcion?: string }) => {
  const formDataToSend = new FormData();
  formDataToSend.append('nombre', formData.nombre);
  formDataToSend.append('descripcion', formData.descripcion || '');
  
  const response = await api.post('/catalogos/especialidades', formDataToSend, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Clientes
export const getClientes = async () => {
  const response = await api.get('/catalogos/clientes');
  return response.data;
};

export const addCliente = async (clienteData: { razon_social: string; cuit: string, direccion: string }) => {
  const response = await api.post('/catalogos/clientes', clienteData);
  return response.data;
};


