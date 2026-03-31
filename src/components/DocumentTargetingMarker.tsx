import { Document } from '../utils/documentMockData';
import { Badge } from './ui/badge';
import { GenericAudienceInline } from './GenericAudienceCard';
import { SpecificAudience } from './SpecificAudience';

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
  const badge = (
    <Badge
      variant="outline"
      className={`text-[11px] ${isGeneric ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
    >
      {title}
    </Badge>
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
    return badge;
  }

  if (mode === 'details') {
    return <div className="min-w-0">{details}</div>;
  }

  return (
    <div className="min-w-0">
      {badge}
      <div className="mt-1">{details}</div>
    </div>
  );
}
