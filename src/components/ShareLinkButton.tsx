import { useState } from 'react';
import { Copy, Check, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

interface ShareLinkButtonProps {
  url: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareLinkButton({ 
  url, 
  label = 'Copier le lien',
  variant = 'ghost',
  size = 'sm',
  className = ''
}: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const success = await copyToClipboard(url);
      if (success) {
        setCopied(true);
        toast.success('Lien copié !', {
          description: 'Le lien a été copié dans le presse-papier',
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant={variant}
        size={size}
        onClick={handleCopy}
        className={className}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        {size !== 'icon' && <span className="ml-2">{copied ? 'Copié !' : label}</span>}
      </Button>
    </motion.div>
  );
}