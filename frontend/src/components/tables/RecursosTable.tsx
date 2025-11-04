import React, { useMemo, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Recurso, PersonalRecurso, EquipoRecurso } from '@/store/recurso/recursoStore';

type ViewType = 'tipos' | 'recursos' | 'meses_operarios';

interface TipoRecurso {
  id_tipo_recurso: number;
  descripcion: string;
}

interface RecursoFromDB {
  id_recurso: number;
  id_tipo_recurso: number;
  descripcion: string;
  unidad: string;
  cantidad: number;
  meses_operario: number;
}

interface RecursosTableProps {
  view: ViewType;
  data: any[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: any) => void;
  selectedRow?: any;
  rowKey?: string;
  className?: string;
  // Props específicas para vista de recursos
  onCantidadChange?: (idRecurso: number, cantidad: number) => void;
  onAddMesesOperarios?: (recurso: any) => void;
  recursosStore?: Recurso[]; // Recursos del store para verificar estado
  // Props específicas para vista de tipos
  tiposCompletos?: Set<number>; // IDs de tipos que tienen recursos completos
  // Props específicas para vista de meses_operarios
  tipoMesesOperarios?: 'personal' | 'equipos';
  onRemovePersonal?: (idPersonal: number) => void;
  onRemoveEquipo?: (idEquipo: number) => void;
  onMesesOperarioChange?: (id: number, meses: number) => void;
  // Nuevas props para selección en meses_operarios
  selectedIds?: Set<number>; // IDs de filas seleccionadas
  onRowSelect?: (id: number, isSelected: boolean) => void; // Callback cuando se selecciona/deselecciona una fila
  // Datos completos disponibles (para personal/equipos)
  allAvailableData?: any[]; // Todos los datos disponibles (personal/equipos de BD)
  selectedData?: any[]; // Datos seleccionados (con meses_operario)
}

function normalize(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.toLowerCase();
  return String(value).toLowerCase();
}

