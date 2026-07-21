import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './button';
import { useTranslation } from '../../utils/languageContext';

const BRAND_BLUE = '#000E2B';

export interface BulkActionButton {
  labelKey: string;
  icon: ReactNode;
  onClick: () => void;
  color: string;
  borderColor: string;
  bgColor: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  selectAllFiltered: boolean;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  actions: BulkActionButton[];
  /** i18n key for unit label — defaults to "bulk.selectedOne" / "bulk.selectedMany" */
  unitOneKey?: string;
  unitManyKey?: string;
}

export function BulkActionBar({
  selectedCount,
  totalFilteredCount,
  selectAllFiltered,
  onSelectAllFiltered,
  onClearSelection,
  actions,
  unitOneKey = 'bulk.selectedOne',
  unitManyKey = 'bulk.selectedMany',
}: BulkActionBarProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-b border-gray-200 bg-gray-50 overflow-hidden"
        >
          <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs leading-none font-medium text-white"
                style={{ backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE }}
              >
                {selectedCount}{' '}
                {selectedCount === 1 ? t(unitOneKey) : t(unitManyKey)}
              </span>

              {!selectAllFiltered && selectedCount < totalFilteredCount && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onSelectAllFiltered}
                  className="h-auto p-0 text-xs"
                >
                  {t('bulk.selectAllFiltered', { count: totalFilteredCount })}
                </Button>
              )}

              {selectAllFiltered && (
                <span className="text-xs text-muted-foreground">
                  {t('bulk.allFilteredSelected', { count: totalFilteredCount })}
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8"
              >
                <X className="w-4 h-4 mr-1" />
                {t('bulk.clear')}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {actions.map((action) => (
                <Button
                  key={action.labelKey}
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="h-8"
                  style={{
                    color: action.color,
                    borderColor: action.borderColor,
                    backgroundColor: action.bgColor,
                  }}
                >
                  {action.icon}
                  <span className="ml-1.5">{t(action.labelKey)}</span>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
