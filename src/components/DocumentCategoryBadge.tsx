import { DocumentCategory } from '../utils/documentMockData';
import { useTranslation } from '../utils/languageContext';

interface DocumentCategoryBadgeProps {
  category: DocumentCategory | undefined | null;
  className?: string;
}

export function DocumentCategoryBadge({ category, className = '' }: DocumentCategoryBadgeProps) {
  const { t } = useTranslation();
  if (!category) return null;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0 ${className}`}
    >
      {t(`ged.addModal.documentCategory.${category}`)}
    </span>
  );
}
