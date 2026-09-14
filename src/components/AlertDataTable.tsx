import { motion } from 'motion/react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronUp, Clock, Eye } from 'lucide-react';
import { Badge } from './ui/badge';
import { RowActionButton, RowActions } from './ui/row-actions';
import { Checkbox } from './ui/checkbox';
import { StatusBadge } from './StatusBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { AlertItem, AlertListCategory } from '../utils/alertsGenerator';
import { useTranslation } from '../utils/languageContext';

export type AlertBulkAction = 'true_hit' | 'false_hit' | 'unsure' | 'escalate';

interface AlertDataTableProps {
  data: AlertItem[];
  /** Masque le nom de l'entité quand le tableau est déjà groupé par entité. */
  showEntityName?: boolean;
  /** Affichage resserré : masque les colonnes changement, score et date. */
  compact?: boolean;
  hoveredRow: string | null;
  setHoveredRow: (id: string | null) => void;
  onRowClick: (row: AlertItem) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  onDecision?: (alertId: string, decision: AlertBulkAction) => void;
  onEntityClick?: (row: AlertItem) => void;
  selectedIds?: Set<string>;
  onToggleSelectRow?: (id: string) => void;
  onToggleSelectAll?: () => void;
  allPendingSelected?: boolean;
  somePendingSelected?: boolean;
}

const STATUS_VARIANT: Record<
  AlertItem['status'],
  'warning' | 'danger' | 'neutral'
> = {
  Pending: 'warning',
  Confirmed: 'danger',
  Rejected: 'neutral',
};

const STATUS_LABEL_KEY: Record<AlertItem['status'], string> = {
  Pending: 'complianceAlerts.status.pending',
  Confirmed: 'complianceAlerts.status.confirmed',
  Rejected: 'complianceAlerts.status.rejected',
};

const ALERT_LIST_LABEL_KEY: Record<AlertListCategory, string> = {
  PEP: 'complianceAlerts.list.pep',
  'Watch List': 'complianceAlerts.list.watchList',
  Sanctions: 'complianceAlerts.list.sanctions',
  'Adverse Media': 'complianceAlerts.list.adverseMedia',
  Crime: 'complianceAlerts.list.crime',
  'Financial Warning': 'complianceAlerts.list.financialWarning',
};

