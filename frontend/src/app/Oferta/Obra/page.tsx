import React from 'react';
import { FileText, Pencil } from 'lucide-react';

import ObraForm from '@/components/forms/ObraForm';
import useObraBaseStore from '@/store/obra/obraStore';
import ResumenObra from './ResumenObra/page';
import HeaderOferta from '@/components/headers/HeaderOferta';
import { Button } from '@/components/ui/button';

const Obra: React.FC = () => {
  const { obra, editObra, setEditObra } = useObraBaseStore();

  const isEditing = !obra || editObra;
  const title = isEditing
    ? obra
      ? 'Editar obra'
      : 'Nueva obra'
    : obra?.nombre_proyecto || 'Obra sin nombre';
  const subtitle = isEditing
    ? 'Completa la información general para preparar la oferta.'
    : obra?.descripcion_proyecto || 'Revisa y gestiona los datos principales de la obra.';

  const rightContent = !isEditing ? (
    <Button
      variant="outline"
      onClick={() => setEditObra(true)}
      className="border-slate-600 text-slate-300 hover:bg-slate-700"
    >
      <Pencil className="h-4 w-4 mr-2" />
      Editar obra
    </Button>
  ) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <HeaderOferta
        title={title}
        subtitle={subtitle}
        icon={FileText}
        rightContent={rightContent}
      />

      <div className="px-6 pb-8">
        {isEditing ? <ObraForm /> : <ResumenObra />}
      </div>
    </div>
  );
};

export default Obra;
