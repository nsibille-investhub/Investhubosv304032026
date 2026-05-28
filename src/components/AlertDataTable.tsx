import { motion } from 'motion/react';
import { ArrowUpDown, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { RowActions } from './ui/row-actions';
import { StatusBadge } from './StatusBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { AlertItem, AlertListCategory } from '../utils/alertsGenerator';
import { useTranslation } from '../utils/languageContext';

interface AlertDataTableProps {
  data: AlertItem[];
  hoveredRow: string | null;
  setHoveredRow: (id: string | null) => void;
  onRowClick: (row: AlertItem) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  onDecision?: (alertId: string, decision: 'true_hit' | 'false_hit') => void;
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
  hoveredRow,
  setHoveredRow,
  onRowClick,
  sortConfig,
  onSort,
  onDecision,
}: AlertDataTableProps) {
  const { t } = useTranslation();

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

  const renderChanges = (changes: 'New' | 'Modified' | null) => {
    if (!changes) return null;
    const labelKey =
      changes === 'New' ? 'complianceAlerts.changes.new' : 'complianceAlerts.changes.modified';
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
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) {
      const weeks = Math.floor(daysAgo / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(daysAgo / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-2">
                {t('complianceAlerts.table.name')}
                {getSortIcon('name')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
              {t('complianceAlerts.table.changes')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('match')}
            >
              <div className="flex items-center gap-2">
                {t('complianceAlerts.table.match')}
                {getSortIcon('match')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
              {t('complianceAlerts.table.list')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-2">
                {t('complianceAlerts.table.status')}
                {getSortIcon('status')}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('daysAgo')}
            >
              <div className="flex items-center gap-2">
                {t('complianceAlerts.table.date')}
                {getSortIcon('daysAgo')}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase tracking-wider">
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
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {alert.entityName}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-400">
                      {t('complianceAlerts.table.nameAlertLabel')}:
                    </span>{' '}
                    {alert.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{renderChanges(alert.changes)}</td>
              <td className="px-6 py-4">{renderMatch(alert.match)}</td>
              <td className="px-6 py-4">
                <Badge variant="outline" className="text-[11px] font-medium">
                  {t(ALERT_LIST_LABEL_KEY[alert.alertList])}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <StatusBadge
                  label={t(STATUS_LABEL_KEY[alert.status])}
                  variant={STATUS_VARIANT[alert.status]}
                />
              </td>
              <td className="px-6 py-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-sm text-gray-600 cursor-help">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDaysAgo(alert.daysAgo)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div>Date: {alert.date}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="px-6 py-4">
                <RowActions
                  previewLabel={t('complianceAlerts.tooltip.view')}
                  acceptLabel={t('complianceAlerts.tooltip.confirm')}
                  rejectLabel={t('complianceAlerts.tooltip.reject')}
                  onPreview={() => onRowClick(alert)}
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
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
