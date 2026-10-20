import { useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Layers, Target } from 'lucide-react';

import { useTranslation } from '../../../utils/languageContext';
import {
  FundCallSettings,
  ShareInput,
  WizardSubscription,
  alreadyCalled,
  parseNumber,
  proposedPercent,
  remainingToCall,
  shareAmount,
} from '../../../utils/capitalCallWizard';
import { ColumnConfig, DataTable } from '../../DataTable';
import { StatusBadge } from '../../StatusBadge';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Checkbox } from '../../ui/checkbox';
import { DisabledReason } from '../../ui/disabled-reason';
import { FormField, SuffixInput } from '../../ui/form-field';
import { ListingCard } from '../../ui/listing';
import { SegmentedControl } from '../../ui/segmented-control';
import { SidePanelSection } from '../../ui/side-panel';
import { WidgetCard } from '../../ui/widget-card';

const K = 'funds.capitalCalls.wizard.amounts';

export type AmountsMode = 'perShare' | 'toRaise';

interface WizardAmountsStepProps {
  shares: string[];
  subscriptions: WizardSubscription[];
  settings: FundCallSettings;
  currency: string;
  inputs: Record<string, ShareInput>;
  mode: AmountsMode;
  amountToRaise: string;
  errors: Record<string, string>;
  onModeChange: (mode: AmountsMode) => void;
  onAmountToRaiseChange: (value: string) => void;
  onShareChange: (share: string, patch: Partial<ShareInput>) => void;
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  suffix: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  labelAside?: ReactNode;
  /** Saisie posée sur fond blanc (cellule de tableau) : contour visible. */
  outlined?: boolean;
  onChange: (value: string) => void;
}

