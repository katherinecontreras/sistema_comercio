import { ItemObra } from '@/store/itemObra/itemObraStore';
import { Equipo } from '@/store/equipo/equipoStore';
import { Personal } from '@/store/personal/personalStore';
import {
  Costo,
  TipoCosto,
  CostoItemObra,
  CostoValue,
  TipoCostoItem,
} from '@/store/costo/costoStore';

interface GenerateCostInput {
  items: ItemObra[];
  equipos: Equipo[];
  personal: Personal[];
}

interface GenerateCostOutput {
  tiposCosto: TipoCosto[];
  costos: Costo[];
  itemsActualizados: ItemObra[];
}

const roundToTwo = (value: number) => Number(value.toFixed(2));

const createTipoCostoBase = (
  id: number,
  tipo: string,
  descripcion: string,
  items: ItemObra[]
): TipoCosto => ({
  id_tipo_costo: id,
  tipo,
  descripcion,
  costo_total: 0,
  items: items.map<TipoCostoItem>((item) => ({
    id: item.id_item_Obra,
    tipo,
    desc: item.descripcion,
    costo_total: 0,
  })),
});

const updateTipoCostoItemTotal = (tipoCosto: TipoCosto, itemId: number, delta: number) => {
  const target = tipoCosto.items.find((entry) => entry.id === itemId);
  if (target) {
    target.costo_total = roundToTwo((target.costo_total || 0) + delta);
  }
};

const buildItemsObraEntries = (
  items: ItemObra[],
  valoresBase: { [id: number]: number },
  costoUnitario: number,
  costoTotal: number,
): CostoItemObra[] =>
  items.map((item) => {
    const cantidad = valoresBase[item.id_item_Obra] || 0;
    const total = roundToTwo(cantidad * costoUnitario);
    const porcentaje = costoTotal > 0 ? total / costoTotal : 0;
    return {
      idItem: item.id_item_Obra,
      cantidad,
      total,
      porcentaje,
    };
  });

