import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Package, Trash2 } from 'lucide-react';
import { useObraStore } from '@/store/obra';

interface RecursoSeleccionado {
  id: string;
  id_recurso: number;
  descripcion: string;
  unidad: string;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  porcentaje_de_uso: number;
  tiempo_de_uso: number;
  seleccionado: boolean;
}

interface Props {
  planillaId: number;
  planillaNombre: string;
  partidaId?: number;
  subpartidaId?: number;
  onClose: () => void;
  onSave: (recursos: RecursoSeleccionado[]) => void;
}

const ResourceManagement: React.FC<Props> = ({ 
  planillaId, 
  planillaNombre, 
  partidaId, 
  subpartidaId, 
  onClose, 
  onSave 
}) => {
  const { partidas } = useObraStore();
  const [recursos, setRecursos] = useState<any[]>([]);
  const [recursosSeleccionados, setRecursosSeleccionados] = useState<RecursoSeleccionado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Información de la partida/subpartida para cálculos
  const [duracion, setDuracion] = useState<number>(0);
  const [tipoTiempo, setTipoTiempo] = useState<string>('');
  const [tipoTiempoMedida, setTipoTiempoMedida] = useState<string>('');

  // Cargar recursos de la planilla
  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/v1/catalogos/recursos?tipo_recurso=${planillaId}`);
        const data = await response.json();
        setRecursos(data);
        
        // Obtener información de duración y tipo de tiempo
        if (partidaId) {
          const partida = partidas.find(p => p.id_partida === partidaId);
          if (partida) {
            setDuracion((partida as any).duracion || 0);
            setTipoTiempo((partida as any).tipo_de_tiempo?.nombre || '');
            setTipoTiempoMedida((partida as any).tipo_de_tiempo?.medida || '');
          }
        } else if (subpartidaId) {
          // Buscar subpartida en las partidas
          for (const partida of partidas) {
            const subpartida = partida.subpartidas?.find(sp => sp.id_subpartida === subpartidaId);
            if (subpartida) {
              setDuracion((subpartida as any).duracion || 0);
              setTipoTiempo((subpartida as any).tipo_de_tiempo?.nombre || '');
              setTipoTiempoMedida((subpartida as any).tipo_de_tiempo?.medida || '');
              break;
            }
          }
        }
      } catch (err) {
        console.error('Error cargando recursos:', err);
        setError('Error al cargar los recursos de la planilla');
      } finally {
        setLoading(false);
      }
    };

    cargarRecursos();
  }, [planillaId, partidaId, subpartidaId, partidas]);

  // Función para calcular porcentaje de uso basado en tiempo de uso
  const calcularPorcentajeUso = (tiempoUso: number): number => {
    if (duracion <= 0) return 0;
    return Math.min((tiempoUso / duracion) * 100, 100);
  };

  // Función para calcular tiempo de uso basado en porcentaje
  const calcularTiempoUso = (porcentaje: number): number => {
    if (duracion <= 0) return 0;
    return (porcentaje / 100) * duracion;
  };

  // Función para calcular costo total con porcentaje de uso
  const calcularCostoTotal = (cantidad: number, costoUnitario: number, porcentajeUso: number): number => {
    return cantidad * costoUnitario * (porcentajeUso / 100);
  };

  // Toggle selección de recurso
  const toggleRecursoSeleccion = (recurso: any) => {
    const existe = recursosSeleccionados.find(r => r.id_recurso === recurso.id_recurso);
    
    if (existe) {
      // Deseleccionar
      setRecursosSeleccionados(prev => prev.filter(r => r.id_recurso !== recurso.id_recurso));
    } else {
      // Seleccionar con valores por defecto
      const nuevoRecurso: RecursoSeleccionado = {
        id: `recurso-${recurso.id_recurso}`,
        id_recurso: recurso.id_recurso,
        descripcion: recurso.descripcion,
        unidad: recurso.unidad?.nombre || '',
        cantidad: 1,
        costo_unitario: recurso.costo_unitario_predeterminado || 0,
        costo_total: recurso.costo_unitario_predeterminado || 0,
        porcentaje_de_uso: 100,
        tiempo_de_uso: duracion,
        seleccionado: true
      };
      setRecursosSeleccionados(prev => [...prev, nuevoRecurso]);
    }
  };

  // Actualizar cantidad
  const actualizarCantidad = (id: string, cantidad: number) => {
    setRecursosSeleccionados(prev => prev.map(r => {
      if (r.id === id) {
        const costoTotal = calcularCostoTotal(cantidad, r.costo_unitario, r.porcentaje_de_uso);
        return { ...r, cantidad, costo_total: costoTotal };
      }
      return r;
    }));
  };

  // Actualizar costo unitario
  const actualizarCostoUnitario = (id: string, costoUnitario: number) => {
    setRecursosSeleccionados(prev => prev.map(r => {
      if (r.id === id) {
        const costoTotal = calcularCostoTotal(r.cantidad, costoUnitario, r.porcentaje_de_uso);
        return { ...r, costo_unitario: costoUnitario, costo_total: costoTotal };
      }
      return r;
    }));
  };

  // Actualizar porcentaje de uso
  const actualizarPorcentajeUso = (id: string, porcentaje: number) => {
    const porcentajeLimitado = Math.min(Math.max(porcentaje, 0), 100);
    const tiempoUso = calcularTiempoUso(porcentajeLimitado);
    
    setRecursosSeleccionados(prev => prev.map(r => {
      if (r.id === id) {
        const costoTotal = calcularCostoTotal(r.cantidad, r.costo_unitario, porcentajeLimitado);
        return { 
          ...r, 
          porcentaje_de_uso: porcentajeLimitado, 
          tiempo_de_uso: tiempoUso,
          costo_total: costoTotal
        };
      }
      return r;
    }));
  };

  // Actualizar tiempo de uso
  const actualizarTiempoUso = (id: string, tiempo: number) => {
    const tiempoLimitado = Math.min(Math.max(tiempo, 0), duracion);
    const porcentaje = calcularPorcentajeUso(tiempoLimitado);
    
    setRecursosSeleccionados(prev => prev.map(r => {
      if (r.id === id) {
        const costoTotal = calcularCostoTotal(r.cantidad, r.costo_unitario, porcentaje);
        return { 
          ...r, 
          tiempo_de_uso: tiempoLimitado,
          porcentaje_de_uso: porcentaje,
          costo_total: costoTotal
        };
      }
      return r;
    }));
  };

  // Eliminar recurso seleccionado
  const eliminarRecurso = (id: string) => {
    setRecursosSeleccionados(prev => prev.filter(r => r.id !== id));
  };

  // Calcular totales
  const calcularTotales = () => {
    const totalCosto = recursosSeleccionados.reduce((sum, r) => sum + r.costo_total, 0);
    const totalCantidad = recursosSeleccionados.reduce((sum, r) => sum + r.cantidad, 0);
    
    return {
      cantidadRecursos: recursosSeleccionados.length,
      totalCantidad,
      totalCosto
    };
  };

  const totales = calcularTotales();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Cargando recursos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Gestión de Recursos</h3>
          <p className="text-slate-400">Planilla: {planillaNombre}</p>
          {duracion > 0 && (
            <p className="text-sm text-slate-500">
              Duración: {duracion} {tipoTiempoMedida} ({tipoTiempo})
            </p>
          )}
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          <X className="h-4 w-4 mr-2" />
          Cerrar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Izquierdo: Recursos Disponibles */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos Disponibles ({recursos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {recursos.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay recursos disponibles en esta planilla</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-auto">
                {recursos.map((recurso) => {
                  const estaSeleccionado = recursosSeleccionados.some(r => r.id_recurso === recurso.id_recurso);
                  return (
                    <div
                      key={recurso.id_recurso}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        estaSeleccionado
                          ? 'bg-green-900/30 border-green-500'
                          : 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50'
                      }`}
                      onClick={() => toggleRecursoSeleccion(recurso)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-white">{recurso.descripcion}</div>
                          <div className="text-sm text-slate-400">
                            {recurso.unidad?.nombre} • ${recurso.costo_unitario_predeterminado || 0}
                          </div>
                        </div>
                        {estaSeleccionado && (
                          <Check className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel Derecho: Recursos Seleccionados */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos Seleccionados ({recursosSeleccionados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {recursosSeleccionados.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Selecciona recursos del panel izquierdo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tabla de recursos seleccionados */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700 sticky top-0">
                        <tr>
                          <th className="text-left p-2 text-white font-medium">Recurso</th>
                          <th className="text-center p-2 text-white font-medium">Cantidad</th>
                          <th className="text-center p-2 text-white font-medium">Precio Unit.</th>
                          <th className="text-center p-2 text-white font-medium">% Uso</th>
                          <th className="text-center p-2 text-white font-medium">Tiempo Uso</th>
                          <th className="text-right p-2 text-white font-medium">Total</th>
                          <th className="text-center p-2 text-white font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recursosSeleccionados.map((recurso) => (
                          <tr 
                            key={recurso.id}
                            className="border-t border-slate-600 hover:bg-slate-700/50"
                          >
                            <td className="p-2">
                              <div className="text-white font-medium">{recurso.descripcion}</div>
                              <div className="text-xs text-slate-400">{recurso.unidad}</div>
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={recurso.cantidad}
                                onChange={(e) => actualizarCantidad(recurso.id, parseFloat(e.target.value) || 0)}
                                className="w-20 h-8 text-center"
                                min="0"
                                step="1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={recurso.costo_unitario}
                                onChange={(e) => actualizarCostoUnitario(recurso.id, parseFloat(e.target.value) || 0)}
                                className="w-24 h-8 text-center"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={recurso.porcentaje_de_uso}
                                  onChange={(e) => actualizarPorcentajeUso(recurso.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 h-8 text-center"
                                  min="0"
                                  max="100"
                                  step="1"
                                />
                                <span className="text-xs text-slate-400">%</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={recurso.tiempo_de_uso}
                                  onChange={(e) => actualizarTiempoUso(recurso.id, parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8 text-center"
                                  min="0"
                                  max={duracion}
                                  step="0.1"
                                />
                                <span className="text-xs text-slate-400">{tipoTiempoMedida}</span>
                              </div>
                            </td>
                            <td className="p-2 text-right">
                              <span className="font-semibold text-green-400">
                                ${recurso.costo_total.toFixed(2)}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarRecurso(recurso.id)}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resumen */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-base">Resumen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-sky-400">{totales.cantidadRecursos}</div>
                        <div className="text-xs text-slate-400">Recursos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{Math.round(totales.totalCantidad)}</div>
                        <div className="text-xs text-slate-400">Cantidad Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">${totales.totalCosto.toFixed(2)}</div>
                        <div className="text-xs text-slate-400">Costo Total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2">
        <Button
          onClick={onClose}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onSave(recursosSeleccionados)}
          disabled={recursosSeleccionados.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-4 w-4 mr-2" />
          Guardar Recursos ({recursosSeleccionados.length})
        </Button>
      </div>
    </div>
  );
};

export default ResourceManagement;