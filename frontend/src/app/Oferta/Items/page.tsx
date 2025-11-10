import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

import useItemObraBaseStore from '@/store/itemObra/itemObraStore';
import useObraBaseStore from '@/store/obra/obraStore';
import useEquipoBaseStore from '@/store/equipo/equipoStore';
import usePersonalBaseStore from '@/store/personal/personalStore';
import useCostoStore, { ITEMS_COSTOS_STORAGE_KEY } from '@/store/costo/costoStore';

import { getEquipos } from '@/actions/equipos';
import { getPersonal } from '@/actions/personal';

import { generateCostStructures } from '@/utils/costos';

import { useToastHelpers } from '@/components/notifications/ToastProvider';
import HeaderOferta from '@/components/headers/HeaderOferta';
import { Button } from '@/components/ui/button';
import AddItemModal from '@/components/modals/AddItemModal';
import ItemCard from '@/components/items/ItemCard';

const ItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastHelpers();

  const { obra } = useObraBaseStore();
  const { itemCreate,  setItemCreate, itemsObra, setItemSelected, setItemsObra, accumulatePersonalAndEquiposFromRecursos,} = useItemObraBaseStore();
  const { equipos, setEquipos } = useEquipoBaseStore();
  const { personales, setPersonales } = usePersonalBaseStore();
  const { setCostData, markReady } = useCostoStore();

  const [isProcessing, setIsProcessing] = useState(false);

  const currentObraId = obra?.id_obra ?? -1;

  const itemsDeObra = useMemo(() => {
    return (itemsObra || []).filter((i) => i.id_obra === currentObraId);
  }, [itemsObra, currentObraId]);

  const canFinalize = useMemo(() => {
    if (!itemsDeObra.length) return false;
    let result= true
    itemsDeObra.every((item) => {
      const meses = item.meses_operario ?? 0;
      if (meses <= 0) {
        result = false;
      }
    });
    return result
  }, [itemsDeObra]);

  // Modal de creación
  const closeModal = () => setItemCreate(false);
  const afterCreated = () => {};

  const handleFinalize = useCallback(async () => {
    if (!canFinalize || isProcessing) return;
    setIsProcessing(true);

    try {
      itemsDeObra.forEach((item) => accumulatePersonalAndEquiposFromRecursos(item.id_item_Obra));

      // Obtener la versión más reciente de los items con personal y equipos acumulados
      const allItems = useItemObraBaseStore.getState().itemsObra;
      const itemsActuales = allItems.filter((item) => item.id_obra === currentObraId);

      let equiposData = equipos;
      if (!equiposData.length) {
        equiposData = await getEquipos();
        setEquipos(equiposData);
      }

      let personalData = personales;
      if (!personalData.length) {
        personalData = await getPersonal();
        setPersonales(personalData);
      }

      const { tiposCosto, costos, itemsActualizados } = generateCostStructures({
        items: itemsActuales,
        equipos: equiposData,
        personal: personalData,
      });

      setCostData(tiposCosto, costos);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ITEMS_COSTOS_STORAGE_KEY, JSON.stringify(itemsActualizados));
      }

      const itemsGlobalesActualizados = allItems.map((item) => {
        const actualizado = itemsActualizados.find((i) => i.id_item_Obra === item.id_item_Obra);
        return actualizado ? { ...item, ...actualizado } : item;
      });

      setItemsObra(itemsGlobalesActualizados);
      markReady(true);

      showSuccess('Costos preparados', 'Los costos fueron generados a partir de los recursos seleccionados.');

      navigate('/oferta/costos');
    } catch (error) {
      console.error('Error generando costos', error);
      showError('No se pudieron generar los costos', 'Revisa los recursos asignados e inténtalo nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  }, [
    canFinalize,
    isProcessing,
    itemsDeObra,
    accumulatePersonalAndEquiposFromRecursos,
    currentObraId,
    equipos,
    setEquipos,
    personales,
    setPersonales,
    setCostData,
    setItemsObra,
    markReady,
    showSuccess,
    showError,
    navigate,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <AddItemModal open={itemCreate} onClose={closeModal} onCreated={afterCreated} />
      <HeaderOferta
        title="Items de Obra"
        subtitle="Gestiona los items de la obra"
        icon={ClipboardList}
        rightContent={(
          <div className="flex gap-3">
            <Button
              onClick={handleFinalize}
              disabled={!canFinalize || isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Generando...' : 'Finalizar y calcular costos'}
            </Button>
            <Button onClick={() => setItemCreate(true)} className="bg-sky-600 hover:bg-sky-700 text-white">
              Nuevo Item
            </Button>
          </div>
        )}
      />

      <div className="px-6 py-4 space-y-6">
        {itemsDeObra.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No hay items. Crea el primero.</p>
          </div>
        ) : (
          itemsDeObra.map((item) => (
            <ItemCard
              key={item.id_item_Obra}
              item={item}
              onSelectItem={setItemSelected}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ItemsPage;
