import { useState } from 'react';
import { CheckCircle2, CircleX, Filter, Globe, Share2, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent } from './ui/sheet';
import { SIDE_PANEL_WIDE_STYLE, SidePanelCard, SidePanelHeader, SidePanelSection } from './ui/side-panel';
import { EmptyState } from './EmptyState';
import { StatusBadge } from './StatusBadge';
import { Tag } from './Tag';

export type SubmissionReportRowState = 'inSync' | 'gap' | 'created' | 'copied' | 'failed';

const SYNC_ARROWS = { toTarget: '→', fromTarget: '←', both: '↔' } as const;

export interface SubmissionReportRow {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  origin: string;
  originSection?: string;
  /** Section du questionnaire d'où vient la donnée. */
  sourceKey: string;
  /** Objet qui reçoit la donnée, InvestHub ou partenaire externe. */
  destinationKey: string;
  /** Destination hors InvestHub (outil KYC, CRM, registre). */
  external?: boolean;
  direction?: keyof typeof SYNC_ARROWS;
  state: SubmissionReportRowState;
  previousValue?: string;
  onPropagate?: () => void;
  /** Destination externe dont le dernier envoi a échoué : relance. */
  onRetry?: () => void;
}

interface SubmissionReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submittedAt: string;
  rows: SubmissionReportRow[];
  /** Sections du questionnaire proposées dans le filtre Source. */
  sources: Array<{ value: string; label: string }>;
}

const ALL = 'all';
const T = 'subscriptions.detail.report';

function RowState({ row }: { row: SubmissionReportRow }) {
  const { t } = useTranslation();
  if (row.state === 'failed') {
    return <StatusBadge variant="danger" icon={CircleX} label={t(`${T}.failed`)} />;
  }
  if (row.state === 'gap') {
    return <StatusBadge variant="warning" icon={TriangleAlert} label={t(`${T}.gap`)} />;
  }
  if (row.state === 'inSync') {
    return <StatusBadge variant="success" icon={CheckCircle2} label={t(`${T}.inSync`)} />;
  }
  return <Tag label={t(row.state === 'created' ? `${T}.mandateCreated` : `${T}.documentCopied`)} />;
}

function ReportRows({ rows }: { rows: SubmissionReportRow[] }) {
  const { t } = useTranslation();
  return (
    <SidePanelCard flush className="divide-y divide-border">
      {rows.map(row => {
        const Icon = row.icon;
        return (
          <div key={row.key} className="flex items-start gap-3 px-4 py-3">
            <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {row.direction ? `${SYNC_ARROWS[row.direction]} ${row.label}` : row.label}
              </p>
              <p className="text-sm font-medium text-foreground break-words">
                {row.value || t('subscriptions.detail.answerEffects.empty')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.originSection ? `${row.origin} · ${row.originSection}` : row.origin}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <RowState row={row} />
              {row.previousValue && <Tag label={t(`${T}.replaced`, { value: row.previousValue })} />}
              {row.state === 'gap' && row.onPropagate && (
                <Button variant="outline" size="sm" onClick={row.onPropagate}>
                  {t(`${T}.propagate`)}
                </Button>
              )}
              {row.state === 'failed' && row.onRetry && (
                <Button variant="outline" size="sm" onClick={row.onRetry}>
                  {t(`${T}.retry`)}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </SidePanelCard>
  );
}

/** Panneau latéral des données reportées vers les objets liés et les partenaires externes. */
export function SubmissionReportSheet({ open, onOpenChange, submittedAt, rows, sources }: SubmissionReportSheetProps) {
  const { t } = useTranslation();
  const [source, setSource] = useState(ALL);
  const [destination, setDestination] = useState(ALL);

  const destinationLabel = (key: string) => t(`subscriptions.detail.answerEffects.objects.${key}`);
  const destinations = Array.from(new Set(rows.map(row => row.destinationKey)));
  const usedSources = sources.filter(option => rows.some(row => row.sourceKey === option.value));
  const filtered = rows.filter(
    row => (source === ALL || row.sourceKey === source) && (destination === ALL || row.destinationKey === destination),
  );
  const internalRows = filtered.filter(row => !row.external);
  const externalRows = filtered.filter(row => row.external);
  const failedCount = rows.filter(row => row.state === 'failed').length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={t(`${T}.title`)} description={t(`${T}.summary`, { date: submittedAt })} />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection icon={Filter} title={t(`${T}.filters.title`)}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="report-source">{t(`${T}.filters.source`)}</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger id="report-source" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t(`${T}.filters.allSources`)}</SelectItem>
                    {usedSources.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="report-destination">{t(`${T}.filters.destination`)}</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger id="report-destination" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t(`${T}.filters.allDestinations`)}</SelectItem>
                    {destinations.map(key => (
                      <SelectItem key={key} value={key}>
                        {destinationLabel(key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SidePanelSection>

          {filtered.length === 0 && (
            <EmptyState icon={Filter} title={t(`${T}.filters.emptyTitle`)} description={t(`${T}.filters.emptyDescription`)} />
          )}

          {internalRows.length > 0 && (
            <SidePanelSection
              icon={Share2}
              title={t(`${T}.sectionTitle`)}
              description={t(`${T}.sectionDescription`, { count: internalRows.length })}
            >
              <ReportRows rows={internalRows} />
            </SidePanelSection>
          )}

          {externalRows.length > 0 && (
            <SidePanelSection
              icon={Globe}
              title={t(`${T}.externalTitle`)}
              description={
                failedCount > 0
                  ? t(`${T}.externalDescriptionFailed`, { count: externalRows.length, failed: failedCount })
                  : t(`${T}.externalDescription`, { count: externalRows.length })
              }
            >
              <ReportRows rows={externalRows} />
            </SidePanelSection>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
