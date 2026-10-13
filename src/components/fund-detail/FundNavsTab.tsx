import { LineChart, Plus, TriangleAlert } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { FundDetail } from '../../utils/fundDetailMock';
import { EmptyState } from '../EmptyState';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DisabledReason } from '../ui/disabled-reason';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from '../ui/utils';

const K = 'funds.detail.navs';

interface FundNavsTabProps {
  detail: FundDetail;
  editReason?: string;
}

/** Une table par date, une colonne par part, l'actif net daté dans le même onglet (PRD section 11.1). */
export function FundNavsTab({ detail, editReason }: FundNavsTabProps) {
  const { t } = useTranslation();
  const money = (value: number) => formatCurrency(value, detail.currency);
  const missing = new Set(detail.expectedNavMissing.map(item => `${item.shareId}-${item.expectedDate.getTime()}`));

  const addButton = (
    <DisabledReason reason={editReason ?? t('funds.detail.comingSoon')}>
      <Button size="sm" disabled>
        <Plus className="w-4 h-4" />
        {t(`${K}.add`)}
      </Button>
    </DisabledReason>
  );

  if (detail.navs.length === 0) {
    return (
      <Card className="shadow-sm">
        <EmptyState icon={LineChart} title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyDescription`)} action={addButton} />
      </Card>
    );
  }

  return (
    <Card className="gap-0 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className={WIDGET_TITLE_CLASS}>{t(`${K}.title`)}</h3>
          <p className={WIDGET_SUBTITLE_CLASS}>
            {t(`${K}.subtitle`, { frequency: t(`common.frequencyDayField.frequencies.${detail.navFrequency}`).toLowerCase() })}
          </p>
        </div>
        {addButton}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t(`${K}.date`)}</TableHead>
            {detail.shares.map(share => (
              <TableHead key={share.id} className="text-right">
                {t('funds.detail.sharePrefix', { name: share.name })}
              </TableHead>
            ))}
            <TableHead className="text-right">{t(`${K}.netAsset`)}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {detail.navs.map(row => (
            <TableRow key={row.date.getTime()}>
              <TableCell className="font-medium">{formatDate(row.date)}</TableCell>
              {detail.shares.map(share => {
                const value = row.values[share.id];
                const expectedMissing = missing.has(`${share.id}-${row.date.getTime()}`);
                return (
                  <TableCell key={share.id} className="text-right tabular-nums">
                    {value !== null && value !== undefined ? (
                      money(value)
                    ) : expectedMissing ? (
                      <StatusBadge variant="warning" icon={TriangleAlert} label={t(`${K}.expectedMissing`)} />
                    ) : (
                      <span className="text-muted-foreground/60 italic">{t('common.sectionCard.notProvided')}</span>
                    )}
                  </TableCell>
                );
              })}
              <TableCell className="text-right tabular-nums">
                {row.netAsset !== null ? money(row.netAsset) : t('common.sectionCard.notProvided')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
