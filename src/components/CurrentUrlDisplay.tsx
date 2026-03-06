import { useState } from 'react';
import { Copy, Check, Link2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

interface CurrentUrlDisplayProps {
  currentPage: Page;
}

export function CurrentUrlDisplay({ currentPage }: CurrentUrlDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const url = getShareableUrl(currentPage);

  const handleCopy = async () => {
    try {
      const success = await copyToClipboard(url);
      if (success) {
        setCopied(true);
        toast.success('Lien copié !', {
          description: 'Le lien de cette page a été copié dans le presse-papier',
          duration: 2000
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error('Erreur de copie', {
          description: 'Impossible de copier dans le presse-papier'
        });
      }
    } catch (error) {
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la copie'
      });
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link2 className="w-3.5 h-3.5" />
        <span>Partager cette page</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">
                  Lien partageable
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-mono truncate">
                    {url}
                  </div>
                  <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-colors ${
                      copied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  💡 <strong>Astuce :</strong> Partagez ce lien avec vos collaborateurs pour qu'ils accèdent directement à cette page.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}