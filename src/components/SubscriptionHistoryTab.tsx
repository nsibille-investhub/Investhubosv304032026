import { useState } from 'react';
import {
  Ban,
  Building2,
  Check,
  Clock,
  Download,
  FileText,
  History,
  Info,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { useTranslation } from '../utils/languageContext';
import {
  mockComplianceHistory,
  mockDataChanges,
  mockInvestorDocumentsHistory,
  mockInvestorHistory,
  type DataChangeRequest,
  type DataChangeStatus,
  type HistoryAuthorType,
} from '../utils/subscriptionHistoryMockData';

const KEY = 'subscriptions.detail.history';
const CHANGES_KEY = 'subscriptions.detail.dataChanges';

const AUTHOR_ICONS: Record<HistoryAuthorType, typeof User> = {
  backoffice: Building2,
  partner: Users,
  investor: User,
};

const AUTHOR_LABEL_KEYS: Record<HistoryAuthorType, string> = {
  backoffice: `${KEY}.authors.backoffice`,
  partner: `${KEY}.authors.partner`,
  investor: `${KEY}.authors.investor`,
};

const STATUS_STYLES: Record<DataChangeStatus, string> = {
  toValidate: 'bg-amber-50 text-amber-700 border-amber-200',
  validated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refused: 'bg-red-50 text-red-700 border-red-200',
};

/**
 * Historiques de la fiche : actions du dossier, décisions de conformité,
 * documents fournis par l'investisseur tous dossiers confondus, et demandes de
 * modification de données déposées depuis l'extérieur.
 */
export function SubscriptionHistoryTab() {
  const { t } = useTranslation();
  const [changes, setChanges] = useState<DataChangeRequest[]>(mockDataChanges);
  const [refusing, setRefusing] = useState<DataChangeRequest | null>(null);
  const [refusalReason, setRefusalReason] = useState('');

  const handleValidateChange = (change: DataChangeRequest) => {
    setChanges(prev =>
      prev.map(item => (item.id === change.id ? { ...item, status: 'validated' } : item)),
    );
    toast.success(t(`${CHANGES_KEY}.toast.validated`), { description: t(change.fieldKey) });
  };

  const handleRefuseChange = () => {
    if (!refusing || !refusalReason.trim()) return;
    const reason = refusalReason.trim();
    setChanges(prev =>
      prev.map(item => (item.id === refusing.id ? { ...item, status: 'refused', reason } : item)),
    );
    toast.info(t(`${CHANGES_KEY}.toast.refused`), { description: t(refusing.fieldKey) });
    setRefusing(null);
    setRefusalReason('');
  };

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Changements de donnees deposes par l'investisseur ou le distributeur */}
      <Card className="shadow-sm overflow-hidden p-0 gap-0">
        <div className="border-b px-4 py-3">
          <h3 className={WIDGET_TITLE_CLASS}>{t(`${CHANGES_KEY}.title`)}</h3>
          <p className={WIDGET_SUBTITLE_CLASS}>{t(`${CHANGES_KEY}.subtitle`)}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground w-40">
                  {t(`${CHANGES_KEY}.columns.date`)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t(`${CHANGES_KEY}.columns.field`)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t(`${CHANGES_KEY}.columns.newValue`)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t(`${CHANGES_KEY}.columns.info`)}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">
                  {t(`${CHANGES_KEY}.columns.status`)}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">
                  {t(`${CHANGES_KEY}.columns.actions`)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {changes.map(change => (
                <tr key={change.id} className="hover:bg-muted/60">
                  <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{change.at}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{t(change.fieldKey)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{change.newValue}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {t(change.infoKey)}
                    <span className="mt-0.5 block">
                      {t(`${CHANGES_KEY}.origin.${change.origin}`)}
                    </span>
                    {change.reason && (
                      <span className="mt-0.5 block italic text-red-700">{change.reason}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={`${STATUS_STYLES[change.status]} text-xs`}>
                      {t(`${CHANGES_KEY}.status.${change.status}`)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {change.status === 'toValidate' ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-emerald-600"
                          title={t(`${CHANGES_KEY}.actions.validate`)}
                          aria-label={t(`${CHANGES_KEY}.actions.validate`)}
                          onClick={() => handleValidateChange(change)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600"
                          title={t(`${CHANGES_KEY}.actions.refuse`)}
                          aria-label={t(`${CHANGES_KEY}.actions.refuse`)}
                          onClick={() => {
                            setRefusing(change);
                            setRefusalReason('');
                          }}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="block text-center text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Historique investisseur */}
        <Card className="shadow-sm overflow-hidden p-0 gap-0">
          <div className="border-b px-4 py-3">
            <h3 className={`${WIDGET_TITLE_CLASS} flex items-center gap-1.5`}>
              <History className="w-4 h-4" />
              {t(`${KEY}.investor.title`)}
            </h3>
            <p className={WIDGET_SUBTITLE_CLASS}>{t(`${KEY}.investor.subtitle`)}</p>
          </div>
          <ul className="divide-y">
            {mockInvestorHistory.map(entry => {
              const Icon = AUTHOR_ICONS[entry.authorType];
              return (
                <li key={entry.id} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-foreground">{t(entry.labelKey)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {entry.author} · {t(AUTHOR_LABEL_KEYS[entry.authorType])} · {entry.at}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Historique compliance */}
        <Card className="shadow-sm overflow-hidden p-0 gap-0">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
            <div className="min-w-0">
              <h3 className={`${WIDGET_TITLE_CLASS} flex items-center gap-1.5`}>
                <ShieldCheck className="w-4 h-4" />
                {t(`${KEY}.compliance.title`)}
              </h3>
              <p className={WIDGET_SUBTITLE_CLASS}>{t(`${KEY}.compliance.subtitle`)}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1.5 text-xs"
              onClick={() => toast.success(t(`${KEY}.compliance.exportToast`))}
            >
              <Download className="w-3.5 h-3.5" />
              {t(`${KEY}.compliance.exportPdf`)}
            </Button>
          </div>
          <ul className="divide-y">
            {mockComplianceHistory.map(entry => (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-2.5">
                <Clock className="mt-0.5 w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-foreground">{t(entry.labelKey)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {entry.author} · {entry.at}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Documents fournis par l'investisseur, au-dela de cette souscription */}
      <Card className="shadow-sm overflow-hidden p-0 gap-0">
        <div className="border-b px-4 py-3">
          <h3 className={`${WIDGET_TITLE_CLASS} flex items-center gap-1.5`}>
            <FileText className="w-4 h-4" />
            {t(`${KEY}.documents.title`)}
          </h3>
          <p className={`${WIDGET_SUBTITLE_CLASS} flex items-start gap-1.5`}>
            <Info className="mt-0.5 w-3.5 h-3.5 shrink-0" />
            {t(`${KEY}.documents.scopeNotice`)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">
                  {t(`${KEY}.documents.providedAt`)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t(`${KEY}.documents.name`)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground w-40">
                  {t(`${KEY}.documents.subscription`)}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t(`${KEY}.documents.fund`)}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground w-24">
                  {t(`${KEY}.documents.action`)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockInvestorDocumentsHistory.map(doc => (
                <tr key={doc.id} className="hover:bg-muted/60">
                  <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">
                    {doc.providedAt}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{t(doc.nameKey)}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">
                    {doc.subscriptionRef}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{doc.fundName}</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground"
                      title={t(`${KEY}.documents.download`)}
                      aria-label={t(`${KEY}.documents.download`)}
                      onClick={() =>
                        toast.info(t(`${KEY}.documents.downloadToast`), {
                          description: t(doc.nameKey),
                        })
                      }
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={refusing !== null} onOpenChange={open => !open && setRefusing(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{t(`${CHANGES_KEY}.refuse.title`)}</DialogTitle>
            <DialogDescription>
              {refusing ? t(`${CHANGES_KEY}.refuse.subtitle`, { field: t(refusing.fieldKey) }) : ''}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={refusalReason}
            onChange={event => setRefusalReason(event.target.value)}
            placeholder={t(`${CHANGES_KEY}.refuse.placeholder`)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRefusing(null)}>
              {t('subscriptions.detail.action.common.cancel')}
            </Button>
            <Button
              size="sm"
              className="text-white"
              disabled={!refusalReason.trim()}
              onClick={handleRefuseChange}
            >
              {t(`${CHANGES_KEY}.refuse.confirm`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
