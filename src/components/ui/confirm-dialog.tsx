import type { ReactNode } from 'react';
import { AlertTriangle, CircleHelp, Loader2, X, type LucideIcon } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import {
  BIG_MODAL_COMPACT,
  BigModal,
  BigModalBody,
  BigModalContent,
  BigModalPanelFooter,
  BigModalPanelHeader,
} from './big-modal';
import { Button } from './button';
import { DisabledReason } from './disabled-reason';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Contenu complémentaire : avertissement, panneau d'effets... */
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Action en cours : boutons désactivés, chargement, la fenêtre reste ouverte. */
  loading?: boolean;
  /** Confirmation refusée par le serveur : bouton désactivé, motif au survol. */
  confirmDisabledReason?: string;
  onConfirm: () => void;
  /** Icône de l'en-tête ; par défaut un avertissement pour une action destructive. */
  icon?: LucideIcon;
}

/** Confirmation d'une action : reste ouverte pendant le traitement, le parent la ferme au succès. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  confirmDisabledReason,
  onConfirm,
  icon,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const close = () => !loading && onOpenChange(false);

  return (
    <BigModal open={open} onOpenChange={next => !loading && onOpenChange(next)}>
      <BigModalContent className={`${BIG_MODAL_COMPACT} p-0 gap-0`}>
        <div className="flex flex-col overflow-hidden rounded-3xl">
          <BigModalPanelHeader
            icon={icon ?? (destructive ? AlertTriangle : CircleHelp)}
            tone={destructive ? 'danger' : 'primary'}
            title={title}
            subtitle={description}
            onClose={close}
            closeLabel={t('common.confirmDialog.close')}
          />
          {children && <BigModalBody>{children}</BigModalBody>}
          <BigModalPanelFooter
            start={
              <Button variant="ghost" size="sm" className="h-9" onClick={close} disabled={loading}>
                <X className="w-4 h-4 mr-1" />
                {cancelLabel ?? t('common.confirmDialog.cancel')}
              </Button>
            }
            end={
              <DisabledReason reason={confirmDisabledReason}>
                <Button
                  variant={destructive ? 'danger' : 'primary'}
                  size="sm"
                  className="h-9 min-w-[140px]"
                  onClick={onConfirm}
                  disabled={loading || Boolean(confirmDisabledReason)}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {confirmLabel}
                </Button>
              </DisabledReason>
            }
          />
        </div>
      </BigModalContent>
    </BigModal>
  );
}
