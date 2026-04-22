import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import { PageHeader } from '../../../components/ui/page-header';
import { useCollections } from '../context/CollectionsContext';
import {
  useCollectionWizard,
  WIZARD_TOTAL_STEPS,
  type WizardStep,
} from '../hooks/useCollectionWizard';
import type { IngestionMode, WizardData } from '../types';
import { WizardStepper } from './WizardStepper';
import { WizardStepMode } from './wizard/WizardStepMode';
import { WizardStepConfig } from './wizard/WizardStepConfig';
import { WizardStepLinking } from './wizard/WizardStepLinking';
import { WizardStepSchema } from './wizard/WizardStepSchema';

const STEPS = [
  { id: 1, label: 'Mode' },
  { id: 2, label: 'Configuration' },
  { id: 3, label: 'Rattachement' },
  { id: 4, label: 'Schéma' },
];

export interface CollectionWizardProps {
  onExit: () => void;
  onCreated: (collectionId: string, options: { openImport: boolean }) => void;
}

export function CollectionWizard({ onExit, onCreated }: CollectionWizardProps) {
  const {
    currentStep,
    wizardData,
    canProceed,
    goToStep,
    nextStep,
    prevStep,
    updateWizardData,
  } = useCollectionWizard();

  const { createCollection } = useCollections();

  const handleModeChange = (mode: IngestionMode) => {
    updateWizardData({ ingestionMode: mode });
  };

  const modeConfig = (wizardData.modeConfig ?? {}) as Record<string, unknown>;
  const handleConfigPatch = (patch: Record<string, unknown>) => {
    updateWizardData({ modeConfig: { ...modeConfig, ...patch } });
  };

  const isLastStep = currentStep === WIZARD_TOTAL_STEPS;
  const mode = wizardData.ingestionMode;
  const canImportNow = mode === 'file' || mode === 'api-pull';

  const submit = (options: { openImport: boolean }) => {
    if (!canProceed) return;
    const created = createCollection(wizardData as WizardData);
    toast.success('Collection créée', {
      description: created.displayName,
    });
    onCreated(created.id, options);
  };

  return (
    <div className="flex-1">
      <PageHeader
        breadcrumb={[
          { label: 'InvestHub OS' },
          { label: 'Portails et Contenu' },
          { label: 'DataHub', onClick: onExit },
          { label: 'Nouvelle collection' },
        ]}
        onBack={onExit}
        title="Nouvelle collection"
        subtitle={`Étape ${currentStep} sur ${WIZARD_TOTAL_STEPS} · ${STEPS[currentStep - 1].label}`}
      />

      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
        {/* Stepper */}
        <WizardStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(id) => goToStep(id as WizardStep)}
        />

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-gray-950"
          >
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
            {currentStep === 3 && (
              <WizardStepLinking data={wizardData} onChange={updateWizardData} />
            )}
            {currentStep === 4 && (
              <WizardStepSchema data={wizardData} onChange={updateWizardData} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer actions */}
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-2 rounded-xl border border-border bg-white/90 px-5 py-3 shadow-lg shadow-black/5 backdrop-blur-sm dark:bg-gray-950/90">
          <div className="flex items-center gap-1">
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
          </div>

          {isLastStep ? (
            <div className="flex items-center gap-2">
              {canImportNow && (
                <Button
                  variant="outline"
                  onClick={() => submit({ openImport: true })}
                  disabled={!canProceed}
                >
                  Créer et importer maintenant
                </Button>
              )}
              <Button
                onClick={() => submit({ openImport: false })}
                disabled={!canProceed}
                style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                className="text-white shadow-lg shadow-black/20 hover:opacity-90"
              >
                Créer la collection
              </Button>
            </div>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
              className="text-white shadow-lg shadow-black/20 hover:opacity-90"
            >
              Suivant
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollectionWizard;
