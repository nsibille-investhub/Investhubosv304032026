import { ArrowLeft } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import {
  useCollectionWizard,
  WIZARD_TOTAL_STEPS,
  type WizardStep,
} from '../hooks/useCollectionWizard';
import type { IngestionMode } from '../types';
import { WizardStepper } from './WizardStepper';
import { WizardStepMode } from './wizard/WizardStepMode';
import { WizardStepConfig } from './wizard/WizardStepConfig';

const STEPS = [
  { id: 1, label: 'Mode' },
  { id: 2, label: 'Configuration' },
  { id: 3, label: 'Rattachement' },
  { id: 4, label: 'Schéma' },
];

function StepPlaceholder({ step }: { step: WizardStep }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 py-12 text-center">
      <p className="text-sm font-medium text-foreground">
        Étape {step} — à venir
      </p>
      <p className="text-xs text-muted-foreground">
        Cette étape sera livrée dans un prochain prompt.
      </p>
    </div>
  );
}

export interface CollectionWizardProps {
  onExit: () => void;
}

export function CollectionWizard({ onExit }: CollectionWizardProps) {
  const {
    currentStep,
    wizardData,
    canProceed,
    goToStep,
    nextStep,
    prevStep,
    updateWizardData,
  } = useCollectionWizard();

  const handleModeChange = (mode: IngestionMode) => {
    updateWizardData({ ingestionMode: mode });
  };

  const modeConfig = (wizardData.modeConfig ?? {}) as Record<string, unknown>;
  const handleConfigPatch = (patch: Record<string, unknown>) => {
    updateWizardData({ modeConfig: { ...modeConfig, ...patch } });
  };

  return (
    <div className="flex-1 px-6 pb-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 py-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Retour au DataHub
          </Button>
          <div className="h-4 w-px bg-border" aria-hidden />
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-foreground">
              Nouvelle collection
            </h1>
            <p className="text-xs text-muted-foreground">
              Étape {currentStep} sur {WIZARD_TOTAL_STEPS}
            </p>
          </div>
        </div>

        <Card className="gap-0 overflow-hidden p-0">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <WizardStepper
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={(id) => goToStep(id as WizardStep)}
            />
          </div>

          <div className="px-6 py-8">
            {currentStep === 1 && (
              <WizardStepMode
                mode={wizardData.ingestionMode}
                onChange={handleModeChange}
              />
            )}
            {currentStep === 2 && (
              <WizardStepConfig
                mode={wizardData.ingestionMode}
                modeConfig={modeConfig}
                onChange={handleConfigPatch}
              />
            )}
            {currentStep === 3 && <StepPlaceholder step={3} />}
            {currentStep === 4 && <StepPlaceholder step={4} />}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-6 py-4">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            <Button variant="ghost" onClick={onExit}>
              Annuler
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed || currentStep === WIZARD_TOTAL_STEPS}
            >
              Suivant
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CollectionWizard;
