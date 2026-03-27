import { Document } from '../utils/documentMockData';
import { Badge } from './ui/badge';

interface DocumentTargetingMarkerProps {
  document: Document;
}

export function DocumentTargetingMarker({ document }: DocumentTargetingMarkerProps) {
  const targeting = document.navigatorTargeting;

  if (!targeting) {
    return <p className="text-xs text-gray-400">—</p>;
  }

  const isGeneric = targeting.mode === 'generic';
  const title = isGeneric ? 'Générique' : 'Nominatif';
  const details = isGeneric
    ? `Fonds: ${targeting.fund || 'Tous fonds'} · Parts: ${targeting.shareClass || 'Toutes'} · Segment: ${targeting.segment || 'Tous segments'}`
    : `Investisseur: ${targeting.investor || '-'} · Structure: ${targeting.structure || '-'} · Souscription: ${targeting.subscription || '-'}`;

  return (
    <div className="min-w-0">
      <Badge
        variant="outline"
        className={`text-[11px] ${isGeneric ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
      >
        {title}
      </Badge>
      <p className="mt-1 text-xs leading-snug text-gray-500">{details}</p>
    </div>
  );
}
