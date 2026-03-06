import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';
import { Button } from './button';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = ''
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      // Vérifier le format
      if (!acceptedFormats.includes(file.type)) {
        const formats = acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ');
        resolve(`Format non supporté. Formats acceptés : ${formats}`);
        return;
      }

      // Vérifier la taille
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        resolve(`L'image est trop volumineuse (${formatFileSize(file.size)}). Taille maximale : ${maxSizeMB}MB`);
        return;
      }

      // Vérifier les dimensions (optionnel, limite à 4000x4000px)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width > 4000 || img.height > 4000) {
          resolve(`Les dimensions de l'image sont trop grandes (${img.width}x${img.height}px). Maximum : 4000x4000px`);
        } else {
          resolve(null);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve('Impossible de lire l\'image');
      };
      
      img.src = objectUrl;
    });
  };

  const simulateUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simuler un délai d'upload
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve(reader.result as string);
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    const validationError = await validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const dataUrl = await simulateUpload(file);
      onChange?.(dataUrl);
      toast.success('Image téléchargée', {
        description: 'Votre image a été téléchargée avec succès'
      });
    } catch (err) {
      setError('Une erreur est survenue lors du téléchargement de l\'image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange?.(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image supprimée', {
      description: 'L\'image a été supprimée avec succès'
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!value && !isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-all duration-200
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <motion.div
                animate={{ 
                  y: isDragging ? -5 : 0,
                  scale: isDragging ? 1.1 : 1 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                  isDragging ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </motion.div>
              
              <div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="text-blue-600 hover:text-blue-700">Choisir un fichier</span>
                  {' '}ou glisser-déposer
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP jusqu'à {maxSizeMB}MB
                </p>
              </div>

              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center"
                >
                  <div className="text-blue-600 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Déposer l'image ici</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 rounded-lg border transition-all bg-blue-50 border-blue-200"
          >
            {/* Icône statique */}
            <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>

            {/* Informations du fichier */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">Téléchargement en cours...</p>
              <Progress value={uploadProgress} className="h-1.5 mt-2" />
            </div>

            {/* Pourcentage */}
            <div className="flex-shrink-0">
              <div className="text-sm font-medium text-blue-700">
                {uploadProgress}%
              </div>
            </div>
          </motion.div>
        )}

        {value && !isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={value}
                  alt="Image téléchargée"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                {/* Bouton supprimer */}
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemove}
                  className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Supprimer l'image"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Option de remplacement */}
            <Button
              onClick={handleClick}
              variant="outline"
              size="sm"
              className="mt-2 w-full h-8 text-xs hover:bg-gray-100"
            >
              <Upload className="w-3.5 h-3.5 mr-2" />
              Remplacer l'image
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages d'erreur */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3"
          >
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
