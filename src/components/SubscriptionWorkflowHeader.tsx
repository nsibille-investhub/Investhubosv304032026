import { useMemo, useState, type ReactNode } from 'react';
import { Ban, Check, Hourglass, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { useWorkflowScenario } from '../utils/workflowScenarioContext';
import { buildHeaderModel, type HeaderModel } from '../utils/workflowSimulator/header';
import type { SimTransition } from '../utils/workflowSimulator/types';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { PageStateBanner } from './ui/page-state-banner';
import { PageHeaderSubtitle, PageHeaderSubtitleItem } from './ui/page-header';

const H = 'subscriptions.workflowSimulator.header';
// Délai fictif d'enregistrement d'une transition jouée depuis la ligne de titre.
const SAVE_DELAY_MS = 600;

export interface WorkflowHeaderParts {
  model: HeaderModel;
  status: ReactNode;
  details: ReactNode;
  banners: ReactNode;
}

/** Ligne de titre de la souscription pilotée par le scénario du simulateur ; null hors simulateur. */
export function useSubscriptionWorkflowHeader(): WorkflowHeaderParts | null {
  const { t, lang } = useTranslation();
  const sim = useWorkflowScenario();
  const [pending, setPending] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB').format(new Date(iso));

  const model = useMemo(() => {
    if (sim.status !== 'ready') return null;
    return buildHeaderModel({
      engine: sim.engine,
      scenario: sim.scenario,
      actions: sim.actions,
      transitions: sim.transitions,
      history: sim.history,
      defaults: sim.demo.headerDefaults,
      statusRenaming: sim.demo.statusRenaming,
      reason: sim.activeDossier?.data.reason,
      formatDate,
      t,
    });
    // formatDate et t ne dépendent que de la langue.
  }, [sim, lang]);

  if (sim.status !== 'ready' || !model) return null;

  const play = (id: string, transition: Pick<SimTransition, 'to' | 'trigger'>, label: string) => {
    setPending(id);
    window.setTimeout(() => {
      sim.playTransition(transition.to, transition.trigger ?? id);
      setPending(null);
      setSaved(id);
      toast.success(t(`${H}.transitionDone`, { action: label, state: sim.engine.stateLabel(transition.to) }));
      window.setTimeout(() => setSaved(current => (current === id ? null : current)), 2000);
    }, SAVE_DELAY_MS);
  };

  const status = (
    <StatusBadge
      label={model.status.label}
      variant={model.status.tone}
      icon={model.status.cancelled ? Ban : undefined}
      tooltip={model.status.tooltip}
    />
  );

  const expected = model.expectedAction;
  const details = (
    <>
      <PageHeaderSubtitle>
        <PageHeaderSubtitleItem icon={Hourglass}>
          {model.waitingOn.length
            ? t(`${H}.waitingOn`, { who: model.waitingOn.join(', ') })
            : t(`${H}.waitingOnUnknown`)}
        </PageHeaderSubtitleItem>
        {expected && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0"
            disabled={pending === expected.code || !expected.to}
            title={expected.to ? undefined : t(`${H}.noTarget`)}
            onClick={() => expected.to && play(expected.code, { to: expected.to, trigger: expected.code }, expected.label)}
          >
            {pending === expected.code && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saved === expected.code && <Check className="w-3.5 h-3.5" />}
            {t(`${H}.expectedAction`, { action: expected.label })}
          </Button>
        )}
      </PageHeaderSubtitle>
      {model.indicators.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {model.indicators.map(indicator =>
            indicator.link ? (
              <button
                key={indicator.id}
                type="button"
                className="rounded-full"
                onClick={() => toast.info(t(`${H}.indicators.openOrigin`, { id: indicator.link ?? '' }))}
              >
                <StatusBadge label={indicator.label} variant={indicator.tone} tooltip={indicator.tooltip} />
              </button>
            ) : (
              <StatusBadge key={indicator.id} label={indicator.label} variant={indicator.tone} tooltip={indicator.tooltip} />
            ),
          )}
        </div>
      )}
    </>
  );

  const banners = model.banners.length ? (
    <div className="px-8 pb-4 bg-card space-y-3">
      {model.banners.map(banner => {
        switch (banner.kind) {
          case 'readOnly':
            return <PageStateBanner key="readOnly" variant="readOnly" scope="subscription" />;
          case 'terminal':
            return (
              <PageStateBanner
                key="terminal"
                variant="terminalState"
                tone={banner.tone}
                title={banner.title}
                description={banner.description}
                action={
                  banner.action && {
                    label: banner.action.label,
                    loading: pending === 'terminal',
                    disabledReason: banner.action.disabledReason,
                    onClick: () => banner.action && play('terminal', banner.action.transition, banner.action.label),
                  }
                }
              />
            );
          case 'external':
            return <PageStateBanner key="external" variant="externalReview" who={banner.who} />;
          case 'hypothesis':
            return <PageStateBanner key="hypothesis" variant="hypothesis" ids={banner.ids} />;
        }
      })}
    </div>
  ) : null;

  return { model, status, details, banners };
}
