import { CheckCircle2, Share2, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import { Button } from './ui/button';
import { Sheet, SheetContent } from './ui/sheet';
import { SIDE_PANEL_WIDE_STYLE, SidePanelCard, SidePanelHeader, SidePanelSection } from './ui/side-panel';
import { StatusBadge } from './StatusBadge';
import { Tag } from './Tag';

export type SubmissionReportRowState = 'inSync' | 'gap' | 'created' | 'copied';

export interface SubmissionReportRow {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  origin: string;
  originSection?: string;
  state: SubmissionReportRowState;
  previousValue?: string;
  onPropagate?: () => void;
}

interface SubmissionReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submittedAt: string;
  rows: SubmissionReportRow[];
}

function RowState({ row }: { row: SubmissionReportRow }) {
  const { t } = useTranslation();
  if (row.state === 'gap') {
    return <StatusBadge variant="warning" icon={TriangleAlert} label={t('subscriptions.detail.report.gap')} />;
  }
  if (row.state === 'inSync') {
    return <StatusBadge variant="success" icon={CheckCircle2} label={t('subscriptions.detail.report.inSync')} />;
  }
  return (
    <Tag
      label={t(
        row.state === 'created'
          ? 'subscriptions.detail.report.mandateCreated'
          : 'subscriptions.detail.report.documentCopied',
      )}
    />
  );
}

/** Panneau latéral des données reportées vers les objets liés à la soumission de l'onboarding. */
export function SubmissionReportSheet({ open, onOpenChange, submittedAt, rows }: SubmissionReportSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader
          title={t('subscriptions.detail.report.title')}
          description={t('subscriptions.detail.report.summary', { date: submittedAt })}
        />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection
            icon={Share2}
            title={t('subscriptions.detail.report.sectionTitle')}
            description={t('subscriptions.detail.report.sectionDescription', { count: rows.length })}
          >
            <SidePanelCard flush className="divide-y divide-border">
              {rows.map(row => {
                const Icon = row.icon;
                return (
                  <div key={row.key} className="flex items-start gap-3 px-4 py-3">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium text-foreground break-words">
                        {row.value || t('subscriptions.detail.answerEffects.empty')}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.originSection ? `${row.origin} · ${row.originSection}` : row.origin}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <RowState row={row} />
                      {row.previousValue && (
                        <Tag label={t('subscriptions.detail.report.replaced', { value: row.previousValue })} />
                      )}
                      {row.state === 'gap' && row.onPropagate && (
                        <Button variant="outline" size="sm" onClick={row.onPropagate}>
                          {t('subscriptions.detail.report.propagate')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </SidePanelCard>
          </SidePanelSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
