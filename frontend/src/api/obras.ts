import api from '@/services/api';

export interface Obra {
  id_obra: number;
  id_cotizacion: number;
  nombre_obra: string;
  descripcion?: string;
}

export interface ObraCreate {
  id_cotizacion: number;
  nombre_obra: string;
  descripcion?: string;
}

export async function createObra(payload: ObraCreate): Promise<Obra> {
  const { data } = await api.post(`/cotizaciones/${payload.id_cotizacion}/obras`, payload);
  return data;
}

export async function fetchObrasByCotizacion(id_cotizacion: number): Promise<Obra[]> {
  const { data } = await api.get(`/cotizaciones/${id_cotizacion}/obras`);
  return data;
}
