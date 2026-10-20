import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
  onModify: (newValue: string) => void;
  onComment: () => void;
  /** Ouvre la piste d'audit de la réponse. */
  onTimeline?: () => void;
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
  onComment,
  onTimeline,
}: QuestionActionsProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentResponse);

  const handleSaveEdit = () => {
    if (editValue.trim() !== currentResponse) {
      onModify(editValue);
      toast.success(t(`${T}.modifiedToast`), {
        description: t(`${T}.modifiedToastDesc`),
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(currentResponse);
    setIsEditing(false);
  };

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
      {/* Response value - editable */}
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
          <Button
            size="sm"
            onClick={handleSaveEdit}
            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-3.5 h-3.5" />
            {t(`${T}.save`)}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelEdit}
            className="h-8"
          >
            {t(`${T}.cancel`)}
          </Button>
        </div>
      ) : (
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
            {currentStatus === 'modified' && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 gap-1">
                <Edit2 className="w-3 h-3" />
                {t(`${T}.modified`)}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Approve */}
            {currentStatus !== 'approved' && (
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
            {currentStatus !== 'rejected' && (
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
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
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors group"
                    >
                      <History className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(`${T}.timeline`)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </>
      )}
    </div>
  );
}
