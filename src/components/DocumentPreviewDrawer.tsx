import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { useTranslation } from '../utils/languageContext';

interface DocumentPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
  format?: string;
  size?: string;
  date?: string;
}

const FORMAT_COLORS: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  docx: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  xlsx: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  pptx: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
};

export function DocumentPreviewDrawer({
  isOpen,
  onClose,
  documentName,
  format,
  size,
  date,
}: DocumentPreviewDrawerProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(100);

  const formatKey = (format || '').toLowerCase();
  const badgeClass = FORMAT_COLORS[formatKey] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[640px] bg-white dark:bg-gray-950 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {t('ged.preview.title')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {documentName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Document meta */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 text-xs">
              {format && (
                <span className={cn('px-2 py-0.5 rounded font-semibold uppercase', badgeClass)}>
                  {format}
                </span>
              )}
              {size && (
                <span className="text-gray-600 dark:text-gray-400">{size}</span>
              )}
              {date && (
                <span className="text-gray-600 dark:text-gray-400">{date}</span>
              )}
            </div>

            {/* Toolbar */}
            <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[48px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(100)}
                  className="h-8 px-2 text-xs"
                >
                  {t('ged.preview.reset')}
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950">
              <div
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md mx-auto transition-all duration-200 border border-gray-200 dark:border-gray-800"
                style={{
                  width: `${zoom}%`,
                  minHeight: '600px',
                }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center min-h-[600px]">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {documentName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {t('ged.preview.notAvailableDemo')}
                  </p>

                  {/* Mock document content */}
                  <div className="w-full max-w-md space-y-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mx-auto"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-full mt-4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-4/5"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
