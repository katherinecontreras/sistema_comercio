import React, { useState, useEffect, useRef } from 'react';
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
  DollarSign,
  Package,
  AlertTriangle,
  Edit,
  Download,
  Upload
} from 'lucide-react';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';
import api from '@/services/api';
import AddRecursosManually from './AddRecursosManually';
import ExcelAttributeModal from '@/components/modals/ExcelAttributeModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const { wizard, setStep, setCostos } = useAppStore();
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedPlanilla, setSelectedPlanilla] = useState<number | null>(null);
  const [tiposRecurso, setTiposRecurso] = useState<TipoRecurso[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [itemCostos, setItemCostos] = useState<ItemCosto[]>(wizard.costos || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedObras, setCollapsedObras] = useState<Set<string>>(new Set());
  
  // Estados para agregar recursos manualmente
  const [showAddManually, setShowAddManually] = useState(false);
  const [selectedPlanillaForManual, setSelectedPlanillaForManual] = useState<{ id: number; nombre: string } | null>(null);
  
  // Estados para modal de nueva planilla
  const [showAddPlanillaModal, setShowAddPlanillaModal] = useState(false);
  const [newPlanilla, setNewPlanilla] = useState({ nombre: '', icono: 'FileSpreadsheet' });
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Estados para Excel
  const [showExcelAttributeModal, setShowExcelAttributeModal] = useState(false);
  const [planillaForExcel, setPlanillaForExcel] = useState<{ id: number; nombre: string } | null>(null);
  const [lastDownloadedAttributes, setLastDownloadedAttributes] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Persistir costos en el estado global
  useEffect(() => {
    setCostos(itemCostos);
  }, [itemCostos, setCostos]);

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

  const handleAddPlanilla = async () => {
    if (!newPlanilla.nombre.trim()) return;

    try {
      const formData = new URLSearchParams();
      formData.append('nombre', newPlanilla.nombre.trim());

      const response = await api.post('/catalogos/tipos_recurso', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data) {
        setTiposRecurso([...tiposRecurso, { ...response.data, icono: newPlanilla.icono }]);
        setNewPlanilla({ nombre: '', icono: 'FileSpreadsheet' });
        setShowAddPlanillaModal(false);
        setToastMessage(`Planilla "${response.data.nombre}" creada exitosamente`);
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

  const handleContinue = () => {
    // Validar que todos los items tengan al menos un recurso
    const itemsWithoutResources = wizard.items.filter(item => !itemHasResources(item.id));
    
    if (itemsWithoutResources.length > 0) {
      setShowValidationAlert(true);
      return;
    }

    setStep('incrementos');
  };

  const handleBack = () => {
    setStep('items');
  };

  const recursosFiltrados = recursos.filter(recurso =>
    recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Iconos disponibles para planillas
  const iconosDisponibles = [
    { name: 'FileSpreadsheet', icon: FileSpreadsheet },
    { name: 'Package', icon: Package },
    { name: 'DollarSign', icon: DollarSign },
  ];

  const handleOpenAddManually = (planillaId: number, planillaNombre: string) => {
    setSelectedPlanillaForManual({ id: planillaId, nombre: planillaNombre });
    setShowAddManually(true);
  };

  const handleSaveRecursosManually = async (recursos: any[]) => {
    if (!selectedPlanillaForManual) return;

    try {
      // 1. Guardar cada recurso en la base de datos (o actualizar si ya existe)
      const recursosGuardados = [];
      
      // Cargar todos los recursos de esta planilla primero
      const todosRecursosResponse = await api.get('/catalogos/recursos');
      const todosRecursos = todosRecursosResponse.data.filter((r: any) => r.id_tipo_recurso === selectedPlanillaForManual.id);
      
      for (const recurso of recursos) {
        // Buscar id_unidad por nombre
        const unidadResponse = await fetch('http://localhost:8000/api/v1/catalogos/unidades');
        const unidades = await unidadResponse.json();
        const unidadEncontrada = unidades.find((u: any) => u.nombre === recurso.unidad);
        
        if (!unidadEncontrada) {
          console.error('Unidad no encontrada:', recurso.unidad);
          continue;
        }

        // Preparar atributos personalizados
        const atributosPersonalizados: any = {};
        Object.keys(recurso).forEach(key => {
          if (!['descripcion', 'unidad', 'cantidad', 'costo_unitario', 'costo_total'].includes(key)) {
            atributosPersonalizados[key] = recurso[key];
          }
        });

        // Verificar si ya existe un recurso con la misma descripción Y los mismos atributos
        const recursoExistente = todosRecursos.find((r: any) => {
          // Primero verificar descripción
          if (r.descripcion !== recurso.descripcion) return false;
          
          // Luego comparar atributos personalizados
          const atributosExistentes = r.atributos || {};
          
          // Comparar si tienen las mismas claves
          const clavesExistentes = Object.keys(atributosExistentes).sort();
          const clavesNuevas = Object.keys(atributosPersonalizados).sort();
          
          if (clavesExistentes.length !== clavesNuevas.length) return false;
          if (JSON.stringify(clavesExistentes) !== JSON.stringify(clavesNuevas)) return false;
          
          // Comparar valores de cada clave
          for (const key of clavesExistentes) {
            if (atributosExistentes[key] !== atributosPersonalizados[key]) return false;
          }
          
          // Si llegamos aquí, son exactamente iguales
          return true;
        });

        if (recursoExistente) {
          // ACTUALIZAR recurso existente
          const recursoData = {
            id_tipo_recurso: selectedPlanillaForManual.id,
            descripcion: recurso.descripcion,
            id_unidad: unidadEncontrada.id_unidad,
            cantidad: parseInt(recurso.cantidad) || 0,
            costo_unitario_predeterminado: parseFloat(recurso.costo_unitario) || 0,
            costo_total: parseFloat(recurso.costo_total) || 0,
            atributos: atributosPersonalizados
          };

          const response = await api.patch(`/catalogos/recursos/${recursoExistente.id_recurso}`, recursoData);
          recursosGuardados.push(response.data);
        } else {
          // CREAR nuevo recurso
          const recursoData = {
            id_tipo_recurso: selectedPlanillaForManual.id,
            descripcion: recurso.descripcion,
            id_unidad: unidadEncontrada.id_unidad,
            cantidad: parseInt(recurso.cantidad) || 0,
            costo_unitario_predeterminado: parseFloat(recurso.costo_unitario) || 0,
            costo_total: parseFloat(recurso.costo_total) || 0,
            atributos: atributosPersonalizados
          };

          const response = await api.post('/catalogos/recursos', recursoData);
          recursosGuardados.push(response.data);
        }
      }

      // 2. Recargar recursos de esta planilla para que aparezcan en la lista
      if (selectedPlanillaForManual.id === selectedPlanilla) {
        const recursosResponse = await api.get('/catalogos/recursos');
        const recursosFiltrados = recursosResponse.data.filter(
          (r: Recurso) => r.id_tipo_recurso === selectedPlanillaForManual.id
        );
        setRecursos(recursosFiltrados);
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

  // Funciones para manejar Excel
  const handleDescargarExcel = (planillaId: number, planillaNombre: string) => {
    setPlanillaForExcel({ id: planillaId, nombre: planillaNombre });
    setShowExcelAttributeModal(true);
  };

  const handleConfirmExcelAttributes = async (atributos: any[]) => {
    if (!planillaForExcel) return;

    try {
      const atributosParaEnviar = atributos.map(a => ({ nombre: a.nombre, tipo: a.tipo }));
      
      const response = await api.post(
        '/catalogos/recursos/generar-plantilla-excel',
        {
          atributos: atributosParaEnviar,
          nombre_planilla: planillaForExcel.nombre
        },
        { responseType: 'blob' }
      );

      // Verificar que sea un archivo válido
      if (response.data.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }

      // Guardar los atributos en localStorage con clave única por planilla
      const storageKey = `excel_atributos_planilla_${planillaForExcel.id}`;
      localStorage.setItem(storageKey, JSON.stringify(atributosParaEnviar));
      
      // También guardar en estado local para uso inmediato
      setLastDownloadedAttributes(atributosParaEnviar);

      // Descargar archivo
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Plantilla_${planillaForExcel.nombre.replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setToastMessage(`Plantilla de ${planillaForExcel.nombre} descargada exitosamente`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
      console.error('Error generando plantilla:', error);
      alert(`Error al generar la plantilla de Excel: ${error.message || error}`);
    } finally {
      setShowExcelAttributeModal(false);
      setPlanillaForExcel(null);
    }
  };

  const handleCargarExcel = (planillaId: number, planillaNombre: string) => {
    setPlanillaForExcel({ id: planillaId, nombre: planillaNombre });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !planillaForExcel) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('id_tipo_recurso', planillaForExcel.id.toString());
      
      // Intentar recuperar los atributos guardados de la última descarga
      const storageKey = `excel_atributos_planilla_${planillaForExcel.id}`;
      let atributosAEnviar = null;
      
      // Primero intentar desde el estado local (descarga reciente)
      if (lastDownloadedAttributes) {
        atributosAEnviar = lastDownloadedAttributes;
      } 
      // Luego intentar desde localStorage
      else {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            atributosAEnviar = JSON.parse(stored);
          } catch (e) {
            console.error('Error parseando atributos guardados:', e);
          }
        }
      }
      
      // Si no hay atributos guardados, usar los base por defecto
      if (!atributosAEnviar) {
        atributosAEnviar = [
          { nombre: 'descripcion', tipo: 'texto' },
          { nombre: 'unidad', tipo: 'texto' },
          { nombre: 'cantidad', tipo: 'entero' },
          { nombre: 'costo_unitario', tipo: 'numerico' },
          { nombre: 'costo_total', tipo: 'numerico' }
        ];
      }
      
      formData.append('atributos', JSON.stringify(atributosAEnviar));

      const response = await api.post('/catalogos/recursos/cargar-desde-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // SIEMPRE recargar todos los recursos de esta planilla (incluso si no está seleccionada)
        const recursosResponse = await api.get('/catalogos/recursos');
        const recursosActualizados = recursosResponse.data.filter(
          (r: Recurso) => r.id_tipo_recurso === planillaForExcel.id
        );
        
        // Actualizar la lista si es la planilla actualmente seleccionada
        if (planillaForExcel.id === selectedPlanilla) {
          setRecursos(recursosActualizados);
        }

        // Si hay un item seleccionado, asignar los recursos cargados automáticamente
        if (selectedItem && response.data.ids_recursos_procesados && response.data.ids_recursos_procesados.length > 0) {
          const nuevosCostos: ItemCosto[] = [];
          const idsRecursosProcesados = response.data.ids_recursos_procesados;
          
          // Filtrar solo los recursos que fueron procesados
          const recursosAProcesar = recursosActualizados.filter(r => 
            idsRecursosProcesados.includes(r.id_recurso)
          );
          
          for (const recurso of recursosAProcesar) {
            // Verificar si ya está asignado
            const yaExiste = itemCostos.some(
              c => c.id_item_obra === selectedItem && c.id_recurso === recurso.id_recurso
            );
            
            if (!yaExiste) {
              const costoTotal = (recurso.cantidad || 1) * recurso.costo_unitario_predeterminado;
              
              nuevosCostos.push({
                id: generateTempId(),
                id_item_obra: selectedItem,
                id_recurso: recurso.id_recurso,
                cantidad: recurso.cantidad || 1,
                precio_unitario_aplicado: recurso.costo_unitario_predeterminado,
                total_linea: costoTotal,
                recurso: {
                  id_recurso: recurso.id_recurso,
                  descripcion: recurso.descripcion,
                  unidad: recurso.unidad,
                  costo_unitario_predeterminado: recurso.costo_unitario_predeterminado
                }
              });
            }
          }
          
          if (nuevosCostos.length > 0) {
            const updatedCostos = [...itemCostos, ...nuevosCostos];
            setItemCostos(updatedCostos);
            setCostos(updatedCostos);
          }
          
          setToastMessage(
            `${response.data.recursos_guardados} recursos creados, ${response.data.recursos_actualizados} actualizados. ${nuevosCostos.length} asignados al item.`
          );
        } else {
          setToastMessage(
            `${response.data.recursos_guardados} recursos creados, ${response.data.recursos_actualizados} actualizados`
          );
        }
        
        // Si hay errores, mostrarlos aunque se hayan guardado algunos
        if (response.data.errores && response.data.errores.length > 0) {
          alert(`⚠️ Carga parcial:\n\n✅ ${response.data.total_procesados} recursos guardados\n❌ ${response.data.errores.length} errores:\n\n${response.data.errores.slice(0, 10).join('\n')}${response.data.errores.length > 10 ? '\n\n... y ' + (response.data.errores.length - 10) + ' errores más' : ''}`);
        }
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(`❌ No se pudo cargar el Excel:\n\n${response.data.errores.join('\n')}`);
      }
    } catch (error: any) {
      console.error('Error cargando Excel:', error);
      
      // Mostrar error más detallado
      let errorMessage = 'Error al cargar el archivo Excel';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setPlanillaForExcel(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  return (
    <div className="space-y-6">
      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} className="bg-slate-700 hover:bg-slate-600 border-slate-600">
          ← Anterior
        </Button>
        <Button 
          onClick={handleContinue}
          className="bg-sky-600 hover:bg-sky-700"
        >
          Continuar →
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Asignar Costos a Items</h3>
            <p className="text-slate-400">Asigna recursos de las planillas a cada item de obra</p>
          </div>
          <div className="text-sm text-slate-400">
            {itemCostos.length} recurso{itemCostos.length !== 1 ? 's' : ''} asignado{itemCostos.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Resumen de Costos */}
        {itemCostos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total General */}
            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-600/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-sm text-green-300 mb-1">Total Cotización</div>
                  <div className="text-3xl font-bold text-green-400">
                    ${wizard.obras.reduce((total, obra) => {
                      const obraItems = wizard.items.filter(item => item.id_obra === obra.id);
                      return total + obraItems.reduce((sum, item) => {
                        return sum + itemCostos
                          .filter(c => c.id_item_obra === item.id)
                          .reduce((s, c) => s + c.total_linea, 0);
                      }, 0);
                    }, 0).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Totales por Obra */}
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-4">
                <div className="text-sm text-slate-300 font-semibold mb-2">Costos por Obra</div>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {wizard.obras.map(obra => {
                    const obraItems = wizard.items.filter(item => item.id_obra === obra.id);
                    const totalCostoObra = obraItems.reduce((sum, item) => {
                      return sum + itemCostos
                        .filter(c => c.id_item_obra === item.id)
                        .reduce((s, c) => s + c.total_linea, 0);
                    }, 0);

                    if (totalCostoObra === 0) return null;

                    return (
                      <div key={obra.id} className="flex justify-between text-sm">
                        <span className="text-slate-400">{obra.nombre}</span>
                        <span className="font-semibold text-green-400">${totalCostoObra.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Totales por Item */}
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-4">
                <div className="text-sm text-slate-300 font-semibold mb-2">Costos por Item</div>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {wizard.obras.map(obra => {
                    const obraItems = wizard.items.filter(item => item.id_obra === obra.id);
                    return obraItems.map(item => {
                      const totalItem = itemCostos
                        .filter(c => c.id_item_obra === item.id)
                        .reduce((sum, c) => sum + c.total_linea, 0);

                      if (totalItem === 0) return null;

                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-400 truncate flex-1">
                            {item.codigo && `${item.codigo} - `}{item.descripcion_tarea}
                          </span>
                          <span className="font-semibold text-green-400 ml-2">${totalItem.toFixed(2)}</span>
                        </div>
                      );
                    });
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
                return (
                  <Button
                    key={tipo.id_tipo_recurso}
                    variant={selectedPlanilla === tipo.id_tipo_recurso ? "default" : "outline"}
                    onClick={() => setSelectedPlanilla(tipo.id_tipo_recurso)}
                    className={`h-20 flex flex-col items-center justify-center ${
                      selectedPlanilla === tipo.id_tipo_recurso
                        ? 'bg-sky-500 border-sky-400'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    }`}
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
            <CardTitle className="flex items-center justify-between">
              <span>Recursos: {tiposRecurso.find(t => t.id_tipo_recurso === selectedPlanilla)?.nombre}</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleOpenAddManually(
                    selectedPlanilla, 
                    tiposRecurso.find(t => t.id_tipo_recurso === selectedPlanilla)?.nombre || ''
                  )}
                  className="bg-sky-600 hover:bg-sky-700 border-sky-500 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Agregar Manualmente
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDescargarExcel(
                    selectedPlanilla,
                    tiposRecurso.find(t => t.id_tipo_recurso === selectedPlanilla)?.nombre || ''
                  )}
                  className="bg-purple-600 hover:bg-purple-700 border-purple-500 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Excel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleCargarExcel(
                    selectedPlanilla,
                    tiposRecurso.find(t => t.id_tipo_recurso === selectedPlanilla)?.nombre || ''
                  )}
                  className="bg-green-600 hover:bg-green-700 border-green-500 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Excel
                </Button>
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
                recursosFiltrados.map((recurso) => (
                  <div 
                    key={recurso.id_recurso}
                    onClick={() => handleAddRecursoToItem(recurso)}
                    className="flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors border border-slate-600"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">{recurso.descripcion}</div>
                      <div className="text-sm text-slate-400">
                        {recurso.unidad} - ${recurso.costo_unitario_predeterminado.toFixed(2)}
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-sky-400" />
                  </div>
                ))
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
                                  onChange={(e) => handleCantidadChange(costo.id, parseInt(e.target.value) || 1)}
                                  min="0"
                                  step="1"
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

      {/* Modal para agregar nueva planilla */}
      <Dialog open={showAddPlanillaModal} onOpenChange={setShowAddPlanillaModal}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Planilla</DialogTitle>
            <DialogDescription className="text-slate-400">
              Completa los datos para agregar una nueva planilla de recursos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddPlanilla(); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-planilla-nombre">Nombre de la Planilla *</Label>
                <Input
                  id="new-planilla-nombre"
                  value={newPlanilla.nombre}
                  onChange={(e) => setNewPlanilla({ ...newPlanilla, nombre: e.target.value })}
                  placeholder="Ej: Equipos de Transporte"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Seleccionar Icono</Label>
                <div className="grid grid-cols-3 gap-2">
                  {iconosDisponibles.map(({ name, icon: Icon }) => (
                    <Button
                      key={name}
                      type="button"
                      variant="outline"
                      onClick={() => setNewPlanilla({ ...newPlanilla, icono: name })}
                      className={`h-16 flex flex-col items-center justify-center ${
                        newPlanilla.icono === name
                          ? 'bg-sky-600 border-sky-500'
                          : 'bg-slate-700 border-slate-600'
                      }`}
                    >
                      <Icon className="h-6 w-6 mb-1" />
                      <span className="text-xs">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowAddPlanillaModal(false)} 
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!newPlanilla.nombre.trim()}
                className="bg-sky-600 hover:bg-sky-700"
              >
                Agregar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de validación */}
      <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Items sin recursos
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Todos los items deben tener al menos un recurso asignado antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowValidationAlert(false)}
              className="bg-sky-600 hover:bg-sky-700"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast/Notificación temporal */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <Check className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Input oculto para cargar archivos Excel */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Modal para seleccionar atributos del Excel */}
      <ExcelAttributeModal
        open={showExcelAttributeModal}
        onClose={() => {
          setShowExcelAttributeModal(false);
          setPlanillaForExcel(null);
        }}
        onConfirm={handleConfirmExcelAttributes}
      />
    </div>
  );
};

export default CostosStep;
