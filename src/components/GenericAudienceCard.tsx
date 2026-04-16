import { Folder, Landmark, Settings, Users, ArrowRight, Layers3, Tag as TagIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Tag } from './Tag';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

type GenericAudienceCardProps = {
  title: string;
  audienceType: string;
  fundLabel: string;
  segmentLabel?: string;
  documentsCount: number;
  foldersCount: number;
  onOpen?: () => void;
  onSettings?: () => void;
};

export function GenericAudienceCard({
  title,
  audienceType,
  fundLabel,
  segmentLabel,
  documentsCount,
  foldersCount,
  onOpen,
  onSettings,
}: GenericAudienceCardProps) {
  return (
    <article className="rounded-2xl border border-[#D7DEE6] bg-[#F4F6FA] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex items-start justify-between">
        <div className="h-14 w-14 rounded-2xl text-white flex items-center justify-center" style={{ backgroundColor: '#000E2B', boxShadow: '0 6px 16px rgba(0,14,43,0.28)' }}>
          <Folder className="h-7 w-7" />
        </div>
        <button
          type="button"
          onClick={onSettings}
          className="h-10 w-10 rounded-xl border border-[#D8DEE7] bg-white text-[#4D5D75] flex items-center justify-center hover:bg-[#F8FAFD] transition-colors"
          aria-label={`Configurer l'espace ${title}`}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 rounded-xl bg-white p-4">
        <h3 className="text-[30px] leading-tight font-semibold text-[#1B2A41]">{title}</h3>

        <div className="space-y-2 text-[19px] text-[#4D5D75]">
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#617491]" />
            <span>{audienceType}</span>
          </p>
          <p className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[#1BAE70]" />
            <span><span className="font-medium text-[#2C3E55]">Fonds :</span> {fundLabel}</span>
          </p>
          {segmentLabel ? (
            <p className="pl-6">
              <span className="font-medium text-[#2C3E55]">Segment :</span> {segmentLabel}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-[18px] text-[#6B7B92] pt-1">
          <span>{documentsCount} documents</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#915BFF]" />
          <span>{foldersCount} dossiers</span>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={onOpen}
            className="w-full h-12 rounded-xl text-white text-[22px] font-medium"
            style={{ backgroundColor: '#000E2B' }}
          >
            Ouvrir l'espace
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

type GenericAudienceInlineProps = {
  fundLabel?: string;
  shareClassLabel?: string;
  segmentLabel?: string;
  className?: string;
};

export function GenericAudienceInline({
  fundLabel,
  shareClassLabel,
  segmentLabel,
  className = 'text-xs leading-snug',
}: GenericAudienceInlineProps) {
  const hasSpecificFund = fundLabel && !['Tous fonds', 'Tous les fonds'].includes(fundLabel);
  const hasSpecificShareClass = shareClassLabel && !['Toutes parts', 'Toutes les parts'].includes(shareClassLabel);
  const hasSpecificSegment = segmentLabel && !['Tous segments', 'Tous les segments'].includes(segmentLabel);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {hasSpecificFund ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Tag icon={Landmark} label={fundLabel} /></span>
            </TooltipTrigger>
            <TooltipContent side="top"><span className="text-xs">Fonds</span></TooltipContent>
          </Tooltip>
        ) : null}
        {hasSpecificShareClass ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Tag icon={Layers3} label={shareClassLabel} /></span>
            </TooltipTrigger>
            <TooltipContent side="top"><span className="text-xs">Parts</span></TooltipContent>
          </Tooltip>
        ) : null}
        {hasSpecificSegment ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Tag icon={TagIcon} label={segmentLabel} /></span>
            </TooltipTrigger>
            <TooltipContent side="top"><span className="text-xs">Segment</span></TooltipContent>
          </Tooltip>
        ) : null}
        {!hasSpecificFund && !hasSpecificShareClass && !hasSpecificSegment ? <span className="text-gray-400">—</span> : null}
      </div>
    </TooltipProvider>
  );
}
