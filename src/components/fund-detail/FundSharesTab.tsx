import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Ban,
  Copy,
  Eye,
  FileSignature,
  Landmark,
  LineChart,
  Lock,
  MoreHorizontal,
  Plus,
  Receipt,
  Trash2,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { FieldTarget, FundDetail, FundShare } from '../../utils/fundDetailMock';
import { DataTable, type ColumnConfig } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { BlockersPanel } from '../ui/blockers-panel';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { DisabledReason } from '../ui/disabled-reason';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { WIDGET_TITLE_CLASS } from '../ui/utils';
import { FundSharePage, type ShareTarget } from './shares/FundSharePage';
import { valuesToShare, type ShareValues } from './shares/shareSchema';

const K = 'funds.detail.shares';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ShareRow {
  id: number;
  share: FundShare;
}

type SortKey = 'name' | 'isin' | 'mode' | 'nominal' | 'reference' | 'managementFee' | 'entryFee' | 'subscribed' | 'called' | 'lastNav';

interface FundSharesTabProps {
  detail: FundDetail;
  /** Périodicité des commissions du fonds (onglet Paramètres). */
  fundPeriodicity: string;
  target: FieldTarget | null;
  onTargetHandled: () => void;
  canEdit: boolean;
  editReason?: string;
  onOpenNavs: () => void;
  onSharesChange: (shares: FundShare[]) => void;
  onDirtyChange: (dirty: boolean) => void;
}

const referenceValue = (share: FundShare) =>
  share.referencePrice === 'lastNav' ? share.lastNav?.value ?? null : share.nominalPrice;

