import { HighlightText } from './HighlightText';
import { ShareClassBadge } from './ShareClassBadge';
import { Badge } from './ui/badge';

interface FundShareCellProps {
  fundName: string;
  shareClass: string;
  searchTerm?: string;
}

export function FundShareCell({ fundName, shareClass, searchTerm = '' }: FundShareCellProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
        <HighlightText text={fundName} searchTerm={searchTerm} />
      </Badge>
      <ShareClassBadge shareClassName={shareClass} searchTerm={searchTerm} />
    </div>
  );
}