// useFormSubmission.ts - Hook para manejar el envío del formulario
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderDraft, CalculoOperation, OperatorType, CalculoValue } from '@/store/material/types';
import { getHeaderTitle } from '@/utils/materiales';
import { createTipoMaterial, updateTipoMaterial } from '@/actions/materiales';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useMaterialStore } from '@/store/material/materialStore';

export const useFormSubmission = (
  headers: HeaderDraft[],
  titulo: string,
  setFormError: React.Dispatch<React.SetStateAction<string | null>>,
  editingTipoId: number | null,
) => {
  const navigate = useNavigate();
  const { tipos, setTipos, setLoading } = useMaterialStore();
  const { execute, loading } = useAsyncOperation();

  const validateCalculations = useCallback(() => {
    for (const header of headers) {
      if (!header.calculoOperations.length) continue;
      for (const operation of header.calculoOperations) {
        if (operation.values.some((value) => !value.headerRef)) {
          return `Completa el cálculo del header "${getHeaderTitle(header)}".`;
        }
      }
    }
    return null;
  }, [headers]);

  const buildCalculoPayload = useCallback(
    (operations: CalculoOperation[], atributoIndexMap: Map<string, number>) => {
      if (!operations.length) return undefined;

      const cleaned = operations.reduce<
        Array<{
          tipo: OperatorType;
          headers_base?: number[];
          headers_atributes?: number[];
        }>
      >((acc, operation) => {
        const baseRefs = Array.from(
          new Set(
            operation.values
              .filter((value) => value.tipo === 'base' && value.headerRef)
              .map((value) => headers.find((header) => header.id === value.headerRef)?.baseHeaderId)
              .filter((id): id is number => typeof id === 'number')
          )
        );

        const attrRefs = Array.from(
          new Set(
            operation.values
              .filter(
                (value): value is CalculoValue & { headerRef: string } =>
                  value.tipo === 'atribute' && !!value.headerRef
              )
              .map((value) => atributoIndexMap.get(value.headerRef))
              .filter((id): id is number => typeof id === 'number')
          )
        );

        if (!baseRefs.length && !attrRefs.length) {
          return acc;
        }

        acc.push({
          tipo: operation.operator,
          headers_base: baseRefs.length ? baseRefs : undefined,
          headers_atributes: attrRefs.length ? attrRefs : undefined,
        });

        return acc;
      }, []);

      if (!cleaned.length) return undefined;

      return {
        activo: true,
        isMultiple: cleaned.length > 1,
        operaciones: cleaned,
      };
    },
    [headers]
  );

  const handleSubmit = useCallback(async () => {
    setFormError(null);

    if (!titulo.trim()) {
      setFormError('El título de la tabla es obligatorio.');
      return;
    }

    const pendingQuestion = headers.find((header) => header.showQuantityQuestion);
    if (pendingQuestion) {
      setFormError('Responde si el header es una cantidad antes de continuar.');
      return;
    }

    const incompleteCalculation = validateCalculations();
    if (incompleteCalculation) {
      setFormError(incompleteCalculation);
      return;
    }

    const atributos = headers.filter((header) => !header.isBaseHeader);
    const atributoIndexMap = new Map(
      atributos.map((header, index) => {
        const match = header.id.match(/^attr-(\d+)$/);
        const resolvedId = match ? Number(match[1]) : index + 1;
        return [header.id, resolvedId];
      }),
    );

    const headersBaseActive = headers
      .filter(
        (header) =>
          header.isBaseHeader &&
          header.baseHeaderId &&
          header.baseHeaderId !== 1 &&
          header.baseHeaderId !== 4 &&
          header.baseHeaderId !== 5,
      )
      .map((header) => header.baseHeaderId!)
      .filter((value, index, self) => self.indexOf(value) === index);

    const headersBasePayload = headers
      .filter((header) => header.isBaseHeader && header.baseHeaderId)
      .map((header) => {
        const tituloLimpio = (header.title || getHeaderTitle(header)).trim();
        const calculoPayload = buildCalculoPayload(header.calculoOperations, atributoIndexMap);

        const entry: {
          id_header_base: number;
          titulo: string;
          order: number;
          calculo?: ReturnType<typeof buildCalculoPayload>;
        } = {
          id_header_base: header.baseHeaderId!,
          titulo: tituloLimpio || getHeaderTitle(header),
          order: header.order,
        };

        if (calculoPayload) {
          entry.calculo = calculoPayload;
        }

        return entry;
      });

    const orderHeaders = headers
      .map((header) => {
        const baseInfo = header.isBaseHeader ? header.baseHeaderId : undefined;
        const attrMatch = !header.isBaseHeader ? header.id.match(/^attr-(\d+)$/) : null;
        const attrId = attrMatch ? Number(attrMatch[1]) : undefined;
        const orderValue = header.order;

        if (header.isBaseHeader && baseInfo !== undefined) {
          return {
            type: 'base' as const,
            id: baseInfo,
            order: orderValue,
          };
        }

        if (!header.isBaseHeader && attrId !== undefined) {
          return {
            type: 'atribute' as const,
            id: attrId,
            order: orderValue,
          };
        }

        return null;
      })
      .filter((entry): entry is { type: 'base' | 'atribute'; id: number; order: number } => entry !== null)
      .sort((a, b) => a.order - b.order);

    const payload = {
      titulo: titulo.trim(),
      headers_base_active: headersBaseActive,
      headers_base_calculations: headersBasePayload,
      headers_atributes:
        atributos.length > 0
          ? atributos.map((header) => {
              const match = header.id.match(/^attr-(\d+)$/);
              const attributeId = match ? Number(match[1]) : undefined;
              const basePayload: {
                id_header_atribute?: number;
                titulo: string;
                isCantidad: boolean;
                order: number;
                calculo?: ReturnType<typeof buildCalculoPayload>;
              } = {
                titulo: (header.title || getHeaderTitle(header)).trim() || 'Header',
                isCantidad: header.isCantidad,
                order: header.order,
              };
              const calculoPayload = buildCalculoPayload(header.calculoOperations, atributoIndexMap);
              if (calculoPayload) {
                basePayload.calculo = calculoPayload;
              }
              if (attributeId !== undefined) {
                basePayload.id_header_atribute = attributeId;
              }
              return basePayload;
            })
          : undefined,
      order_headers: orderHeaders,
    };

    await execute(
      async () => {
        setLoading(true);
        if (editingTipoId) {
          const updated = await updateTipoMaterial(editingTipoId, payload);
          setTipos(
            tipos.map((tipo) =>
              tipo.id_tipo_material === updated.id_tipo_material ? updated : tipo,
            ),
          );
          navigate('/materiales');
          return updated;
        }

        const created = await createTipoMaterial(payload);
        setTipos([...tipos, created]);
        navigate('/materiales');
        return created;
      },
      {
        showErrorToast: true,
        successMessage: editingTipoId
          ? 'Tabla de materiales actualizada correctamente'
          : 'Tabla de materiales creada correctamente',
        errorMessage: editingTipoId
          ? 'Error al actualizar la tabla de materiales'
          : 'Error al crear la tabla de materiales',
        onError: (error) => {
          setFormError(
            error?.response?.data?.detail ||
              (editingTipoId
                ? 'Ocurrió un error al actualizar la tabla.'
                : 'Ocurrió un error al crear la tabla.'),
          );
          setLoading(false);
        },
        onSuccess: () => {
          setLoading(false);
        },
      },
    );
  }, [
    buildCalculoPayload,
    execute,
    headers,
    navigate,
    setLoading,
    setTipos,
    titulo,
    tipos,
    validateCalculations,
    setFormError,
    editingTipoId,
  ]);

  return {
    handleSubmit,
    loading,
  };
};

export default useFormSubmission