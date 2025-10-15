import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, FileSpreadsheet, Search, Upload, X } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';
import api from '@/services/api';
import ExcelDownloader from '@/components/ExcelDownloader';

interface TipoRecurso {
  id_tipo_recurso: number;
  nombre: string;
}

interface Recurso {
  id_recurso: number;
  id_tipo_recurso: number;
  descripcion: string;
  unidad: string;
  costo_unitario_predeterminado: number;
  id_proveedor_preferido?: number;
  atributos?: any;
}

interface ItemCosto {
  id: string;
  id_item_obra: string;
  id_recurso: number;
  cantidad: number;
  precio_unitario_aplicado: number;
  total_linea: number;
  recurso: Recurso;
}

const CostosStep: React.FC = () => {
  const { wizard, setStep, setCostos } = useAppStore();
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedPlanilla, setSelectedPlanilla] = useState<number | null>(null);
  const [tiposRecurso, setTiposRecurso] = useState<TipoRecurso[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [itemCostos, setItemCostos] = useState<ItemCosto[]>(
    wizard.costos.map((costo: any) => ({
      ...costo,
      recurso: {
        id_recurso: costo.recurso.id_recurso,
        id_tipo_recurso: costo.recurso.id_tipo_recurso ?? 0,
        descripcion: costo.recurso.descripcion,
        unidad: costo.recurso.unidad,
        costo_unitario_predeterminado: costo.recurso.costo_unitario_predeterminado,
        id_proveedor_preferido: costo.recurso.id_proveedor_preferido,
        atributos: costo.recurso.atributos,
      }
    }))
  );
  const [selectedRecursos, setSelectedRecursos] = useState<Set<number>>(new Set());
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [precios, setPrecios] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddResource, setShowAddResource] = useState(false);
  const [showUploadExcel, setShowUploadExcel] = useState(false);
  const [newResource, setNewResource] = useState({
    descripcion: '',
    unidad: '',
    costo_unitario_predeterminado: 0
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Cargar tipos de recurso al montar el componente
  useEffect(() => {
    const loadTiposRecurso = async () => {
      try {
        const response = await api.get('/catalogos/tipos_recurso');
        setTiposRecurso(response.data);
      } catch (error) {
        console.error('Error cargando tipos de recurso:', error);
      }
    };
    loadTiposRecurso();
  }, []);

  // Cargar recursos cuando se selecciona una planilla
  useEffect(() => {
    if (selectedPlanilla) {
      const loadRecursos = async () => {
        try {
          setLoading(true);
          const response = await api.get('/catalogos/recursos');
          const recursosFiltrados = response.data.filter((r: Recurso) => r.id_tipo_recurso === selectedPlanilla);
          setRecursos(recursosFiltrados);
        } catch (error) {
          console.error('Error cargando recursos:', error);
        } finally {
          setLoading(false);
        }
      };
      loadRecursos();
    }
  }, [selectedPlanilla]);

  // Filtrar recursos por término de búsqueda
  const recursosFiltrados = recursos.filter(recurso =>
    recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRecurso = (idRecurso: number, checked: boolean) => {
    const newSelected = new Set(selectedRecursos);
    if (checked) {
      newSelected.add(idRecurso);
      const recurso = recursos.find(r => r.id_recurso === idRecurso);
      if (recurso) {
        setCantidades(prev => ({ ...prev, [idRecurso]: 1 }));
        setPrecios(prev => ({ ...prev, [idRecurso]: recurso.costo_unitario_predeterminado }));
      }
    } else {
      newSelected.delete(idRecurso);
      setCantidades(prev => {
        const newCantidades = { ...prev };
        delete newCantidades[idRecurso];
        return newCantidades;
      });
      setPrecios(prev => {
        const newPrecios = { ...prev };
        delete newPrecios[idRecurso];
        return newPrecios;
      });
    }
    setSelectedRecursos(newSelected);
  };

  const handleCantidadChange = (idRecurso: number, cantidad: number) => {
    setCantidades(prev => ({ ...prev, [idRecurso]: cantidad }));
  };

  const handlePrecioChange = (idRecurso: number, precio: number) => {
    setPrecios(prev => ({ ...prev, [idRecurso]: precio }));
  };

  const handleAgregarCostos = () => {
    if (!selectedItem || selectedRecursos.size === 0) return;

    const nuevosCostos: ItemCosto[] = Array.from(selectedRecursos).map(idRecurso => {
      const recurso = recursos.find(r => r.id_recurso === idRecurso);
      const cantidad = cantidades[idRecurso] || 1;
      const precio = precios[idRecurso] || recurso?.costo_unitario_predeterminado || 0;
      
      return {
        id: generateTempId(),
        id_item_obra: selectedItem,
        id_recurso: idRecurso,
        cantidad,
        precio_unitario_aplicado: precio,
        total_linea: cantidad * precio,
        recurso: recurso!
      };
    });

    const updatedCostos = [...itemCostos, ...nuevosCostos];
    setItemCostos(updatedCostos);
    setCostos(updatedCostos);
    setSelectedRecursos(new Set());
    setCantidades({});
    setPrecios({});
  };

  const handleEliminarCosto = (id: string) => {
    const updatedCostos = itemCostos.filter(costo => costo.id !== id);
    setItemCostos(updatedCostos);
    setCostos(updatedCostos);
  };

  const handleConfirmarPlanilla = () => {
    setSelectedPlanilla(null);
    setRecursos([]);
    setSelectedRecursos(new Set());
    setCantidades({});
    setPrecios({});
    setSearchTerm('');
  };

  const handleAddResource = async () => {
    if (!selectedPlanilla || !newResource.descripcion.trim()) return;

    try {
      const response = await api.post('/catalogos/recursos', {
        id_tipo_recurso: selectedPlanilla,
        descripcion: newResource.descripcion.trim(),
        unidad: newResource.unidad.trim(),
        costo_unitario_predeterminado: newResource.costo_unitario_predeterminado
      });

      // Agregar el nuevo recurso a la lista local
      const nuevoRecurso: Recurso = {
        id_recurso: response.data.id_recurso,
        id_tipo_recurso: selectedPlanilla,
        descripcion: newResource.descripcion.trim(),
        unidad: newResource.unidad.trim(),
        costo_unitario_predeterminado: newResource.costo_unitario_predeterminado
      };

      setRecursos(prev => [...prev, nuevoRecurso]);
      setNewResource({ descripcion: '', unidad: '', costo_unitario_predeterminado: 0 });
      setShowAddResource(false);
    } catch (error) {
      console.error('Error agregando recurso:', error);
    }
  };

  const handleUploadExcel = async () => {
    if (!uploadFile || !selectedPlanilla) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await api.post('/catalogos/recursos/carga_masiva', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Recargar recursos después de la carga masiva
      const recursosResponse = await api.get('/catalogos/recursos');
      const recursosFiltrados = recursosResponse.data.filter((r: Recurso) => r.id_tipo_recurso === selectedPlanilla);
      setRecursos(recursosFiltrados);

      setUploadFile(null);
      setShowUploadExcel(false);
      alert(`Se cargaron ${response.data.insertados} recursos exitosamente`);
    } catch (error) {
      console.error('Error cargando Excel:', error);
      alert('Error al cargar el archivo Excel');
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (itemCostos.length > 0) {
      setStep('incrementos');
    }
  };

  const handleBack = () => {
    setStep('items');
  };

  // Obtener items de obra para selección
  const itemsObra = wizard.items;

  // Agrupar costos por item
  const costosPorItem = itemCostos.reduce((acc, costo) => {
    if (!acc[costo.id_item_obra]) {
      acc[costo.id_item_obra] = [];
    }
    acc[costo.id_item_obra].push(costo);
    return acc;
  }, {} as Record<string, ItemCosto[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Asignar Costos a Items</h3>
          <p className="text-muted-foreground">Selecciona un item y asigna recursos de las planillas disponibles</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {itemCostos.length} costo{itemCostos.length !== 1 ? 's' : ''} asignado{itemCostos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Selector de Item */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Item de Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="item">Item de Obra</Label>
            <select
              id="item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecciona un item</option>
              {itemsObra.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.codigo && `${item.codigo} - `}{item.descripcion_tarea}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Selección de Planilla */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Planilla de Recursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tiposRecurso.map((tipo) => (
                <Button
                  key={tipo.id_tipo_recurso}
                  variant={selectedPlanilla === tipo.id_tipo_recurso ? "default" : "outline"}
                  onClick={() => setSelectedPlanilla(tipo.id_tipo_recurso)}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <FileSpreadsheet className="h-6 w-6 mb-2" />
                  <span className="text-sm">{tipo.nombre}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de Asignación de Recursos */}
      {selectedPlanilla && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Asignando Recursos de la Planilla: {tiposRecurso.find(t => t.id_tipo_recurso === selectedPlanilla)?.nombre}</span>
              <Button variant="outline" onClick={handleConfirmarPlanilla}>
                Confirmar y Cerrar Planilla
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Búsqueda y acciones */}
            <div className="mb-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Botones para agregar recursos */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddResource(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Manualmente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadExcel(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Cargar desde Excel
                </Button>
              </div>
            </div>

            {/* Tabla de Recursos */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">Cargando recursos...</div>
              ) : (
                recursosFiltrados.map((recurso) => (
                  <div key={recurso.id_recurso} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedRecursos.has(recurso.id_recurso)}
                      onCheckedChange={(checked) => handleSelectRecurso(recurso.id_recurso, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{recurso.descripcion}</div>
                      <div className="text-sm text-gray-500">
                        {recurso.unidad} - ${recurso.costo_unitario_predeterminado}
                      </div>
                    </div>
                    {selectedRecursos.has(recurso.id_recurso) && (
                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <Label htmlFor={`cantidad-${recurso.id_recurso}`} className="text-xs">Cantidad</Label>
                          <Input
                            id={`cantidad-${recurso.id_recurso}`}
                            type="number"
                            value={cantidades[recurso.id_recurso] || 1}
                            onChange={(e) => handleCantidadChange(recurso.id_recurso, parseFloat(e.target.value) || 1)}
                            min="0"
                            step="0.01"
                            className="h-8"
                          />
                        </div>
                        <div className="w-24">
                          <Label htmlFor={`precio-${recurso.id_recurso}`} className="text-xs">Precio</Label>
                          <Input
                            id={`precio-${recurso.id_recurso}`}
                            type="number"
                            value={precios[recurso.id_recurso] || recurso.costo_unitario_predeterminado}
                            onChange={(e) => handlePrecioChange(recurso.id_recurso, parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="h-8"
                          />
                        </div>
                        <div className="text-sm font-medium">
                          ${((cantidades[recurso.id_recurso] || 1) * (precios[recurso.id_recurso] || recurso.costo_unitario_predeterminado)).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {selectedRecursos.size > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button onClick={handleAgregarCostos} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar {selectedRecursos.size} Recurso{selectedRecursos.size !== 1 ? 's' : ''} Seleccionado{selectedRecursos.size !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Archivos de ejemplo para descarga */}
      <ExcelDownloader />

      {/* Resumen de Costos Asignados */}
      {Object.keys(costosPorItem).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Costos Asignados por Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(costosPorItem).map(([itemId, costos]) => {
                const item = itemsObra.find(i => i.id === itemId);
                const total = costos.reduce((sum, costo) => sum + costo.total_linea, 0);
                
                return (
                  <div key={itemId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {item?.codigo && `${item.codigo} - `}{item?.descripcion_tarea}
                      </h4>
                      <span className="font-bold">${total.toFixed(2)}</span>
                    </div>
                    <div className="space-y-2">
                      {costos.map((costo) => (
                        <div key={costo.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <span>{costo.recurso.descripcion}</span>
                          <div className="flex items-center space-x-2">
                            <span>{costo.cantidad} {costo.recurso.unidad} × ${costo.precio_unitario_aplicado}</span>
                            <span className="font-medium">${costo.total_linea.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarCosto(costo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para agregar recurso manualmente */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Agregar Nuevo Recurso
                <Button variant="ghost" size="sm" onClick={() => setShowAddResource(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Input
                  id="descripcion"
                  value={newResource.descripcion}
                  onChange={(e) => setNewResource({ ...newResource, descripcion: e.target.value })}
                  placeholder="Descripción del recurso"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad *</Label>
                <Input
                  id="unidad"
                  value={newResource.unidad}
                  onChange={(e) => setNewResource({ ...newResource, unidad: e.target.value })}
                  placeholder="Ej: hr, un, m3, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costo">Costo Unitario Predeterminado</Label>
                <Input
                  id="costo"
                  type="number"
                  value={newResource.costo_unitario_predeterminado}
                  onChange={(e) => setNewResource({ ...newResource, costo_unitario_predeterminado: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddResource} disabled={!newResource.descripcion.trim() || !newResource.unidad.trim()}>
                  Agregar Recurso
                </Button>
                <Button variant="outline" onClick={() => setShowAddResource(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para carga masiva desde Excel */}
      {showUploadExcel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Cargar Recursos desde Excel
                <Button variant="ghost" size="sm" onClick={() => setShowUploadExcel(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="excel-file">Archivo Excel</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xlsm"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-gray-500">
                  El archivo debe tener las columnas: descripcion, tipo, unidad, costo<br/>
                  Puedes agregar columnas adicionales que se guardarán en atributos
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUploadExcel} 
                  disabled={!uploadFile || uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Cargar Archivo
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowUploadExcel(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          ← Anterior
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={itemCostos.length === 0}
        >
          Continuar →
        </Button>
      </div>
    </div>
  );
};

export default CostosStep;
