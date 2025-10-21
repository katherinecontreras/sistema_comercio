import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Search, 
  Check, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Edit,
  Download,
  Upload,
  ClipboardList,
  X
} from 'lucide-react';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';
import { useCatalogos } from '@/hooks';
import { addNewPlanilla } from '@/actions';
import { AddPlanillaModal } from '@/components/modals';
import { InfoDialog, Toast } from '@/components/notifications';
import AddRecursosManually from '@/components/wizard/paso4/AddRecursosManually';

interface TipoRecurso {
  id_tipo_recurso: number;
  nombre: string;
  icono?: string;
}

interface Recurso {
  id_recurso: number;
  id_tipo_recurso: number;
  descripcion: string;
  unidad: string;
  cantidad: number;
  costo_unitario_predeterminado: number;
  costo_total: number;
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
  recurso: {
    id_recurso: number;
    descripcion: string;
    unidad: string;
    costo_unitario_predeterminado: number;
  };
}

interface ObraWithItems {
  obra: any;
  items: any[];
  totalRecursos: number;
  totalCosto: number;
}

const CostosStep: React.FC = () => {
  const { wizard, setCostos } = useAppStore();
  const { loadTypesOfRecursos, loadRecursosFrom, loading, loadUnidades, handleAddRecursos } = useCatalogos();
  
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedPlanilla, setSelectedPlanilla] = useState<number | null>(null);
  const [tiposRecurso, setTiposRecurso] = useState<TipoRecurso[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [itemCostos, setItemCostos] = useState<ItemCosto[]>(wizard.costos || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedObras, setCollapsedObras] = useState<Set<string>>(new Set());
  const [showResumen, setShowResumen] = useState(false);
  
  // Estados para agregar recursos manualmente
  const [showAddManually, setShowAddManually] = useState(false);
  const [selectedPlanillaForManual, setSelectedPlanillaForManual] = useState<{ id: number; nombre: string } | null>(null);
  
  // Estados para modal de nueva planilla
  const [showAddPlanillaModal, setShowAddPlanillaModal] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Agrupar items por obra
  const obrasWithItems: ObraWithItems[] = wizard.obras.map(obra => {
    const obraItems = wizard.items.filter(item => item.id_obra === obra.id);
    const totalRecursos = obraItems.reduce((sum, item) => {
      return sum + itemCostos.filter(c => c.id_item_obra === item.id).length;
    }, 0);
    const totalCosto = obraItems.reduce((sum, item) => {
      return sum + itemCostos
        .filter(c => c.id_item_obra === item.id)
        .reduce((s, c) => s + c.total_linea, 0);
    }, 0);
    
    return { obra, items: obraItems, totalRecursos, totalCosto };
  });

  // Verificar si un item tiene recursos
  const itemHasResources = (itemId: string) => {
    return itemCostos.some(c => c.id_item_obra === itemId);
  };

  // Verificar si una obra está completa (todos sus items tienen recursos)
  const isObraComplete = (obraId: string) => {
    const obraItems = wizard.items.filter(item => item.id_obra === obraId);
    return obraItems.length > 0 && obraItems.every(item => itemHasResources(item.id));
  };

  // Cargar tipos de recurso al montar
  useEffect(() => {
    const cargarTiposRecurso = async () => {
      try {
        const data = await loadTypesOfRecursos();
        setTiposRecurso(data);
      } catch (error) {
        console.error('Error cargando tipos de recurso:', error);
      }
    };
    cargarTiposRecurso();
  }, [loadTypesOfRecursos]);

  // Cargar recursos cuando se selecciona una planilla
  useEffect(() => {
    if (selectedPlanilla) {
      const cargarRecursos = async () => {
        try {
          const data = await loadRecursosFrom(selectedPlanilla);
          setRecursos(data);
        } catch (error) {
          console.error('Error cargando recursos:', error);
        }
      };
      cargarRecursos();
    }
  }, [selectedPlanilla, loadRecursosFrom]);

  // Cargar todos los recursos al inicio para poder verificar los tipos
  const [todosLosRecursos, setTodosLosRecursos] = useState<Recurso[]>([]);
  
  useEffect(() => {
    const cargarTodosRecursos = async () => {
      try {
        const promises = tiposRecurso.map(tipo => loadRecursosFrom(tipo.id_tipo_recurso));
        const resultados = await Promise.all(promises);
        const todosRecursos = resultados.flat();
        setTodosLosRecursos(todosRecursos);
      } catch (error) {
        console.error('Error cargando todos los recursos:', error);
      }
    };
    
    if (tiposRecurso.length > 0) {
      cargarTodosRecursos();
    }
  }, [tiposRecurso, loadRecursosFrom]);

  // Persistir costos en el estado global
  useEffect(() => {
    setCostos(itemCostos);
  }, [itemCostos, setCostos]);

  // Función para generar plantilla Excel
  const handleGenerateExcelTemplate = async () => {
    if (!selectedPlanilla) {
      alert('Por favor selecciona una planilla primero');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/catalogos/recursos/generar-plantilla-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          id_tipo_recurso: selectedPlanilla,
          atributos: [
            { nombre: 'descripcion', tipo: 'texto' },
            { nombre: 'unidad', tipo: 'texto' },
            { nombre: 'cantidad', tipo: 'entero' },
            { nombre: 'costo_unitario', tipo: 'numerico' },
            { nombre: 'costo_total', tipo: 'numerico' }
          ]
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const planillaNombre = tiposRecurso.find(t => t.id_tipo_recurso === selectedPlanilla)?.nombre || 'plantilla';
        a.download = `${planillaNombre}_plantilla.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setToastMessage('Plantilla Excel generada exitosamente');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert('Error al generar plantilla Excel');
      }
    } catch (error) {
      console.error('Error generando plantilla:', error);
      alert('Error al generar plantilla Excel');
    }
  };

  // Función para cargar recursos desde Excel
  const handleUploadExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPlanilla || !selectedItem) {
      alert('Por favor selecciona una planilla y un item primero');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('id_tipo_recurso', selectedPlanilla.toString());
      formData.append('atributos', JSON.stringify([
        { nombre: 'descripcion', tipo: 'texto' },
        { nombre: 'unidad', tipo: 'texto' },
        { nombre: 'cantidad', tipo: 'entero' },
        { nombre: 'costo_unitario', tipo: 'numerico' },
        { nombre: 'costo_total', tipo: 'numerico' }
      ]));

      const response = await fetch('http://localhost:8000/api/v1/catalogos/recursos/cargar-desde-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Recargar recursos de la planilla
        const recursosActualizados = await loadRecursosFrom(selectedPlanilla);
        setRecursos(recursosActualizados);

        setToastMessage(`${result.recursos_procesados} recursos cargados exitosamente`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const error = await response.json();
        alert(`Error al cargar Excel: ${error.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error cargando Excel:', error);
      alert('Error al cargar archivo Excel');
    }

    // Limpiar input
    event.target.value = '';
  };

  const handleAddRecursoToItem = (recurso: Recurso) => {
    if (!selectedItem) return;

    // Verificar si el recurso ya está asignado a este item
    const yaExiste = itemCostos.some(
      c => c.id_item_obra === selectedItem && c.id_recurso === recurso.id_recurso
    );

    if (yaExiste) {
      setToastMessage(`"${recurso.descripcion}" ya está asignado a este item`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const nuevoCosto: ItemCosto = {
      id: generateTempId(),
      id_item_obra: selectedItem,
      id_recurso: recurso.id_recurso,
      cantidad: 1,
      precio_unitario_aplicado: recurso.costo_unitario_predeterminado,
      total_linea: recurso.costo_unitario_predeterminado,
      recurso: {
        id_recurso: recurso.id_recurso,
        descripcion: recurso.descripcion,
        unidad: recurso.unidad,
        costo_unitario_predeterminado: recurso.costo_unitario_predeterminado
      }
    };

    const updatedCostos = [...itemCostos, nuevoCosto];
    setItemCostos(updatedCostos);
    setCostos(updatedCostos);
    
    // Mostrar toast (notificación temporal)
    const item = wizard.items.find(i => i.id === selectedItem);
    setToastMessage(`"${recurso.descripcion}" agregado a "${item?.descripcion_tarea || 'Item'}"`);
    setShowToast(true);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleCantidadChange = (costoId: string, cantidad: number) => {
    const updatedCostos = itemCostos.map(costo => {
      if (costo.id === costoId) {
        return {
          ...costo,
          cantidad,
          total_linea: cantidad * costo.precio_unitario_aplicado
        };
      }
      return costo;
    });
    setItemCostos(updatedCostos);
  };

  const handlePrecioChange = (costoId: string, precio: number) => {
    const updatedCostos = itemCostos.map(costo => {
      if (costo.id === costoId) {
        return {
          ...costo,
          precio_unitario_aplicado: precio,
          total_linea: costo.cantidad * precio
        };
      }
      return costo;
    });
    setItemCostos(updatedCostos);
  };

  const handleEliminarCosto = (id: string) => {
    const updatedCostos = itemCostos.filter(costo => costo.id !== id);
    setItemCostos(updatedCostos);
    setCostos(updatedCostos);
  };

  const toggleObraCollapse = (obraId: string) => {
    const newCollapsed = new Set(collapsedObras);
    if (newCollapsed.has(obraId)) {
      newCollapsed.delete(obraId);
    } else {
      newCollapsed.add(obraId);
    }
    setCollapsedObras(newCollapsed);
  };

  const handleAddPlanilla = async (data: { nombre: string; icono: string }) => {
    try {
      const response = await addNewPlanilla(data);
      
      if (response) {
        // Recargar tipos de recurso
        const tipos = await loadTypesOfRecursos();
        setTiposRecurso(tipos);
        
        setToastMessage(`Planilla "${response.nombre}" creada exitosamente`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Error creando planilla:', error);
    }
  };

  const getItemTotalCosto = (itemId: string) => {
    return itemCostos
      .filter(c => c.id_item_obra === itemId)
      .reduce((sum, c) => sum + c.total_linea, 0);
  };

  const getItemRecursoCount = (itemId: string) => {
    return itemCostos.filter(c => c.id_item_obra === itemId).length;
  };

  const recursosFiltrados = recursos.filter(recurso =>
    recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para determinar si una planilla tiene recursos asignados al item actual
  const planillaTieneRecursos = (planillaId: number) => {
    if (!selectedItem) return false;
    return itemCostos.some(costo => {
      // Buscar el recurso en la lista completa de recursos para verificar su tipo
      const recursoEncontrado = todosLosRecursos.find(r => r.id_recurso === costo.id_recurso);
      return costo.id_item_obra === selectedItem && recursoEncontrado?.id_tipo_recurso === planillaId;
    });
  };

  // Función para obtener el color de una planilla
  const getPlanillaColor = (planillaId: number) => {
    const isActive = selectedPlanilla === planillaId;
    const hasResources = planillaTieneRecursos(planillaId);
    
    if (isActive) {
      return 'bg-sky-500 border-sky-400'; // Azul - planilla activa
    } else if (hasResources) {
      return 'bg-green-600 border-green-500'; // Verde - tiene recursos
    } else {
      return 'bg-slate-700 border-slate-600 hover:bg-slate-600'; // Gris - sin recursos
    }
  };

  // Iconos disponibles para planillas
  const handleOpenAddManually = (planillaId: number, planillaNombre: string) => {
    setSelectedPlanillaForManual({ id: planillaId, nombre: planillaNombre });
    setShowAddManually(true);
  };

  const handleSaveRecursosManually = async (recursos: any[]) => {
    if (!selectedPlanillaForManual) return;

    try {
      // 1. Guardar cada recurso en la base de datos
      const recursosGuardados = [];
      
      for (const recurso of recursos) {
        // Buscar id_unidad por nombre
        const unidades = await loadUnidades();
        const unidadEncontrada = unidades.find((u: any) => u.nombre === recurso.unidad);
        
        if (!unidadEncontrada) {
          console.error('Unidad no encontrada:', recurso.unidad);
          continue;
        }

        // Preparar datos del recurso para la BD
        const recursoData = {
          id_tipo_recurso: selectedPlanillaForManual.id,
          descripcion: recurso.descripcion,
          id_unidad: unidadEncontrada.id_unidad,
          cantidad: parseFloat(recurso.cantidad) || 0,
          costo_unitario_predeterminado: parseFloat(recurso.costo_unitario) || 0,
          costo_total: parseFloat(recurso.costo_total) || 0,
          atributos: {} as Record<string, any> // Aquí irían los atributos personalizados
        };

        // Agregar atributos personalizados (los que no son campos base)
        Object.keys(recurso).forEach(key => {
          if (!['descripcion', 'unidad', 'cantidad', 'costo_unitario', 'costo_total'].includes(key)) {
            recursoData.atributos[key] = recurso[key];
          }
        });

        // Guardar en BD
        const recursos = await handleAddRecursos(recursoData);
        recursosGuardados.push(recursos);
      }

      // 2. Recargar recursos de esta planilla para que aparezcan en la lista
      if (selectedPlanillaForManual.id === selectedPlanilla) {
        const recursos= await loadRecursosFrom(selectedPlanillaForManual.id);
        setRecursos(recursos);
      }

      // 3. Agregar los recursos al item como costos (solo los que no existan)
      const nuevosCostos: ItemCosto[] = [];
      
      for (const recursoGuardado of recursosGuardados) {
        // Verificar si ya existe
        const yaExiste = itemCostos.some(
          c => c.id_item_obra === selectedItem && c.id_recurso === recursoGuardado.id_recurso
        );
        
        if (!yaExiste) {
          nuevosCostos.push({
            id: generateTempId(),
            id_item_obra: selectedItem,
            id_recurso: recursoGuardado.id_recurso,
            cantidad: recursoGuardado.cantidad,
            precio_unitario_aplicado: recursoGuardado.costo_unitario_predeterminado,
            total_linea: recursoGuardado.costo_total,
            recurso: {
              id_recurso: recursoGuardado.id_recurso,
              descripcion: recursoGuardado.descripcion,
              unidad: recursoGuardado.unidad,
              costo_unitario_predeterminado: recursoGuardado.costo_unitario_predeterminado
            }
          });
        }
      }

      const updatedCostos = [...itemCostos, ...nuevosCostos];
      setItemCostos(updatedCostos);
      setCostos(updatedCostos);
      setShowAddManually(false);
      setSelectedPlanillaForManual(null);
      
      setToastMessage(`${nuevosCostos.length} recursos guardados y asignados exitosamente`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error guardando recursos:', error);
      alert('Error al guardar los recursos en la base de datos');
    }
  };

  // Si estamos en modo agregar manualmente, mostrar ese componente
  if (showAddManually && selectedPlanillaForManual) {
    return (
      <AddRecursosManually
        planillaNombre={selectedPlanillaForManual.nombre}
        planillaId={selectedPlanillaForManual.id}
        itemId={selectedItem}
        onCancel={() => {
          setShowAddManually(false);
          setSelectedPlanillaForManual(null);
        }}
        onSave={handleSaveRecursosManually}
      />
    );
  }

  // Si estamos mostrando el resumen
  if (showResumen) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Resumen de Costos</h3>
            <p className="text-slate-400">Revisa los recursos asignados a cada item</p>
          </div>
          <Button
            onClick={() => setShowResumen(false)}
            variant="outline"
            className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            Volver a Asignar Recursos
          </Button>
        </div>

        {/* Resumen por Obra */}
        {wizard.obras.map(obra => {
          const obraItems = wizard.items.filter(item => item.id_obra === obra.id);
          const totalCostoObra = obraItems.reduce((sum, item) => {
            return sum + itemCostos
              .filter(c => c.id_item_obra === item.id)
              .reduce((s, c) => s + c.total_linea, 0);
          }, 0);
          const totalRecursosObra = obraItems.reduce((sum, item) => {
            return sum + itemCostos.filter(c => c.id_item_obra === item.id).length;
          }, 0);

          if (totalRecursosObra === 0) return null;

          return (
            <Card key={obra.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{obra.nombre}</span>
                  <div className="text-sm font-normal text-slate-400">
                    {obraItems.length} items • {totalRecursosObra} recursos • ${totalCostoObra.toFixed(2)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {obraItems.map(item => {
                  const itemRecursos = itemCostos.filter(c => c.id_item_obra === item.id);
                  if (itemRecursos.length === 0) return null;

                  const totalCostoItem = itemRecursos.reduce((sum, c) => sum + c.total_linea, 0);

                  return (
                    <div key={item.id} className="mb-4 bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">
                          {item.codigo && `${item.codigo} - `}{item.descripcion_tarea}
                        </h4>
                        <div className="text-green-400 font-semibold">${totalCostoItem.toFixed(2)}</div>
                      </div>
                      <div className="space-y-2">
                        {itemRecursos.map(recurso => (
                          <div key={recurso.id} className="flex items-center justify-between text-sm bg-slate-800/50 p-2 rounded">
                            <span className="text-slate-300">{recurso.recurso.descripcion}</span>
                            <span className="text-slate-400">
                              {recurso.cantidad} {recurso.recurso.unidad} × ${recurso.precio_unitario_aplicado.toFixed(2)} = ${recurso.total_linea.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Asignar Costos a Items</h3>
          <p className="text-slate-400">Asigna recursos de las planillas a cada item de obra</p>
          {itemCostos.length > 0 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wizard.obras.map(obra => {
                  const obraItems = wizard.items.filter(item => item.id_obra === obra.id);
                  const totalCostoObra = obraItems.reduce((sum, item) => {
                    return sum + itemCostos
                      .filter(c => c.id_item_obra === item.id)
                      .reduce((s, c) => s + c.total_linea, 0);
                  }, 0);
                  const totalRecursosObra = obraItems.reduce((sum, item) => {
                    return sum + itemCostos.filter(c => c.id_item_obra === item.id).length;
                  }, 0);

                  if (totalRecursosObra === 0) return null;

                  return (
                    <div 
                      key={obra.id}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
                    >
                      <div className="text-sm text-slate-400 mb-1">{obra.nombre}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          {obraItems.length} items • {totalRecursosObra} recursos
                        </div>
                        <div className="text-lg font-bold text-green-400">
                          ${totalCostoObra.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="text-sm text-slate-400">
          {itemCostos.length} recurso{itemCostos.length !== 1 ? 's' : ''} asignado{itemCostos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Cards de Obras con Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {obrasWithItems
          .sort((a, b) => {
            const aComplete = isObraComplete(a.obra.id);
            const bComplete = isObraComplete(b.obra.id);
            if (aComplete && !bComplete) return 1;
            if (!aComplete && bComplete) return -1;
            return 0;
          })
          .map(({ obra, items, totalRecursos, totalCosto }) => {
            const isComplete = isObraComplete(obra.id);
            const isCollapsed = collapsedObras.has(obra.id);

            return (
              <Card 
                key={obra.id}
                className={`transition-all ${
                  isComplete 
                    ? 'bg-green-900/30 border-green-500/50' 
                    : 'bg-slate-800 border-slate-600'
                }`}
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => isComplete && toggleObraCollapse(obra.id)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isComplete && <Check className="h-5 w-5 text-green-500" />}
                      {obra.nombre}
                    </CardTitle>
                    {isComplete && (
                      isCollapsed ? 
                        <ChevronDown className="h-5 w-5 text-slate-400" /> : 
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  {isComplete && isCollapsed && (
                    <div className="text-sm text-slate-400 mt-2">
                      <div>{items.length} item{items.length !== 1 ? 's' : ''}</div>
                      <div>{totalRecursos} recurso{totalRecursos !== 1 ? 's' : ''}</div>
                      <div className="font-semibold text-green-400">
                        ${totalCosto.toFixed(2)}
                      </div>
                    </div>
                  )}
                </CardHeader>
                
                {(!isComplete || !isCollapsed) && (
                  <CardContent className="space-y-2">
                    {items.map(item => {
                      const hasResources = itemHasResources(item.id);
                      const isSelected = selectedItem === item.id;
                      const recursoCount = getItemRecursoCount(item.id);
                      const totalCostoItem = getItemTotalCosto(item.id);

                      return (
                        <Button
                          key={item.id}
                          variant="outline"
                          className={`w-full justify-between ${
                            isSelected 
                              ? 'bg-sky-500 border-sky-400 text-white' 
                              : hasResources
                              ? 'bg-green-600/20 border-green-500/50 text-green-100'
                              : 'bg-slate-700 border-slate-600 text-white'
                          } hover:opacity-80`}
                          onClick={() => setSelectedItem(item.id)}
                        >
                          <span className="truncate">{item.descripcion_tarea}</span>
                          {hasResources && (
                            <div className="flex items-center gap-2 text-xs">
                              <span>{recursoCount} rec.</span>
                              <span className="font-semibold">${totalCostoItem.toFixed(2)}</span>
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
      </div>

      {/* Selección de Planilla */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Seleccionar Planilla de Recursos</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddPlanillaModal(true)}
                className="bg-sky-600 hover:bg-sky-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nueva Planilla
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tiposRecurso.map((tipo) => {
                const IconComponent = FileSpreadsheet;
                const colorClass = getPlanillaColor(tipo.id_tipo_recurso);
                
                return (
                  <Button
                    key={tipo.id_tipo_recurso}
                    variant="outline"
                    onClick={() => setSelectedPlanilla(tipo.id_tipo_recurso)}
                    className={`h-20 flex flex-col items-center justify-center ${colorClass}`}
                  >
                    <IconComponent className="h-6 w-6 mb-2" />
                    <span className="text-sm">{tipo.nombre}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Recursos de la Planilla */}
      {selectedPlanilla && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span>Recursos: {tiposRecurso.find(t => t.id_tipo_recurso === selectedPlanilla)?.nombre}</span>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedPlanilla(null);
                    setSearchTerm('');
                  }}
                  className="bg-slate-700 hover:bg-slate-600 border-slate-600"
                >
                  Cerrar Planilla
                </Button>
              </div>
              
              {/* Botones de Gestión de Recursos */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => handleOpenAddManually(
                    selectedPlanilla, 
                    tiposRecurso.find(t => t.id_tipo_recurso === selectedPlanilla)?.nombre || ''
                  )}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Cargar Manual
                </Button>
                
                <Button 
                  onClick={handleGenerateExcelTemplate}
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              {loading ? (
                <div className="text-center py-4 text-slate-400">Cargando recursos...</div>
              ) : recursosFiltrados.length === 0 ? (
                <div className="text-center py-4 text-slate-400">No hay recursos en esta planilla</div>
              ) : (
                recursosFiltrados.map((recurso) => {
                  // Verificar si el recurso está seleccionado para el item actual
                  const costoExistente = selectedItem ? itemCostos.find(
                    c => c.id_item_obra === selectedItem && c.id_recurso === recurso.id_recurso
                  ) : null;
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
                              {recurso.unidad} - ${recurso.costo_unitario_predeterminado.toFixed(2)}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-sky-400" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recursos Asignados por Item */}
      {itemCostos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recursos Asignados por Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wizard.items
                .filter(item => itemCostos.some(c => c.id_item_obra === item.id))
                .map((item) => {
                  const itemCostosFiltered = itemCostos.filter(c => c.id_item_obra === item.id);
                  const totalItem = itemCostosFiltered.reduce((sum, c) => sum + c.total_linea, 0);
                  const isSelected = selectedItem === item.id;

                  return (
                    <div 
                      key={item.id} 
                      className={`border rounded-lg ${
                        isSelected 
                          ? 'border-sky-500 bg-sky-900/10' 
                          : 'border-slate-600'
                      }`}
                    >
                      {/* Header del item */}
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 border-b border-slate-600">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.codigo && (
                              <span className="text-xs font-mono bg-sky-900/50 text-sky-300 px-2 py-1 rounded">
                                {item.codigo}
                              </span>
                            )}
                            <span className="font-medium text-white">{item.descripcion_tarea}</span>
                          </div>
                          <div className="text-sm text-slate-400">
                            {itemCostosFiltered.length} recurso{itemCostosFiltered.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Total Item</div>
                          <div className="text-lg font-bold text-green-400">${totalItem.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Recursos del item */}
                      <div className="p-3 space-y-2">
                        {itemCostosFiltered.map((costo) => (
                          <div key={costo.id} className="flex items-center gap-4 p-3 bg-slate-700 rounded-lg border border-slate-600">
                            <div className="flex-1">
                              <div className="font-medium text-white">{costo.recurso.descripcion}</div>
                              <div className="text-sm text-slate-400">{costo.recurso.unidad}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20">
                                <Input
                                  type="number"
                                  value={costo.cantidad}
                                  onChange={(e) => handleCantidadChange(costo.id, parseFloat(e.target.value) || 1)}
                                  min="0"
                                  step="0.01"
                                  className="h-8 text-xs"
                                />
                              </div>
                              <span className="text-slate-400">×</span>
                              <div className="w-24">
                                <Input
                                  type="number"
                                  value={costo.precio_unitario_aplicado}
                                  onChange={(e) => handlePrecioChange(costo.id, parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  className="h-8 text-xs"
                                />
                              </div>
                              <span className="text-slate-400">=</span>
                              <div className="text-sm font-medium text-green-400 w-24 text-right">
                                ${costo.total_linea.toFixed(2)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarCosto(costo.id)}
                                className="text-red-400 hover:text-red-300"
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

      {/* Botón para Ver Resumen */}
      {itemCostos.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setShowResumen(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white"
            size="lg"
          >
            <ClipboardList className="h-5 w-5 mr-2" />
            Ver Resumen de Costos
          </Button>
        </div>
      )}

      {/* Modal para agregar nueva planilla */}
      <AddPlanillaModal
        open={showAddPlanillaModal}
        onClose={() => setShowAddPlanillaModal(false)}
        onAdd={handleAddPlanilla}
      />

      {/* AlertDialog de validación */}
      <InfoDialog
        open={showValidationAlert} 
        onClose={() => setShowValidationAlert(false)}
        title={<span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Items sin recursos</span>}
        description="Todos los items deben tener al menos un recurso asignado antes de continuar."
        actionLabel="Entendido"
        variant="primary"
      />

      {/* Toast/Notificación temporal */}
      <Toast
        message={toastMessage}
        type="success"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default CostosStep;
