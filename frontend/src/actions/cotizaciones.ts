import api from '@/services/api';

// Cotización
export const addCotizacion = async (cotizacionData: {
  id_cliente: number;
  nombre_proyecto: string;
  descripcion_proyecto?: string;
  fecha_inicio?: string;
  fecha_vencimiento?: string;
  moneda: string;
  estado: 'borrador' | 'finalizada' | 'aprobada' | 'rechazada';
}) => {
  const response = await api.post('/cotizaciones', cotizacionData);
  return response.data.id_cotizacion;
};

// Obras
export const addObras = async (obras: Array<{
  id_cotizacion: number;
  nombre_obra: string;
  descripcion?: string;
  ubicacion?: string;
}>) => {
  const idsObras = [];
  
  for (const obra of obras) {
    const idCotizacion = obra.id_cotizacion;
    const response = await api.post(`/cotizaciones/${idCotizacion}/obras`, obra);
    idsObras.push(response.data.id_obra);
  }
  
  return idsObras;
};

// Items
export const addItems = async (items: Array<{
  id_obra: string;
  codigo?: string;
  descripcion_tarea: string;
  id_especialidad?: number;
  id_unidad?: number;
  cantidad?: number;
  precio_unitario?: number;
}>) => {
  const idsItems = [];
  
  for (const item of items) {
    const idObra = item.id_obra;
    const response = await api.post(`/cotizaciones/obras/${idObra}/items`, item);
    idsItems.push(response.data.id_item_obra);
  }
  
  return idsItems;
};

// Costos (Item Recursos)
export const addCostos = async (costos: Array<{
  id_item_obra: string;
  id_recurso: number;
  cantidad: number;
  precio_unitario_aplicado: number;
  total_linea: number;
}>) => {
  const idsCostos = [];
  
  for (const costo of costos) {
    const idItem = costo.id_item_obra;
    const response = await api.post(`/cotizaciones/items/${idItem}/costos`, costo);
    idsCostos.push(response.data.id_item_costo);
  }
  
  return idsCostos;
};

// Incrementos
export const addIncrementos = async (incrementos: Array<{
  id_item_obra: string;
  concepto: string;
  tipo_incremento: 'porcentaje' | 'monto_fijo';
  valor: number;
  monto_calculado: number;
  porcentaje?: number;
  descripcion?: string;
}>) => {
  const idsIncrementos = [];
  
  for (const incremento of incrementos) {
    const idItem = incremento.id_item_obra;
    const response = await api.post(`/cotizaciones/items/${idItem}/incrementos`, incremento);
    idsIncrementos.push(response.data.id_incremento);
  }
  
  return idsIncrementos;
};

