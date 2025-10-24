import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { AtributoBase } from '@/store/atributo';

interface AttributeSelectionModalProps {
  onClose: () => void;
  onConfirm: (atributos: AtributoBase[]) => void;
  title: string;
  description: string;
  confirmButtonText: string;
  confirmButtonIcon?: React.ReactNode;
}

const STORAGE_KEY = 'excel_atributos_personalizados_v1';

// atributos base con id explícito
const atributosBase: AtributoBase[] = [
  { id: 'descripcion', nombre: 'Descripción', tipo: 'texto', base: true, requerido: true },
  { id: 'unidad', nombre: 'Unidad', tipo: 'texto', base: true, requerido: true },
  { id: 'cantidad', nombre: 'Cantidad', tipo: 'entero', base: true, requerido: true },
  { id: 'costo_unitario', nombre: 'Costo Unitario', tipo: 'numerico', base: true, requerido: true },
  { id: 'costo_total', nombre: 'Costo Total', tipo: 'numerico', base: true, requerido: true },
];

const AttributeSelectionModal: React.FC<AttributeSelectionModalProps> = ({ 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmButtonText,
  confirmButtonIcon
}) => {
  const [atributos, setAtributos] = useState<AtributoBase[]>(atributosBase);
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<Set<string>>(
    new Set(atributosBase.filter(a => a.requerido || a.id === 'descripcion' || a.id === 'unidad').map(a => a.id))
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [nuevoAtributo, setNuevoAtributo] = useState({
    nombre: '',
    tipo: 'texto' as 'texto' | 'numerico' | 'entero',
    requerido: false
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const personalizados: AtributoBase[] = JSON.parse(stored);
        setAtributos([...atributosBase, ...personalizados]);
      } catch (err) {
        console.error('error parseando atributos personalizados', err);
        setAtributos(atributosBase);
      }
    } else {
      setAtributos(atributosBase);
    }
  }, []);

  const toggleAtributo = (id: string) => {
    const nuevo = new Set(atributosSeleccionados);
    if (nuevo.has(id)) {
      nuevo.delete(id);
    } else {
      nuevo.add(id);
    }
    setAtributosSeleccionados(nuevo);
  };

  const handleConfirm = () => {
    const seleccionados = atributos.filter(a => atributosSeleccionados.has(a.id));
    onConfirm(seleccionados);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleAddAtributo = () => {
    if (!nuevoAtributo.nombre.trim()) return;

    const nuevoId = `custom_${Date.now()}`;
    const atributoPersonalizado: AtributoBase = {
      id: nuevoId,
      nombre: nuevoAtributo.nombre.trim(),
      tipo: nuevoAtributo.tipo,
      requerido: nuevoAtributo.requerido,
      base: false
    };

    setAtributos(prev => {
      const nuevosAtributos = [...prev, atributoPersonalizado];
      // Guardar en localStorage
      const personalizados = nuevosAtributos.filter(a => !a.base);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personalizados));
      return nuevosAtributos;
    });

    // Seleccionar automáticamente el nuevo atributo
    setAtributosSeleccionados(prev => new Set(prev).add(nuevoId));

    // Limpiar formulario
    setNuevoAtributo({ nombre: '', tipo: 'texto', requerido: false });
    setShowAddForm(false);
  };

  const handleDeleteAtributo = (id: string) => {
    const atributo = atributos.find(a => a.id === id);
    if (atributo?.base) return; // No permitir eliminar atributos base

    setAtributos(prev => {
      const nuevosAtributos = prev.filter(a => a.id !== id);
      // Actualizar localStorage
      const personalizados = nuevosAtributos.filter(a => !a.base);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personalizados));
      return nuevosAtributos;
    });

    // Remover de seleccionados
    setAtributosSeleccionados(prev => {
      const nuevo = new Set(prev);
      nuevo.delete(id);
      return nuevo;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-slate-400">{description}</p>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      {/* Lista de atributos */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Atributos Disponibles</CardTitle>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Atributo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Formulario para agregar nuevo atributo */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
              <h4 className="text-white font-medium mb-3">Nuevo Atributo Personalizado</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nombre" className="text-slate-300">Nombre del Atributo</Label>
                  <Input
                    id="nombre"
                    value={nuevoAtributo.nombre}
                    onChange={(e) => setNuevoAtributo(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Proveedor, Marca, etc."
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo" className="text-slate-300">Tipo de Dato</Label>
                  <select
                    id="tipo"
                    value={nuevoAtributo.tipo}
                    onChange={(e) => setNuevoAtributo(prev => ({ ...prev, tipo: e.target.value as 'texto' | 'numerico' | 'entero' }))}
                    className="w-full p-2 border border-slate-600 rounded-md bg-slate-800 text-white"
                  >
                    <option value="texto">Texto</option>
                    <option value="numerico">Numérico</option>
                    <option value="entero">Entero</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={nuevoAtributo.requerido}
                      onChange={(e) => setNuevoAtributo(prev => ({ ...prev, requerido: e.target.checked }))}
                      className="rounded border-slate-600 bg-slate-800"
                    />
                    <span>Requerido</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNuevoAtributo({ nombre: '', tipo: 'texto', requerido: false });
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddAtributo}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!nuevoAtributo.nombre.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>
          )}

          <div className="border border-slate-600 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-700">
                <tr>
                  <th className="text-left p-3 text-white font-medium">Seleccionar</th>
                  <th className="text-left p-3 text-white font-medium">Nombre</th>
                  <th className="text-center p-3 text-white font-medium">Tipo</th>
                  <th className="text-center p-3 text-white font-medium">Estado</th>
                  <th className="text-center p-3 text-white font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {atributos.map((atributo) => (
                  <tr 
                    key={atributo.id} 
                    className={`border-t border-slate-600 cursor-pointer transition-all duration-200 ${
                      atributosSeleccionados.has(atributo.id)
                        ? 'bg-green-900/20 border-l-4 border-green-500/50 hover:bg-green-900/30'
                        : 'hover:bg-slate-700/50'
                    }`}
                    onClick={() => toggleAtributo(atributo.id)}
                  >
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                        {atributosSeleccionados.has(atributo.id) ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-slate-400 rounded-full"></div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-white font-medium">{atributo.nombre}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        atributo.tipo === 'texto' ? 'bg-blue-100 text-blue-800' :
                        atributo.tipo === 'numerico' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {atributo.tipo}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {atributo.requerido && (
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                            Requerido
                          </span>
                        )}
                        {atributo.base && (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                            Base
                          </span>
                        )}
                        {!atributo.base && (
                          <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                            Personalizado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {!atributo.base && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAtributo(atributo.id);
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card className="bg-slate-700 border-slate-600">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                Atributos seleccionados: {atributosSeleccionados.size}
              </p>
              <p className="text-slate-400 text-sm">
                {atributosSeleccionados.size > 0 
                  ? 'Se utilizarán los atributos seleccionados'
                  : 'Selecciona al menos un atributo para continuar'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Total atributos:</p>
              <p className="text-white font-semibold">{atributos.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={atributosSeleccionados.size === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {confirmButtonIcon}
          {confirmButtonText} ({atributosSeleccionados.size})
        </Button>
      </div>
    </div>
  );
};

export default AttributeSelectionModal;


