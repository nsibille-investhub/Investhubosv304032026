import { useState } from 'react';
import { motion } from 'motion/react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface EditableSectionProps {
  title: string;
  icon: React.ReactNode;
  children: (isEditing: boolean) => React.ReactNode;
  onSave?: (data: any) => void;
  className?: string;
}

export function EditableSection({
  title,
  icon,
  children,
  onSave,
  className = ''
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({});
      toast.success('Modifications enregistrées', {
        description: `Les informations de "${title}" ont été mises à jour`
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    toast.info('Modifications annulées');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Modifier
          </motion.button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-1.5"
              style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="gap-1.5"
            >
              <X className="w-4 h-4" />
              Annuler
            </Button>
          </div>
        )}
      </div>
      
      {children(isEditing)}
    </motion.div>
  );
}