export const generateCostStructures = ({
  items,
  equipos,
  personal,
}: GenerateCostInput): GenerateCostOutput => {
  const tipoCostoEquipo = createTipoCostoBase(
    1,
    'equipo',
    'Inmuebles , rodados y equipos',
    items
  );
  const tipoCostoCombustibles = createTipoCostoBase(
    3,
    'equipo',
    'Combustibles  y Lubricantes',
    items
  );
  const tipoCostoNeumaticos = createTipoCostoBase(
    4,
    'equipo',
    'Neumaticos y Mantenimiento',
    items
  );
  const tipoCostoPersonal = createTipoCostoBase(
    2,
    'personal',
    'Detalle de personal',
    items
  );

  const equipoMap = new Map(equipos.map((eq) => [eq.id_equipo, eq]));
  const personalMap = new Map(personal.map((per) => [per.id_personal, per]));

  const costos: Costo[] = [];
  let idCostoCounter = 1;

  const itemTotalAcumulado = new Map<number, number>();
  const acumulaTotalItem = (itemId: number, delta: number) => {
    itemTotalAcumulado.set(itemId, roundToTwo((itemTotalAcumulado.get(itemId) || 0) + delta));
  };

  // Procesar equipos
  const equiposUsados = new Map<number, Map<number, number>>();
  items.forEach((item) => {
    (item.equipos || []).forEach((eq) => {
      const eqData = equipoMap.get(eq.id_equipo);
      if (!eqData) return;
      const itemMeses = eq.meses_operario || 0;
      if (itemMeses <= 0) return;
      const usoPorItem = equiposUsados.get(eq.id_equipo) ?? new Map<number, number>();
      usoPorItem.set(item.id_item_Obra, (usoPorItem.get(item.id_item_Obra) || 0) + itemMeses);
      equiposUsados.set(eq.id_equipo, usoPorItem);
    });
  });

  equiposUsados.forEach((usoPorItem, idEquipo) => {
    const equipo = equipoMap.get(idEquipo);
    if (!equipo) return;

    const cantidadTotal = Array.from(usoPorItem.values()).reduce((sum, meses) => sum + meses, 0);
    if (cantidadTotal <= 0) return;

    const valuesBase: CostoValue[] = [
      { name: 'Amortizacion', value: roundToTwo(equipo.Amortizacion) },
      { name: 'Seguro', value: roundToTwo(equipo.Seguro) },
      { name: 'Patente', value: roundToTwo(equipo.Patente) },
      { name: 'Transporte', value: roundToTwo(equipo.Transporte) },
      { name: 'Fee Alquiler ', value: roundToTwo(equipo.Fee_alquiler) },
    ];

    const costoUnitario = roundToTwo(valuesBase.reduce((sum, item) => sum + item.value, 0));
    const costoTotal = roundToTwo(costoUnitario * cantidadTotal);
    const promedioValue: CostoValue = {
      name: 'Promedio',
      value: roundToTwo(equipo.Amortizacion * 100),
    };
    const values: CostoValue[] = [...valuesBase, promedioValue];
    const itemsObra = buildItemsObraEntries(
      items,
      Object.fromEntries(usoPorItem.entries()),
      costoUnitario,
      costoTotal,
    );

    const costo: Costo = {
      id_costo: idCostoCounter++,
      id_tipo_costo: 1,
      detalle: equipo.detalle,
      values,
      unidad: 'mes',
      costo_unitario: costoUnitario,
      cantidad: roundToTwo(cantidadTotal),
      costo_total: costoTotal,
      itemsObra,
    };

    costos.push(costo);
    tipoCostoEquipo.costo_total = roundToTwo(tipoCostoEquipo.costo_total + costoTotal);

    itemsObra.forEach((entry) => {
      if (entry.total > 0) {
        acumulaTotalItem(entry.idItem, entry.total);
        updateTipoCostoItemTotal(tipoCostoEquipo, entry.idItem, entry.total);
      }
    });

    const categoriaEquipoAdicionales: Array<{
      tipoCosto: TipoCosto;
      id_tipo_costo: number;
      values: CostoValue[];
    }> = [
      {
        tipoCosto: tipoCostoCombustibles,
        id_tipo_costo: 3,
        values: [
          { name: 'Combustible', value: roundToTwo(equipo.Combustible) },
          { name: 'Lubricante', value: roundToTwo(equipo.Lubricantes) },
        ],
      },
      {
        tipoCosto: tipoCostoNeumaticos,
        id_tipo_costo: 4,
        values: [
          { name: 'Neumaticos', value: roundToTwo(equipo.Neumaticos) },
          { name: 'Mantenimiento', value: roundToTwo(equipo.Mantenim) },
        ],
      },
    ];

    categoriaEquipoAdicionales.forEach(({ tipoCosto, id_tipo_costo, values }) => {
      const costoUnitarioCategoria = roundToTwo(values.reduce((sum, item) => sum + item.value, 0));
      const costoTotalCategoria = roundToTwo(costoUnitarioCategoria * cantidadTotal);
      const itemsObraCategoria = buildItemsObraEntries(
        items,
        Object.fromEntries(usoPorItem.entries()),
        costoUnitarioCategoria,
        costoTotalCategoria,
      );

      const costoCategoria: Costo = {
        id_costo: idCostoCounter++,
        id_tipo_costo,
        detalle: equipo.detalle,
        values,
        unidad: 'mes',
        costo_unitario: costoUnitarioCategoria,
        cantidad: roundToTwo(cantidadTotal),
        costo_total: costoTotalCategoria,
        itemsObra: itemsObraCategoria,
      };

      costos.push(costoCategoria);
      tipoCosto.costo_total = roundToTwo(tipoCosto.costo_total + costoTotalCategoria);

      itemsObraCategoria.forEach((entry) => {
        if (entry.total > 0) {
          acumulaTotalItem(entry.idItem, entry.total);
          updateTipoCostoItemTotal(tipoCosto, entry.idItem, entry.total);
        }
      });
    });
  });

  // Procesar personal
  const personalUsado = new Map<number, Map<number, number>>();
  items.forEach((item) => {
    (item.manoObra || []).forEach((per) => {
      const personalDetalle = personalMap.get(per.id_personal);
      if (!personalDetalle) return;
      const meses = per.meses_operario || 0;
      if (meses <= 0) return;
      const usoPorItem = personalUsado.get(per.id_personal) ?? new Map<number, number>();
      usoPorItem.set(item.id_item_Obra, (usoPorItem.get(item.id_item_Obra) || 0) + meses);
      personalUsado.set(per.id_personal, usoPorItem);
    });
  });

  personalUsado.forEach((usoPorItem, idPersonal) => {
    const persona = personalMap.get(idPersonal);
    if (!persona) return;

    const cantidadTotal = Array.from(usoPorItem.values()).reduce((sum, meses) => sum + meses, 0);
    if (cantidadTotal <= 0) return;

    const values: CostoValue[] = [
      { name: 'CostoR+NR+CS', value: roundToTwo(persona.costo_mensual_sin_seguros) },
      { name: 'Seguros', value: roundToTwo(persona.seguros_art_mas_vo) },
      { name: 'Ex Medic+Cap.', value: roundToTwo(persona.examen_medico) },
      { name: 'Indum.y EPP', value: roundToTwo(persona.indumentaria_y_epp) },
      { name: 'Pernoctes', value: roundToTwo(persona.pernoctes_y_viajes) },
    ];

    const costoUnitario = roundToTwo(values.reduce((sum, item) => sum + item.value, 0));
    const costoTotal = roundToTwo(costoUnitario * cantidadTotal);
    const itemsObra = buildItemsObraEntries(
      items,
      Object.fromEntries(usoPorItem.entries()),
      costoUnitario,
      costoTotal,
    );

    const costo: Costo = {
      id_costo: idCostoCounter++,
      id_tipo_costo: 2,
      detalle: persona.funcion,
      values,
      unidad: 'mes',
      costo_unitario: costoUnitario,
      cantidad: roundToTwo(cantidadTotal),
      costo_total: costoTotal,
      itemsObra,
    };

    costos.push(costo);
    tipoCostoPersonal.costo_total = roundToTwo(tipoCostoPersonal.costo_total + costoTotal);

    itemsObra.forEach((entry) => {
      if (entry.total > 0) {
        acumulaTotalItem(entry.idItem, entry.total);
        updateTipoCostoItemTotal(tipoCostoPersonal, entry.idItem, entry.total);
      }
    });
  });

  const itemsActualizados = items.map<ItemObra>((item) => ({
    ...item,
    costo_total: itemTotalAcumulado.get(item.id_item_Obra) || 0,
  }));

  return {
    tiposCosto: [tipoCostoEquipo, tipoCostoCombustibles, tipoCostoNeumaticos, tipoCostoPersonal],
    costos,
    itemsActualizados,
  };
};



