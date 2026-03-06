import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Edit2 } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditableFieldProps {
  label: string;
  value: string | undefined;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  validation?: (value: string) => { valid: boolean; error?: string };
  onSave: (newValue: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function EditableField({
  label,
  value,
  type = 'text',
  options,
  validation,
  onSave,
  placeholder,
  icon,
  className = '',
  disabled = false
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [error, setError] = useState<string | undefined>();

  const handleSave = () => {
    // Validation
    if (validation) {
      const result = validation(editValue);
      if (!result.valid) {
        setError(result.error);
        return;
      }
    }

    // Sauvegarde
    onSave(editValue);
    setIsEditing(false);
    setError(undefined);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
    setError(undefined);
  };

  if (disabled) {
    return (
      <div className={className}>
        <label className="text-xs text-gray-500 mb-1 block">{label}</label>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-gray-400 italic">Non disponible pour ce type</span>
        </div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <motion.div 
        className={`group ${className}`}
        whileHover={{ scale: 1.01 }}
      >
        <label className="text-xs text-gray-500 mb-1 block">{label}</label>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon}
            <span className="text-sm text-gray-900 truncate">
              {value || <span className="text-gray-400 italic">Non renseigné</span>}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      
      {type === 'select' && options ? (
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm"
          rows={3}
        />
      ) : (
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm"
        />
      )}
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-red-600 mt-1 flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          {error}
        </motion.p>
      )}
      
      <div className="flex items-center gap-2 mt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
        >
          <Check className="w-3.5 h-3.5" />
          Sauvegarder
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCancel}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
        >
          <X className="w-3.5 h-3.5" />
          Annuler
        </motion.button>
      </div>
    </motion.div>
  );
}
