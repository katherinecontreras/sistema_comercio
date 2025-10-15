import api from '@/services/api';

export interface Cotizacion {
  id_cotizacion: number;
  id_cliente: number;
  nombre_proyecto: string;
  fecha_creacion: string;
  estado: string;
}

export interface CotizacionCreate {
  id_cliente: number;
  nombre_proyecto: string;
  fecha_creacion: string;
}

export async function fetchCotizaciones(): Promise<Cotizacion[]> {
  const { data } = await api.get('/cotizaciones');
  return data;
}

export async function createCotizacion(payload: CotizacionCreate): Promise<Cotizacion> {
  const { data } = await api.post('/cotizaciones', payload);
  return data;
}

export async function fetchCotizacionPlanilla(id: number) {
  const { data } = await api.get(`/cotizaciones/${id}/planilla`);
  return data;
}
