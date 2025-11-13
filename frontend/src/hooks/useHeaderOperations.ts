// useHeaderOperations.ts - Hook para operaciones con headers
import { useCallback } from 'react';
import BaseHeaderId, { HeaderDraft, OperatorType, ColumnType, BASE_HEADERS } from '@/store/material/types';
import { createId, getBaseOrder, cloneHeaderDraft } from '@/utils/materiales';

export const useHeaderOperations = (
  setHeadersWithNormalize: (updater: (prev: HeaderDraft[]) => HeaderDraft[]) => void,
  setRemovedCustomHeaders: React.Dispatch<React.SetStateAction<HeaderDraft[]>>
) => {
  const handleAddBaseHeader = useCallback(
    (baseHeaderId: number) => {
      const baseInfo = BASE_HEADERS.find((item) => item.id === baseHeaderId);
      if (!baseInfo) return;

      setHeadersWithNormalize((prev) => {
        const newHeader: HeaderDraft = {
          id: `base-${baseHeaderId}`,
          title: baseInfo.label,
          isEditable: baseInfo.optional,
          isBaseHeader: true,
          baseHeaderId,
          isCantidad: baseHeaderId === 2,
          isQuantityDefined: true,
          showQuantityQuestion: false,
          calculoOperations: [],
          order: getBaseOrder(baseHeaderId as BaseHeaderId),
        };

        let nextHeaders = [...prev, newHeader];

        if (baseHeaderId === 2) {
          nextHeaders = nextHeaders.map((header) => {
            if (header.baseHeaderId === 5) {
              const alreadyIncludes = header.calculoOperations.some((operation) =>
                operation.values.some((value) => value.headerRef === 'base-2')
              );
              if (alreadyIncludes) return header;

              const updatedOperations = header.calculoOperations.length
                ? header.calculoOperations.map((operation, index) =>
                    index === 0
                      ? {
                          ...operation,
                          values: [
                            ...operation.values,
                            {
                              id: createId(),
                              headerRef: 'base-2',
                              headerTitle: 'Cantidad',
                              tipo: 'base' as ColumnType,
                            },
                          ],
                        }
                      : operation
                  )
                : [
                    {
                      operator: 'multiplicacion' as OperatorType,
                      values: [
                        {
                          id: createId(),
                          headerRef: 'base-2',
                          headerTitle: 'Cantidad',
                          tipo: 'base' as ColumnType,
                        },
                        {
                          id: createId(),
                          headerRef: 'base-4',
                          headerTitle: '$Unitario',
                          tipo: 'base' as ColumnType,
                        },
                      ],
                    },
                  ];

              return {
                ...header,
                calculoOperations: updatedOperations,
              };
            }
            return header;
          });
        }

        return nextHeaders;
      });
    },
    [setHeadersWithNormalize]
  );

  const handleAddNewHeader = useCallback(() => {
    setHeadersWithNormalize((prev) => {
      const maxBaseOrderBeforeUnit = Math.max(
        0,
        ...prev
          .filter(
            (header) =>
              header.baseHeaderId &&
              header.baseHeaderId !== 4 &&
              header.baseHeaderId !== 5
          )
          .map((header) => header.order)
      );

      const maxCustomOrder = Math.max(
        0,
        ...prev
          .filter((header) => !header.isBaseHeader)
          .map((header) => header.order)
      );

      const nextOrder = Math.max(maxBaseOrderBeforeUnit, maxCustomOrder) + 1;

      const newHeader: HeaderDraft = {
        id: createId(),
        title: '',
        isEditable: true,
        isBaseHeader: false,
        isCantidad: false,
        isQuantityDefined: false,
        showQuantityQuestion: true,
        calculoOperations: [],
        order: nextOrder,
      };

      const updatedHeaders = prev.map((header) => {
        if (header.baseHeaderId === 4) {
          const desiredOrder = header.order <= nextOrder ? nextOrder + 1 : header.order;
          return {
            ...header,
            order: desiredOrder,
          };
        }

        if (header.baseHeaderId === 5) {
          return {
            ...header,
            order: 999,
          };
        }

        return header;
      });

      return [...updatedHeaders, newHeader];
    });
  }, [setHeadersWithNormalize]);

  const handleRestoreCustomHeader = useCallback(
    (headerId: string) => {
      setRemovedCustomHeaders((prev) => {
        const headerToRestore = prev.find((header) => header.id === headerId);
        if (!headerToRestore) return prev;

        setHeadersWithNormalize((current) => [...current, cloneHeaderDraft(headerToRestore)]);

        return prev.filter((header) => header.id !== headerId);
      });
    },
    [setHeadersWithNormalize, setRemovedCustomHeaders]
  );

  const handleDiscardCustomHeader = useCallback(
    (headerId: string) => {
      setRemovedCustomHeaders((prev) => prev.filter((header) => header.id !== headerId));
    },
    [setRemovedCustomHeaders]
  );

  const handleQuantityResponse = useCallback(
    (headerId: string, value: boolean) => {
      setHeadersWithNormalize((prev) =>
        prev.map((header) =>
          header.id === headerId
            ? {
                ...header,
                isCantidad: value,
                isQuantityDefined: true,
                showQuantityQuestion: false,
              }
            : header
        )
      );
    },
    [setHeadersWithNormalize]
  );

  const handleReorderEditableHeaders = useCallback(
    (orderedIds: string[]) => {
      if (orderedIds.length === 0) return;

      setHeadersWithNormalize((prev) => {
        const detailHeader = prev.find((header) => header.baseHeaderId === 1);
        const unitarioHeader = prev.find((header) => header.baseHeaderId === 4);
        const totalHeader = prev.find((header) => header.baseHeaderId === 5);

        const assignedOrders = new Map<string, number>();
        let orderCursor = 1;

        if (detailHeader) {
          assignedOrders.set(detailHeader.id, orderCursor++);
        }

        orderedIds.forEach((id) => {
          if (!assignedOrders.has(id)) {
            assignedOrders.set(id, orderCursor++);
          }
        });

        prev
          .filter(
            (header) =>
              header.isEditable &&
              header.baseHeaderId !== 1 &&
              header.baseHeaderId !== 4 &&
              header.baseHeaderId !== 5 &&
              !orderedIds.includes(header.id)
          )
          .sort((a, b) => a.order - b.order)
          .forEach((header) => {
            if (!assignedOrders.has(header.id)) {
              assignedOrders.set(header.id, orderCursor++);
            }
          });

        prev
          .filter(
            (header) =>
              !header.isEditable &&
              header.baseHeaderId !== 1 &&
              header.baseHeaderId !== 4 &&
              header.baseHeaderId !== 5
          )
          .sort((a, b) => a.order - b.order)
          .forEach((header) => {
            if (!assignedOrders.has(header.id)) {
              assignedOrders.set(header.id, orderCursor++);
            }
          });

        if (unitarioHeader) {
          assignedOrders.set(unitarioHeader.id, orderCursor++);
        }

        if (totalHeader) {
          assignedOrders.set(totalHeader.id, 999);
        }

        return prev.map((header) => ({
          ...header,
          order: assignedOrders.get(header.id) ?? header.order,
        }));
      });
    },
    [setHeadersWithNormalize]
  );

  return {
    handleAddBaseHeader,
    handleAddNewHeader,
    handleRestoreCustomHeader,
    handleDiscardCustomHeader,
    handleQuantityResponse,
    handleReorderEditableHeaders,
  };
};

export default useHeaderOperations