import React, { useMemo, useState } from 'react';
import useItemObraBaseStore from '@/store/itemObra/itemObraStore';
import useObraBaseStore from '@/store/obra/obraStore';
import useRecursoBaseStore, { Recurso, PersonalRecurso, EquipoRecurso } from '@/store/recurso/recursoStore';
import { Personal } from '@/store/personal/personalStore';
import { Equipo } from '@/store/equipo/equipoStore';
import { useLoad } from '@/hooks/useLoad';
import HeaderRecursos from '@/components/headers/HeaderRecursos';
import Breadcrumbs from '@/components/tables/Breadcrumbs';
import InfoSelecciones from '@/components/tables/InfoSelecciones';
import VistaTipos from './Views/VistaTipos';
import VistaRecursos from './Views/VistaRecursos';
import VistaMesesOperarios from './Views/VistaMesesOperarios';

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

type ViewType = 'tipos' | 'recursos' | 'meses_operarios';
type TipoMesesOperarios = 'personal' | 'equipos';

const RecursosPage: React.FC = () => {
  // Stores
  const { itemsObra, getItemSelected, setItemSelected, updateMesesOperarioAndCapataz, accumulatePersonalAndEquiposFromRecursos } = useItemObraBaseStore();
  const { obra } = useObraBaseStore();
  const {
    addTipoRecursoToItemObra,
    getRecursosByTipoRecurso,
    addRecursoToTipoRecurso,
    updateRecursoInTipoRecurso,
    setTipoRecursoSelected,
    getTipoRecursoSelected,
    setRecursoSelected,
    getRecursoSelected,
  } = useRecursoBaseStore();

  // Acceder directamente al estado del store para reactividad
  const tiposRecursoByItemObra = useRecursoBaseStore((state) => state.tiposRecursoByItemObra);
  const recursosByTipoRecurso = useRecursoBaseStore((state) => state.recursosByTipoRecurso);

  // Estados de datos de BD
  const [tiposRecursoDB, setTiposRecursoDB] = useState<TipoRecurso[]>([]);
  const [recursosDB, setRecursosDB] = useState<RecursoFromDB[]>([]);
  const [personalDB, setPersonalDB] = useState<Personal[]>([]);
  const [equiposDB, setEquiposDB] = useState<Equipo[]>([]);

  // Estados de UI
  const [view, setView] = useState<ViewType>('tipos');
  const [tipoMesesOperarios, setTipoMesesOperarios] = useState<TipoMesesOperarios>('personal');
  const [itemInput, setItemInput] = useState('');

  // Estados de seleccion temporal para meses_operarios
  const [personalSeleccionado, setPersonalSeleccionado] = useState<PersonalRecurso[]>([]);
  const [equiposSeleccionado, setEquiposSeleccionado] = useState<EquipoRecurso[]>([]);

  const itemsDeObra = useMemo(() => {
    const currentId = obra?.id_obra ?? -1;
    return (itemsObra || []).filter(i => i.id_obra === currentId);
  }, [itemsObra, obra?.id_obra]);

  const itemSelected = getItemSelected();
  const tipoRecursoSelected = getTipoRecursoSelected();
  const recursoSelectedStore = getRecursoSelected();

  // Usar el hook useLoad para centralizar la carga de datos
  const { loadingTipos, loadingRecursos } = useLoad({
    tipoRecursoSelected: tipoRecursoSelected || undefined,
    setTiposRecursoDB,
    setPersonalDB,
    setEquiposDB,
    setRecursosDB,
  });
  
  // Convertir recurso del store a RecursoFromDB para VistaRecursos
  const recursoSelected: RecursoFromDB | null = recursoSelectedStore 
    ? {
        id_recurso: recursoSelectedStore.id_recurso,
        id_tipo_recurso: recursoSelectedStore.id_tipo_recurso,
        descripcion: recursoSelectedStore.descripcion,
        unidad: recursoSelectedStore.unidad,
        cantidad: recursoSelectedStore.cantidad,
        meses_operario: recursoSelectedStore.meses_operario || 0,
      }
    : null;


  const getRecursosStoreForView = (): Recurso[] => {
    if (!tipoRecursoSelected) return [];
    return getRecursosByTipoRecurso(tipoRecursoSelected.id_tipo_recurso);
  };

  // Verificar que tipos tienen recursos completos
  const tiposCompletos = useMemo(() => {
    const completos = new Set<number>();
    if (!itemSelected) return completos;

    // Obtener todos los tipos asociados al item desde el store
    const tiposDelItem = tiposRecursoByItemObra[itemSelected.id_item_Obra] || [];
    
    tiposDelItem.forEach((tipoItem) => {
      // Verificar si este tipo tiene recursos completos desde el store
      const recursos = recursosByTipoRecurso[tipoItem.id_tipo_recurso] || [];
      if (recursos.length > 0) {
        // Un tipo estÃ¡ completo si tiene al menos un recurso con meses operarios
        const tieneRecursoCompleto = recursos.some(r => {
          return !!(r.personal && r.personal.length > 0);
        });
        if (tieneRecursoCompleto) {
          completos.add(tipoItem.id_tipo_recurso);
        }
      }
    });
    return completos;
  }, [itemSelected, tiposRecursoByItemObra, recursosByTipoRecurso]);

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setView('tipos');
      setTipoRecursoSelected(null);
      setRecursoSelected(null);
    } else if (index === 1 && tipoRecursoSelected) {
      setView('recursos');
      setRecursoSelected(null);
    } else if (index === 2 && view === 'meses_operarios') {
      setView('recursos');
    }
  };

  // Handlers
  const handleTipoRecursoSelect = (tipo: TipoRecurso) => {
    addTipoRecursoToItemObra(itemSelected!.id_item_Obra, tipo);
    setTipoRecursoSelected(tipo);
    setView('recursos');
    setRecursoSelected(null);
  };

  const handleRecursoSelect = (recurso: RecursoFromDB) => {
    const recursoStore = getRecursosStoreForView().find(r => r.id_recurso === recurso.id_recurso);
    if (!recursoStore) {
      // Agregar recurso al store si no existe
      const nuevoRecurso: Recurso = {
        id_recurso: recurso.id_recurso,
        id_tipo_recurso: recurso.id_tipo_recurso,
        descripcion: recurso.descripcion,
        unidad: recurso.unidad,
        cantidad: recurso.cantidad,
        meses_operario: 0,
      };
      addRecursoToTipoRecurso(tipoRecursoSelected!.id_tipo_recurso, nuevoRecurso);
    }
    // Convertir RecursoFromDB a Recurso para el store
    const recursoParaStore: Recurso = {
      id_recurso: recurso.id_recurso,
      id_tipo_recurso: recurso.id_tipo_recurso,
      descripcion: recurso.descripcion,
      unidad: recurso.unidad,
      cantidad: recurso.cantidad,
      meses_operario: recurso.meses_operario,
    };
    setRecursoSelected(recursoParaStore);
  };

  const handleCantidadChange = (idRecurso: number, cantidad: number) => {
    const recurso = getRecursosStoreForView().find(r => r.id_recurso === idRecurso);
    if (recurso && tipoRecursoSelected) {
      const updated: Recurso = { ...recurso, cantidad };
      updateRecursoInTipoRecurso(tipoRecursoSelected.id_tipo_recurso, updated);
    }
  };

  const handleAddMesesOperarios = (recurso: RecursoFromDB) => {
    // Convertir RecursoFromDB a Recurso para el store
    const recursoParaStore: Recurso = {
      id_recurso: recurso.id_recurso,
      id_tipo_recurso: recurso.id_tipo_recurso,
      descripcion: recurso.descripcion,
      unidad: recurso.unidad,
      cantidad: recurso.cantidad,
      meses_operario: recurso.meses_operario,
    };
    setRecursoSelected(recursoParaStore);
    // Cargar personal y equipos existentes del store si los hay
    const recursoStore = getRecursosStoreForView().find(r => r.id_recurso === recurso.id_recurso);
    if (recursoStore) {
      setPersonalSeleccionado(recursoStore.personal || []);
      setEquiposSeleccionado(recursoStore.equipos || []);
    } else {
      setPersonalSeleccionado([]);
      setEquiposSeleccionado([]);
    }
    // Siempre mostrar primero la tabla de mano de obra (personal)
    setTipoMesesOperarios('personal');
    setView('meses_operarios');
  };

  const handlePersonalSelect = (personal: Personal) => {
    const nuevo: PersonalRecurso = {
      id_personal: personal.id_personal,
      funcion: personal.funcion,
      meses_operario: 0,
    };
    // Verificar si ya existe
    if (!personalSeleccionado.some(p => p.id_personal === personal.id_personal)) {
      setPersonalSeleccionado([...personalSeleccionado, nuevo]);
    }
  };

  const handleEquipoSelect = (equipo: Equipo) => {
    const nuevo: EquipoRecurso = {
      id_equipo: equipo.id_equipo,
      detalle: equipo.detalle,
      meses_operario: 0,
    };
    // Verificar si ya existe
    if (!equiposSeleccionado.some(e => e.id_equipo === equipo.id_equipo)) {
      setEquiposSeleccionado([...equiposSeleccionado, nuevo]);
    }
  };

  const handleRemovePersonal = (idPersonal: number) => {
    setPersonalSeleccionado(personalSeleccionado.filter(p => p.id_personal !== idPersonal));
  };

  const handleRemoveEquipo = (idEquipo: number) => {
    setEquiposSeleccionado(equiposSeleccionado.filter(e => e.id_equipo !== idEquipo));
  };

  const handleMesesOperarioChange = (id: number, meses: number) => {
    if (tipoMesesOperarios === 'personal') {
      setPersonalSeleccionado(
        personalSeleccionado.map(p =>
          p.id_personal === id ? { ...p, meses_operario: meses } : p
        )
      );
    } else {
      setEquiposSeleccionado(
        equiposSeleccionado.map(e =>
          e.id_equipo === id ? { ...e, meses_operario: meses } : e
        )
      );
    }
  };

  const handleSaveMesesOperarios = () => {
    if (!recursoSelected || !tipoRecursoSelected || !itemSelected) return;

    // Obtener el recurso del store
    const recursos = getRecursosByTipoRecurso(tipoRecursoSelected.id_tipo_recurso);
    const recursoStore = recursos.find(r => r.id_recurso === recursoSelected.id_recurso);
    
    if (recursoStore) {
      // Actualizar el recurso con los nuevos arrays de personal y equipos
      const updated: Recurso = {
        ...recursoStore,
        personal: personalSeleccionado,
        equipos: equiposSeleccionado,
      };
      updateRecursoInTipoRecurso(tipoRecursoSelected.id_tipo_recurso, updated);
    } else {
      // Si no existe, crearlo con los datos
      const nuevo: Recurso = {
        id_recurso: recursoSelected.id_recurso,
        id_tipo_recurso: recursoSelected.id_tipo_recurso,
        descripcion: recursoSelected.descripcion,
        unidad: recursoSelected.unidad,
        cantidad: recursoSelected.cantidad,
        meses_operario: 0,
        personal: personalSeleccionado,
        equipos: equiposSeleccionado,
      };
      addRecursoToTipoRecurso(tipoRecursoSelected.id_tipo_recurso, nuevo);
    }

    // Acumular personal y equipos desde todos los recursos del item
    accumulatePersonalAndEquiposFromRecursos(itemSelected.id_item_Obra);
    
    // Actualizar meses_operario y capataz del item basado en todos los recursos
    updateMesesOperarioAndCapataz(itemSelected.id_item_Obra);

    // Volver a vista de recursos
    setView('recursos');
    setPersonalSeleccionado([]);
    setEquiposSeleccionado([]);
  };

  const canSaveMesesOperarios = personalSeleccionado.length > 0 && equiposSeleccionado.length > 0;

  // Personal y equipos disponibles (todos, no filtrados)
  const personalDisponible = useMemo(() => {
    return personalDB;
  }, [personalDB]);

  const equiposDisponibles = useMemo(() => {
    return equiposDB;
  }, [equiposDB]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <HeaderRecursos
        itemsDeObra={itemsDeObra}
        itemSelected={itemSelected}
        itemInput={itemInput}
        onItemInputChange={setItemInput}
        onItemSelect={setItemSelected}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        view={view}
        tipoRecursoSelected={tipoRecursoSelected}
        onNavigate={handleBreadcrumbClick}
      />

      {/* Info de selecciones actuales */}
      <InfoSelecciones
        itemSelected={itemSelected}
        tipoRecursoSelected={tipoRecursoSelected}
        recursoSelected={recursoSelected}
      />

      {/* Contenido según la vista */}
      {!itemSelected ? (
        <div className="text-slate-400 text-center py-8 px-6">
          Por favor, selecciona un item de obra
        </div>
      ) : (
        <>
          {view === 'tipos' && (
            <VistaTipos
              tiposRecursoDB={tiposRecursoDB}
              tiposCompletos={tiposCompletos}
              tipoRecursoSelected={tipoRecursoSelected}
              loading={loadingTipos}
              onTipoSelect={handleTipoRecursoSelect}
              onDeselect={() => setTipoRecursoSelected(null)}
            />
          )}

          {view === 'recursos' && (
            <VistaRecursos
              recursosDB={recursosDB}
              recursosStore={getRecursosStoreForView()}
              recursoSelected={recursoSelected}
              loading={loadingRecursos}
              onRecursoSelect={handleRecursoSelect}
              onCantidadChange={handleCantidadChange}
              onAddMesesOperarios={handleAddMesesOperarios}
              onDeselect={() => setRecursoSelected(null)}
            />
          )}

          {view === 'meses_operarios' && (
            <VistaMesesOperarios
              tipoMesesOperarios={tipoMesesOperarios}
              personalSeleccionado={personalSeleccionado}
              equiposSeleccionado={equiposSeleccionado}
              personalDisponible={personalDisponible}
              equiposDisponibles={equiposDisponibles}
              onTipoChange={setTipoMesesOperarios}
              onPersonalSelect={handlePersonalSelect}
              onEquipoSelect={handleEquipoSelect}
              onRemovePersonal={handleRemovePersonal}
              onRemoveEquipo={handleRemoveEquipo}
              onMesesOperarioChange={handleMesesOperarioChange}
              onSave={handleSaveMesesOperarios}
              canSave={canSaveMesesOperarios}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RecursosPage;