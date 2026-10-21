import { motion } from 'motion/react';
import {
  Check,
  X,
  Edit2,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
  Calculator,
} from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';

const T = 'subscriptions.detail.questionActions';

export type QuestionStatus = 'pending' | 'approved' | 'rejected' | 'modified';

interface QuestionActionsProps {
  questionId: string;
  currentResponse: string;
  currentStatus?: QuestionStatus;
  commentCount?: number;
  hasUnresolvedComments?: boolean;
  onApprove: () => void;
  onReject: () => void;
  /** Ouvre la modification. Absent : l'action n'est pas proposée (droit, statut). */
  onModify?: () => void;
  /** Champ composé, calculé : aucune modification possible. */
  computed?: boolean;
  /** Validation et invalidation proposées (absentes en lecture seule). */
  canControl?: boolean;
  onComment: () => void;
  /** Ouvre la piste d'audit de la réponse. */
  onTimeline?: () => void;
  /** Modifications depuis la soumission et la dernière validation : badge du bouton de piste d'audit. */
  modificationCount?: number;
}

export function QuestionActions({
  questionId,
  currentResponse,
  currentStatus = 'pending',
  commentCount = 0,
  hasUnresolvedComments = false,
  onApprove,
  onReject,
  onModify,
  computed = false,
  canControl = true,
  onComment,
  onTimeline,
  modificationCount = 0,
}: QuestionActionsProps) {
  const { t } = useTranslation();

  const handleApprove = () => {
    onApprove();
    toast.success(t(`${T}.approvedToast`), {
      description: t(`${T}.approvedToastDesc`),
    });
  };

  const handleReject = () => {
    onReject();
    toast.error(t(`${T}.rejectedToast`), {
      description: t(`${T}.rejectedToastDesc`),
    });
  };

  return (
    <div className="flex items-center gap-2">
        <>
          {/* Status badge */}
          <div className="flex items-center gap-2">
            {currentStatus === 'approved' && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t(`${T}.approved`)}
              </Badge>
            )}
            {currentStatus === 'rejected' && (
              <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
                <XCircle className="w-3 h-3" />
                {t(`${T}.rejected`)}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Approve */}
            {canControl && currentStatus !== 'approved' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApprove}
                      className="p-1.5 rounded-md hover:bg-emerald-50 transition-colors group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(`${T}.approve`)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Reject */}
            {canControl && currentStatus !== 'rejected' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReject}
                      className="p-1.5 rounded-md hover:bg-red-50 transition-colors group"
                    >
                      <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(`${T}.reject`)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Edit */}
            {computed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="p-1.5 rounded-md" tabIndex={0} aria-label={t(`${T}.computed`)}>
                      <Calculator className="w-4 h-4 text-gray-300" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(`${T}.computed`)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : onModify ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onModify}
                      aria-label={t(`${T}.modify`)}
                      className="p-1.5 rounded-md hover:bg-blue-50 transition-colors group"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(`${T}.modify`)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}

            {/* Comment */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onComment}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors group relative"
                  >
                    <MessageSquare className={`w-4 h-4 transition-colors ${
                      commentCount > 0
                        ? hasUnresolvedComments 
                          ? 'text-red-600' 
                          : 'text-emerald-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    {commentCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ${
                          hasUnresolvedComments
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {commentCount}
                      </motion.span>
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {commentCount === 0
                      ? t(`${T}.addComment`)
                      : hasUnresolvedComments
                      ? t(`${T}.unresolvedComments`, { count: commentCount })
                      : t(`${T}.resolvedComments`, { count: commentCount })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {onTimeline && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onTimeline}
                      aria-label={t(`${T}.timeline`)}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors group relative"
                    >
                      <History
                        className={`w-4 h-4 transition-colors ${
                          modificationCount > 0 ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {modificationCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm bg-blue-600 text-white"
                        >
                          {modificationCount}
                        </motion.span>
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {modificationCount > 0
                        ? t(modificationCount === 1 ? `${T}.timelineModifiedOne` : `${T}.timelineModifiedMany`, {
                            count: modificationCount,
                          })
                        : t(`${T}.timeline`)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </>
    </div>
  );
}
