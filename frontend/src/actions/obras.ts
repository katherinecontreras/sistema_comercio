import api from '@/services/api';

// Obras (Ofertas)
export const createObra = async (obraData: {
  id_cliente: number;
  codigo_proyecto?: string;
  nombre_proyecto: string;
  descripcion_proyecto?: string;
  fecha_creacion: string;
  fecha_entrega?: string;
  fecha_recepcion?: string;
  moneda: string;
  estado: string;
}) => {
  const response = await api.post('/obras', obraData);
  return response.data;
};

export const getObras = async () => {
  const response = await api.get('/obras');
  return response.data;
};

export const updateObra = async (idObra: number, obraData: any) => {
  const response = await api.put(`/obras/${idObra}`, obraData);
  return response.data;
};

export const getObra = async (id: number) => {
  const response = await api.get(`/obras/${id}`);
  return response.data;
};

// Partidas
export const createPartida = async (idObra: number, partidaData: {
  nombre_partida: string;
  descripcion?: string;
  codigo?: string;
  duracion?: number;
  id_tipo_tiempo?: number;
  especialidad?: any[];
  tiene_subpartidas?: boolean;
}) => {
  console.log('=== LLAMANDO A API createPartida ===');
  console.log('URL:', `/obras/${idObra}/partidas`);
  console.log('Datos:', partidaData);
  
  try {
    const response = await api.post(`/obras/${idObra}/partidas`, partidaData);
    console.log('✅ Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en createPartida:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
};

export const getPartidas = async (idObra: number) => {
  const response = await api.get(`/obras/${idObra}/partidas`);
  return response.data;
};

// SubPartidas
export const createSubPartida = async (idPartida: number, subpartidaData: {
  codigo?: string;
  descripcion_tarea: string;
  id_especialidad?: number;
  id_unidad?: number;
  cantidad: number;
  precio_unitario: number;
}) => {
  const response = await api.post(`/obras/partidas/${idPartida}/subpartidas`, subpartidaData);
  return response.data;
};

export const getSubPartidas = async (idPartida: number) => {
  const response = await api.get(`/obras/partidas/${idPartida}/subpartidas`);
  return response.data;
};

// Costos de Partidas (cuando no tienen subpartidas)
export const addCostoPartida = async (idPartida: number, costoData: {
  id_recurso: number;
  cantidad: number;
  precio_unitario_aplicado: number;
  total_linea: number;
}) => {
  const response = await api.post(`/obras/partidas/${idPartida}/costos`, costoData);
  return response.data;
};

export const getCostosPartida = async (idPartida: number) => {
  const response = await api.get(`/obras/partidas/${idPartida}/costos`);
  return response.data;
};

// Costos de SubPartidas
export const addCostoSubPartida = async (idSubPartida: number, costoData: {
  id_recurso: number;
  cantidad: number;
  precio_unitario_aplicado: number;
  total_linea: number;
}) => {
  const response = await api.post(`/obras/subpartidas/${idSubPartida}/costos`, costoData);
  return response.data;
};

export const getCostosSubPartida = async (idSubPartida: number) => {
  const response = await api.get(`/obras/subpartidas/${idSubPartida}/costos`);
  return response.data;
};

// Incrementos
export const createIncremento = async (incrementoData: {
  id_partida?: number;
  id_subpartida?: number;
  concepto: string;
  descripcion?: string;
  tipo_incremento: string;
  valor: number;
  porcentaje: number;
  monto_calculado: number;
}) => {
  const response = await api.post('/obras/incrementos', incrementoData);
  return response.data;
};

export const getIncrementos = async (idObra: number) => {
  const response = await api.get(`/obras/${idObra}/incrementos`);
  return response.data;
};

export const updateIncremento = async (idIncremento: number, incrementoData: any) => {
  const response = await api.put(`/obras/incrementos/${idIncremento}`, incrementoData);
  return response.data;
};

export const deleteIncremento = async (idIncremento: number) => {
  const response = await api.delete(`/obras/incrementos/${idIncremento}`);
  return response.data;
};

// Tipos de Tiempo
export const getTiposTiempo = async () => {
  const response = await api.get('/catalogos/tipos-tiempo');
  return response.data;
};

export const createTipoTiempo = async (tipoData: { nombre: string; medida: string }) => {
  const response = await api.post('/obras/tipos-tiempo', tipoData);
  return response.data;
};
