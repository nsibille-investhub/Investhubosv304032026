import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { HighlightText } from './HighlightText';
import { copyToClipboard } from '../utils/clipboard';
import { ClickableName } from './ClickableName';

interface SubscriptionNameCellProps {
  name: string;
  id: number;
  searchTerm?: string;
}

export function SubscriptionNameCell({ name, id, searchTerm = '' }: SubscriptionNameCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const idText = `SUB-${id}`;
    const success = await copyToClipboard(idText);
    
    if (success) {
      setCopied(true);
      toast.success('ID copié !', { description: idText });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Erreur de copie', { description: 'Impossible de copier dans le presse-papier' });
    }
  };

  return (
    <div className="flex flex-col gap-1 max-w-[350px]">
      {/* Nom de la souscription */}
      <motion.span
        whileHover={{ x: 2 }}
        className="truncate"
      >
        <ClickableName>
          <HighlightText text={name} searchTerm={searchTerm} />
        </ClickableName>
      </motion.span>

      {/* ID avec bouton de copie */}
      <div className="flex items-center gap-1.5 group">
        <span className="text-xs text-gray-500 dark:text-gray-500">
          ID: {id}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCopyId}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-3 h-3 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
