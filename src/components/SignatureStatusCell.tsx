import { motion } from 'motion/react';
import { PenTool, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface SignatureStatusCellProps {
  signatures: {
    required: number;
    completed: number;
    signatories: Array<{
      name: string;
      role: string;
      status: 'pending' | 'signed';
      signedAt?: Date;
    }>;
  };
}

export function SignatureStatusCell({ signatures }: SignatureStatusCellProps) {
  const allSigned = signatures.completed === signatures.required;
  const progress = (signatures.completed / signatures.required) * 100;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="relative">
            {/* Icône principale */}
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${
              allSigned 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40' 
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40'
            }`}>
              <PenTool className="w-3.5 h-3.5" />
            </div>
            
            {/* Badge de compteur */}
            <div className={`absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-semibold ${
              allSigned 
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white' 
                : 'bg-amber-600 dark:bg-amber-500 text-white'
            }`}>
              {signatures.completed}
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold transition-colors ${
                allSigned 
                  ? 'text-emerald-700 dark:text-emerald-400' 
                  : 'text-amber-700 dark:text-amber-400'
              }`}>
                {signatures.completed}/{signatures.required}
              </span>
            </div>
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${
                  allSigned 
                    ? 'bg-emerald-500 dark:bg-emerald-400' 
                    : 'bg-amber-500 dark:bg-amber-400'
                }`}
              />
            </div>
          </div>
        </motion.button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0" 
        align="start" 
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Signatures</h3>
            </div>
            <Badge className={`text-xs px-2 py-0.5 ${
              allSigned 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            }`}>
              {signatures.completed}/{signatures.required}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">Progression</span>
              <span className={`text-xs font-semibold ${
                allSigned 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${
                  allSigned 
                    ? 'bg-emerald-500 dark:bg-emerald-400' 
                    : 'bg-amber-500 dark:bg-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Signataires */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Signataires
            </div>
            {signatures.signatories.map((signatory, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-start justify-between px-3 py-2.5 rounded-lg border ${
                  signatory.status === 'signed'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className={`p-1 rounded-full mt-0.5 ${
                    signatory.status === 'signed'
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                  }`}>
                    {signatory.status === 'signed' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {signatory.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {signatory.role}
                    </div>
                    {signatory.status === 'signed' && signatory.signedAt && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Signé le {new Date(signatory.signedAt).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={`text-[10px] px-2 py-0.5 flex-shrink-0 ml-2 ${
                  signatory.status === 'signed'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                }`}>
                  {signatory.status === 'signed' ? 'Signé' : 'En attente'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
