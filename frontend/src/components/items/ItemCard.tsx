import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ItemObra } from '@/store/itemObra/itemObraStore';
import { useNavigate } from 'react-router-dom';

interface ItemCardProps {
  item: ItemObra;
  onSelectItem: (item: ItemObra) => void;
}

type ViewType = 'manoObra' | 'equipos';

const ItemCard: React.FC<ItemCardProps> = ({ item, onSelectItem }) => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<ViewType>('manoObra');

  // Calcular total de meses operarios según la vista seleccionada
  const totalMesesOperario = useMemo(() => {
    if (viewType === 'manoObra') {
      return (item.manoObra || []).reduce((sum, p) => sum + (p.meses_operario || 0), 0);
    } else {
      return (item.equipos || []).reduce((sum, e) => sum + (e.meses_operario || 0), 0);
    }
  }, [item, viewType]);

  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    if (viewType === 'manoObra') {
      return (item.manoObra || []).map((p, idx) => ({
        name: p.funcion,
        mesesOperario: p.meses_operario,
        id: p.id_personal,
        index: idx,
      }));
    } else {
      return (item.equipos || []).map((e, idx) => ({
        name: e.detalle,
        mesesOperario: e.meses_operario,
        id: e.id_equipo,
        index: idx,
      }));
    }
  }, [item, viewType]);

  // Configuración del chart
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach((data, index) => {
      const colors = [
        '#3b82f6', // blue-500
        '#2563eb', // blue-600
        '#1d4ed8', // blue-700
        '#1e40af', // blue-800
      ];
      config[`mesesOperario-${index}`] = {
        label: data.name,
        color: colors[index % colors.length],
      };
    });
    return config;
  }, [chartData]);

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{item.descripcion}</h3>
            <div className="flex gap-4 text-sm text-slate-300">
              <div>
                <span className="text-slate-400">Meses Operario: </span>
                <span className="text-white font-medium">{item.meses_operario?.toFixed(2) || '0.00'}</span>
              </div>
              <div>
                <span className="text-slate-400">Capataz: </span>
                <span className="text-white font-medium">{item.capataz?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-sky-600 hover:bg-sky-700 text-white"
              onClick={() => {
                onSelectItem(item);
                navigate('/oferta/recursos');
              }}
            >
              Agregar recursos
            </Button>
            <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewType === 'manoObra' ? 'default' : 'ghost'}
                className={`text-xs ${viewType === 'manoObra' ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setViewType('manoObra')}
              >
                Mano de Obra
              </Button>
              <Button
                size="sm"
                variant={viewType === 'equipos' ? 'default' : 'ghost'}
                className={`text-xs ${viewType === 'equipos' ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setViewType('equipos')}
              >
                Equipos
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-0">
        {/* Total de meses operarios */}
        <div className="mb-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-sm text-slate-400 mb-1">
              Total Meses Operario ({viewType === 'manoObra' ? 'Mano de Obra' : 'Equipos'}):
            </p>
            <p className="text-2xl font-bold text-sky-400">{totalMesesOperario.toFixed(2)}</p>
          </div>
        </div>

        {/* Gráfico de barras */}
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="w-full h-64"
          >
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis
                dataKey="name"
                hide={true}
              />
              <YAxis
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
                label={{ value: 'Meses Operario', angle: -90, position: 'insideLeft', fill: '#cbd5e1' }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <ChartTooltipContent
                        active={active}
                        payload={payload}
                        labelFormatter={() => data.name}
                        formatter={(value) => [
                          <span key="value" className="text-white font-medium">
                            {Number(value).toFixed(2)}
                          </span>,
                          'Meses Operario'
                        ]}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="mesesOperario"
                radius={[4, 4, 0, 0]}
                fill="#3b82f6"
              >
                {chartData.map((_, index) => {
                  const colors = [
                    '#3b82f6', // blue-500
                    '#2563eb', // blue-600
                    '#1d4ed8', // blue-700
                    '#1e40af', // blue-800
                  ];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-slate-700/30 rounded-lg">
            <p className="text-slate-400">
              No hay datos de {viewType === 'manoObra' ? 'mano de obra' : 'equipos'} para mostrar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemCard;

