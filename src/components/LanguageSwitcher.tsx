import { Globe, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation, Language } from '../utils/languageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

const LANGUAGES: { code: Language; labelKey: string; short: string }[] = [
  { code: 'fr', labelKey: 'language.french', short: 'FR' },
  { code: 'en', labelKey: 'language.english', short: 'EN' },
];

export function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 flex items-center gap-1.5 group"
              aria-label={t('header.languageSwitcher')}
            >
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors uppercase">
                {lang}
              </span>
            </motion.button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('header.languageSwitcher')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LANGUAGES.map(({ code, labelKey, short }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLang(code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-6">{short}</span>
              <span>{t(labelKey)}</span>
            </span>
            {lang === code && <Check className="w-4 h-4 text-[#0066FF]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
