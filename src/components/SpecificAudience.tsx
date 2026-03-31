import { Building2, FileText, UserRound } from 'lucide-react';
import { Tag } from './Tag';

type SpecificAudienceProps = {
  investor: string;
  structure?: string;
  subscription?: string;
  className?: string;
};

export function SpecificAudience({
  investor,
  structure,
  subscription,
  className = 'text-xs leading-snug text-gray-500',
}: SpecificAudienceProps) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <Tag icon={UserRound} label={`Investisseur: ${investor}`} />
      {structure ? <Tag icon={Building2} label={`Structure: ${structure}`} /> : null}
      {subscription ? <Tag icon={FileText} label={`Souscription: ${subscription}`} /> : null}
    </div>
  );
}
