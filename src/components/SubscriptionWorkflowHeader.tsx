import { useMemo, type ReactNode } from 'react';
import { Ban, Hourglass, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { useWorkflowScenario } from '../utils/workflowScenarioContext';
import { buildHeaderModel, type HeaderModel } from '../utils/workflowSimulator/header';
import { useWorkflowActions } from './WorkflowActions';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { PageStateBanner } from './ui/page-state-banner';
import { DisabledReason } from './ui/disabled-reason';
import { PageHeaderSubtitle, PageHeaderSubtitleItem } from './ui/page-header';

const H = 'subscriptions.workflowSimulator.header';

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
  const { menu, request, pending } = useWorkflowActions();

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

  const status = (
    <StatusBadge
      label={model.status.label}
      variant={model.status.tone}
      icon={model.status.cancelled ? Ban : undefined}
      tooltip={model.status.tooltip}
    />
  );

  const expected = menu?.placement === 'page' && !model.terminal ? menu.primary : null;
  const details = (
    <>
      <PageHeaderSubtitle>
        <PageHeaderSubtitleItem icon={Hourglass}>
          {model.waitingOn.length
            ? t(`${H}.waitingOn`, { who: model.waitingOn.join(', ') })
            : t(`${H}.waitingOnUnknown`)}
        </PageHeaderSubtitleItem>
        {expected && (
          <DisabledReason reason={expected.disabledReason}>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0"
            disabled={pending === expected.code || expected.disabled}
            onClick={() => request(expected)}
          >
            {pending === expected.code && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {t(`${H}.expectedAction`, { action: expected.label })}
          </Button>
          </DisabledReason>
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
                action={(() => {
                  const back = banner.action;
                  if (!back) return undefined;
                  const menuAction = menu?.all.find(a => a.code === back.transition.trigger);
                  return {
                    label: back.label,
                    loading: Boolean(menuAction && pending === menuAction.code),
                    disabledReason: menuAction?.disabledReason ?? (menuAction ? undefined : back.disabledReason ?? t(`${H}.terminal.notForRole`, { state: model.status.label })),
                    onClick: () => menuAction && request(menuAction),
                  };
                })()}
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
