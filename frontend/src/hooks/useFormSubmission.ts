// useFormSubmission.ts - Hook para manejar el envío del formulario
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderDraft, CalculoOperation, OperatorType, CalculoValue } from '@/store/material/types';
import { getHeaderTitle } from '@/utils/materiales';
import { createTipoMaterial } from '@/actions/materiales';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useMaterialStore } from '@/store/material/materialStore';

export const useFormSubmission = (
  headers: HeaderDraft[],
  titulo: string,
  setFormError: React.Dispatch<React.SetStateAction<string | null>>
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
    const atributoIndexMap = new Map(atributos.map((header, index) => [header.id, index + 1]));

    const payload = {
      titulo: titulo.trim(),
      headers_base_active: headers
        .filter(
          (header) =>
            header.isBaseHeader &&
            header.baseHeaderId &&
            header.baseHeaderId !== 1 &&
            header.baseHeaderId !== 4 &&
            header.baseHeaderId !== 5
        )
        .map((header) => header.baseHeaderId!)
        .filter((value, index, self) => self.indexOf(value) === index),
      headers_base_calculations: headers
        .filter((header) => header.isBaseHeader && header.baseHeaderId)
        .map((header) => ({
          id_header_base: header.baseHeaderId!,
          calculo: buildCalculoPayload(header.calculoOperations, atributoIndexMap),
        }))
        .filter((item) => item.calculo !== undefined),
      headers_atributes:
        atributos.length > 0
          ? atributos.map((header) => ({
              titulo: header.title.trim() || 'Header',
              isCantidad: header.isCantidad,
              calculo: buildCalculoPayload(header.calculoOperations, atributoIndexMap),
            }))
          : undefined,
    };

    await execute(
      async () => {
        setLoading(true);
        const created = await createTipoMaterial(payload);
        setTipos([...tipos, created]);
        navigate('/materiales');
        return created;
      },
      {
        showErrorToast: true,
        successMessage: 'Tabla de materiales creada correctamente',
        errorMessage: 'Error al crear la tabla de materiales',
        onError: (error) => {
          setFormError(error?.response?.data?.detail || 'Ocurrió un error al crear la tabla.');
          setLoading(false);
        },
        onSuccess: () => {
          setLoading(false);
        },
      }
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
  ]);

  return {
    handleSubmit,
    loading,
  };
};

export default useFormSubmission