import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { DraftTableHeader } from './DraftTableHeader';
import { useDraggableHeaders } from '@/hooks/useDraggableHeaders';
import { DraggableTableHead } from '../animations/DraggableTableHeadProps';
import { AnimatedTableCell } from '../animations/AnimatedTableCell';
import { AnimatedTableRow } from '../animations/AnimatedTableRow';
import { OPERATOR_SYMBOL_MAP } from '@/utils/materiales';
import { OperatorType } from '@/store/material/types';

interface HeaderData {
  id: string;
  title: string;
  isEditable: boolean;
  isBaseHeader: boolean;
  isCantidad: boolean;
  isQuantityDefined: boolean;
  showQuantityQuestion: boolean;
  baseHeaderId?: number;
  calculoOperations: Array<{
    operator: OperatorType;
    values: Array<{
      id: string;
      headerRef: string | null;
      headerTitle: string;
      tipo: 'base' | 'atribute';
    }>;
  }>;
  order: number;
}

interface DraftTableViewProps {
  titulo: string;
  headers: HeaderData[];
  isSelectionMode: boolean;
  highlightedColumns: Set<string>;
  flashingColumns: Set<string>;
  onTituloChange: (value: string) => void;
  onHeaderTitleChange: (headerId: string, value: string) => void;
  onHeaderRemove: (headerId: string) => void;
  onQuantityResponse: (headerId: string, value: boolean) => void;
  onAddCalculo: (headerId: string, operator: OperatorType) => void;
  onValueClick: (headerId: string, operationIndex: number, valueIndex: number) => void;
  onValueDoubleClick: (headerId: string, operationIndex: number, valueIndex: number) => void;
  onValueContextMenu: (headerId: string, operationIndex: number, valueIndex: number) => void;
  onColumnSelect: (headerId: string) => void;
  loading: boolean;
  onReorderHeaders: (order: string[]) => void;
}

