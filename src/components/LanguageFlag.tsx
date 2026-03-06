import React from 'react';

interface LanguageFlagProps {
  language: string;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

const languageFlags: Record<string, string> = {
  'Français': '🇫🇷',
  'English': '🇬🇧',
  'Español': '🇪🇸',
  'Deutsch': '🇩🇪',
  'Italiano': '🇮🇹',
  'Português': '🇵🇹',
  'Nederlands': '🇳🇱',
  '中文': '🇨🇳',
  '日本語': '🇯🇵',
  '한국어': '🇰🇷',
  'العربية': '🇸🇦',
  'Русский': '🇷🇺',
};

export function LanguageFlag({ language, size = 'md', showTooltip = false }: LanguageFlagProps) {
  const flag = languageFlags[language] || '🌐';
  
  const sizeClasses = size === 'sm' ? 'text-sm' : 'text-base';
  
  return (
    <span 
      className={`${sizeClasses} leading-none`}
      title={showTooltip ? language : undefined}
    >
      {flag}
    </span>
  );
}
