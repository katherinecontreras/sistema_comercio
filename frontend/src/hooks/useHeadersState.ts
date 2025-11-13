// useHeadersState.ts - Hook para manejar el estado de headers
import { useState, useCallback, useMemo } from 'react';
import { HeaderDraft, BASE_HEADERS } from '@/store/material/types';
import { normalizeHeaders, getHeaderTitle } from '@/utils/materiales';

export const useHeadersState = (initialHeaders: HeaderDraft[]) => {
  const [headers, setHeaders] = useState<HeaderDraft[]>(() =>
    normalizeHeaders(initialHeaders)
  );
  const [removedCustomHeaders, setRemovedCustomHeaders] = useState<HeaderDraft[]>([]);

  const setHeadersWithNormalize = useCallback(
    (updater: (prev: HeaderDraft[]) => HeaderDraft[]) => {
      setHeaders((prev) => normalizeHeaders(updater(prev)));
    },
    []
  );

  const showHeaderSelectionBar = useMemo(() => {
    const baseHeadersRemoved = BASE_HEADERS.some(
      (b) => b.optional && !headers.some((h) => h.baseHeaderId === b.id)
    );
    const customHeadersRemoved = removedCustomHeaders.length > 0;
    return baseHeadersRemoved || customHeadersRemoved;
  }, [headers, removedCustomHeaders]);

  const availableBaseHeaders = useMemo(() => {
    const activeBaseIds = new Set(
      headers
        .filter(
          (header) =>
            header.isBaseHeader &&
            header.baseHeaderId &&
            header.baseHeaderId !== 1 &&
            header.baseHeaderId !== 4 &&
            header.baseHeaderId !== 5
        )
        .map((header) => header.baseHeaderId!)
    );
    return BASE_HEADERS.filter((item) => item.optional && !activeBaseIds.has(item.id));
  }, [headers]);

  const customHeaderOptions = useMemo(
    () =>
      removedCustomHeaders.map((header) => ({
        id: header.id,
        label: getHeaderTitle(header),
      })),
    [removedCustomHeaders]
  );

  return {
    headers,
    setHeaders,
    setHeadersWithNormalize,
    removedCustomHeaders,
    setRemovedCustomHeaders,
    showHeaderSelectionBar,
    availableBaseHeaders,
    customHeaderOptions,
  };
};

export default useHeadersState