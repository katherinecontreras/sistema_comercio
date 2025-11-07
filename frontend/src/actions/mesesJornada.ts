import api from '@/services/api';

// ==================== INTERFACES ====================

export interface DiaMes {
  id_dia: number;
  id_mes: number;
  fecha: number;
  dia: string;
  hs_normales: number;
  hs_50porc: number;
  hs_100porc: number;
  total_horas: number;
}

export interface DiaMesUpdate {
  dia?: string;
  hs_normales?: number;
  hs_50porc?: number;
  hs_100porc?: number;
  total_horas?: number;
}

export interface MesResumen {
  id_mes: number;
  id_cliente: number;
  total_horas_normales: number;
  total_horas_50porc: number;
  total_horas_100porc: number;
  total_horas_fisicas: number;
  total_dias_trabajados: number;
  valor_mult_horas_viaje: number;
  horas_viaje: number;
}

export interface MesResumenUpdate {
  valor_mult_horas_viaje?: number;
}

// ==================== DIAS MES ====================

export const getDiasMesPorMes = async (id_mes: number): Promise<DiaMes[]> => {
  const { data } = await api.get(`/meses-jornada/dias-mes/mes/${id_mes}`);
  return data;
};

export const getDiaMesById = async (id_dia: number): Promise<DiaMes> => {
  const { data } = await api.get(`/meses-jornada/dias-mes/${id_dia}`);
  return data;
};

export const updateDiaMes = async (id_dia: number, diaMesData: DiaMesUpdate): Promise<DiaMes> => {
  // Convertir valores a enteros explícitamente
  const dataToSend: any = {};
  if (diaMesData.hs_normales !== undefined) {
    dataToSend.hs_normales = Math.round(Number(diaMesData.hs_normales) || 0);
  }
  if (diaMesData.hs_50porc !== undefined) {
    dataToSend.hs_50porc = Math.round(Number(diaMesData.hs_50porc) || 0);
  }
  if (diaMesData.hs_100porc !== undefined) {
    dataToSend.hs_100porc = Math.round(Number(diaMesData.hs_100porc) || 0);
  }
  if (diaMesData.total_horas !== undefined) {
    dataToSend.total_horas = Math.round(Number(diaMesData.total_horas) || 0);
  }
  if (diaMesData.dia !== undefined) {
    dataToSend.dia = diaMesData.dia;
  }
  
  const { data } = await api.put(`/meses-jornada/dias-mes/${id_dia}`, dataToSend);
  return data;
};

// ==================== MES RESUMEN ====================

export const getMesResumenPorCliente = async (id_cliente: number): Promise<MesResumen> => {
  const { data } = await api.get(`/meses-jornada/mes-resumen/cliente/${id_cliente}`);
  return data;
};

export const getMesResumen = async (id_mes: number): Promise<MesResumen> => {
  const { data } = await api.get(`/meses-jornada/mes-resumen/${id_mes}`);
  return data;
};

export const updateMesResumen = async (
  id_mes: number,
  mesResumenData: MesResumenUpdate
): Promise<MesResumen> => {
  const { data } = await api.put(`/meses-jornada/mes-resumen/${id_mes}`, mesResumenData);
  return data;
};
