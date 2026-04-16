import { Document } from '../utils/documentMockData';
import { Globe, UserRound } from 'lucide-react';
import { GenericAudienceInline } from './GenericAudienceCard';
import { SpecificAudience } from './SpecificAudience';
import { Tag } from './Tag';

interface DocumentTargetingMarkerProps {
  document: Document;
  mode?: 'full' | 'tag' | 'details';
}

export function DocumentTargetingMarker({ document, mode = 'full' }: DocumentTargetingMarkerProps) {
  const targeting = document.navigatorTargeting;

  if (!targeting) {
    return <p className="text-xs text-gray-400">—</p>;
  }

  const isGeneric = targeting.mode === 'generic';
  const title = isGeneric ? 'Générique' : 'Nominatif';
  const natureTag = (
    <Tag
      icon={isGeneric ? Globe : UserRound}
      label={title}
      className="text-[11px] bg-[#F5F0EB] text-[#6B5E54] border-[#E0D6CC]"
    />
  );

  const details = isGeneric ? (
    <GenericAudienceInline
      fundLabel={targeting.fund}
      shareClassLabel={targeting.shareClass}
      segmentLabel={targeting.segment}
    />
  ) : (
    <SpecificAudience
      investor={targeting.investor || '—'}
      structure={targeting.structure}
      subscription={targeting.subscription}
    />
  );

  if (mode === 'tag') {
    return natureTag;
  }

  if (mode === 'details') {
    return <div className="min-w-0">{details}</div>;
  }

  return (
    <div className="min-w-0">
      {natureTag}
      <div className="mt-1">{details}</div>
    </div>
  );
}
