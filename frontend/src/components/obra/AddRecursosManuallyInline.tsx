import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Check, X, Package } from 'lucide-react';
import { generateTempId } from '@/utils/idGenerator';
import { useCatalogos } from '@/hooks';
import { AddUnidadModal } from '@/components/modals';

interface Atributo {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numerico' | 'entero';
  requerido: boolean;
}

interface RecursoLocal {
  id: string;
  datos: Record<string, any>;
}

interface Unidad {
  id_unidad: number;
  nombre: string;
  simbolo?: string;
  descripcion?: string;
}

interface Props {
  planillaNombre: string;
  planillaId: number;
  onCancel: () => void;
  onSave: (recursos: any[]) => void;
}

const AddRecursosManuallyInline: React.FC<Props> = ({ planillaNombre, planillaId, onCancel, onSave }) => {
  const { loadUnidades, handleAddRecursos } = useCatalogos();
  
  const [atributos] = useState<Atributo[]>([
    { id: 'descripcion', nombre: 'Descripción', tipo: 'texto', requerido: true },
    { id: 'unidad', nombre: 'Unidad', tipo: 'texto', requerido: true },
    { id: 'cantidad', nombre: 'Cantidad', tipo: 'entero', requerido: true },
    { id: 'costo_unitario', nombre: 'Costo Unitario', tipo: 'numerico', requerido: true },
  ]);
  
  const [recursos, setRecursos] = useState<RecursoLocal[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUnidad, setShowAddUnidad] = useState(false);
  const [nuevaUnidad, setNuevaUnidad] = useState('');

  useEffect(() => {
    loadUnidades().then(setUnidades);
  }, [loadUnidades]);

  const agregarRecurso = () => {
    const nuevoRecurso: RecursoLocal = {
      id: generateTempId(),
      datos: {
        descripcion: '',
        unidad: '',
        cantidad: 1,
        costo_unitario: 0,
      }
    };
    setRecursos([...recursos, nuevoRecurso]);
  };

  const eliminarRecurso = (id: string) => {
    setRecursos(recursos.filter(r => r.id !== id));
  };

  const actualizarRecurso = (id: string, campo: string, valor: any) => {
    setRecursos(recursos.map(r => 
      r.id === id 
        ? { ...r, datos: { ...r.datos, [campo]: valor } }
        : r
    ));
  };

  const validarRecurso = (recurso: RecursoLocal): boolean => {
    return atributos.every(atributo => {
      if (atributo.requerido) {
        const valor = recurso.datos[atributo.id];
        return valor !== '' && valor !== null && valor !== undefined;
      }
      return true;
    });
  };

  const validarTodos = (): boolean => {
    return recursos.length > 0 && recursos.every(validarRecurso);
  };

  const calcularCostoTotal = (recurso: RecursoLocal): number => {
    const cantidad = parseFloat(recurso.datos.cantidad) || 0;
    const costoUnitario = parseFloat(recurso.datos.costo_unitario) || 0;
    return cantidad * costoUnitario;
  };

  const handleSave = async () => {
    if (!validarTodos()) return;
    
    setLoading(true);
    try {
      const recursosParaEnviar = recursos.map(recurso => ({
        id_tipo_recurso: planillaId,
        descripcion: recurso.datos.descripcion,
        id_unidad: unidades.find(u => u.nombre === recurso.datos.unidad)?.id_unidad || null,
        cantidad: parseFloat(recurso.datos.cantidad) || 0,
        costo_unitario_predeterminado: parseFloat(recurso.datos.costo_unitario) || 0,
        costo_total: calcularCostoTotal(recurso),
        atributos: {}
      }));

      await handleAddRecursos(recursosParaEnviar);
      onSave(recursosParaEnviar);
    } catch (error) {
      console.error('Error guardando recursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnidad = async (data: { nombre: string; simbolo: string; descripcion?: string }) => {
    try {
      // Aquí deberías llamar a la función para agregar la unidad al backend
      // Por ahora, simulamos la creación de una nueva unidad
      const nuevaUnidad: Unidad = {
        id_unidad: Date.now(), // ID temporal
        nombre: data.nombre,
        simbolo: data.simbolo,
        descripcion: data.descripcion
      };
      setUnidades([...unidades, nuevaUnidad]);
      setShowAddUnidad(false);
      setNuevaUnidad('');
    } catch (error) {
      console.error('Error agregando unidad:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Agregar Recursos Manualmente</h3>
          <p className="text-slate-400">Planilla: {planillaNombre}</p>
        </div>
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      {/* Botón para agregar recurso */}
      <div className="flex justify-end">
        <Button
          onClick={agregarRecurso}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Recurso
        </Button>
      </div>

      {/* Lista de recursos */}
      {recursos.length === 0 ? (
        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-400 text-center">
              No hay recursos agregados
            </p>
            <p className="text-slate-500 text-sm text-center mt-2">
              Haz clic en "Agregar Recurso" para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recursos.map((recurso, index) => (
            <Card key={recurso.id} className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">
                    Recurso {index + 1}
                  </CardTitle>
                  <Button
                    onClick={() => eliminarRecurso(recurso.id)}
                    variant="outline"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label className="text-white">Descripción *</Label>
                    <Input
                      value={recurso.datos.descripcion}
                      onChange={(e) => actualizarRecurso(recurso.id, 'descripcion', e.target.value)}
                      placeholder="Descripción del recurso"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {/* Unidad */}
                  <div className="space-y-2">
                    <Label className="text-white">Unidad *</Label>
                    <div className="flex space-x-2">
                      <select
                        value={recurso.datos.unidad}
                        onChange={(e) => actualizarRecurso(recurso.id, 'unidad', e.target.value)}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                      >
                        <option value="">Seleccionar unidad</option>
                        {unidades.map(unidad => (
                          <option key={unidad.id_unidad} value={unidad.nombre}>
                            {unidad.nombre} ({unidad.simbolo})
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => setShowAddUnidad(true)}
                        variant="outline"
                        size="sm"
                        className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div className="space-y-2">
                    <Label className="text-white">Cantidad *</Label>
                    <Input
                      type="number"
                      value={recurso.datos.cantidad}
                      onChange={(e) => actualizarRecurso(recurso.id, 'cantidad', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="1"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {/* Costo Unitario */}
                  <div className="space-y-2">
                    <Label className="text-white">Costo Unitario *</Label>
                    <Input
                      type="number"
                      value={recurso.datos.costo_unitario}
                      onChange={(e) => actualizarRecurso(recurso.id, 'costo_unitario', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                {/* Costo Total */}
                <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Costo Total:</span>
                    <span className="text-green-400 font-semibold">
                      ${calcularCostoTotal(recurso).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2">
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!validarTodos() || loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Guardar Recursos ({recursos.length})
            </>
          )}
        </Button>
      </div>

      {/* Modal para agregar unidad */}
      <AddUnidadModal
        open={showAddUnidad}
        onClose={() => setShowAddUnidad(false)}
        onAdd={handleAddUnidad}
        initialNombre={nuevaUnidad}
      />
    </div>
  );
};

export default AddRecursosManuallyInline;
