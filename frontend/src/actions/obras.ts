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

// Partidas
export const createPartida = async (partidaData: any) => {
  const response = await api.post('/obras/partidas', partidaData);
  return response.data;
};

export const getPartidas = async (idObra: number) => {
  const response = await api.get(`/obras/${idObra}/partidas`);
  return response.data;
};

export const updatePartida = async (id: number, partidaData: any) => {
  const response = await api.put(`/obras/partidas/${id}`, partidaData);
  return response.data;
};

export const deletePartida = async (id: number) => {
  const response = await api.delete(`/obras/partidas/${id}`);
  return response.data;
};

// SubPartidas
export const createSubPartida = async (subpartidaData: any) => {
  const response = await api.post('/obras/subpartidas', subpartidaData);
  return response.data;
};

export const getSubPartidas = async (idPartida: number) => {
  const response = await api.get(`/obras/partidas/${idPartida}/subpartidas`);
  return response.data;
};

export const updateSubPartida = async (id: number, subpartidaData: any) => {
  const response = await api.put(`/obras/subpartidas/${id}`, subpartidaData);
  return response.data;
};

export const deleteSubPartida = async (id: number) => {
  const response = await api.delete(`/obras/subpartidas/${id}`);
  return response.data;
};

// Costos de Partidas
export const createCostoPartida = async (costoData: any) => {
  const response = await api.post('/obras/partidas-costos', costoData);
  return response.data;
};

export const getCostosPartida = async (idPartida: number) => {
  const response = await api.get(`/obras/partidas/${idPartida}/costos`);
  return response.data;
};

export const updateCostoPartida = async (id: number, costoData: any) => {
  const response = await api.put(`/obras/partidas-costos/${id}`, costoData);
  return response.data;
};

export const deleteCostoPartida = async (id: number) => {
  const response = await api.delete(`/obras/partidas-costos/${id}`);
  return response.data;
};

// Costos de SubPartidas
export const createCostoSubPartida = async (costoData: any) => {
  const response = await api.post('/obras/subpartidas-costos', costoData);
  return response.data;
};

export const getCostosSubPartida = async (idSubPartida: number) => {
  const response = await api.get(`/obras/subpartidas/${idSubPartida}/costos`);
  return response.data;
};

export const updateCostoSubPartida = async (id: number, costoData: any) => {
  const response = await api.put(`/obras/subpartidas-costos/${id}`, costoData);
  return response.data;
};

export const deleteCostoSubPartida = async (id: number) => {
  const response = await api.delete(`/obras/subpartidas-costos/${id}`);
  return response.data;
};

// Incrementos
export const getIncrementos = async () => {
  const response = await api.get('/obras/incrementos');
  return response.data;
};

export const getIncremento = async (id: number) => {
  const response = await api.get(`/obras/incrementos/${id}`);
  return response.data;
};

export const createIncremento = async (incrementoData: any) => {
  const response = await api.post('/obras/incrementos', incrementoData);
  return response.data;
};

export const updateIncremento = async (id: number, incrementoData: any) => {
  const response = await api.put(`/obras/incrementos/${id}`, incrementoData);
  return response.data;
};

export const deleteIncremento = async (id: number) => {
  const response = await api.delete(`/obras/incrementos/${id}`);
  return response.data;
};