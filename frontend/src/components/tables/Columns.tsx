import { Personal } from "@/store/personal/personalStore";
import { Equipo } from "@/store/equipo/equipoStore";

export interface Cliente {
  id_cliente: number;
  razon_social: string;
  cuit: string;
  actividad?: string;
}


export const columnsClient = [
    {
      key: 'razon_social' as keyof Cliente,
      header: 'Razón Social',
      sortable: true
    },
    {
      key: 'cuit' as keyof Cliente,
      header: 'CUIT',
      sortable: true
    },
    {
      key: 'actividad' as keyof Cliente,
      header: 'ACTIVIDAD',
      sortable: true
    }
];

export const columnsEquipos: { key: keyof Equipo; header: string; sortable?: boolean }[] = [
  { key: 'detalle', header: 'Detalle', sortable: true },
  { key: 'Amortizacion', header: 'Amortización' },
  { key: 'Seguro', header: 'Seguro' },
  { key: 'Patente', header: 'Patente' },
  { key: 'Transporte', header: 'Transporte' },
  { key: 'Fee_alquiler', header: 'Fee alquiler' },
  { key: 'Combustible', header: 'Combustible' },
  { key: 'Lubricantes', header: 'Lubricantes' },
  { key: 'Neumaticos', header: 'Neumáticos' },
  { key: 'Mantenim', header: 'Mantenim.' },
  { key: 'Operador', header: 'Operador' },
  { key: 'Total_mes', header: 'Total/Mes' },
];

export const sectionConfligPersonal: Record<string, { tipo: string; columns: { label: string; key: keyof Personal }[] }> = {
    sueldos: {
    tipo: 'Sueldos',
    columns: [
        { label: 'Sueldo Bruto', key: 'sueldo_bruto' },
        { label: 'Sueldo No Rem.', key: 'sueldo_no_remunerado' },
        { label: 'Neto Bolsillo Mensual', key: 'neto_bolsillo_mensual' },
    ],
    },
    costos: {
    tipo: 'Costos',
    columns: [
        { label: 'Seguros ART + VO', key: 'seguros_art_mas_vo' },
        { label: 'Costo Mensual s/ Seg.', key: 'costo_mensual_sin_seguros' },
        { label: 'Costo Total Mensual', key: 'costo_total_mensual' },
        { label: 'Costo Total (Apertura)', key: 'costo_total_mensual_apertura' },
    ],
    },
    descuentos: {
    tipo: 'Descuentos',
    columns: [
        { label: 'Descuentos', key: 'descuentos' },
        { label: '% Descuento', key: 'porc_descuento' },
    ],
    },
    cargas_sociales: {
    tipo: 'Cargas Sociales',
    columns: [
        { label: 'Cargas Sociales', key: 'cargas_sociales' },
        { label: '% Cargas s/ Bruto', key: 'porc_cargas_sociales_sobre_sueldo_bruto' },
    ],
    },
    otros: {
    tipo: 'Otros',
    columns: [
        { label: 'Examen Médico', key: 'examen_medico' },
        { label: 'Indumentaria y EPP', key: 'indumentaria_y_epp' },
        { label: 'Pernoctes y Viajes', key: 'pernoctes_y_viajes' },
    ],
    },
};

export const sectionConfigEquipos: Record<string, { tipo: string; columns: { label: string; key: keyof Equipo }[] }> = {
    propiedad: {
        tipo: 'Costos de Propiedad',
        columns: [
            { label: 'Amortización', key: 'Amortizacion' },
            { label: 'Seguro', key: 'Seguro' },
            { label: 'Patente', key: 'Patente' },
        ],
    },
    operacion: {
        tipo: 'Costos de Operación',
        columns: [
            { label: 'Transporte', key: 'Transporte' },
            { label: 'Fee Alquiler', key: 'Fee_alquiler' },
            { label: 'Combustible', key: 'Combustible' },
            { label: 'Lubricantes', key: 'Lubricantes' },
            { label: 'Neumáticos', key: 'Neumaticos' },
        ],
    },
    resumen: {
        tipo: 'Resumen',
        columns: [
            { label: 'Mantenimiento', key: 'Mantenim' },
            { label: 'Operador', key: 'Operador' },
            { label: 'Total/Mes', key: 'Total_mes' },
        ],
    },
};

export default {columnsClient,sectionConfligPersonal,sectionConfigEquipos}