export function AlertDataTable({
  data,
  showEntityName = true,
  compact = false,
  hoveredRow,
  setHoveredRow,
  onRowClick,
  sortConfig,
  onSort,
  onDecision,
  onEntityClick,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  allPendingSelected,
  somePendingSelected,
}: AlertDataTableProps) {
  const { t } = useTranslation();
  const selectionEnabled = !!onToggleSelectRow && !!selectedIds;
  // Le CSS Tailwind du projet est précompilé : les largeurs passent par des
  // styles inline pour que les tableaux groupés restent alignés entre eux.
  const colWidth = (width: string, compactWidth?: string) =>
    showEntityName ? undefined : { width: compact ? compactWidth ?? width : width };
  const headPad = compact ? 'px-3 py-2' : 'px-6 py-3';
  const cellPad = compact ? 'px-3 py-2.5' : 'px-6 py-4';
  const checkPad = compact ? 'px-2 py-2' : 'px-4 py-3';
  const checkWidth = { width: compact ? '2rem' : '2.5rem' };
  const hasPendingRow = data.some((a) => a.status === 'Pending');

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600" />
    );
  };

  const renderChanges = (changes: AlertItem['changes']) => {
    if (!changes) return null;
    const labelKey =
      changes === 'New'
        ? 'complianceAlerts.changes.new'
        : changes === 'Reopened'
          ? 'complianceAlerts.changes.reopened'
          : 'complianceAlerts.changes.modified';
    return (
      <Badge variant="outline" className="text-[11px] font-medium">
        {t(labelKey)}
      </Badge>
    );
  };

  const renderMatch = (match: number) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-foreground tabular-nums">
      {match}%
    </span>
  );

  const formatDaysAgo = (daysAgo: number) => {
    if (daysAgo === 0) return t('complianceEntities.relative.today');
    if (daysAgo === 1) return t('complianceEntities.relative.yesterday');
    if (daysAgo < 7) return t('complianceEntities.relative.days', { count: daysAgo });
    if (daysAgo < 30) return t('complianceEntities.relative.weeks', { count: Math.floor(daysAgo / 7) });
    if (daysAgo < 365) return t('complianceEntities.relative.months', { count: Math.floor(daysAgo / 30) });
    return t('complianceEntities.relative.years', { count: Math.floor(daysAgo / 365) });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={showEntityName ? undefined : { tableLayout: 'fixed' }}>
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            {selectionEnabled && (
              <th className={checkPad} style={checkWidth}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Checkbox
                        checked={
                          allPendingSelected
                            ? true
                            : somePendingSelected
                              ? 'indeterminate'
                              : false
                        }
                        disabled={!hasPendingRow}
                        onCheckedChange={() => onToggleSelectAll?.()}
                        aria-label={t('complianceAlerts.selection.selectAll')}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {allPendingSelected
                      ? t('complianceAlerts.selection.deselectAll')
                      : t('complianceAlerts.selection.selectAll')}
                  </TooltipContent>
                </Tooltip>
              </th>
            )}
            <th
              className={`${headPad} text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
              style={colWidth('26%', '25%')}
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-2">
                {t('complianceAlerts.table.name')}
                {getSortIcon('name')}
              </div>
            </th>
            {!compact && (
              <th className={`${headPad} text-left text-xs text-gray-600 uppercase tracking-wider`} style={colWidth('13%')}>
                {t('complianceAlerts.table.changes')}
              </th>
            )}
            {!compact && (
              <th
                className={`${headPad} text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                style={colWidth('10%')}
                onClick={() => onSort('match')}
              >
                <div className="flex items-center gap-2">
                  {t('complianceAlerts.table.match')}
                  {getSortIcon('match')}
                </div>
              </th>
            )}
            <th className={`${headPad} text-left text-xs text-gray-600 uppercase tracking-wider`} style={colWidth('17%', '26%')}>
              {t('complianceAlerts.table.list')}
            </th>
            <th
              className={`${headPad} text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
              style={colWidth('12%', '20%')}
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-2">
                {t('complianceAlerts.table.status')}
                {getSortIcon('status')}
              </div>
            </th>
            {!compact && (
              <th
                className={`${headPad} text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                style={colWidth('12%')}
                onClick={() => onSort('daysAgo')}
              >
                <div className="flex items-center gap-2">
                  {t('complianceAlerts.table.date')}
                  {getSortIcon('daysAgo')}
                </div>
              </th>
            )}
            <th className={`${headPad} text-right text-xs text-gray-600 uppercase tracking-wider`} style={colWidth('10%', '29%')}>
              {t('complianceAlerts.table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((alert) => (
            <motion.tr
              key={alert.id}
              className={`transition-colors cursor-pointer ${
                hoveredRow === alert.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredRow(alert.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onRowClick(alert)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {selectionEnabled && (
                <td className={checkPad} style={checkWidth} onClick={(e) => e.stopPropagation()}>
                  {alert.status === 'Pending' ? (
                    <Checkbox
                      checked={selectedIds?.has(alert.id) ?? false}
                      onCheckedChange={() => onToggleSelectRow?.(alert.id)}
                      aria-label={t('complianceAlerts.selection.selectRow')}
                    />
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Checkbox
                            checked={false}
                            disabled
                            aria-label={t('complianceAlerts.selection.onlyPendingTip')}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('complianceAlerts.selection.onlyPendingTip')}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </td>
              )}
              <td className={cellPad}>
                {showEntityName ? (
                  <div>
                    {onEntityClick ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEntityClick(alert);
                        }}
                        title={t('complianceAlerts.table.openEntity')}
                        className="text-sm font-medium text-left hover:underline underline-offset-2"
                        style={{ color: '#000E2B' }}
                      >
                        {alert.entityName}
                      </button>
                    ) : (
                      <div
                        className="text-sm font-medium"
                        style={{ color: '#000E2B' }}
                      >
                        {alert.entityName}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <span className="font-medium text-gray-400">
                        {t('complianceAlerts.table.nameAlertLabel')}:
                      </span>{' '}
                      {alert.name}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-sm font-medium${compact ? ' truncate' : ''}`}
                    style={{ color: '#000E2B' }}
                    title={alert.name}
                  >
                    {alert.name}
                  </div>
                )}
              </td>
              {!compact && <td className={cellPad}>{renderChanges(alert.changes)}</td>}
              {!compact && <td className={cellPad}>{renderMatch(alert.match)}</td>}
              <td className={cellPad}>
                <Badge
                  variant="outline"
                  className="text-[11px] font-medium"
                  style={{ maxWidth: '100%' }}
                  title={t(ALERT_LIST_LABEL_KEY[alert.alertList])}
                >
                  <span className="min-w-0 truncate">{t(ALERT_LIST_LABEL_KEY[alert.alertList])}</span>
                </Badge>
              </td>
              <td className={cellPad}>
                <StatusBadge
                  label={t(STATUS_LABEL_KEY[alert.status])}
                  variant={STATUS_VARIANT[alert.status]}
                />
              </td>
              {!compact && (
                <td className={cellPad}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm text-gray-600 cursor-help">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDaysAgo(alert.daysAgo)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">{alert.date}</div>
                    </TooltipContent>
                  </Tooltip>
                </td>
              )}
              <td className={cellPad}>
                <div
                  className="flex items-center justify-end gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RowActionButton
                    icon={Eye}
                    tooltip={t('complianceAlerts.tooltip.view')}
                    intent="neutral"
                    onClick={() => onRowClick(alert)}
                    ariaLabel={t('complianceAlerts.tooltip.view')}
                  />
                  {alert.status === 'Pending' && onDecision && (
                    <RowActionButton
                      icon={ChevronUp}
                      tooltip={t('complianceAlerts.tooltip.escalate')}
                      intent="warning"
                      onClick={() => onDecision(alert.id, 'escalate')}
                      ariaLabel={t('complianceAlerts.tooltip.escalate')}
                    />
                  )}
                  <RowActions
                    previewLabel={t('complianceAlerts.tooltip.view')}
                    acceptLabel={t('complianceAlerts.tooltip.confirm')}
                    rejectLabel={t('complianceAlerts.tooltip.reject')}
                    showPreview={false}
                    onAccept={
                      alert.status === 'Pending' && onDecision
                        ? () => onDecision(alert.id, 'true_hit')
                        : undefined
                    }
                    onReject={
                      alert.status === 'Pending' && onDecision
                        ? () => onDecision(alert.id, 'false_hit')
                        : undefined
                    }
                    showAccept={alert.status === 'Pending' && !!onDecision}
                    showReject={alert.status === 'Pending' && !!onDecision}
                  />
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
