import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import HelpStepOverlay from "@/components/animations/HelpStepOverlay";

interface AyudaMesageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StepPlacement = "top" | "bottom" | "left" | "right" | "center";

interface StepConfig {
  id: string;
  anchor: string;
  placement?: StepPlacement;
  offset?: { x?: number; y?: number };
  title: string;
  description: React.ReactNode;
  customPosition?: (
    rect: DOMRect,
    viewport: { width: number; height: number; scrollX: number; scrollY: number }
  ) => { top: number; left: number; transform: string };
}

interface OverlayPosition {
  top: number;
  left: number;
  transform: string;
}

const DEFAULT_POSITION: OverlayPosition = {
  top: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  left: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
  transform: "translate(-50%, -50%)",
};

export function AyudaMesage({ open, onOpenChange }: AyudaMesageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState<OverlayPosition | null>(null);

  const steps = useMemo<StepConfig[]>(
    () => [
      {
        id: "paso-1",
        anchor: '[data-help-anchor="table-title"]',
        placement: "top",
        offset: { y: 210 },
        title: "Paso 1: Agrega el título de la tabla",
        description: (
          <ul className="list-disc list-inside space-y-1 text-emerald-100">
            <li>Edita el título directamente en la primera fila para identificar la plantilla.</li>
          </ul>
        ),
      },
      {
        id: "paso-2",
        anchor: '[data-help-anchor="editable-headers"]',
        placement: "top",
        offset: { y: -60 },
        title: "Paso 2: Ajusta los headers editables",
        description: (
          <ul className="list-disc list-inside space-y-1 text-emerald-100">
            <li>Puedes renombrar los headers editables y reorganizarlos arrastrándolos.</li>
            <li>
              Si un header no es necesario, elimínalo con la “X”. Luego podrás reactivarlo desde el panel
              superior.
            </li>
          </ul>
        ),
      },
      {
        id: "paso-3",
        anchor: '[data-help-anchor="add-custom-header"]',
        placement: "top",
        offset: { y: -40 },
        title: "Paso 3: Añade headers personalizados",
        description: (
          <ul className="list-disc list-inside space-y-1 text-emerald-100">
            <li>Usa el botón “Nuevo header personalizado” para crear columnas adicionales.</li>
            <li>Indica si el header es una cantidad y asígnale un nombre para habilitar la edición.</li>
            <li>Los headers personalizados eliminados quedan disponibles para restaurarlos en el panel.</li>
          </ul>
        ),
      },
      {
        id: "paso-4",
        anchor: '[data-help-anchor="calc-buttons"]',
        placement: "bottom",
        offset: { y: -15 },
        title: "Paso 4: Añade cálculos automáticos",
        description: (
          <ul className="list-disc list-inside space-y-1 text-emerald-100">
            <li>
              Los botones <strong>×</strong>, <strong>/</strong>, <strong>+</strong> y <strong>-</strong> aparecen solo en headers con cantidades o
              cálculos activos.
            </li>
            <li>Pulsa uno de los botones para agregar un cálculo y crear nuevos placeholders “Seleccionar…”.</li>
            <li>Cada expresión puede combinar multiplicaciones, divisiones, sumas o restas.</li>
          </ul>
        ),
      },
      {
        id: "paso-5",
        anchor: '[data-help-anchor="save-button"]',
        placement: "right",
        offset: { x: -160, y: -220 },
        title: "Paso 5: Acciones de selección en la fórmula",
        description: (
          <ul className="list-disc list-inside space-y-1 text-emerald-100">
            <li>Haz clic en un placeholder “Seleccionar…” para escoger una columna iluminada.</li>
            <li>Doble clic sobre un valor asignado para limpiarlo y elegir otra columna.</li>
            <li>
              Clic derecho para eliminar toda la fórmula (si solo tiene dos factores) o quitar el elemento seleccionado.
            </li>
          </ul>
        ),
      },
      {
        id: "paso-6",
        anchor: '[data-help-anchor="add-custom-header"]',
        customPosition: (rect, viewport) => ({
          top: rect.top + viewport.scrollY,
          left: viewport.width / 2 + viewport.scrollX,
          transform: "translate(-50%, -40%)",
        }),
        title: "Paso 6: Revisa antes de guardar",
        description: (
          <ul className="list-disc list-inside space-y-1 text-emerald-100">
            <li>Verifica que todos los headers personalizados tengan título.</li>
            <li>Asegúrate de que no queden placeholders “Seleccionar…” sin completar.</li>
            <li>Confirma que <strong>$Total</strong> mantenga al menos un factor válido.</li>
          </ul>
        ),
      },
      {
        id: "paso-7",
        anchor: '[data-help-anchor="save-button"]',
        placement: "top",
        offset: { y: 260 },
        title: "Paso 7: Guarda y usa tu plantilla",
        description: (
          <ul className="list-disc list-inside space-y-1 text-emerald-100">
            <li>Haz clic en “Guardar nueva tabla” para validar la configuración y crear el tipo de material.</li>
            <li>La plantilla aparecerá en la vista principal y podrás utilizarla al cargar materiales.</li>
          </ul>
        ),
      },
    ],
    []
  );

  const totalSteps = steps.length;

  const calculatePosition = useCallback(
    (step: StepConfig): OverlayPosition => {
      if (typeof window === "undefined") {
        return DEFAULT_POSITION;
      }

      const element = document.querySelector(step.anchor) as HTMLElement | null;
      if (!element) {
        return DEFAULT_POSITION;
      }

      const rect = element.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX || window.pageXOffset,
        scrollY: window.scrollY || window.pageYOffset,
      };

      if (step.customPosition) {
        return step.customPosition(rect, viewport);
      }

      const offsetX = step.offset?.x ?? 0;
      const offsetY = step.offset?.y ?? 0;

      const placements: Record<StepPlacement, OverlayPosition> = {
        top: {
          top: rect.top + viewport.scrollY - offsetY,
          left: rect.left + viewport.scrollX + rect.width / 2 + offsetX,
          transform: "translate(-50%, -105%)",
        },
        bottom: {
          top: rect.bottom + viewport.scrollY + offsetY,
          left: rect.left + viewport.scrollX + rect.width / 2 + offsetX,
          transform: "translate(-50%, 5%)",
        },
        left: {
          top: rect.top + viewport.scrollY + rect.height / 2 + offsetY,
          left: rect.left + viewport.scrollX - offsetX,
          transform: "translate(-110%, -50%)",
        },
        right: {
          top: rect.top + viewport.scrollY + rect.height / 2 + offsetY,
          left: rect.right + viewport.scrollX + offsetX,
          transform: "translate(10%, -50%)",
        },
        center: {
          top: rect.top + viewport.scrollY + rect.height / 2 + offsetY,
          left: rect.left + viewport.scrollX + rect.width / 2 + offsetX,
          transform: "translate(-50%, -50%)",
        },
      };

      const placement = step.placement ?? "top";
      return placements[placement] ?? DEFAULT_POSITION;
    },
    []
  );

  useEffect(() => {
    if (!open) {
      setPosition(null);
      setCurrentStep(0);
      return;
    }

    const updatePosition = () => {
      const step = steps[currentStep];
      if (!step) {
        setPosition(DEFAULT_POSITION);
        return;
      }
      setPosition(calculatePosition(step));
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, currentStep, steps, calculatePosition]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  if (!open) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <div className="pointer-events-none fixed inset-0 z-[9000]">
      <AnimatePresence>
        {position && step && (
          <HelpStepOverlay
            key={step.id}
            stepIndex={currentStep}
            totalSteps={totalSteps}
            title={step.title}
            description={step.description}
            position={position}
            onNext={handleNext}
            onPrev={handlePrev}
            onClose={handleClose}
            isFirst={currentStep === 0}
            isLast={currentStep === totalSteps - 1}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
