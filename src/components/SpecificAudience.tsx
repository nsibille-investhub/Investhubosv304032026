import { Building2, FileText, UserRound } from 'lucide-react';
import { Tag } from './Tag';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

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
  className = 'text-xs leading-snug',
}: SpecificAudienceProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span><Tag icon={UserRound} label={investor} /></span>
          </TooltipTrigger>
          <TooltipContent side="top"><span className="text-xs">Investisseur</span></TooltipContent>
        </Tooltip>
        {structure ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Tag icon={Building2} label={structure} /></span>
            </TooltipTrigger>
            <TooltipContent side="top"><span className="text-xs">Structure</span></TooltipContent>
          </Tooltip>
        ) : null}
        {subscription ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Tag icon={FileText} label={subscription} /></span>
            </TooltipTrigger>
            <TooltipContent side="top"><span className="text-xs">Souscription</span></TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
