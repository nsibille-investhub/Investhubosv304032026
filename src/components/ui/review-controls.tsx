import { motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from './badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { DisabledReason } from './disabled-reason';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewControlsProps {
  status: ReviewStatus;
  onApprove: () => void;
  onReject: () => void;
  /** Libellés traduits : badge d'état et libellé au survol des boutons. */
  labels: { approved: string; rejected: string; approve: string; reject: string };
  /** Validation et invalidation proposées (absentes en lecture seule). */
  canControl?: boolean;
  /** Motif d'indisponibilité de la validation : le bouton reste visible, grisé. */
  approveDisabledReason?: string;
}

/**
 * Contrôle d'un élément soumis (réponse, pièce justificative) : badge Validé / Invalidé
 * puis boutons Valider et Invalider. Le bouton de l'état courant est masqué.
 */
export function ReviewControls({
  status,
  onApprove,
  onReject,
  labels,
  canControl = true,
  approveDisabledReason,
}: ReviewControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {status === 'approved' && (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {labels.approved}
        </Badge>
      )}
      {status === 'rejected' && (
        <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
          <XCircle className="w-3 h-3" />
          {labels.rejected}
        </Badge>
      )}

      {canControl && (
        <div className="flex items-center gap-1">
          {status !== 'approved' &&
            (approveDisabledReason ? (
              <DisabledReason reason={approveDisabledReason}>
                <span className="p-1.5 rounded-md" aria-label={labels.approve}>
                  <CheckCircle2 className="w-4 h-4 text-gray-300" />
                </span>
              </DisabledReason>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onApprove}
                      aria-label={labels.approve}
                      className="p-1.5 rounded-md hover:bg-emerald-50 transition-colors group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{labels.approve}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

          {status !== 'rejected' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReject}
                    aria-label={labels.reject}
                    className="p-1.5 rounded-md hover:bg-red-50 transition-colors group"
                  >
                    <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{labels.reject}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}
