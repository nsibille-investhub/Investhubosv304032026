import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Eye, Lock, LineChart, MoreHorizontal, Plus, Trash2, XCircle } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { FieldTarget, FundDetail } from '../../utils/fundDetailMock';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DisabledReason } from '../ui/disabled-reason';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { WIDGET_TITLE_CLASS } from '../ui/utils';

const K = 'funds.detail.shares';

interface FundSharesTabProps {
  detail: FundDetail;
  target: FieldTarget | null;
  onTargetHandled: () => void;
  editReason?: string;
  onOpenNavs: () => void;
}

export function FundSharesTab({ detail, target, onTargetHandled, editReason, onOpenNavs }: FundSharesTabProps) {
  const { t, lang } = useTranslation();
  const percentFormat = new Intl.NumberFormat(lang, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const percent = (value: number) => percentFormat.format(value / 100);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const money = (value: number) => formatCurrency(value, detail.currency);
  const comingSoon = () => toast.info(t('funds.detail.comingSoonToast'));

  useEffect(() => {
    if (!target || target.tab !== 'shares') return;
    setHighlighted(target.fieldId);
    requestAnimationFrame(() =>
      document.getElementById(`fund-share-${target.fieldId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
    onTargetHandled();
    const timer = setTimeout(() => setHighlighted(null), 2500);
    return () => clearTimeout(timer);
  }, [target, onTargetHandled]);

  return (
    <Card className="gap-0 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className={WIDGET_TITLE_CLASS}>{t(`${K}.title`, { count: detail.shares.length })}</h3>
        <DisabledReason reason={editReason ?? t('funds.detail.comingSoon')}>
          <Button size="sm" disabled>
            <Plus className="w-4 h-4" />
            {t(`${K}.add`)}
          </Button>
        </DisabledReason>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t(`${K}.columns.name`)}</TableHead>
            <TableHead>{t(`${K}.columns.isin`)}</TableHead>
            <TableHead>{t(`${K}.columns.mode`)}</TableHead>
            <TableHead className="text-right">{t(`${K}.columns.nominal`)}</TableHead>
            <TableHead className="text-right">{t(`${K}.columns.managementFee`)}</TableHead>
            <TableHead className="text-right">{t(`${K}.columns.entryFee`)}</TableHead>
            <TableHead className="text-right">{t(`${K}.columns.subscribed`)}</TableHead>
            {detail.paymentMode === 'calls' && (
              <TableHead className="text-right">{t(`${K}.columns.called`)}</TableHead>
            )}
            <TableHead className="text-right">{t(`${K}.columns.lastNav`)}</TableHead>
            <TableHead>
              <span className="sr-only">{t(`${K}.columns.actions`)}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {detail.shares.map(share => {
            const calledPercent = share.subscribed > 0 ? Math.round((share.called / share.subscribed) * 100) : 0;
            return (
              <TableRow
                key={share.id}
                id={`fund-share-${share.id}`}
                style={highlighted === share.id ? { backgroundColor: 'var(--warning-soft)' } : undefined}
              >
                <TableCell>
                  <span className="inline-flex items-center gap-2 font-medium text-foreground">
                    {t('funds.detail.sharePrefix', { name: share.name })}
                    {share.restricted && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} aria-label={t(`${K}.restricted`)} className="inline-flex text-muted-foreground">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">{t(`${K}.restricted`)}</span>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {share.closed && <StatusBadge label={t(`${K}.closed`)} variant="neutral" />}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{share.isin}</TableCell>
                <TableCell>{t(`${K}.mode.${share.mode}`)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {share.nominalPrice !== null ? (
                    money(share.nominalPrice)
                  ) : (
                    <StatusBadge label={t(`${K}.priceMissing`)} variant="danger" />
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{percent(share.managementFee)}</TableCell>
                <TableCell className="text-right tabular-nums">{percent(share.entryFee)}</TableCell>
                <TableCell className="text-right tabular-nums">{money(share.subscribed)}</TableCell>
                {detail.paymentMode === 'calls' && (
                  <TableCell className="text-right tabular-nums">
                    {money(share.called)}
                    <span className="block text-xs text-muted-foreground">{calledPercent} %</span>
                  </TableCell>
                )}
                <TableCell className="text-right tabular-nums">
                  {share.lastNav ? (
                    <>
                      {money(share.lastNav.value)}
                      <span className="block text-xs text-muted-foreground">{formatDate(share.lastNav.date)}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground/60 italic">{t('common.sectionCard.notProvided')}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t(`${K}.actionsFor`, { name: share.name })}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={comingSoon}>
                        <Eye className="w-4 h-4" />
                        {t(`${K}.actions.open`)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onOpenNavs}>
                        <LineChart className="w-4 h-4" />
                        {t(`${K}.actions.navs`)}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {[
                        { key: 'duplicate', icon: Copy },
                        { key: 'close', icon: XCircle },
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.key} onClick={comingSoon} disabled={Boolean(editReason)}>
                            <Icon className="w-4 h-4" />
                            <span className="flex flex-col">
                              <span>{t(`${K}.actions.${item.key}`)}</span>
                              {editReason && <span className="text-xs text-muted-foreground">{editReason}</span>}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={comingSoon}
                        disabled={Boolean(editReason)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="flex flex-col">
                          <span>{t(`${K}.actions.delete`)}</span>
                          {editReason && <span className="text-xs text-muted-foreground">{editReason}</span>}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