export function FundSharesTab({
  detail,
  fundPeriodicity,
  target,
  onTargetHandled,
  canEdit,
  editReason,
  onOpenNavs,
  onSharesChange,
  onDirtyChange,
}: FundSharesTabProps) {
  const { t, lang } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [closing, setClosing] = useState<FundShare | null>(null);
  const [deleting, setDeleting] = useState<FundShare | null>(null);
  const [pending, setPending] = useState<null | 'close' | 'delete' | 'duplicate'>(null);

  const isCalls = detail.paymentMode === 'calls';
  const actionReason = !canEdit ? t('funds.detail.reasons.noEditRight') : editReason;
  const money = (value: number) => formatCurrency(value, detail.currency);
  // Même nombre de décimales sur toutes les lignes : les colonnes de frais se comparent d'un coup d'œil.
  const feeFormat = new Intl.NumberFormat(lang, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const calledFormat = new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 });
  const priceFormat = (value: number) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency: detail.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  // Lien "Prix à renseigner" de la vue d'ensemble : ouvre la fiche de la part sur son prix nominal.
  useEffect(() => {
    if (!target || target.tab !== 'shares') return;
    if (detail.shares.some(share => share.id === target.fieldId)) {
      setOpenId(target.fieldId);
      setShareTarget({ sectionId: 'pricing', fieldId: 'nominalPrice' });
    }
    onTargetHandled();
  }, [target, onTargetHandled, detail.shares]);

  const openShare = detail.shares.find(share => share.id === openId) ?? null;

  useEffect(() => {
    if (!openShare) onDirtyChange(false);
  }, [openShare, onDirtyChange]);

  const updateShare = (id: string, update: (share: FundShare) => FundShare) =>
    onSharesChange(detail.shares.map(share => (share.id === id ? update(share) : share)));

  const nextId = () => `share-${Date.now().toString(36)}`;

  const createShare = () => {
    const used = new Set(detail.shares.map(share => share.name));
    const letter = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)).find(item => !used.has(item)) ?? 'Z';
    const base = detail.shares[0];
    const share: FundShare = {
      ...base,
      id: nextId(),
      name: letter,
      isin: '',
      externalId: '',
      description: { fr: '', en: '' },
      customFields: {},
      subscribed: 0,
      called: 0,
      lastNav: null,
      closed: false,
      operators: [],
      restricted: false,
      carried: false,
      lemonwayDebit: false,
      deleteBlockers: { subscriptions: 0, navs: 0, operations: 0 },
    };
    onSharesChange([...detail.shares, share]);
    setShareTarget({ sectionId: 'identification', fieldId: 'name' });
    setOpenId(share.id);
    toast.success(t(`${K}.toast.created`, { name: letter }));
  };

  const duplicate = async (source: FundShare) => {
    setPending('duplicate');
    await wait(600);
    const copy: FundShare = {
      ...source,
      id: nextId(),
      name: t(`${K}.copyName`, { name: source.name }),
      isin: '',
      lastNav: null,
      subscribed: 0,
      called: 0,
      closed: false,
      deleteBlockers: { subscriptions: 0, navs: 0, operations: 0 },
    };
    onSharesChange([...detail.shares, copy]);
    setPending(null);
    setShareTarget(null);
    setOpenId(copy.id);
    toast.success(t(`${K}.toast.duplicated`, { name: copy.name }));
  };

  const confirmClose = async () => {
    if (!closing) return;
    setPending('close');
    await wait(800);
    updateShare(closing.id, share => ({ ...share, closed: true }));
    toast.success(t(`${K}.toast.closed`, { name: closing.name }));
    setPending(null);
    setClosing(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setPending('delete');
    await wait(800);
    onSharesChange(detail.shares.filter(share => share.id !== deleting.id));
    toast.success(t(`${K}.toast.deleted`, { name: deleting.name }));
    if (openId === deleting.id) setOpenId(null);
    setPending(null);
    setDeleting(null);
  };

  const deleteBlocked = deleting
    ? deleting.deleteBlockers.subscriptions + deleting.deleteBlockers.navs + deleting.deleteBlockers.operations > 0
    : false;

  const rows: ShareRow[] = useMemo(() => {
    const list = detail.shares.map((share, index) => ({ id: index, share }));
    if (!sortConfig) return list;
    const value = (share: FundShare): string | number => {
      switch (sortConfig.key as SortKey) {
        case 'name':
          return share.name;
        case 'isin':
          return share.isin;
        case 'mode':
          return t(`${K}.mode.${share.mode}`);
        case 'nominal':
          return share.nominalPrice ?? -1;
        case 'reference':
          return referenceValue(share) ?? -1;
        case 'managementFee':
          return share.managementFee;
        case 'entryFee':
          return share.entryFee;
        case 'subscribed':
          return share.subscribed;
        case 'called':
          return share.called;
        case 'lastNav':
          return share.lastNav?.value ?? -1;
        default:
          return 0;
      }
    };
    const factor = sortConfig.direction === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const left = value(a.share);
      const right = value(b.share);
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return String(left).localeCompare(String(right), lang) * factor;
    });
  }, [detail.shares, sortConfig, lang, t]);

  if (openShare) {
    return (
      <>
        <FundSharePage
          key={openShare.id}
          share={openShare}
          detail={detail}
          fundPeriodicity={fundPeriodicity}
          canEdit={canEdit}
          editReason={editReason}
          initialTarget={shareTarget}
          onBack={() => {
            setOpenId(null);
            setShareTarget(null);
          }}
          onSave={(changes: ShareValues) => updateShare(openShare.id, share => valuesToShare(share, changes))}
          onOpenNavs={onOpenNavs}
          onDuplicate={() => duplicate(openShare)}
          onClose={() => setClosing(openShare)}
          onDelete={() => setDeleting(openShare)}
          onDirtyChange={onDirtyChange}
        />
        {renderDialogs()}
      </>
    );
  }

  const flag = (key: string, Icon: typeof Lock) => (
    <Tooltip key={key}>
      <TooltipTrigger asChild>
        <span tabIndex={0} aria-label={t(`${K}.flags.${key}`)} className="inline-flex text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-xs">{t(`${K}.flags.${key}`)}</span>
      </TooltipContent>
    </Tooltip>
  );

  const columns: ColumnConfig<ShareRow>[] = ([

    {
      key: 'name',
      label: t(`${K}.columns.name`),
      sortable: true,
      render: ({ share }) => (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <span className="font-medium text-primary hover:underline">{t('funds.detail.sharePrefix', { name: share.name })}</span>
          {share.restricted && flag('restricted', Lock)}
          {share.carried && flag('carried', Trophy)}
          {share.lemonwayDebit && detail.modules.lemonway && flag('lemonway', Landmark)}
          {share.closed && <StatusBadge label={t(`${K}.closed`)} variant="neutral" icon={Ban} />}
        </span>
      ),
    },
    {
      key: 'isin',
      label: t(`${K}.columns.isin`),
      sortable: true,
      render: ({ share }) =>
        share.isin ? (
          <span className="font-mono text-xs text-muted-foreground">{share.isin}</span>
        ) : (
          <span className="text-muted-foreground/60 italic">{t('common.sectionCard.notProvided')}</span>
        ),
    },
    {
      key: 'mode',
      label: t(`${K}.columns.mode`),
      sortable: true,
      render: ({ share }) => <span className="text-sm">{t(`${K}.mode.${share.mode}`)}</span>,
    },
    {
      key: 'nominal',
      label: t(`${K}.columns.nominal`),
      sortable: true,
      align: 'right',
      render: ({ share }) =>
        share.nominalPrice !== null ? (
          <span className="text-sm">{priceFormat(share.nominalPrice)}</span>
        ) : (
          <StatusBadge label={t(`${K}.priceMissing`)} variant="danger" />
        ),
    },
    {
      key: 'reference',
      label: t(`${K}.columns.referencePrice`),
      sortable: true,
      align: 'right',
      render: ({ share }) => {
        const value = referenceValue(share);
        return (
          <span className="text-sm">
            {value !== null ? priceFormat(value) : <span className="text-muted-foreground/60 italic">{t('common.sectionCard.notProvided')}</span>}
            <span className="block whitespace-nowrap text-xs text-muted-foreground">{t(`${K}.referencePriceShort.${share.referencePrice}`)}</span>
          </span>
        );
      },
    },
    {
      key: 'managementFee',
      label: t(`${K}.columns.managementFee`),
      sortable: true,
      align: 'right',
      render: ({ share }) => <span className="text-sm">{feeFormat.format(share.managementFee / 100)}</span>,
    },
    {
      key: 'entryFee',
      label: t(`${K}.columns.entryFee`),
      sortable: true,
      align: 'right',
      render: ({ share }) => <span className="text-sm">{feeFormat.format(share.entryFee / 100)}</span>,
    },
    {
      key: 'subscribed',
      label: t(`${K}.columns.subscribed`),
      sortable: true,
      align: 'right',
      render: ({ share }) => <span className="text-sm">{money(share.subscribed)}</span>,
    },
    ...(isCalls
      ? [
          {
            key: 'called',
            label: t(`${K}.columns.called`),
            sortable: true,
            align: 'right' as const,
            render: ({ share }: ShareRow) => (
              <span className="text-sm">
                {money(share.called)}
                <span className="block text-xs text-muted-foreground">
                  {calledFormat.format(share.subscribed > 0 ? share.called / share.subscribed : 0)}
                </span>
              </span>
            ),
          },
        ]
      : []),
    {
      key: 'lastNav',
      label: t(`${K}.columns.lastNav`),
      sortable: true,
      align: 'right',
      render: ({ share }) =>
        share.lastNav ? (
          <span className="text-sm">
            {priceFormat(share.lastNav.value)}
            <span className="block text-xs text-muted-foreground">{formatDate(share.lastNav.date)}</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground/60 italic">{t(`${K}.noNav`)}</span>
        ),
    },
    {
      key: 'actions',
      label: t(`${K}.columns.actions`),
      align: 'right',
      render: ({ share }) => (
        <div onClick={event => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t(`${K}.actionsFor`, { name: share.name })}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenId(share.id)}>
                <Eye className="w-4 h-4" />
                {t(`${K}.actions.open`)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenNavs}>
                <LineChart className="w-4 h-4" />
                {t(`${K}.actions.navs`)}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <MenuAction icon={Copy} label={t(`${K}.actions.duplicate`)} reason={actionReason} onClick={() => duplicate(share)} />
              <MenuAction
                icon={XCircle}
                label={t(`${K}.actions.close`)}
                reason={actionReason ?? (share.closed ? t(`${K}.alreadyClosed`) : undefined)}
                onClick={() => setClosing(share)}
              />
              <MenuAction icon={Trash2} label={t(`${K}.actions.delete`)} reason={actionReason} destructive onClick={() => setDeleting(share)} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ] as ColumnConfig<ShareRow>[]).map(column => ({ ...column, className: 'px-3 first:pl-6 last:pr-6' }));

  function renderDialogs() {
    return (
      <>
        <ConfirmDialog
          open={closing !== null}
          onOpenChange={open => !open && setClosing(null)}
          title={t(`${K}.closeDialog.title`, { name: closing?.name ?? '' })}
          description={t(`${K}.closeDialog.description`)}
          confirmLabel={t(`${K}.closeDialog.confirm`)}
          destructive
          loading={pending === 'close'}
          onConfirm={confirmClose}
        />

        <ConfirmDialog
          open={deleting !== null && !deleteBlocked}
          onOpenChange={open => !open && setDeleting(null)}
          title={t(`${K}.deleteDialog.title`, { name: deleting?.name ?? '' })}
          description={t(`${K}.deleteDialog.description`)}
          confirmLabel={t(`${K}.deleteDialog.confirm`)}
          destructive
          loading={pending === 'delete'}
          onConfirm={confirmDelete}
        />

        <Dialog open={deleting !== null && deleteBlocked} onOpenChange={open => !open && setDeleting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t(`${K}.deleteDialog.title`, { name: deleting?.name ?? '' })}</DialogTitle>
              <DialogDescription>{t(`${K}.blockers.intro`)}</DialogDescription>
            </DialogHeader>
            {deleting && (
              <BlockersPanel
                title={t(`${K}.blockers.title`)}
                description={t(`${K}.blockers.description`)}
                blockers={(
                  [
                    ['subscriptions', FileSignature],
                    ['navs', LineChart],
                    ['operations', Receipt],
                  ] as const
                )
                  .filter(([key]) => deleting.deleteBlockers[key] > 0)
                  .map(([key, icon]) => ({
                    id: key,
                    icon,
                    label: t(`${K}.blockers.${key}`),
                    count: deleting.deleteBlockers[key],
                    onOpen:
                      key === 'navs'
                        ? () => {
                            setDeleting(null);
                            onOpenNavs();
                          }
                        : undefined,
                  }))}
                alternative={{
                  label: t(`${K}.blockers.alternative`),
                  description: t(`${K}.blockers.alternativeDescription`),
                  disabledReason: deleting.closed ? t(`${K}.alreadyClosed`) : undefined,
                  onAction: () => {
                    const share = deleting;
                    setDeleting(null);
                    setClosing(share);
                  },
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden p-0 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className={WIDGET_TITLE_CLASS}>{t(`${K}.title`, { count: detail.shares.length })}</h3>
        <DisabledReason reason={actionReason}>
          <Button size="sm" onClick={createShare} disabled={Boolean(actionReason)}>
            <Plus className="w-4 h-4" />
            {t(`${K}.add`)}
          </Button>
        </DisabledReason>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        hoveredRow={hoveredRow}
        setHoveredRow={setHoveredRow}
        onRowClick={row => {
          setShareTarget(null);
          setOpenId(row.share.id);
        }}
        sortConfig={sortConfig}
        onSort={key =>
          setSortConfig(current => {
            if (!current || current.key !== key) return { key, direction: 'asc' };
            if (current.direction === 'asc') return { key, direction: 'desc' };
            return null;
          })
        }
        compactMode
        hideSelection
      />
      {renderDialogs()}
    </Card>
  );
}

function MenuAction({
  icon: Icon,
  label,
  reason,
  destructive,
  onClick,
}: {
  icon: typeof Copy;
  label: string;
  reason?: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <DropdownMenuItem variant={destructive ? 'destructive' : undefined} onClick={onClick} disabled={Boolean(reason)}>
      <Icon className="w-4 h-4" />
      <span className="flex flex-col">
        <span>{label}</span>
        {reason && <span className="text-xs text-muted-foreground">{reason}</span>}
      </span>
    </DropdownMenuItem>
  );
}