function NumberField({ id, label, value, suffix, error, hint, hideLabel, labelAside, outlined, onChange }: NumberFieldProps) {
  return (
    <FormField id={id} label={label} error={error} hint={hint} hideLabel={hideLabel} labelAside={labelAside}>
      <SuffixInput
        id={id}
        suffix={suffix}
        className={outlined ? 'border-border' : undefined}
        value={value}
        onChange={event => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
    </FormField>
  );
}

export function WizardAmountsStep({
  shares,
  subscriptions,
  settings,
  currency,
  inputs,
  mode,
  amountToRaise,
  errors,
  onModeChange,
  onAmountToRaiseChange,
  onShareChange,
}: WizardAmountsStepProps) {
  const { t, lang } = useTranslation();
  const [openRestrictions, setOpenRestrictions] = useState<Record<string, boolean>>({});
  const money = (value: number, digits = 0) =>
    new Intl.NumberFormat(lang, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  const currencySymbol =
    new Intl.NumberFormat(lang, { style: 'currency', currency }).formatToParts(0).find(part => part.type === 'currency')
      ?.value ?? currency;
  const perShareSubscriptions = (share: string) => subscriptions.filter(item => item.share === share);
  const amountOf = (share: string) => shareAmount(inputs[share], perShareSubscriptions(share), settings);
  const total = shares.reduce((sum, share) => sum + amountOf(share), 0);
  const sum = (items: WizardSubscription[], pick: (item: WizardSubscription) => number) =>
    items.reduce((value, item) => value + pick(item), 0);

  const activeSettings = (
    [
      ['perUnit', settings.perUnit],
      ['netFlow', settings.netFlow],
      ['capAt100', settings.capAt100],
      ['combinedNotices', settings.combinedNotices],
    ] as const
  ).filter(([, active]) => active);

  const settingsLine = (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>{t(`${K}.settings.label`)}</span>
      {activeSettings.length === 0 ? (
        <span>{t(`${K}.settings.none`)}</span>
      ) : (
        activeSettings.map(([key]) => <StatusBadge key={key} label={t(`${K}.settings.${key}`)} variant="outline" />)
      )}
      <span aria-hidden>·</span>
      <span>{t(`${K}.allocation.${settings.perUnit ? 'perUnit' : settings.allocation}`)}</span>
    </div>
  );

  const toRaiseValue = parseNumber(amountToRaise) ?? 0;
  const gap = toRaiseValue - total;

  type RaiseRow = { id: number; share: string };
  const raiseColumns: ColumnConfig<RaiseRow>[] = [
    {
      key: 'share',
      label: t(`${K}.columns.share`),
      render: row => <span className="whitespace-nowrap text-sm font-medium">{t('funds.detail.sharePrefix', { name: row.share })}</span>,
    },
    {
      key: 'committed',
      label: t(`${K}.columns.committed`),
      align: 'right',
      render: row => <span className="text-sm">{money(sum(perShareSubscriptions(row.share), item => item.committed))}</span>,
    },
    {
      key: 'called',
      label: t(`${K}.columns.called`),
      align: 'right',
      render: row => <span className="text-sm">{money(sum(perShareSubscriptions(row.share), alreadyCalled))}</span>,
    },
    {
      key: 'remainingBefore',
      label: t(`${K}.columns.remainingBefore`),
      align: 'right',
      render: row => <span className="text-sm">{money(sum(perShareSubscriptions(row.share), remainingToCall))}</span>,
    },
    {
      key: 'percent',
      label: t(`${K}.columns.percent`),
      align: 'right',
      render: row => (
        <div className="ml-auto w-28" onClick={event => event.stopPropagation()}>
          <NumberField
            id={`raise-${row.share}`}
            label={t(`${K}.percentFor`, { share: row.share })}
            hideLabel
            outlined
            value={inputs[row.share].value}
            suffix="%"
            error={errors[row.share]}
            onChange={value => onShareChange(row.share, { kind: 'percent', value })}
          />
        </div>
      ),
    },
    {
      key: 'amount',
      label: t(`${K}.columns.amount`),
      align: 'right',
      render: row => <span className="text-sm font-medium">{money(amountOf(row.share))}</span>,
    },
    {
      key: 'remainingAfter',
      label: t(`${K}.columns.remainingAfter`),
      align: 'right',
      render: row => (
        <span className="text-sm">{money(sum(perShareSubscriptions(row.share), remainingToCall) - amountOf(row.share))}</span>
      ),
    },
  ];

  const shareCard = (share: string): ReactNode => {
    const input = inputs[share];
    const items = perShareSubscriptions(share);
    const restrictionOpen = openRestrictions[share] ?? input.restriction !== null;
    const unitSuffix = t(`${K}.perUnitSuffix`, { currency: currencySymbol });
    return (
      <SidePanelSection
        key={share}
        icon={Layers}
        title={t('funds.detail.sharePrefix', { name: share })}
        description={t(`${K}.shareSummary`, {
          committed: money(sum(items, item => item.committed)),
          count: items.length,
        })}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {settings.perUnit ? (
              <NumberField
                id={`value-${share}`}
                label={t(`${K}.fields.perUnit`)}
                value={input.value}
                suffix={unitSuffix}
                error={errors[share]}
                onChange={value => onShareChange(share, { value })}
              />
            ) : (
              <NumberField
                id={`value-${share}`}
                label={t(`${K}.fields.value`)}
                value={input.value}
                suffix={input.kind === 'percent' ? '%' : currencySymbol}
                error={errors[share]}
                hint={t(`${K}.notCalledPlaceholder`)}
                labelAside={
                  <SegmentedControl
                    options={[
                      { value: 'percent', label: t(`${K}.kinds.percent`) },
                      { value: 'amount', label: t(`${K}.kinds.amount`) },
                    ]}
                    value={input.kind}
                    onValueChange={kind => onShareChange(share, { kind, value: '' })}
                    size="sm"
                  />
                }
                onChange={value => onShareChange(share, { value })}
              />
            )}
            <NumberField
              id={`recall-${share}`}
              label={t(settings.perUnit ? `${K}.fields.recallPerUnit` : `${K}.fields.recall`)}
              value={input.recall}
              suffix={settings.perUnit ? unitSuffix : currencySymbol}
              onChange={recall => onShareChange(share, { recall })}
            />
            {(settings.netFlow || settings.perUnit) && (
              <NumberField
                id={`net-${share}`}
                label={t(settings.perUnit ? `${K}.fields.netFlowPerUnit` : `${K}.fields.netFlow`)}
                value={input.netFlow}
                suffix={settings.perUnit ? unitSuffix : currencySymbol}
                onChange={netFlow => onShareChange(share, { netFlow })}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={input.callEntryFees}
                  onCheckedChange={checked => onShareChange(share, { callEntryFees: checked === true })}
                />
                {t(`${K}.fields.entryFees`)}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={input.callPremium}
                  onCheckedChange={checked => onShareChange(share, { callPremium: checked === true })}
                />
                {t(`${K}.fields.premium`)}
              </label>
            </div>
            <span className="text-sm">
              {t(`${K}.shareAmount`)} <span className="font-semibold tabular-nums">{money(amountOf(share))}</span>
            </span>
          </div>

          <Collapsible
            open={restrictionOpen}
            onOpenChange={open => setOpenRestrictions(prev => ({ ...prev, [share]: open }))}
            className="border-t border-border pt-3"
          >
            <CollapsibleTrigger className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              {restrictionOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {t(`${K}.restriction.toggle`)}
              {input.restriction && (
                <span className="text-xs text-muted-foreground">
                  {t(`${K}.restriction.selected`, { count: input.restriction.length, total: items.length })}
                </span>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">{t(`${K}.restriction.hint`)}</p>
              <div className="grid max-h-60 grid-cols-1 gap-1 overflow-y-auto md:grid-cols-2">
                {items.map(item => (
                  <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted">
                    <Checkbox
                      checked={input.restriction?.includes(item.id) ?? false}
                      onCheckedChange={checked => {
                        const current = input.restriction ?? [];
                        const next = checked ? [...current, item.id] : current.filter(id => id !== item.id);
                        onShareChange(share, { restriction: next.length > 0 ? next : null });
                      }}
                    />
                    <span className="truncate">{item.investor}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{item.id}</span>
                  </label>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </SidePanelSection>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DisabledReason reason={settings.perUnit ? t(`${K}.toRaiseUnavailable`) : null}>
          <SegmentedControl<AmountsMode>
            options={[
              { value: 'perShare', label: t(`${K}.modes.perShare`) },
              { value: 'toRaise', label: t(`${K}.modes.toRaise`), disabled: settings.perUnit },
            ]}
            value={mode}
            onValueChange={onModeChange}
          />
        </DisabledReason>
        {settingsLine}
      </div>

      {mode === 'perShare' ? (
        <div className="space-y-4">{shares.map(shareCard)}</div>
      ) : (
        <div className="space-y-4">
          <SidePanelSection icon={Target} title={t(`${K}.modes.toRaise`)}>
            <div className="max-w-xs">
              <NumberField
                id="amount-to-raise"
                label={t(`${K}.toRaise.label`)}
                hideLabel
                value={amountToRaise}
                suffix={currencySymbol}
                onChange={onAmountToRaiseChange}
              />
            </div>
            {toRaiseValue > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t(`${K}.toRaise.proposal`, {
                  percent: new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format(
                    proposedPercent(toRaiseValue, subscriptions),
                  ),
                })}
              </p>
            )}
          </SidePanelSection>
          <ListingCard>
            <DataTable
              data={shares.map((share, index) => ({ id: index + 1, share }))}
              columns={raiseColumns}
              hoveredRow={null}
              setHoveredRow={() => undefined}
              onRowClick={() => undefined}
              sortConfig={null}
              onSort={() => undefined}
              compactMode
              hideSelection
              density="compact"
              footer={{
                share: t(`${K}.columns.total`),
                committed: money(sum(subscriptions, item => item.committed)),
                called: money(sum(subscriptions, alreadyCalled)),
                remainingBefore: money(sum(subscriptions, remainingToCall)),
                amount: money(total),
                remainingAfter: money(sum(subscriptions, remainingToCall) - total),
              }}
            />
          </ListingCard>
          {toRaiseValue > 0 && Math.abs(gap) >= 0.01 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t(`${K}.toRaise.gapTitle`)}</AlertTitle>
              <AlertDescription>
                {t(gap > 0 ? `${K}.toRaise.gapBelow` : `${K}.toRaise.gapAbove`, { amount: money(Math.abs(gap)) })}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <WidgetCard title={t(`${K}.total`)}>
        <p className="text-right text-lg font-semibold tabular-nums" aria-live="polite">
          {money(total, 2)}
        </p>
      </WidgetCard>
    </div>
  );
}
