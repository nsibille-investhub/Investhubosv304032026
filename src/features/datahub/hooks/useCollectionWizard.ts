import { useCallback, useMemo, useState } from 'react';
import type { WizardData } from '../types';

export type WizardStep = 1 | 2 | 3 | 4;

export const WIZARD_TOTAL_STEPS = 4 as const;

function isStepValid(step: WizardStep, data: WizardData): boolean {
  switch (step) {
    case 1:
      return !!data.ingestionMode;
    case 2: {
      const cfg = (data.modeConfig ?? {}) as Record<string, unknown>;
      switch (data.ingestionMode) {
        case 'manual':
          return true;
        case 'file':
          return typeof cfg.fileName === 'string' || cfg.configureLater === true;
        case 'api-pull':
          return (
            typeof cfg.endpointUrl === 'string' &&
            (cfg.endpointUrl as string).trim().length > 0 &&
            typeof cfg.authType === 'string'
          );
        case 'api-push':
          return true;
        case 'mcp':
          return true;
        default:
          return false;
      }
    }
    case 3: {
      const displayOk =
        typeof data.displayName === 'string' &&
        data.displayName.trim().length > 0;
      const techOk =
        typeof data.technicalName === 'string' &&
        /^[a-z0-9_]+$/.test(data.technicalName);
      const pivotOk = !!data.pivotType;
      return displayOk && techOk && pivotOk;
    }
    case 4:
      // Filled in prompt 3.4.
      return true;
    default:
      return false;
  }
}

export interface UseCollectionWizardOptions {
  initialStep?: WizardStep;
  initialData?: Partial<WizardData>;
}

export function useCollectionWizard(options: UseCollectionWizardOptions = {}) {
  const { initialStep = 1, initialData } = options;

  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>(
    initialData ?? {},
  );

  const updateWizardData = useCallback((patch: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...patch }));
  }, []);

  const canProceed = useMemo(
    () => isStepValid(currentStep, wizardData as WizardData),
    [currentStep, wizardData],
  );

  const goToStep = useCallback((step: WizardStep) => {
    if (step < 1 || step > WIZARD_TOTAL_STEPS) return;
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) =>
      s < WIZARD_TOTAL_STEPS ? ((s + 1) as WizardStep) : s,
    );
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setWizardData(initialData ?? {});
  }, [initialData]);

  return {
    currentStep,
    wizardData,
    canProceed,
    goToStep,
    nextStep,
    prevStep,
    updateWizardData,
    reset,
  };
}

export type CollectionWizardController = ReturnType<
  typeof useCollectionWizard
>;
