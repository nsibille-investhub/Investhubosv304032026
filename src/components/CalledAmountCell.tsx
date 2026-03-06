import { motion } from 'motion/react';
import { TrendingUp, Clock, ArrowRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from './ui/utils';
import { formatCurrency } from '../utils/formatters';

interface CalledAmountCellProps {
  calledAmount: number;
  pendingCallAmount: number;
  remainingAmount: number;
  totalAmount: number;
}

export function CalledAmountCell({
  calledAmount,
  pendingCallAmount,
  remainingAmount,
  totalAmount
}: CalledAmountCellProps) {
  const calledPercentage = totalAmount > 0 ? (calledAmount / totalAmount) * 100 : 0;
  const pendingPercentage = totalAmount > 0 ? (pendingCallAmount / totalAmount) * 100 : 0;
  const remainingPercentage = totalAmount > 0 ? (remainingAmount / totalAmount) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      {/* Montant principal */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(calledAmount)}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calledPercentage}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-full bg-green-500 dark:bg-green-400"
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-semibold">Montant appelé</div>
              <div className="text-xs">{formatCurrency(calledAmount)}</div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pendingPercentage}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-orange-500 dark:bg-orange-400"
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-semibold">En attente</div>
              <div className="text-xs">{formatCurrency(pendingCallAmount)}</div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${remainingPercentage}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-full bg-blue-500 dark:bg-blue-400"
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-semibold">Restant à appeler</div>
              <div className="text-xs">{formatCurrency(remainingAmount)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Détails condensés */}
      <div className="flex items-center gap-3 text-xs">
        {pendingCallAmount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 cursor-help">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{formatCurrency(pendingCallAmount)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">Appel en attente</div>
                <div className="text-xs">Montant en cours de traitement</div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {remainingAmount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 cursor-help">
                <ArrowRight className="w-3 h-3" />
                <span className="font-medium">{formatCurrency(remainingAmount)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">Restant à appeler</div>
                <div className="text-xs">Montant qui sera appelé ultérieurement</div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
