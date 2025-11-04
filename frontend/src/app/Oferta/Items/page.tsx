import React, { useMemo } from 'react';
import useItemObraBaseStore from '@/store/itemObra/itemObraStore';
import useObraBaseStore from '@/store/obra/obraStore';
import { Button } from '@/components/ui/button';
import AddItemModal from '@/components/modals/AddItemModal';
import ItemCard from '@/components/items/ItemCard';

const ItemsPage: React.FC = () => {
  const { obra } = useObraBaseStore();
  const { itemCreate, setItemCreate, itemsObra, setItemSelected } = useItemObraBaseStore();

  const itemsDeObra = useMemo(() => {
    const currentId = obra?.id_obra ?? -1;
    return (itemsObra || []).filter(i => i.id_obra === currentId);
  }, [itemsObra, obra?.id_obra]);

  // Modal de creación
  const closeModal = () => setItemCreate(false);
  const afterCreated = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <AddItemModal open={itemCreate} onClose={closeModal} onCreated={afterCreated} />
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Items de Obra</h1>
          <p className="mt-1 text-sm text-slate-400">Gestiona los items de la obra</p>
        </div>
        <Button onClick={() => setItemCreate(true)} className="bg-sky-600 hover:bg-sky-700 text-white">
          Nuevo Item
        </Button>
      </div>

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
