// Configuration pour les segments d'investisseurs

export interface SegmentConfig {
  bg: string;
  text: string;
  border: string;
}

export function getSegmentConfig(segment: string): SegmentConfig {
  const segmentConfigs: Record<string, SegmentConfig> = {
    'HNWI': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    'UHNWI': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200'
    },
    'Retail': {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200'
    },
    'Professional': {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200'
    },
    'Institutional': {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200'
    },
    'Family Office': {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    'Corporate': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200'
    }
  };

  // Retourne la config pour le segment, ou une config par défaut
  return segmentConfigs[segment] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200'
  };
}
