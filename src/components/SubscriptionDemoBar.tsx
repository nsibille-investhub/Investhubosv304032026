import { FlaskConical, RotateCcw, SlidersHorizontal } from 'lucide-react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { useTranslation } from '../utils/languageContext';
import {
  INTEGRATION_KEYS,
  INTEGRATION_LABELS,
  SUBSCRIPTION_DEMO_STATES,
  SUBSCRIPTION_DEMO_STATE_LABEL_KEYS,
  useSubscriptionDemo,
  type IntegrationKey,
  type SubscriptionDemoRights,
  type SubscriptionDemoSettings,
  type SubscriptionDemoStateId,
} from '../utils/subscriptionDemoContext';

const SETTING_LABEL_KEYS: Array<{ key: keyof SubscriptionDemoSettings; labelKey: string }> = [
  { key: 'internalValidation', labelKey: 'subscriptions.detail.demo.settings.internalValidation' },
  { key: 'riskEngine', labelKey: 'subscriptions.detail.demo.settings.riskEngine' },
  { key: 'externalRiskAnalysis', labelKey: 'subscriptions.detail.demo.settings.externalRiskAnalysis' },
  { key: 'signatoriesPanel', labelKey: 'subscriptions.detail.demo.settings.signatoriesPanel' },
  { key: 'partnerSignature', labelKey: 'subscriptions.detail.demo.settings.partnerSignature' },
  { key: 'directSignaturePartner', labelKey: 'subscriptions.detail.demo.settings.directSignaturePartner' },
  { key: 'counterSignatoryChoice', labelKey: 'subscriptions.detail.demo.settings.counterSignatoryChoice' },
  { key: 'screeningCommentRequired', labelKey: 'subscriptions.detail.demo.settings.screeningComment' },
  { key: 'scoreRefresh', labelKey: 'subscriptions.detail.demo.settings.scoreRefresh' },
];

const RIGHT_LABEL_KEYS: Array<{ key: keyof SubscriptionDemoRights; labelKey: string }> = [
  { key: 'validateFund', labelKey: 'subscriptions.detail.demo.rights.validateFund' },
  { key: 'validateCompliance', labelKey: 'subscriptions.detail.demo.rights.validateCompliance' },
  { key: 'screening', labelKey: 'subscriptions.detail.demo.rights.screening' },
];

const FLAG_LABEL_KEYS: Array<{ key: 'deferredProcessing' | 'administered' | 'subscriptionTypeSet' | 'transferOrigin'; labelKey: string }> = [
  { key: 'deferredProcessing', labelKey: 'subscriptions.detail.demo.flags.deferredProcessing' },
  { key: 'administered', labelKey: 'subscriptions.detail.demo.flags.administered' },
  { key: 'subscriptionTypeSet', labelKey: 'subscriptions.detail.demo.flags.subscriptionTypeSet' },
  { key: 'transferOrigin', labelKey: 'subscriptions.detail.demo.flags.transferOrigin' },
];

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-xs text-foreground/90">
      <span className="min-w-0 truncate">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}

/**
 * Sélecteur d'état de démonstration : rend lisibles les conditions qui, en V1,
 * font apparaître ou disparaître des panneaux entiers de la fiche.
 */
export function SubscriptionDemoBar() {
  const { t } = useTranslation();
  const { config, setState, setSetting, setIntegration, setRight, setFlag, reset } =
    useSubscriptionDemo();

  const hiddenPanels = [
    !config.settings.riskEngine && t('subscriptions.detail.demo.settings.riskEngine'),
    !config.settings.externalRiskAnalysis &&
      t('subscriptions.detail.demo.settings.externalRiskAnalysis'),
    !config.settings.signatoriesPanel && t('subscriptions.detail.demo.settings.signatoriesPanel'),
    !config.rights.screening && t('subscriptions.detail.demo.rights.screening'),
  ].filter((item): item is string => typeof item === 'string');

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-border bg-muted/40 px-8 py-2">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <FlaskConical className="w-3.5 h-3.5" />
        {t('subscriptions.detail.demo.title')}
      </span>

      <Select
        value={config.state}
        onValueChange={value => setState(value as SubscriptionDemoStateId)}
      >
        <SelectTrigger className="h-8 w-[260px] text-xs" aria-label={t('subscriptions.detail.demo.stateLabel')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUBSCRIPTION_DEMO_STATES.map(state => (
            <SelectItem key={state} value={state} className="text-xs">
              {t(SUBSCRIPTION_DEMO_STATE_LABEL_KEYS[state])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t('subscriptions.detail.demo.configure')}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] max-h-[70vh] overflow-y-auto p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('subscriptions.detail.demo.sections.settings')}
          </p>
          <div className="mt-1 divide-y divide-border/60">
            {SETTING_LABEL_KEYS.map(item => (
              <ToggleRow
                key={item.key}
                label={t(item.labelKey)}
                checked={Boolean(config.settings[item.key])}
                onChange={value => setSetting(item.key, value as never)}
              />
            ))}
          </div>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('subscriptions.detail.demo.sections.integrations')}
          </p>
          <div className="mt-1 divide-y divide-border/60">
            {INTEGRATION_KEYS.map((key: IntegrationKey) => (
              <ToggleRow
                key={key}
                label={INTEGRATION_LABELS[key]}
                checked={config.settings.integrations[key]}
                onChange={value => setIntegration(key, value)}
              />
            ))}
          </div>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('subscriptions.detail.demo.sections.rights')}
          </p>
          <div className="mt-1 divide-y divide-border/60">
            {RIGHT_LABEL_KEYS.map(item => (
              <ToggleRow
                key={item.key}
                label={t(item.labelKey)}
                checked={config.rights[item.key]}
                onChange={value => setRight(item.key, value)}
              />
            ))}
          </div>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('subscriptions.detail.demo.sections.flags')}
          </p>
          <div className="mt-1 divide-y divide-border/60">
            {FLAG_LABEL_KEYS.map(item => (
              <ToggleRow
                key={item.key}
                label={t(item.labelKey)}
                checked={config.flags[item.key]}
                onChange={value => setFlag(item.key, value)}
              />
            ))}
          </div>

          <Button variant="ghost" size="sm" className="mt-3 h-8 w-full gap-1.5 text-xs" onClick={reset}>
            <RotateCcw className="w-3.5 h-3.5" />
            {t('subscriptions.detail.demo.reset')}
          </Button>
        </PopoverContent>
      </Popover>

      {hiddenPanels.length > 0 && (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
          {t('subscriptions.detail.demo.hiddenPanels', { list: hiddenPanels.join(', ') })}
        </Badge>
      )}
    </div>
  );
}
