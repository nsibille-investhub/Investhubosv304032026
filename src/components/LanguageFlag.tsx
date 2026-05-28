import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';
import { useTranslation } from '../utils/languageContext';

interface LanguageFlagProps {
  language: string;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

const namedLanguageFlags: Record<string, string> = {
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

const codeLanguageFlags: Record<string, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  de: '🇩🇪',
  it: '🇮🇹',
  es: '🇪🇸',
};

const codeLanguageLabelKey: Record<string, string> = {
  fr: 'subscriptions.language.fr',
  en: 'subscriptions.language.en',
  de: 'subscriptions.language.de',
  it: 'subscriptions.language.it',
  es: 'subscriptions.language.es',
};

export function LanguageFlag({ language, size = 'md', showTooltip = false }: LanguageFlagProps) {
  const { t } = useTranslation();
  const isCode = language in codeLanguageFlags;
  const flag = isCode ? codeLanguageFlags[language] : (namedLanguageFlags[language] || '🌐');
  const label = isCode ? t(codeLanguageLabelKey[language]) : language;

  const sizeClasses = size === 'sm' ? 'text-sm' : 'text-base';

  if (!showTooltip) {
    return (
      <span className={cn(sizeClasses, 'leading-none')} aria-label={label}>
        {flag}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(sizeClasses, 'leading-none inline-flex items-center cursor-default')}
          aria-label={label}
        >
          {flag}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
