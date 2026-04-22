import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  useCollectionWizard,
  WIZARD_TOTAL_STEPS,
  type WizardStep,
} from '../hooks/useCollectionWizard';
import type { IngestionMode } from '../types';
import { WizardStepper } from './WizardStepper';
import { WizardStepMode } from './wizard/WizardStepMode';

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
  open: boolean;
  onClose: () => void;
}

export function CollectionWizard({ open, onClose }: CollectionWizardProps) {
  const controller = useCollectionWizard();
  const { currentStep, wizardData, canProceed, goToStep, nextStep, prevStep, updateWizardData } =
    controller;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  const handleModeChange = (mode: IngestionMode) => {
    updateWizardData({ ingestionMode: mode });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex h-screen w-screen max-w-none flex-col gap-0 rounded-none border-0 p-0 sm:max-w-none"
        style={{
          top: 0,
          left: 0,
          // Tailwind v4 uses the standalone `translate:` CSS property, not
          // `transform: translate(...)`. Overriding `transform` does nothing
          // here — we must neutralize `translate` directly.
          translate: 'none',
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          borderRadius: 0,
          padding: 0,
        }}
      >
        <header className="flex items-center border-b border-border bg-card px-6 py-4 pr-16">
          {/* Built-in DialogContent close button sits at top-right (top-4 right-4). */}
          <div className="flex flex-col">
            <DialogTitle className="text-lg font-semibold">
              Nouvelle collection
            </DialogTitle>
            <DialogDescription className="text-xs">
              Étape {currentStep} sur {WIZARD_TOTAL_STEPS}
            </DialogDescription>
          </div>
        </header>

        <div className="border-b border-border bg-card px-6 py-4">
          <WizardStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(id) => goToStep(id as WizardStep)}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {currentStep === 1 && (
              <WizardStepMode
                mode={wizardData.ingestionMode}
                onChange={handleModeChange}
              />
            )}
            {currentStep === 2 && <StepPlaceholder step={2} />}
            {currentStep === 3 && <StepPlaceholder step={3} />}
            {currentStep === 4 && <StepPlaceholder step={4} />}
          </div>
        </div>

        <footer className="sticky bottom-0 flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Précédent
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canProceed || currentStep === WIZARD_TOTAL_STEPS}
          >
            Suivant
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

export default CollectionWizard;
