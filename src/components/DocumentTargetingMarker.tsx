import { Document } from '../utils/documentMockData';
import { Globe, UserRound } from 'lucide-react';
import { GenericAudienceInline } from './GenericAudienceCard';
import { SpecificAudience } from './SpecificAudience';
import { Tag } from './Tag';
import { useTranslation } from '../utils/languageContext';

interface DocumentTargetingMarkerProps {
  document: Document;
  mode?: 'full' | 'tag' | 'details';
}

export function DocumentTargetingMarker({ document, mode = 'full' }: DocumentTargetingMarkerProps) {
  const { t } = useTranslation();
  const targeting = document.navigatorTargeting;

  if (!targeting) {
    return <p className="text-xs text-gray-400">—</p>;
  }

  const isGeneric = targeting.mode === 'generic';
  const title = isGeneric ? t('ged.targeting.generic') : t('ged.targeting.nominative');
  const natureTag = (
    <Tag
      icon={isGeneric ? Globe : UserRound}
      label={title}
      className="text-[11px]"
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

  // Lightweight inline marker (used in list-view document rows): no
  // pill background, neutral gray, mirroring the BirdView pattern.
  if (mode === 'tag') {
    if (isGeneric) {
      return (
        <div className="flex items-center gap-1 text-gray-400">
          <Globe className="w-3.5 h-3.5" />
          <span className="text-xs">{t('ged.targeting.generic')}</span>
        </div>
      );
    }
    return (
      <div
        className="flex items-center gap-1 text-gray-400"
        title={t('ged.targeting.nominative')}
      >
        <UserRound className="w-3.5 h-3.5" />
        {targeting.investor && (
          <span className="text-xs truncate max-w-[12rem]">{targeting.investor}</span>
        )}
      </div>
    );
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
