import { Users } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface InvestorEmptyStateProps {
  hasFilters: boolean;
  hasSearch: boolean;
  onReset?: () => void;
}

export function InvestorEmptyState({ hasFilters, hasSearch, onReset }: InvestorEmptyStateProps) {
  return (
    <EmptyState
      hasFilters={hasFilters}
      hasSearch={hasSearch}
      onReset={onReset}
      icon={Users}
      entityName="investisseur"
      entityNamePlural="investisseurs"
    />
  );
}
