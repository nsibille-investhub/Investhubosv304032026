import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Mail, Repeat, Undo2 } from 'lucide-react';
import { useTranslation } from '../../../utils/languageContext';
import { formatDate, formatNavValue } from '../../../utils/formatters';
import type { FundDetail } from '../../../utils/fundDetailMock';
import { FileDropZone } from '../../../features/datahub/components/FileDropZone';
import { StatusBadge } from '../../StatusBadge';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { EffectsPanel } from '../../ui/effects-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { WidgetMetric } from '../../ui/widget-card';
import { computeNavEffects, type NavEntryInput, isoDay } from './navEffects';

const N = 'funds.detail.navs';
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ImportLine {
  shareId: string;
  date: Date;
  value: number;
  replaces: number | null;
}

/**
 * Lecture du fichier simulée pour la maquette : le serveur lirait les colonnes part, date et valeur.
 * Une ligne par part ouverte à une date nouvelle, plus une correction de la part A
 * à la dernière date connue.
 */
function simulateParse(detail: FundDetail): ImportLine[] {
  const today = new Date();
  const latest = detail.navs[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 12);
  // Date des créations : fin du mois écoulé, ou le jour même si elle est déjà saisie.
  const date = !latest || isoDay(monthEnd) > isoDay(latest.date) ? monthEnd : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const lines: ImportLine[] = detail.shares
    .filter(share => !share.closed)
    .map(share => {
      const base = share.lastNav?.value ?? share.nominalPrice ?? 100;
      const existing = detail.navs.find(row => isoDay(row.date) === isoDay(date))?.values[share.id];
      return {
        shareId: share.id,
        date,
        value: Math.round(base * 1.012 * 100) / 100,
        replaces: typeof existing === 'number' ? existing : null,
      };
    });
  const first = detail.shares[0];
  const current = latest?.values[first.id];
  if (latest && typeof current === 'number' && isoDay(latest.date) !== isoDay(date)) {
    lines.push({ shareId: first.id, date: latest.date, value: Math.round(current * 1.002 * 100) / 100, replaces: current });
  }
  return lines;
}

interface NavImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: FundDetail;
  onImport: (inputs: NavEntryInput[]) => Promise<void>;
}

export function NavImportDialog({ open, onOpenChange, detail, onImport }: NavImportDialogProps) {
  const { t } = useTranslation();
  const money = (value: number) => formatNavValue(value, detail.currency);
  const [step, setStep] = useState<'drop' | 'reading' | 'recap'>('drop');
  const [fileName, setFileName] = useState('');
  const [lines, setLines] = useState<ImportLine[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep('drop');
    setFileName('');
    setLines([]);
    setRunning(false);
  }, [open]);

  const read = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setStep('reading');
    await wait(800);
    setLines(simulateParse(detail));
    setStep('recap');
  };

  const creations = lines.filter(line => line.replaces === null).length;
  const replacements = lines.length - creations;
  const effects = lines.map(line => {
    const share = detail.shares.find(item => item.id === line.shareId)!;
    return computeNavEffects(detail, share, line.date, line.value);
  });
  const redemptions = effects.reduce((acc, item) => acc + item.redemptions.length, 0);
  const subscriptions = effects.reduce((acc, item) => acc + item.pendingSubscriptions, 0);
  const secondary = effects.filter(item => item.secondaryMarket).length;
  const confirm = detail.paymentMode === 'direct';

  const run = async () => {
    setRunning(true);
    await onImport(
      lines.map(line => ({
        shareId: line.shareId,
        date: line.date,
        value: line.value,
        proof: fileName,
        confirmSubscriptions: confirm,
        replaceNominal: false,
      })),
    );
    setRunning(false);
  };

  return (
    <Dialog open={open} onOpenChange={next => !running && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${N}.import.title`)}</DialogTitle>
          <DialogDescription>
            {step === 'recap' ? t(`${N}.import.recapDescription`, { file: fileName }) : t(`${N}.import.description`)}
          </DialogDescription>
        </DialogHeader>

        {step === 'drop' && (
          <FileDropZone
            accept=".csv,.xlsx"
            onFiles={files => read(files[0])}
            title={t(`${N}.import.drop`)}
            hint={t(`${N}.import.hint`)}
          />
        )}

        {step === 'reading' && (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground" role="status">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t(`${N}.import.reading`, { file: fileName })}
          </p>
        )}

        {step === 'recap' && (
          <div className="max-h-96 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <WidgetMetric label={t(`${N}.import.creations`)} value={creations} size="lg" />
              <WidgetMetric label={t(`${N}.import.replacements`)} value={replacements} size="lg" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(`${N}.import.columns.share`)}</TableHead>
                  <TableHead>{t(`${N}.import.columns.date`)}</TableHead>
                  <TableHead className="text-right">{t(`${N}.import.columns.value`)}</TableHead>
                  <TableHead>{t(`${N}.import.columns.kind`)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map(line => {
                  const share = detail.shares.find(item => item.id === line.shareId)!;
                  return (
                    <TableRow key={`${line.shareId}-${isoDay(line.date)}`}>
                      <TableCell>{t('funds.detail.sharePrefix', { name: share.name })}</TableCell>
                      <TableCell>{formatDate(line.date)}</TableCell>
                      <TableCell className="text-right tabular-nums">{money(line.value)}</TableCell>
                      <TableCell>
                        {line.replaces === null ? (
                          <StatusBadge label={t(`${N}.import.creation`)} variant="success" />
                        ) : (
                          <StatusBadge label={t(`${N}.import.replacement`, { value: money(line.replaces) })} variant="warning" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <EffectsPanel
              title={t(`${N}.import.effectsTitle`)}
              effects={[
                ...(redemptions > 0
                  ? [{ id: 'redemptions', icon: Undo2, label: t(`${N}.import.effects.redemptions`), count: redemptions, reversible: true }]
                  : []),
                ...(subscriptions > 0
                  ? [
                      {
                        id: 'subscriptions',
                        icon: Mail,
                        label: t(`${N}.import.effects.subscriptions`),
                        count: confirm ? subscriptions : 0,
                        note: confirm ? t(`${N}.effects.emails`, { count: subscriptions }) : t(`${N}.import.effects.noConfirmation`),
                        reversible: false,
                      },
                    ]
                  : []),
                ...(secondary > 0
                  ? [{ id: 'secondary', icon: Repeat, label: t(`${N}.import.effects.secondary`), count: secondary, reversible: true }]
                  : []),
              ]}
            />
          </div>
        )}

        <DialogFooter>
          {step === 'recap' ? (
            <>
              <Button variant="outline" onClick={() => setStep('drop')} disabled={running}>
                <ArrowLeft className="w-4 h-4" />
                {t(`${N}.dialog.back`)}
              </Button>
              <Button onClick={run} disabled={running}>
                {running && <Loader2 className="w-4 h-4 animate-spin" />}
                {t(`${N}.import.run`)}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={step === 'reading'}>
              {t('common.confirmDialog.cancel')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
