import React from "react";
import SmartSelect from '@/components/ui/SmartSelect';

interface HeaderRecursosProps {
  itemsDeObra: any[];
  itemSelected: any;
  itemInput: string;
  onItemInputChange: (value: string) => void;
  onItemSelect: (item: any) => void;
}

const HeaderRecursos: React.FC<HeaderRecursosProps> = ({
  itemsDeObra,
  itemSelected,
  itemInput,
  onItemInputChange,
  onItemSelect,
}) => {
  return (
    <div className="relative flex items-center justify-between px-6 py-5 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-900/40">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M20 7h-4m-4 0H4m16 5h-4m-4 0H4m16 5h-4m-4 0H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Gestión de Recursos
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestiona los recursos de los items de obra
          </p>
        </div>
      </div>

      {/* Selector de Item de Obra */}
      <div className="w-full max-w-md">
        <SmartSelect
          label="Item de Obra"
          placeholder="Escribe para buscar el item..."
          items={itemsDeObra.map((it) => ({ id: it.id_item_Obra, nombre: it.descripcion }))}
          value={itemInput || (itemSelected?.descripcion ?? '')}
          onChange={onItemInputChange}
          onSelect={(sel) => {
            const found = itemsDeObra.find(i => i.id_item_Obra === sel.id);
            if (found) onItemSelect(found);
          }}
          required
        />
      </div>
    </div>
  );
};

export default HeaderRecursos;