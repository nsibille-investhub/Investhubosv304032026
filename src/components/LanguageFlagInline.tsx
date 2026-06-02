import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useTranslation } from '../utils/languageContext';

interface LanguageFlagInlineProps {
  language: string;
}

const FLAGS: Record<string, string> = {
  fr: '\u{1F1EB}\u{1F1F7}',
  en: '\u{1F1EC}\u{1F1E7}',
  de: '\u{1F1E9}\u{1F1EA}',
  it: '\u{1F1EE}\u{1F1F9}',
  es: '\u{1F1EA}\u{1F1F8}',
};

export function LanguageFlagInline({ language }: LanguageFlagInlineProps) {
  const { t } = useTranslation();
  const flag = FLAGS[language] || '\u{1F310}';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-sm leading-none cursor-default">{flag}</span>
      </TooltipTrigger>
      <TooltipContent>
        {t(`subscriptions.language.${language}`)}
      </TooltipContent>
    </Tooltip>
  );
}