const RecursosTable: React.FC<RecursosTableProps> = ({
  view,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  onRowClick,
  selectedRow,
  rowKey,
  className = '',
  onCantidadChange,
  onAddMesesOperarios,
  recursosStore = [],
  tiposCompletos = new Set<number>(),
  tipoMesesOperarios = 'personal',
  onRemovePersonal,
  onRemoveEquipo,
  onMesesOperarioChange,
  selectedIds = new Set<number>(),
  onRowSelect,
  allAvailableData = [],
  selectedData = [],
}) => {
  const [query, setQuery] = useState('');
  const [editingCantidad, setEditingCantidad] = useState<number | null>(null);
  const [cantidadValue, setCantidadValue] = useState<string>('');

  // Activar edición automáticamente cuando se selecciona un recurso
  useEffect(() => {
    if (view === 'recursos' && selectedRow && rowKey) {
      const selectedId = (selectedRow as any)[rowKey];
      const recursos = data as RecursoFromDB[];
      const recurso = recursos.find(r => (r as any)[rowKey!] === selectedId);
      if (recurso) {
        // Obtener cantidad del store si existe, sino de la BD
        const recursoStore = recursosStore?.find(r => r.id_recurso === recurso.id_recurso);
        const cantidad = recursoStore?.cantidad ?? recurso.cantidad;
        
        if (editingCantidad !== recurso.id_recurso) {
          setEditingCantidad(recurso.id_recurso);
          setCantidadValue(cantidad.toString());
        }
      }
    } else if (!selectedRow && editingCantidad !== null) {
      setEditingCantidad(null);
      setCantidadValue('');
    }
  }, [selectedRow, view, rowKey, data, recursosStore]);

  // Para meses_operarios, usar allAvailableData si está disponible, sino data
  const dataForFiltering = useMemo(() => {
    if (view === 'meses_operarios' && allAvailableData.length > 0) {
      return allAvailableData;
    }
    return data;
  }, [view, allAvailableData, data]);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return dataForFiltering;
    const q = query.trim().toLowerCase();
    return dataForFiltering.filter((row) => {
      if (view === 'tipos') {
        return normalize(row.descripcion).includes(q);
      } else if (view === 'recursos') {
        return normalize(row.descripcion).includes(q) || normalize(row.unidad).includes(q);
      } else if (view === 'meses_operarios') {
        const field = tipoMesesOperarios === 'personal' ? row.funcion : row.detalle;
        return normalize(field).includes(q);
      }
      return false;
    });
  }, [dataForFiltering, query, searchable, view, tipoMesesOperarios]);

  const handleCantidadFocus = (idRecurso: number, cantidadActual: number) => {
    setEditingCantidad(idRecurso);
    setCantidadValue(cantidadActual.toString());
  };

  const handleCantidadBlur = (idRecurso: number) => {
    const cantidad = parseFloat(cantidadValue) || 0;
    if (onCantidadChange) {
      onCantidadChange(idRecurso, cantidad);
    }
    setEditingCantidad(null);
    setCantidadValue('');
  };

  const handleCantidadKeyDown = (e: React.KeyboardEvent, idRecurso: number) => {
    if (e.key === 'Enter') {
      handleCantidadBlur(idRecurso);
    } else if (e.key === 'Escape') {
      setEditingCantidad(null);
      setCantidadValue('');
    }
  };

  const getMesesOperarioTotal = (recurso: RecursoFromDB): number => {
    const recursoStore = recursosStore.find(r => r.id_recurso === recurso.id_recurso);
    if (!recursoStore?.personal || recursoStore.personal.length === 0) return 0;
    return recursoStore.personal.reduce((sum, p) => sum + (p.meses_operario || 0), 0);
  };

  const hasMesesOperarios = (recurso: RecursoFromDB): boolean => {
    const recursoStore = recursosStore.find(r => r.id_recurso === recurso.id_recurso);
    return !!(recursoStore?.personal && recursoStore.personal.length > 0);
  };

  const renderTiposView = () => (
    <>
      <TableHeader>
        <TableRow className="bg-slate-700">
          <TableHead className="text-white">Descripción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={1} className="text-center text-slate-300">
              Cargando...
            </TableCell>
          </TableRow>
        ) : filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={1} className="text-center text-slate-400">
              No hay tipos de recurso
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((row: TipoRecurso, idx) => {
            const rowKeyValue = rowKey ? (row as any)[rowKey] : undefined;
            const selectedRowKeyValue = selectedRow && rowKey ? (selectedRow as any)[rowKey] : undefined;
            const isSelected = rowKeyValue !== undefined && rowKeyValue === selectedRowKeyValue;
            const isCompleto = tiposCompletos.has(row.id_tipo_recurso);
            return (
              <TableRow
                key={rowKey ? String(rowKeyValue) : idx}
                className={`${isSelected ? 'bg-slate-600/60' : ''} ${isCompleto ? 'bg-green-900/20' : ''} hover:bg-slate-700/40 cursor-pointer`}
                onClick={() => onRowClick?.(row)}
              >
                <TableCell className="text-white cursor-pointer" onClick={() => onRowClick?.(row)}>
                  {row.descripcion}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </>
  );

  const renderRecursosView = () => (
    <>
      <TableHeader>
        <TableRow className="bg-slate-700">
          <TableHead className="text-white">Descripción</TableHead>
          <TableHead className="text-white">Unidad</TableHead>
          <TableHead className="text-white">Cantidad</TableHead>
          <TableHead className="text-white">Meses Operarios</TableHead>
          <TableHead className="text-white">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-slate-300">
              Cargando...
            </TableCell>
          </TableRow>
        ) : filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-slate-400">
              No hay recursos
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((row: RecursoFromDB, idx) => {
            const rowKeyValue = rowKey ? (row as any)[rowKey] : undefined;
            const selectedRowKeyValue = selectedRow && rowKey ? (selectedRow as any)[rowKey] : undefined;
            const isSelected = rowKeyValue !== undefined && rowKeyValue === selectedRowKeyValue;
            const mesesTotal = getMesesOperarioTotal(row);
            const hasMeses = hasMesesOperarios(row);
            const isEditing = editingCantidad === row.id_recurso;
            
            // Obtener la cantidad actual del recurso (del store o de la BD)
            const recursoStore = recursosStore?.find(r => r.id_recurso === row.id_recurso);
            const cantidadActual = recursoStore?.cantidad ?? row.cantidad;
            const tieneCantidad = cantidadActual > 0;
            
            // El botón debe estar habilitado si está seleccionado O si tiene cantidad > 0
            // Siempre habilitado, independientemente de si tiene meses operarios
            const botonHabilitado = isSelected || tieneCantidad;
            
            return (
              <TableRow
                key={rowKey ? String(rowKeyValue) : idx}
                className={`${isSelected ? 'bg-slate-700/60' : ''} ${hasMeses ? 'bg-green-900/20' : ''} hover:bg-slate-700/40 cursor-pointer`}
                onClick={() => onRowClick?.(row)}
              >
                <TableCell className="text-white cursor-pointer" onClick={() => onRowClick?.(row)}>
                  {row.descripcion}
                </TableCell>
                <TableCell className="text-white cursor-pointer" onClick={() => onRowClick?.(row)}>
                  {row.unidad}
                </TableCell>
                <TableCell className="text-white" onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={cantidadValue}
                      onChange={(e) => setCantidadValue(e.target.value)}
                      onBlur={() => handleCantidadBlur(row.id_recurso)}
                      onKeyDown={(e) => handleCantidadKeyDown(e, row.id_recurso)}
                      className="w-20 bg-slate-800 border-slate-600 text-white"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`${isSelected ? 'cursor-text' : 'cursor-pointer hover:underline'}`}
                      onClick={() => {
                        if (isSelected) {
                          // Si está seleccionado, activar edición si no está activa
                          if (!isEditing) {
                            handleCantidadFocus(row.id_recurso, cantidadActual);
                          }
                        } else {
                          // Si no está seleccionado, hacer click en la fila
                          onRowClick?.(row);
                        }
                      }}
                    >
                      {cantidadActual}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-white cursor-pointer" onClick={() => onRowClick?.(row)}>
                  {hasMeses ? mesesTotal : 0}
                </TableCell>
                <TableCell className="text-white" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (botonHabilitado) {
                        onAddMesesOperarios?.(row);
                      }
                    }}
                    disabled={!botonHabilitado}
                    className={
                      !botonHabilitado
                        ? 'bg-gray-600 hover:bg-gray-600 cursor-not-allowed opacity-50 text-white' 
                        : hasMeses 
                          ? 'bg-green-800 hover:bg-green-900 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar meses operarios
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </>
  );

  const renderMesesOperariosView = () => {
    // Obtener meses_operario de los datos seleccionados
    const getMesesOperario = (id: number): number => {
      const selected = selectedData.find(item => {
        const itemId = tipoMesesOperarios === 'personal' 
          ? (item as PersonalRecurso).id_personal 
          : (item as EquipoRecurso).id_equipo;
        return itemId === id;
      });
      return selected?.meses_operario || 0;
    };

    return (
      <>
        <TableHeader>
          <TableRow className="bg-slate-700">
            <TableHead className="text-white">
              {tipoMesesOperarios === 'personal' ? 'Función' : 'Detalle'}
            </TableHead>
            <TableHead className="text-white">Meses Operario</TableHead>
            <TableHead className="text-white">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-slate-300">
                Cargando...
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-slate-400">
                No hay {tipoMesesOperarios === 'personal' ? 'personal' : 'equipos'} disponibles
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((row: any, idx) => {
              const id = tipoMesesOperarios === 'personal' 
                ? row.id_personal 
                : row.id_equipo;
              const displayText = tipoMesesOperarios === 'personal'
                ? row.funcion
                : row.detalle;
              const isSelected = selectedIds.has(id);
              const mesesOperario = getMesesOperario(id);
              
              return (
                <TableRow 
                  key={idx} 
                  className={`hover:bg-slate-700/40 cursor-pointer ${isSelected ? 'bg-slate-700/60' : ''}`}
                  onClick={() => {
                    if (onRowSelect) {
                      onRowSelect(id, !isSelected);
                    }
                  }}
                >
                  <TableCell className="text-white cursor-pointer" onClick={() => {
                    if (onRowSelect) {
                      onRowSelect(id, !isSelected);
                    }
                  }}>
                    {displayText}
                  </TableCell>
                  <TableCell className="text-white" onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="number"
                      step="0.1"
                      value={mesesOperario}
                      onChange={(e) => {
                        const meses = parseFloat(e.target.value) || 0;
                        if (onMesesOperarioChange) {
                          onMesesOperarioChange(id, meses);
                        }
                      }}
                      disabled={!isSelected}
                      className={`w-24 bg-slate-800 border-slate-600 text-white ${!isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </TableCell>
                  <TableCell className="text-white" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant={isSelected ? "destructive" : "outline"}
                      disabled={!isSelected}
                      onClick={() => {
                        if (isSelected) {
                          if (tipoMesesOperarios === 'personal' && onRemovePersonal) {
                            onRemovePersonal(id);
                          } else if (tipoMesesOperarios === 'equipos' && onRemoveEquipo) {
                            onRemoveEquipo(id);
                          }
                        }
                      }}
                      className={
                        !isSelected 
                          ? 'bg-gray-600 hover:bg-gray-600 border-gray-600 cursor-not-allowed opacity-50 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {searchable && (
        <div className="flex items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      )}

      <div className="border border-slate-600 rounded-lg overflow-hidden">
        <div className="max-h-[480px] overflow-auto">
          <Table>
            {view === 'tipos' && renderTiposView()}
            {view === 'recursos' && renderRecursosView()}
            {view === 'meses_operarios' && renderMesesOperariosView()}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RecursosTable;

