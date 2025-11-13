// page.tsx - Componente Principal Refactorizado
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Boxes, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { HeaderHome } from '@/components';
import { Button } from '@/components/ui/button';
import { HeaderSelectionBar } from '@/components/forms/HeaderSelectionBar';
import { DraftTableView } from '@/components/tables/DraftTableView';
import { AyudaMesage } from '@/components/notifications/AyudaMesage';
import { cn } from '@/lib/utils';

// Hooks personalizados
import { useHeadersState } from '@/hooks/useHeadersState';
import { useSelectionState } from '@/hooks/useSelectionState';
import { useHeaderOperations } from '@/hooks/useHeaderOperations';
import { useHeaderRemoval } from '@/hooks/useHeaderRemoval';
import { useCalculationHandlers } from '@/hooks/useCalculationHandlers';
import { useFormSubmission } from '@/hooks/useFormSubmission';

// Estado inicial
import { createInitialHeaders } from '@/store/material/initialState';

const MotionButton = motion(Button);

const TipoMaterialPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado local
  const [titulo, setTitulo] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [ayudaOpen, setAyudaOpen] = useState(false);

  // Hook de gestión de headers
  const {
    headers,
    setHeadersWithNormalize,
    setRemovedCustomHeaders,
    showHeaderSelectionBar,
    availableBaseHeaders,
    customHeaderOptions,
  } = useHeadersState(createInitialHeaders());

  // Hook de gestión de selección
  const {
    selectionMode,
    setSelectionMode,
    flashingColumns,
    setFlashingColumns,
    eligibleColumnIds,
    selectionBackupRef,
    createSelectionState,
    triggerFlash,
  } = useSelectionState(headers);

  // Hook de operaciones con headers
  const {
    handleAddBaseHeader,
    handleAddNewHeader,
    handleRestoreCustomHeader,
    handleDiscardCustomHeader,
    handleQuantityResponse,
    handleReorderEditableHeaders,
  } = useHeaderOperations(setHeadersWithNormalize, setRemovedCustomHeaders);

  // Hook de eliminación de headers
  const { handleHeaderRemove } = useHeaderRemoval(
    setHeadersWithNormalize,
    setRemovedCustomHeaders,
    selectionMode,
    setSelectionMode,
    selectionBackupRef
  );

  // Hook de gestión de cálculos
  const {
    handleAddCalculo,
    handleValueClick,
    handleValueContextMenu,
    handleValueDoubleClick,
    handleColumnSelect,
  } = useCalculationHandlers(
    headers,
    setHeadersWithNormalize,
    selectionMode,
    setSelectionMode,
    selectionBackupRef,
    setFormError,
    setFlashingColumns,
    createSelectionState,
    triggerFlash,
    eligibleColumnIds
  );

  // Hook de envío del formulario
  const { handleSubmit, loading } = useFormSubmission(headers, titulo, setFormError);

  const handleBack = useCallback(() => {
    navigate('/materiales');
  }, [navigate]);

  return (
    <div className="space-y-6 pb-8">
      <HeaderHome
        title="Nueva Tabla de Materiales"
        description="Diseña tu tabla personalizada agregando los campos que necesites. Puedes crear cálculos automáticos entre columnas usando multiplicaciones y divisiones."
        icon={Boxes}
        iconClassName="bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
        aside={
          <div className='flex'>
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="border-slate-600 text-slate-200 bg-slate-900 mr-2 hover:bg-slate-800/60"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button
              className="border-slate-600 text-slate-200 bg-slate-900 hover:bg-slate-800/60" 
              variant="outline" 
              onClick={() => setAyudaOpen(true)}>
              Ayuda
            </Button>
          </div>
        } 
      />

      <div className="text-slate-100">
        <div className="space-y-6" data-help-anchor="review-area">
          <AyudaMesage open={ayudaOpen} onOpenChange={setAyudaOpen} />
          
          <div
            className={cn(
              'relative flex items-start justify-between mx-1 gap-4',
              'overflow-hidden'
            )}
          >
            <AnimatePresence mode="sync">
              {showHeaderSelectionBar && (
                <motion.div
                  key="header-selection"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                  className="flex-1"
                >
                  <HeaderSelectionBar
                    baseOptions={availableBaseHeaders.map((item) => ({
                      id: item.id,
                      label: item.label,
                    }))}
                    customOptions={customHeaderOptions}
                    onSelectBase={handleAddBaseHeader}
                    onRestoreCustom={handleRestoreCustomHeader}
                    onDiscardCustom={handleDiscardCustomHeader}
                    loading={loading}
                  />
                </motion.div>
              )}

              <motion.div
                key="add-header-button"
                layout
                initial={false}
                animate={{
                  x: showHeaderSelectionBar ? 0.2 : 0,
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                className="flex-shrink-0"
              >
                <MotionButton
                  type="button"
                  onClick={handleAddNewHeader}
                  data-help-anchor="add-custom-header"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo header personalizado
                </MotionButton>
              </motion.div>
            </AnimatePresence>
          </div>

          <DraftTableView
            titulo={titulo}
            headers={headers}
            isSelectionMode={!!selectionMode}
            highlightedColumns={eligibleColumnIds}
            flashingColumns={flashingColumns}
            onTituloChange={setTitulo}
            onHeaderTitleChange={(headerId, value) =>
              setHeadersWithNormalize((prev) =>
                prev.map((header) => (header.id === headerId ? { ...header, title: value } : header)),
              )
            }
            onHeaderRemove={handleHeaderRemove}
            onQuantityResponse={handleQuantityResponse}
            onAddCalculo={handleAddCalculo}
            onValueClick={handleValueClick}
            onValueDoubleClick={handleValueDoubleClick}
            onValueContextMenu={handleValueContextMenu}
            onColumnSelect={handleColumnSelect}
            loading={loading}
            onReorderHeaders={handleReorderEditableHeaders}
          />

          {formError && (
            <div className="rounded-md border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              type="button"
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              disabled={loading || !titulo.trim()}
              onClick={handleSubmit}
              data-help-anchor="save-button"
            >
              {loading ? 'Creando tabla...' : 'Guardar nueva tabla'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipoMaterialPage;