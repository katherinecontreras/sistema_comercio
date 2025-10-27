import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Package, Download, Upload, Plus } from 'lucide-react';
import { useObraStore } from '@/store/obra';
import { getRecursosByTipo } from '@/actions/catalogos';
import ResourceTable from '../tables/ResourceTable';

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
  const { partidas, saveRecursosToPlanilla, getRecursosFromPlanilla } = useObraStore();
  const [recursos, setRecursos] = useState<any[]>([]);
  const [recursosSeleccionados, setRecursosSeleccionados] = useState<RecursoSeleccionado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Información de la partida/subpartida para cálculos
  const [duracion, setDuracion] = useState<number>(0);
  const [tipoTiempo, setTipoTiempo] = useState<string>('');
  const [tipoTiempoMedida, setTipoTiempoMedida] = useState<string>('');
  
  // Estados para modales y Excel
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showAddManually, setShowAddManually] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Cargar recursos de la planilla
  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        setLoading(true);
        // Obtener recursos por tipo usando la nueva ruta
        const data = await getRecursosByTipo(planillaId);
        
        setRecursos(data);
        
        // Cargar recursos previamente guardados
        if (partidaId) {
          const recursosGuardados = getRecursosFromPlanilla(partidaId, subpartidaId || null, planillaId);
          if (recursosGuardados.length > 0) {
            setRecursosSeleccionados(recursosGuardados);
          }
          
          // Obtener información de duración y tipo de tiempo
          const partida = partidas.find(p => p.id_partida === partidaId);
          if (partida) {
            setDuracion(partida.duracion || 0);
            setTipoTiempo(partida.tipo_de_tiempo?.nombre || '');
            setTipoTiempoMedida(partida.tipo_de_tiempo?.medida || '');
          }
        } else if (subpartidaId) {
          // Buscar subpartida en las partidas
          for (const partida of partidas) {
            const subpartida = partida.subpartidas?.find((sp: any) => sp.id_subpartida === subpartidaId);
            if (subpartida) {
              const recursosGuardados = getRecursosFromPlanilla(partida.id_partida!, subpartidaId, planillaId);
              if (recursosGuardados.length > 0) {
                setRecursosSeleccionados(recursosGuardados);
              }
              
              setDuracion(subpartida.duracion || 0);
              setTipoTiempo(subpartida.tipo_de_tiempo?.nombre || '');
              setTipoTiempoMedida(subpartida.tipo_de_tiempo?.medida || '');
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
  }, [planillaId, partidaId, subpartidaId, partidas, getRecursosFromPlanilla]);

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

  // Actualizar campos recursos
   const actualizarRecurso = (id: string, type: string, value: number) => {
    setRecursosSeleccionados(prev =>
      prev.map(r => {
        if (r.id !== id) return r;

        let cantidad = r.cantidad;
        let costoUnitario = r.costo_unitario;
        let porcentaje = r.porcentaje_de_uso;
        let tiempo = r.tiempo_de_uso;

        switch (type) {
          case 'cantidad':
            cantidad = value;
            break;
          case 'costo_unitario':
          case 'precio_unitario': // compatibilidad con ResourceTable
            costoUnitario = value;
            break;
          case 'porcentaje_de_uso':
            porcentaje = Math.min(Math.max(value, 0), 100);
            tiempo = calcularTiempoUso(porcentaje);
            break;
          case 'tiempo_de_uso':
            tiempo = Math.min(Math.max(value, 0), duracion);
            porcentaje = calcularPorcentajeUso(tiempo);
            break;
          default:
            return r;
        }

        const costoTotal = calcularCostoTotal(cantidad, costoUnitario, porcentaje);
        return {
          ...r,
          cantidad,
          costo_unitario: costoUnitario,
          porcentaje_de_uso: porcentaje,
          tiempo_de_uso: tiempo,
          costo_total: costoTotal,
        };
      })
    );
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


  // Función para cargar recursos desde Excel
  const handleUploadExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!planillaId || !partidaId) {
      setToastMessage('Error: No se ha seleccionado una planilla o partida');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_tipo_recurso', planillaId.toString());

    try {
      const response = await fetch('http://localhost:8000/api/v1/catalogos/recursos/cargar-desde-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setToastMessage(`Excel cargado exitosamente: ${data.recursos_agregados} recursos agregados`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        // Recargar recursos
        const recursosData = await getRecursosByTipo(planillaId);
        setRecursos(recursosData);
      } else {
        const error = await response.json();
        setToastMessage(`Error al cargar Excel: ${error.detail || 'Error desconocido'}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Error cargando Excel:', error);
      setToastMessage('Error al cargar archivo Excel');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }

    // Limpiar input
    event.target.value = '';
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

      {/* Tabla única de recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recursos Disponibles ({recursos.length})</span>
            <span className="text-sm font-normal text-slate-400">
              Seleccionados: {recursosSeleccionados.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={() => setShowAddManually(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Manualmente
            </Button>
            
            <Button 
              onClick={() => setShowExcelModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Generar Excel
            </Button>
            
            <div>
              <input
                id="upload-excel"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleUploadExcel}
                className="hidden"
              />
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                size="sm"
                onClick={() => document.getElementById('upload-excel')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cargar Excel
              </Button>
            </div>
          </div>
          {recursos.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay recursos disponibles en esta planilla</p>
              <p className="text-sm mt-2">Usa los botones de arriba para agregar recursos</p>
            </div>
          ) : (
            <div className="border border-slate-600 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700 sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-white font-medium">Recurso</th>
                      <th className="text-center p-3 text-white font-medium">Cantidad</th>
                      <th className="text-center p-3 text-white font-medium">Precio Unit.</th>
                      <th className="text-center p-3 text-white font-medium">% Uso</th>
                      <th className="text-center p-3 text-white font-medium">Tiempo Uso</th>
                      <th className="text-right p-3 text-white font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recursos.map((recurso) => {
                      const estaSeleccionado = recursosSeleccionados.some(r => r.id_recurso === recurso.id_recurso);
                      const recursoSeleccionado = recursosSeleccionados.find(r => r.id_recurso === recurso.id_recurso);
                      
                      return (
                        <tr 
                          key={recurso.id_recurso}
                          className={`border-t border-slate-600 cursor-pointer transition-all duration-200 ${
                            estaSeleccionado
                              ? 'bg-green-900/20 border-green-500/50 hover:bg-green-900/30'
                              : 'hover:bg-slate-700/50'
                          }`}
                          onClick={() => toggleRecursoSeleccion(recurso)}
                        >
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              {estaSeleccionado && (
                                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                              )}
                              <div>
                                <div className="text-white font-medium">{recurso.descripcion}</div>
                                <div className="text-xs text-slate-400">
                                  {recurso.unidad?.nombre || recurso.unidad} • ${recurso.costo_unitario_predeterminado || 0}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {estaSeleccionado ? (
                              <Input
                                type="number"
                                value={recursoSeleccionado?.cantidad || 1}
                                onChange={(e) => actualizarCantidad(recursoSeleccionado!.id, parseFloat(e.target.value) || 0)}
                                className="w-20 h-8 text-center bg-slate-800 border-slate-600"
                                min="0"
                                step="1"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            {estaSeleccionado ? (
                              <Input
                                type="number"
                                value={recursoSeleccionado?.costo_unitario || recurso.costo_unitario_predeterminado}
                                onChange={(e) => actualizarCostoUnitario(recursoSeleccionado!.id, parseFloat(e.target.value) || 0)}
                                className="w-24 h-8 text-center bg-slate-800 border-slate-600"
                                min="0"
                                step="0.01"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-slate-400">${recurso.costo_unitario_predeterminado || 0}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {estaSeleccionado ? (
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={recursoSeleccionado?.porcentaje_de_uso || 100}
                                  onChange={(e) => actualizarPorcentajeUso(recursoSeleccionado!.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 h-8 text-center bg-slate-800 border-slate-600"
                                  min="0"
                                  max="100"
                                  step="1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-xs text-slate-400">%</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            {estaSeleccionado ? (
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={recursoSeleccionado?.tiempo_de_uso || duracion}
                                  onChange={(e) => actualizarTiempoUso(recursoSeleccionado!.id, parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8 text-center bg-slate-800 border-slate-600"
                                  min="0"
                                  max={duracion}
                                  step="0.1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-xs text-slate-400">{tipoTiempoMedida}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {estaSeleccionado ? (
                              <span className="font-semibold text-green-400">
                                ${recursoSeleccionado?.costo_total.toFixed(2) || '0.00'}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen */}
      {recursosSeleccionados.length > 0 && (
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-base">Resumen de Recursos Seleccionados</CardTitle>
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
      )}

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
          onClick={() => {
            // Guardar recursos en el store
            if (partidaId) {
              saveRecursosToPlanilla(partidaId, subpartidaId || null, planillaId, recursosSeleccionados);
            }
            // Llamar al callback del componente padre
            onSave(recursosSeleccionados);
          }}
          disabled={recursosSeleccionados.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-4 w-4 mr-2" />
          Guardar Recursos ({recursosSeleccionados.length})
        </Button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-slate-800 border border-slate-600 rounded-lg p-4 text-white z-50">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;