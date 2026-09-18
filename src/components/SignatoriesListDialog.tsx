import { Clock, PenTool, UserCheck } from 'lucide-react';

import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useTranslation } from '../utils/languageContext';

/** Ligne de la fenetre "Liste des signataires". */
export interface SignatoryRow {
  id: string;
  name: string;
  email: string;
  /** Ordre de signature ; les contre-signataires signent apres les signataires. */
  order: number;
  counterSignatory: boolean;
  /** Contre-signataire designe mais pas encore valide cote societe de gestion. */
  pendingValidation?: boolean;
  role?: string;
  phone?: string;
}

interface SignatoriesListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: SignatoryRow[];
}

/** Fenetre de consultation : signataires, contre-signataires et ordre de signature. */
export function SignatoriesListDialog({ open, onOpenChange, rows }: SignatoriesListDialogProps) {
  const { t } = useTranslation();
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  const signatories = sorted.filter(row => !row.counterSignatory);
  const counterSignatories = sorted.filter(row => row.counterSignatory);

  const renderGroup = (group: SignatoryRow[], titleKey: string, emptyKey: string) => (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t(titleKey)}
      </p>
      {group.length === 0 ? (
        <p className="mt-1.5 text-sm text-muted-foreground">{t(emptyKey)}</p>
      ) : (
        <ul className="mt-1.5 divide-y divide-border rounded-lg border">
          {group.map(row => (
            <li key={row.id} className="flex items-start justify-between gap-3 px-3 py-2">
              <span className="flex min-w-0 items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {row.order}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{row.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{row.email}</span>
                  {row.phone && (
                    <span className="block truncate text-xs text-muted-foreground">{row.phone}</span>
                  )}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                {row.role && <span className="text-xs text-muted-foreground">{row.role}</span>}
                {row.counterSignatory && (
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[11px]">
                    <UserCheck className="w-3 h-3 mr-1" />
                    {t('subscriptions.detail.signatories.counterSignatory')}
                  </Badge>
                )}
                {row.pendingValidation && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
                    <Clock className="w-3 h-3 mr-1" />
                    {t('subscriptions.detail.signatories.pendingValidation')}
                  </Badge>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            {t('subscriptions.detail.signatories.dialogTitle')}
          </DialogTitle>
          <DialogDescription>{t('subscriptions.detail.signatories.dialogSubtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {renderGroup(
            signatories,
            'subscriptions.detail.signatories.signatories',
            'subscriptions.detail.signatories.emptySignatories',
          )}
          {renderGroup(
            counterSignatories,
            'subscriptions.detail.signatories.counterSignatories',
            'subscriptions.detail.signatories.emptyCounterSignatories',
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