export const DraftTableView: React.FC<DraftTableViewProps> = ({
  titulo,
  headers,
  isSelectionMode,
  highlightedColumns,
  flashingColumns,
  onTituloChange,
  onHeaderTitleChange,
  onHeaderRemove,
  onQuantityResponse,
  onAddCalculo,
  onValueClick,
  onValueDoubleClick,
  onValueContextMenu,
  onColumnSelect,
  loading,
  onReorderHeaders,
}) => {
  const sortedHeaders = useMemo(
    () => [...headers].sort((a, b) => a.order - b.order),
    [headers]
  );

  const canUseCalculations = (header: HeaderData) => {
    if (header.isBaseHeader) {
      if (header.baseHeaderId === 5) {
        return true;
      }
      if (header.baseHeaderId === 2) {
        return header.isQuantityDefined && header.isCantidad;
      }
      return false;
    }

    if (header.calculoOperations.length > 0) {
      return true;
    }

    return header.isQuantityDefined && header.isCantidad;
  };

  // Solo headers editables que NO sean Detalle, $Unitario, $Total
  const editableHeaderIds = useMemo(
    () =>
      sortedHeaders
        .filter(
          (header) =>
            header.isEditable &&
            header.baseHeaderId !== 1 &&
            header.baseHeaderId !== 4 &&
            header.baseHeaderId !== 5
        )
        .map((header) => header.id),
    [sortedHeaders]
  );

  const {
    draggedId,
    dropIndex,
    registerPosition,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  } = useDraggableHeaders({
    editableHeaderIds,
    onReorder: onReorderHeaders,
  });

  const isDraggable = (header: HeaderData) =>
    editableHeaderIds.includes(header.id);

  const isDragging = (headerId: string) => draggedId === headerId;

  const isInDropZone = (headerId: string) => {
    if (!draggedId || dropIndex === null) return false;
    const editableIndex = editableHeaderIds.indexOf(headerId);
    const draggedIndex = editableHeaderIds.indexOf(draggedId);

    if (editableIndex === -1 || draggedIndex === -1) return false;

    if (dropIndex > draggedIndex) {
      return editableIndex > draggedIndex && editableIndex <= dropIndex;
    }

    if (dropIndex < draggedIndex) {
      return editableIndex >= dropIndex && editableIndex < draggedIndex;
    }

    return false;
  };

  const getDropIndicators = (headerId: string) => {
    if (!draggedId || dropIndex === null) {
      return { showLeft: false, showRight: false };
    }

    const editableIndex = editableHeaderIds.indexOf(headerId);
    if (editableIndex === -1) {
      return { showLeft: false, showRight: false };
    }

    const showLeft = dropIndex === editableIndex;
    const showRight =
      dropIndex === editableHeaderIds.length
        ? editableIndex === editableHeaderIds.length - 1
        : dropIndex === editableIndex + 1;

    return { showLeft, showRight };
  };

  const renderExpression = (header: HeaderData) => {
    const parts: React.ReactNode[] = [];
    header.calculoOperations.forEach((operation, opIdx) => {
      operation.values.forEach((value, valIdx) => {
        if (parts.length > 0) {
          parts.push(
            <span key={`op-${opIdx}-${valIdx}`} className="mx-1 text-emerald-300">
              {OPERATOR_SYMBOL_MAP[operation.operator]}
            </span>
          );
        }
        parts.push(
          <span key={value.id} className="text-emerald-200">
            {value.headerTitle || '___'}
          </span>
        );
      });
    });
    return parts.length > 0 ? parts : '---';
  };

  const renderTableCellContent = (
    header: HeaderData,
    rowType: 'operations' | 'calculations' | 'empty',
  ) => {
    if (rowType === 'operations') {
      if (!canUseCalculations(header)) {
        return <span className="text-xs text-slate-500">---</span>;
      }

      const disabled =
        loading ||
        (!header.isBaseHeader &&
          !header.isQuantityDefined &&
          header.calculoOperations.length === 0);

      const operatorButtons: Array<{ operator: OperatorType; symbol: string }> = [
        { operator: 'multiplicacion', symbol: OPERATOR_SYMBOL_MAP.multiplicacion },
        { operator: 'division', symbol: OPERATOR_SYMBOL_MAP.division },
        { operator: 'suma', symbol: OPERATOR_SYMBOL_MAP.suma },
        { operator: 'resta', symbol: OPERATOR_SYMBOL_MAP.resta },
      ];

      return (
        <div className="flex justify-center gap-2">
          {operatorButtons.map(({ operator, symbol }) => (
            <Button
              key={operator}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 border-emerald-500/50 hover:bg-emerald-500/10"
              data-calculo-trigger="true"
              onClick={(event) => {
                event.stopPropagation();
                onAddCalculo(header.id, operator);
              }}
              disabled={disabled}
            >
              <span className="text-lg font-semibold leading-none text-emerald-300">
                {symbol}
              </span>
            </Button>
          ))}
        </div>
      );
    }

    if (rowType === 'calculations') {
      if (!canUseCalculations(header)) {
        return <div className="h-4 bg-slate-800/30 rounded animate-pulse" />;
      }

      const hasOps = header.calculoOperations.length > 0;
      
      if (hasOps) {
        return (
          <div className="space-y-2 w-full">
            {header.calculoOperations.map((operation, opIndex) => (
              <div key={opIndex} className="space-y-2">
                {operation.values.map((value, valIndex) => (
                  <div key={value.id} className="flex items-center gap-2">
                    {(opIndex > 0 || valIndex > 0) && (
                      <span className="text-xs text-emerald-300">
                        {OPERATOR_SYMBOL_MAP[operation.operator]}
                      </span>
                    )}
                    <div
                      className={cn(
                        'flex-1 px-2 py-1 rounded text-xs border cursor-pointer transition-all',
                        value.headerTitle
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-700/50 border-slate-600 text-slate-400 animate-pulse'
                      )}
                      onClick={() => onValueClick(header.id, opIndex, valIndex)}
                      onDoubleClick={() => {
                        if (value.headerTitle) {
                          onValueDoubleClick(header.id, opIndex, valIndex);
                        }
                      }}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        onValueContextMenu(header.id, opIndex, valIndex);
                      }}
                    >
                      {value.headerTitle || 'Seleccionar...'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <Separator className="bg-slate-700" />
            <div className="text-xs text-emerald-200 font-medium flex flex-wrap gap-1">
              {renderExpression(header)}
            </div>
          </div>
        );
      }
      
      return <div className="h-4 bg-slate-800/30 rounded animate-pulse" />;
    }

    // empty row
    return <div className="h-4 bg-slate-800/30 rounded animate-pulse" />;
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/70">
      <Table>
        {/* Título de la tabla */}
        <TableHeader>
          <TableRow>
            <TableHead
              colSpan={sortedHeaders.length}
              className="border-b-2 border-slate-700 bg-slate-900/90 px-6 py-4 text-center"
            >
              <Input
                data-help-anchor="table-title"
                value={titulo}
                onChange={(e) => onTituloChange(e.target.value)}
                placeholder="Título de la tabla..."
                disabled={loading}
                className="text-center text-lg font-bold bg-transparent border-none text-white 
                          focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              />
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* Headers con drag & drop */}
        <TableHeader>
          <TableRow data-help-anchor="editable-headers">
            {sortedHeaders.map((header) => {
              const draggable = isDraggable(header);
              const dragging = isDragging(header.id);
              const { showLeft, showRight } = getDropIndicators(header.id);

              return (
                <DraggableTableHead
                  key={header.id}
                  headerId={header.id}
                  isDraggable={draggable}
                  isDragging={dragging}
                  onRegisterPosition={registerPosition}
                  onDragStart={handleDragStart}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  showDropIndicatorLeft={showLeft}
                  showDropIndicatorRight={showRight}
                >
              <DraftTableHeader
                id={header.id}
                title={header.title}
                isEditable={header.isEditable}
                isCantidad={header.isCantidad}
                isQuantityDefined={header.isQuantityDefined}
                showQuantityQuestion={header.showQuantityQuestion}
                isSelectionMode={isSelectionMode}
                highlightedColumns={highlightedColumns}
                    isFlashing={flashingColumns.has(header.id)}
                onTitleChange={(value) => onHeaderTitleChange(header.id, value)}
                onRemove={() => onHeaderRemove(header.id)}
                onQuantityResponse={(value) => onQuantityResponse(header.id, value)}
                loading={loading}
                    isDragging={dragging}
                  />
                </DraggableTableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        {/* Cuerpo de tabla */}
        <TableBody>
          {/* Primera fila: botones de operación */}
          <AnimatedTableRow className="border-t border-slate-800">
            {sortedHeaders.map((header) => {
              const isInteractive = isSelectionMode && highlightedColumns.has(header.id);
              const isHighlighted = flashingColumns.has(header.id);
              const handleClick = isInteractive ? () => onColumnSelect(header.id) : undefined;

              return (
                <AnimatedTableCell
                  key={`ops-${header.id}`}
                  isDragging={isDragging(header.id)}
                  isInDropZone={isInDropZone(header.id)}
                  dataSelectable={isInteractive}
                  dataHelpAnchor={header.baseHeaderId === 2 ? 'calc-buttons' : undefined}
                  className={cn(
                    'bg-slate-900/50',
                    isInteractive && 'bg-blue-500/10 cursor-pointer hover:bg-blue-500/20',
                    isHighlighted && 'bg-blue-500/10 animate-pulse'
                  )}
                  onClick={handleClick}
                >
                  {renderTableCellContent(header, 'operations')}
                </AnimatedTableCell>
              );
            })}
          </AnimatedTableRow>

          {/* Segunda fila: operaciones activas */}
          <AnimatedTableRow className="border-t border-slate-800">
            {sortedHeaders.map((header) => {
              const isInteractive = isSelectionMode && highlightedColumns.has(header.id);
              const isHighlighted = flashingColumns.has(header.id);
              const handleClick = isInteractive ? () => onColumnSelect(header.id) : undefined;

              return (
                <AnimatedTableCell
                  key={`calc-${header.id}`}
                  isDragging={isDragging(header.id)}
                  isInDropZone={isInDropZone(header.id)}
                  dataSelectable={isInteractive}
                  dataHelpAnchor={header.baseHeaderId === 5 ? 'calc-content' : undefined}
                  className={cn(
                    'bg-slate-900/50',
                    isInteractive && 'bg-blue-500/10 cursor-pointer hover:bg-blue-500/20',
                    isHighlighted && 'bg-blue-500/10 animate-pulse'
                  )}
                  onClick={handleClick}
                >
                  {renderTableCellContent(header, 'calculations')}
                </AnimatedTableCell>
              );
            })}
          </AnimatedTableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default DraftTableView;