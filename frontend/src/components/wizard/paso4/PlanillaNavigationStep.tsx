import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Check, Folder, FolderOpen, Search, Plus, AlertCircle, Download, Upload, Edit } from 'lucide-react';
import { ItemObra } from '@/store/obra';
import { useCatalogos } from '@/hooks';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';
import AddRecursosManually from './AddRecursosManually';
import ExcelAttributeModal from '@/components/modals/ExcelAttributeModal';
import { AtributoBase } from '@/store/atributo';

interface PlanillaNavigationStepProps {
  selectedItem: ItemObra;
  selectedPlanillas: Array<{id: number, nombre: string}>;
  onPlanillaSelect: (planillaId: number) => void;
  onPlanillaDelete: (planillaId: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PlanillaNavigationStep: React.FC<PlanillaNavigationStepProps> = ({
  selectedItem,
  selectedPlanillas,
  onPlanillaSelect,
  onPlanillaDelete,
  onNext,
  onBack
}) => {
  const { loadRecursosFrom } = useCatalogos();
  const { wizard, setCostos } = useAppStore();
  const [activePlanilla, setActivePlanilla] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoResourcesAlert, setShowNoResourcesAlert] = useState(false);
  const [itemCostos, setItemCostos] = useState<any[]>(wizard.costos || []);
  const [showAddManually, setShowAddManually] = useState(false);
  const [showExcelAttributeModal, setShowExcelAttributeModal] = useState(false);

  const handlePlanillaClick = async (planillaId: number) => {
    setActivePlanilla(planillaId);
    onPlanillaSelect(planillaId);
    
    // Cargar recursos de la planilla
    setLoading(true);
    setShowNoResourcesAlert(false);
    
    try {
      const recursosData = await loadRecursosFrom(planillaId);
      setRecursos(recursosData);
      
      if (recursosData.length === 0) {
        setShowNoResourcesAlert(true);
      }
    } catch (error) {
      console.error('Error cargando recursos:', error);
      setRecursos([]);
      setShowNoResourcesAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlanilla = (planillaId: number) => {
    setShowDeleteConfirm(planillaId);
  };

  const confirmDelete = (planillaId: number) => {
    onPlanillaDelete(planillaId);
    setShowDeleteConfirm(null);
    if (activePlanilla === planillaId) {
      setActivePlanilla(null);
    }
  };

  // Persistir costos en el estado global
  useEffect(() => {
    setCostos(itemCostos);
  }, [itemCostos, setCostos]);

  // Función para agregar un recurso al item
  const handleAddRecursoToItem = (recurso: any) => {
    if (!selectedItem.id) return;

    // Verificar si ya existe
    const yaExiste = itemCostos.some(
      c => c.id_item_obra === selectedItem.id && c.id_recurso === recurso.id_recurso
    );

    if (yaExiste) {
      alert('Este recurso ya está asignado a este item');
      return;
    }

    const nuevoCosto = {
      id: generateTempId(),
      id_item_obra: selectedItem.id,
      id_recurso: recurso.id_recurso,
      cantidad: 1,
      precio_unitario_aplicado: recurso.costo_unitario_predeterminado || 0,
      total_linea: recurso.costo_unitario_predeterminado || 0,
      recurso: {
        id_recurso: recurso.id_recurso,
        descripcion: recurso.descripcion,
        unidad: recurso.unidad,
        costo_unitario_predeterminado: recurso.costo_unitario_predeterminado || 0
      }
    };

    setItemCostos([...itemCostos, nuevoCosto]);
  };

  // Función para eliminar un costo
  const handleEliminarCosto = (costoId: string) => {
    setItemCostos(itemCostos.filter(c => c.id !== costoId));
  };

  // Función para cambiar cantidad
  const handleCantidadChange = (costoId: string, cantidad: number) => {
    setItemCostos(itemCostos.map(costo => {
      if (costo.id === costoId) {
        return {
          ...costo,
          cantidad,
          total_linea: cantidad * costo.precio_unitario_aplicado
        };
      }
      return costo;
    }));
  };

  // Función para cambiar precio
  const handlePrecioChange = (costoId: string, precio: number) => {
    setItemCostos(itemCostos.map(costo => {
      if (costo.id === costoId) {
        return {
          ...costo,
          precio_unitario_aplicado: precio,
          total_linea: costo.cantidad * precio
        };
      }
      return costo;
    }));
  };

  // Cargar todos los recursos de todas las planillas para poder verificar los tipos
  const [allRecursos, setAllRecursos] = useState<any[]>([]);
  
  useEffect(() => {
    const cargarTodosRecursos = async () => {
      try {
        const promises = selectedPlanillas.map(p => loadRecursosFrom(p.id));
        const resultados = await Promise.all(promises);
        const todosRecursos = resultados.flat();
        setAllRecursos(todosRecursos);
      } catch (error) {
        console.error('Error cargando todos los recursos:', error);
      }
    };
    
    if (selectedPlanillas.length > 0) {
      cargarTodosRecursos();
    }
  }, [selectedPlanillas, loadRecursosFrom]);

  const getPlanillaStatus = (planillaId: number) => {
    // Verificar si la planilla tiene recursos asignados al item actual
    const hasResources = itemCostos.some(costo => {
      const recursoEncontrado = allRecursos.find(r => r.id_recurso === costo.id_recurso);
      return costo.id_item_obra === selectedItem.id && recursoEncontrado?.id_tipo_recurso === planillaId;
    });
    return hasResources ? 'loaded' : 'empty';
  };

  const getPlanillaColor = (planillaId: number, isActive: boolean) => {
    const status = getPlanillaStatus(planillaId);
    
    if (isActive) {
      return 'bg-sky-400'; // Azul claro para activa
    }
    
    switch (status) {
      case 'loaded':
        return 'bg-green-500'; // Verde para con recursos
      case 'empty':
        return 'bg-slate-600'; // Gris para sin recursos
      default:
        return 'bg-slate-600';
    }
  };

  const getPlanillaIcon = (planillaId: number) => {
    const status = getPlanillaStatus(planillaId);
    return status === 'loaded' ? (
      <FolderOpen className="h-5 w-5" />
    ) : (
      <Folder className="h-5 w-5" />
    );
  };

  // Función para abrir modal de atributos Excel
  const handleGenerateExcel = () => {
    if (!activePlanilla) {
      alert('Por favor selecciona una planilla primero');
      return;
    }
    setShowExcelAttributeModal(true);
  };

  // Función para generar plantilla Excel con los atributos seleccionados
  const handleConfirmExcelAttributes = async (atributosSeleccionados: AtributoBase[]) => {
    console.log('Atributos seleccionados:', atributosSeleccionados);
    console.log('Planilla activa:', activePlanilla);
    
    if (!activePlanilla) {
      alert('No hay planilla activa');
      return;
    }

    try {
      const planillaNombre = selectedPlanillas.find(p => p.id === activePlanilla)?.nombre || 'plantilla';
      
      const atributosParaAPI = atributosSeleccionados.map(attr => ({
        nombre: attr.nombre, // Usar el nombre legible, no el id
        tipo: attr.tipo
      }));

      const requestBody = {
        atributos: atributosParaAPI,
        nombre_planilla: planillaNombre
      };

      console.log('Enviando request con:', requestBody);

      const response = await fetch('http://localhost:8000/api/v1/catalogos/recursos/generar-plantilla-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const blob = await response.blob();
        console.log('Blob size:', blob.size);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Plantilla_${planillaNombre.replace(' ', '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setShowExcelAttributeModal(false);
        alert('Plantilla Excel generada exitosamente');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setShowExcelAttributeModal(false);
        alert(`Error al generar plantilla Excel: ${response.status}`);
      }
    } catch (error) {
      console.error('Error generando plantilla:', error);
      setShowExcelAttributeModal(false);
      alert('Error al generar plantilla Excel: ' + (error as Error).message);
    }
  };

  // Función para cargar recursos desde Excel
  const handleUploadExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!activePlanilla) {
      alert('Por favor selecciona una planilla primero');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Cargando archivo Excel:', file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('id_tipo_recurso', activePlanilla.toString());
      formData.append('atributos', JSON.stringify([
        { nombre: 'descripcion', tipo: 'texto' },
        { nombre: 'unidad', tipo: 'texto' },
        { nombre: 'cantidad', tipo: 'entero' },
        { nombre: 'costo_unitario', tipo: 'numerico' },
        { nombre: 'costo_total', tipo: 'numerico' }
      ]));

      console.log('Enviando archivo a la API...');

      const response = await fetch('http://localhost:8000/api/v1/catalogos/recursos/cargar-desde-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Respuesta completa del servidor:', result);
        
        if (!result.success || result.total_procesados === 0) {
          console.error('No se procesaron recursos:', result.errores);
          alert(`Error: No se cargaron recursos.\nErrores: ${result.errores?.join(', ') || 'Desconocido'}`);
          return;
        }
        
        console.log(`Recursos guardados: ${result.recursos_guardados}, actualizados: ${result.recursos_actualizados}`);
        console.log('IDs procesados:', result.ids_recursos_procesados);
        
        // Recargar recursos de la planilla
        const recursosActualizados = await loadRecursosFrom(activePlanilla);
        console.log('Recursos recargados:', recursosActualizados);
        setRecursos(recursosActualizados);
        
        // Recargar también todos los recursos para actualizar los colores de planillas
        const promises = selectedPlanillas.map(p => loadRecursosFrom(p.id));
        const resultados = await Promise.all(promises);
        const todosRecursos = resultados.flat();
        setAllRecursos(todosRecursos);
        
        setShowNoResourcesAlert(false);

        // AUTO-SELECCIONAR los recursos cargados (agregarlos como costos al item)
        const nuevosCostos = [];
        for (const idRecurso of result.ids_recursos_procesados || []) {
          // Buscar el recurso en los recursos recargados
          const recursoEncontrado = recursosActualizados.find((r: any) => r.id_recurso === idRecurso);
          
          if (recursoEncontrado) {
            // Verificar si ya está asignado
            const yaExiste = itemCostos.some(
              c => c.id_item_obra === selectedItem.id && c.id_recurso === idRecurso
            );
            
            if (!yaExiste) {
              const nuevoCosto = {
                id: generateTempId(),
                id_item_obra: selectedItem.id,
                id_recurso: recursoEncontrado.id_recurso,
                cantidad: recursoEncontrado.cantidad || 1,
                precio_unitario_aplicado: recursoEncontrado.costo_unitario_predeterminado || 0,
                total_linea: (recursoEncontrado.cantidad || 1) * (recursoEncontrado.costo_unitario_predeterminado || 0),
                recurso: {
                  id_recurso: recursoEncontrado.id_recurso,
                  descripcion: recursoEncontrado.descripcion,
                  unidad: recursoEncontrado.unidad,
                  costo_unitario_predeterminado: recursoEncontrado.costo_unitario_predeterminado || 0
                }
              };
              nuevosCostos.push(nuevoCosto);
            }
          }
        }
        
        // Agregar los nuevos costos al estado
        if (nuevosCostos.length > 0) {
          console.log(`Auto-seleccionando ${nuevosCostos.length} recursos cargados`);
          setItemCostos([...itemCostos, ...nuevosCostos]);
        }

        const mensaje = `✅ ${result.total_procesados} recursos cargados exitosamente\n` +
                       `Guardados: ${result.recursos_guardados}, Actualizados: ${result.recursos_actualizados}\n` +
                       `${nuevosCostos.length} recursos auto-seleccionados para el item` +
                       (result.errores && result.errores.length > 0 ? `\n\n⚠️ Advertencias:\n${result.errores.join('\n')}` : '');
        
        alert(mensaje);
      } else {
        const error = await response.json();
        console.error('Error del servidor:', error);
        alert(`Error al cargar Excel: ${error.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error cargando Excel:', error);
      alert('Error al cargar archivo Excel: ' + (error as Error).message);
    }

    // Limpiar input
    event.target.value = '';
  };

  // Función para abrir el componente de carga manual
  const handleCargarManual = () => {
    if (!activePlanilla) {
      alert('Por favor selecciona una planilla primero');
      return;
    }
    setShowAddManually(true);
  };

  // Función para guardar recursos agregados manualmente
  const handleSaveRecursosManually = async (recursosAgregados: any[]) => {
    try {
      // Los recursos ya fueron guardados en la BD por AddRecursosManually
      // Ahora necesitamos agregarlos como costos al item actual
      
      // Recargar recursos de la planilla activa
      if (activePlanilla) {
        const recursosActualizados = await loadRecursosFrom(activePlanilla);
        setRecursos(recursosActualizados);
        
        // Agregar automáticamente los nuevos recursos como costos
        const nuevosCostos = recursosAgregados.map(recurso => ({
          id: generateTempId(),
          id_item_obra: selectedItem.id,
          id_recurso: recurso.id_recurso,
          cantidad: recurso.cantidad || 1,
          precio_unitario_aplicado: recurso.costo_unitario || 0,
          total_linea: (recurso.cantidad || 1) * (recurso.costo_unitario || 0),
          recurso: {
            id_recurso: recurso.id_recurso,
            descripcion: recurso.descripcion,
            unidad: recurso.unidad,
            costo_unitario_predeterminado: recurso.costo_unitario || 0
          }
        }));

        setItemCostos([...itemCostos, ...nuevosCostos]);
        setShowNoResourcesAlert(false);
      }
      
      setShowAddManually(false);
    } catch (error) {
      console.error('Error guardando recursos:', error);
      alert('Error al guardar los recursos');
    }
  };

  // Si estamos mostrando el componente de carga manual, renderizarlo
  if (showAddManually && activePlanilla) {
    return (
      <AddRecursosManually
        planillaNombre={selectedPlanillas.find(p => p.id === activePlanilla)?.nombre || ''}
        planillaId={activePlanilla}
        itemId={selectedItem.id}
        onCancel={() => setShowAddManually(false)}
        onSave={handleSaveRecursosManually}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Gestionar Recursos por Planilla</h3>
          <p className="text-muted-foreground">
            Selecciona una planilla para cargar recursos para: <strong>{selectedItem.codigo || selectedItem.descripcion_tarea}</strong>
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedPlanillas.length} planilla{selectedPlanillas.length !== 1 ? 's' : ''} seleccionada{selectedPlanillas.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Información del Item */}
      <Card>
        <CardHeader>
          <CardTitle>Item Seleccionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">
              {selectedItem.codigo && `${selectedItem.codigo} - `}{selectedItem.descripcion_tarea}
            </h4>
            <div className="text-sm text-slate-400">
              {selectedItem.especialidad && `Especialidad: ${selectedItem.especialidad} • `}
              {selectedItem.unidad && `Unidad: ${selectedItem.unidad} • `}
              {selectedItem.cantidad > 0 && `Cantidad: ${selectedItem.cantidad} • `}
              {selectedItem.precio_unitario > 0 && `Precio: $${selectedItem.precio_unitario}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegación por Carpetas - Estilo tabs horizontal */}
      <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {selectedPlanillas.map((planilla) => {
            const isActive = activePlanilla === planilla.id;
            const bgColor = getPlanillaColor(planilla.id, isActive);
            
            return (
              <div
                key={planilla.id}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all ${bgColor} text-white hover:opacity-90 min-w-[150px]`}
                onClick={() => handlePlanillaClick(planilla.id)}
              >
                {getPlanillaIcon(planilla.id)}
                <span className="font-medium text-sm truncate">{planilla.nombre}</span>
                
                {/* Botón X para eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlanilla(planilla.id);
                  }}
                  className="ml-auto p-0.5 hover:bg-black/20 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Área de contenido de la planilla activa */}
      {activePlanilla ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-4">
              <div>Recursos de: {selectedPlanillas.find(p => p.id === activePlanilla)?.nombre}</div>
              
              {/* Botones de gestión de recursos */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handleCargarManual}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Cargar Manual
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleGenerateExcel}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generar Excel
                </Button>
                <div>
                  <input
                    id="upload-excel-recursos"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleUploadExcel}
                    className="hidden"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => document.getElementById('upload-excel-recursos')?.click()}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Cargar Excel
                  </Button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                <p>Cargando recursos...</p>
              </div>
            ) : showNoResourcesAlert ? (
              <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-6">
                <div className="flex items-center gap-3 text-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-300">No hay recursos en esta planilla</h3>
                    <p className="text-amber-400 text-sm mt-1">
                      Esta planilla no tiene recursos guardados. Usa los botones de arriba para cargar recursos.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar recursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista de recursos */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {recursos
                    .filter(recurso => 
                      recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((recurso) => {
                      // Verificar si el recurso está seleccionado para el item actual
                      const costoExistente = itemCostos.find(
                        c => c.id_item_obra === selectedItem.id && c.id_recurso === recurso.id_recurso
                      );
                      const isSelected = !!costoExistente;

                      return (
                        <div 
                          key={recurso.id_recurso}
                          className={`p-3 rounded-lg transition-colors border ${
                            isSelected
                              ? 'bg-green-600/20 border-green-500'
                              : 'bg-slate-700 hover:bg-slate-600 border-slate-600 cursor-pointer'
                          }`}
                        >
                          {isSelected && costoExistente ? (
                            // Recurso seleccionado - mostrar con controles
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-white flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-400" />
                                    {recurso.descripcion}
                                  </div>
                                  <div className="text-sm text-slate-400">
                                    {recurso.unidad}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEliminarCosto(costoExistente.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {/* Controles de cantidad y precio */}
                              <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Label className="text-slate-400 text-xs">Cant:</Label>
                                  <Input
                                    type="number"
                                    value={costoExistente.cantidad}
                                    onChange={(e) => handleCantidadChange(costoExistente.id, parseFloat(e.target.value) || 1)}
                                    min="0"
                                    step="0.01"
                                    className="h-8 w-20 text-xs"
                                  />
                                </div>
                                <span className="text-slate-400">×</span>
                                <div className="flex items-center gap-1">
                                  <Label className="text-slate-400 text-xs">Precio:</Label>
                                  <Input
                                    type="number"
                                    value={costoExistente.precio_unitario_aplicado}
                                    onChange={(e) => handlePrecioChange(costoExistente.id, parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    className="h-8 w-24 text-xs"
                                  />
                                </div>
                                <span className="text-slate-400">=</span>
                                <div className="text-sm font-medium text-green-400 ml-auto">
                                  ${costoExistente.total_linea.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Recurso no seleccionado - mostrar normal
                            <div 
                              onClick={() => handleAddRecursoToItem(recurso)}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-white">{recurso.descripcion}</div>
                                <div className="text-sm text-slate-400">
                                  {recurso.unidad} - ${recurso.costo_unitario_predeterminado?.toFixed(2) || '0.00'}
                                </div>
                              </div>
                              <Plus className="h-4 w-4 text-sky-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-slate-400">
            <p>Selecciona una planilla para gestionar sus recursos</p>
          </CardContent>
        </Card>
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-800">¿Eliminar planilla?</h4>
                <p className="text-sm text-red-600">
                  Esta acción eliminará la planilla y todos sus recursos. No se puede deshacer.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegación */}
      <div className="flex justify-between">
        <Button 
          onClick={onBack}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          <X className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={selectedPlanillas.length === 0}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          Continuar
          <Check className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Modal de atributos Excel */}
      <ExcelAttributeModal
        open={showExcelAttributeModal}
        onClose={() => setShowExcelAttributeModal(false)}
        onConfirm={handleConfirmExcelAttributes}
      />
    </div>
  );
};
