import { Document } from '../utils/documentMockData';
import { DocumentScope, type DocumentScopeData } from './ui/document-scope';

interface DocumentTargetingMarkerProps {
  document: Document;
  folderPath?: string[];
  layout?: 'stacked' | 'inline';
}

export function scopeFromDocument(
  document: Document,
  folderPath?: string[],
): DocumentScopeData | null {
  const targeting = document.navigatorTargeting;
  if (!targeting) return null;
  if (targeting.mode === 'nominative') {
    return {
      nature: 'nominative',
      folderPath,
      investor: targeting.investor,
      structure: targeting.structure,
      subscription: targeting.subscription,
      fund: targeting.fund,
    };
  }
  return {
    nature: 'generic',
    folderPath,
    fund: targeting.fund,
    shareClass: targeting.shareClass,
    segments: targeting.segment ? [targeting.segment] : undefined,
  };
}

export function DocumentTargetingMarker({
  document,
  folderPath,
  layout = 'stacked',
}: DocumentTargetingMarkerProps) {
  const scope = scopeFromDocument(document, folderPath);
  if (!scope) {
    return <p className="text-xs text-gray-400">-</p>;
  }
  return <DocumentScope scope={scope} layout={layout} />;
}
