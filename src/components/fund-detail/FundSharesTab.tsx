import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import {
  Copy,
  CreditCard,
  Eye,
  FileSignature,
  Gem,
  LineChart,
  Lock,
  MoreHorizontal,
  Plus,
  Receipt,
  Trash2,
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
import type { SettingsValues } from './settings/settingsSchema';
import { FundShareSheet } from './shares/FundShareSheet';
import { applyShareValues, duplicateShare, newShare } from './shares/shareValues';

const K = 'funds.detail.shares';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Row = Omit<FundShare, 'id'> & { id: number; shareId: string };
type SortKey = 'name' | 'isin' | 'mode' | 'nominalPrice' | 'referencePrice' | 'managementFee' | 'entryFee' | 'subscribed' | 'called' | 'lastNav';

interface FundSharesTabProps {
  detail: FundDetail;
  shareValues: Record<string, SettingsValues>;
  fundValues: SettingsValues;
  onSharesChange: (shares: FundShare[], shareValues: Record<string, SettingsValues>) => void;
  target: FieldTarget | null;
  onTargetHandled: () => void;
  canEdit: boolean;
  editReason?: string;
  onOpenNavs: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

function Picto({ icon: Icon, label }: { icon: typeof Lock; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} aria-label={label} className="inline-flex text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-xs">{label}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export function FundSharesTab({
  detail,
  shareValues,
  fundValues,
  onSharesChange,
  target,
  onTargetHandled,
  canEdit,
  editReason,
  onOpenNavs,
  onDirtyChange,
}: FundSharesTabProps) {
  const { t, lang } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<{ sectionId: string; fieldId: string } | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [dialog, setDialog] = useState<null | { kind: 'close' | 'delete' | 'blockers'; shareId: string }>(null);
  const [pending, setPending] = useState(false);

  const shares = detail.shares;
  const money = (value: number) => formatCurrency(value, detail.currency);
  // Même nombre de décimales sur toutes les lignes : deux.
  const percentFormat = new Intl.NumberFormat(lang, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const percent = (value: number) => percentFormat.format(value / 100);
  const writeReason = !canEdit ? t('funds.detail.reasons.noEditRight') : editReason;
  const openShare = shares.find(share => share.id === openId) ?? null;
  const dialogShare = dialog ? shares.find(share => share.id === dialog.shareId) ?? null : null;

  const handleHighlightHandled = useCallback(() => setHighlight(null), []);

  // Lien "La part n'a pas de prix" de la vue d'ensemble : ouvre la fiche sur le prix nominal.
  useEffect(() => {
    if (!target || target.tab !== 'shares') return;
    setOpenId(target.fieldId);
    setHighlight({ sectionId: 'pricing', fieldId: 'nominalPrice' });
    onTargetHandled();
  }, [target, onTargetHandled]);

  useEffect(() => {
    if (!openShare) onDirtyChange(false);
  }, [openShare, onDirtyChange]);

  const nextId = () => `share-${Date.now().toString(36)}`;

  const duplicate = (share: FundShare) => {
    const { share: copy, values } = duplicateShare(share, shareValues[share.id], nextId(), t(`${K}.copySuffix`));
    onSharesChange([...shares, copy], { ...shareValues, [copy.id]: values });
    setOpenId(copy.id);
    toast.success(t(`${K}.toast.duplicated`, { name: copy.name }));
  };

  const create = () => {
    // Prochaine lettre libre (E après A à D), sinon libellé générique.
    const used = new Set(shares.map(share => share.name));
    const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(candidate => !used.has(candidate));
    const { share, values } = newShare(nextId(), letter ?? t(`${K}.newShareName`));
    onSharesChange([...shares, share], { ...shareValues, [share.id]: values });
    setOpenId(share.id);
    toast.success(t(`${K}.toast.created`));
  };

  const askDelete = (share: FundShare) => {
    // Le serveur refuse la suppression d'une part qui porte des objets (PRD section 10.4).
    const blocked = share.counts.subscriptions + share.counts.navs + share.counts.operations > 0;
    setDialog({ kind: blocked ? 'blockers' : 'delete', shareId: share.id });
  };

  const confirmClose = async () => {
    if (!dialogShare) return;
    setPending(true);
    await wait(900);
    onSharesChange(
      shares.map(share => (share.id === dialogShare.id ? { ...share, closed: true } : share)),
      shareValues,
    );
    setPending(false);
    setDialog(null);
    toast.success(t(`${K}.toast.closed`, { name: dialogShare.name }));
  };

  const confirmDelete = async () => {
    if (!dialogShare) return;
    setPending(true);
    await wait(900);
    const { [dialogShare.id]: removed, ...rest } = shareValues;
    void removed;
    onSharesChange(shares.filter(share => share.id !== dialogShare.id), rest);
    setPending(false);
    setDialog(null);
    if (openId === dialogShare.id) setOpenId(null);
    toast.success(t(`${K}.toast.deleted`, { name: dialogShare.name }));
  };

  const closeReason = (share: FundShare) => writeReason ?? (share.closed ? t('funds.detail.shareSheet.reasons.alreadyClosed') : undefined);

  const rows: Row[] = useMemo(() => {
    const list: Row[] = shares.map((share, index) => ({ ...share, id: index + 1, shareId: share.id }));
    if (!sortConfig) return list;
    const key = sortConfig.key as SortKey;
    const valueOf = (row: Row): number | string | null => {
      if (key === 'lastNav') return row.lastNav?.value ?? null;
      if (key === 'called') return row.subscribed > 0 ? row.called / row.subscribed : 0;
      return row[key] as number | string | null;
    };
    const sorted = [...list].sort((a, b) => {
      const left = valueOf(a);
      const right = valueOf(b);
      if (left === null || left === '') return 1;
      if (right === null || right === '') return -1;
      const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), lang);
      return sortConfig.direction === 'asc' ? result : -result;
    });
    return sorted;
  }, [shares, sortConfig, lang]);

  const toShare = (row: Row): FundShare => shares.find(share => share.id === row.shareId) ?? shares[0];

  const empty = <span className="text-muted-foreground/60 italic">{t('common.sectionCard.notProvided')}</span>;

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'name',
      label: t(`${K}.columns.name`),
      sortable: true,
      render: row => (
        <span className="inline-flex flex-wrap items-center gap-2 font-medium text-foreground">
          {t('funds.detail.sharePrefix', { name: row.name })}
          {row.restricted && <Picto icon={Lock} label={t(`${K}.pictos.restricted`)} />}
          {row.carried && <Picto icon={Gem} label={t(`${K}.pictos.carried`)} />}
          {row.lemonwayDebit && <Picto icon={CreditCard} label={t(`${K}.pictos.lemonway`)} />}
          {row.closed && <StatusBadge label={t(`${K}.closed`)} variant="neutral" icon={XCircle} />}
        </span>
      ),
    },
    {
      key: 'isin',
      label: t(`${K}.columns.isin`),
      sortable: true,
      render: row => (row.isin ? <span className="font-mono text-xs text-muted-foreground">{row.isin}</span> : empty),
    },
    { key: 'mode', label: t(`${K}.columns.mode`), sortable: true, render: row => t(`${K}.mode.${row.mode}`) },
    {
      key: 'nominalPrice',
      label: t(`${K}.columns.nominal`),
      sortable: true,
      align: 'right',
      render: row =>
        row.nominalPrice !== null ? money(row.nominalPrice) : <StatusBadge label={t(`${K}.priceMissing`)} variant="danger" />,
    },
    {
      key: 'referencePrice',
      label: t(`${K}.columns.referencePrice`),
      sortable: true,
      render: row => t(`funds.detail.shareSheet.options.referencePrice.${row.referencePrice}`),
    },
    { key: 'managementFee', label: t(`${K}.columns.managementFee`), sortable: true, align: 'right', render: row => percent(row.managementFee) },
    { key: 'entryFee', label: t(`${K}.columns.entryFee`), sortable: true, align: 'right', render: row => percent(row.entryFee) },
    { key: 'subscribed', label: t(`${K}.columns.subscribed`), sortable: true, align: 'right', render: row => money(row.subscribed) },
    ...(detail.paymentMode === 'calls'
      ? [
          {
            key: 'called',
            label: t(`${K}.columns.called`),
            sortable: true,
            align: 'right' as const,
            render: (row: Row) => (
              <>
                {money(row.called)}
                <span className="block text-xs text-muted-foreground">
                  {/* Pourcentage à zéro sans souscription (PRD section 10.1). */}
                  {percent(row.subscribed > 0 ? (row.called / row.subscribed) * 100 : 0)}
                </span>
              </>
            ),
          },
        ]
      : []),
    {
      key: 'lastNav',
      label: t(`${K}.columns.lastNav`),
      sortable: true,
      align: 'right',
      render: row =>
        row.lastNav ? (
          <>
            {money(row.lastNav.value)}
            <span className="block text-xs text-muted-foreground">{formatDate(row.lastNav.date)}</span>
          </>
        ) : (
          empty
        ),
    },
    {
      key: 'actions',
      label: t(`${K}.columns.actions`),
      align: 'right',
      render: row => (
        <span onClick={event => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t(`${K}.actionsFor`, { name: row.name })}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenId(row.shareId)}>
                <Eye className="w-4 h-4" />
                {t(`${K}.actions.open`)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenNavs}>
                <LineChart className="w-4 h-4" />
                {t(`${K}.actions.navs`)}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {(
                [
                  ['duplicate', Copy, () => duplicate(toShare(row)), writeReason],
                  ['close', XCircle, () => setDialog({ kind: 'close', shareId: row.shareId }), closeReason(toShare(row))],
                  ['delete', Trash2, () => askDelete(toShare(row)), writeReason],
                ] as const
              ).map(([key, Icon, onClick, reason]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={onClick}
                  disabled={Boolean(reason)}
                  variant={key === 'delete' ? 'destructive' : 'default'}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex flex-col">
                    <span>{t(`${K}.actions.${key}`)}</span>
                    {reason && <span className="text-xs text-muted-foreground">{reason}</span>}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      ),
    },
  ];

  let content: ReactNode;
  if (openShare) {
    content = (
      <FundShareSheet
        key={openShare.id}
        share={openShare}
        values={shareValues[openShare.id]}
        detail={detail}
        fundValues={fundValues}
        canEdit={canEdit}
        editReason={editReason}
        highlight={highlight}
        onHighlightHandled={handleHighlightHandled}
        onSave={changes => {
          const merged = { ...shareValues[openShare.id], ...changes };
          onSharesChange(
            shares.map(share => (share.id === openShare.id ? applyShareValues(share, merged) : share)),
            { ...shareValues, [openShare.id]: merged },
          );
        }}
        onBack={() => setOpenId(null)}
        onDirtyChange={onDirtyChange}
        onOpenNavs={onOpenNavs}
        onDuplicate={() => duplicate(openShare)}
        onClose={() => setDialog({ kind: 'close', shareId: openShare.id })}
        onDelete={() => askDelete(openShare)}
      />
    );
  } else {
    content = (
      <Card className="gap-0 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 className={WIDGET_TITLE_CLASS}>{t(`${K}.title`, { count: shares.length })}</h3>
          <DisabledReason reason={writeReason}>
            <Button size="sm" onClick={create} disabled={Boolean(writeReason)}>
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
          onRowClick={row => setOpenId(row.shareId)}
          sortConfig={sortConfig}
          onSort={key =>
            setSortConfig(prev =>
              prev?.key === key ? (prev.direction === 'asc' ? { key, direction: 'desc' } : null) : { key, direction: 'asc' },
            )
          }
          compactMode
          hideSelection
          density="compact"
        />
      </Card>
    );
  }

  return (
    <>
      {content}

      <ConfirmDialog
        open={dialog?.kind === 'close'}
        onOpenChange={open => !open && setDialog(null)}
        title={t(`${K}.dialogs.close.title`, { name: dialogShare?.name ?? '' })}
        description={t(`${K}.dialogs.close.description`)}
        confirmLabel={t(`${K}.dialogs.close.confirm`)}
        loading={pending}
        onConfirm={confirmClose}
      />

      <ConfirmDialog
        open={dialog?.kind === 'delete'}
        onOpenChange={open => !open && setDialog(null)}
        title={t(`${K}.dialogs.delete.title`, { name: dialogShare?.name ?? '' })}
        description={t(`${K}.dialogs.delete.description`)}
        confirmLabel={t(`${K}.actions.delete`)}
        destructive
        loading={pending}
        onConfirm={confirmDelete}
      />

      <Dialog open={dialog?.kind === 'blockers'} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`${K}.actions.delete`)}</DialogTitle>
            <DialogDescription>{dialogShare ? t('funds.detail.sharePrefix', { name: dialogShare.name }) : ''}</DialogDescription>
          </DialogHeader>
          {dialogShare && (
            <BlockersPanel
              title={t(`${K}.dialogs.blockers.title`)}
              blockers={(
                [
                  ['subscriptions', FileSignature],
                  ['navs', LineChart],
                  ['operations', Receipt],
                ] as const
              )
                .filter(([key]) => dialogShare.counts[key] > 0)
                .map(([key, icon]) => ({
                  id: key,
                  icon,
                  label: t(`${K}.dialogs.blockers.${key}`),
                  count: dialogShare.counts[key],
                  onOpen: key === 'navs' ? () => { setDialog(null); onOpenNavs(); } : undefined,
                }))}
              alternative={{
                label: t(`${K}.dialogs.blockers.closeShare`),
                description: t(`${K}.dialogs.close.description`),
                disabledReason: closeReason(dialogShare),
                onAction: () => setDialog({ kind: 'close', shareId: dialogShare.id }),
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
