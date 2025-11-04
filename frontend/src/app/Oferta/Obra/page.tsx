import React from 'react';
import ObraForm from '@/components/forms/ObraForm';
import useObraBaseStore from '@/store/obra/obraStore';
import ResumenObra from './ResumenObra/page';

const Obra: React.FC = () => {
  const { obra, editObra } = useObraBaseStore();
  return (
    <>
      {!obra || editObra ? (
        <ObraForm />
      ) : (
        <ResumenObra />
      )}
    </>
  );
};

export default Obra;
