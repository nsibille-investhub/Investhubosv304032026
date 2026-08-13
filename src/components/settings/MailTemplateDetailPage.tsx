import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr as frLocale, enUS as enLocale } from 'date-fns/locale';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Eye,
  Monitor,
  RotateCcw,
  Smartphone,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation, type Language } from '../../utils/languageContext';
import { SECTION_NUMBER, type MailTemplate } from '../../utils/mailTemplatesMockData';
import {
  defaultSelection,
  resolveValues,
  type ContextSelection,
  type SelectableFamily,
} from '../../utils/mailTemplateVariables';
import { formatHtml } from '../../utils/htmlFormat';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PageHeader } from '../ui/page-header';
import { SegmentedControl } from '../ui/segmented-control';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { cn } from '../ui/utils';
import { LanguageFlagInline } from '../LanguageFlagInline';
import { MailTemplateSourceEditor } from './MailTemplateSourceEditor';
import { MailTemplateVariablePanel } from './MailTemplateVariablePanel';
import { MailTemplateWysiwyg } from './MailTemplateWysiwyg';

type ContentLang = 'fr' | 'en';
type PreviewWidth = 'desktop' | 'mobile';

/** Les trois façons de travailler un gabarit, exclusives. */
type ViewMode = 'visual' | 'preview' | 'source';

const PREVIEW_WIDTH_PX: Record<PreviewWidth, number> = {
  desktop: 640,
  mobile: 375,
};

/** Intitulé de la surface affichée, sous la barre de modes. */
const SURFACE_LABEL_KEY: Record<ViewMode, string> = {
  visual: 'visualLabel',
  preview: 'previewLabel',
  source: 'htmlLabel',
};

/** Logo d'exemple embarqué : l'aperçu ne dépend d'aucun appel réseau. */
const SAMPLE_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="56">' +
      '<rect width="180" height="56" rx="6" fill="#0F323D"/>' +
      '<text x="90" y="34" font-family="Arial,Helvetica,sans-serif" font-size="16" ' +
      'fill="#ffffff" text-anchor="middle">InvestHub</text></svg>',
  );

const VARIABLE_PATTERN = /\$[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)*/g;

/** Nouvelle instance à chaque appel : un littéral global garde son lastIndex. */
function variableMatcher(): RegExp {
  return new RegExp(VARIABLE_PATTERN.source, 'g');
}

/**
 * Remplace les variables par les valeurs d'exemple.
 *
 * La substitution passe par les jetons complets : remplacer par sous-chaîne
 * transformerait $amount_final en valeur de $amount suivie de "_final". Une
 * variable sans valeur d'exemple reste affichée telle quelle.
 */
function resolveVariables(html: string, values: Record<string, string>): string {
  const resolved: Record<string, string> = { ...values, $logo: SAMPLE_LOGO };
  return html.replace(variableMatcher(), (token) => resolved[token] ?? token);
}

function buildPreviewDocument(html: string, values: Record<string, string>): string {
  const body = resolveVariables(html, values);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; }
  body {
    padding: 24px;
    background: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    line-height: 1.55;
    color: #1a1a2e;
    -webkit-text-size-adjust: 100%;
  }
  img { max-width: 100%; border: 0; }
  a { color: #1a1a2e; }
  p { margin: 0 0 12px; }
</style>
</head>
<body>${body}</body>
</html>`;
}

/** Contenu de référence, source mise en forme : ouvrir un gabarit ne le marque pas modifié. */
function baselineOf(template: MailTemplate) {
  return {
    fr: { subject: template.fr.subject, html: formatHtml(template.fr.html) },
    en: { subject: template.en.subject, html: formatHtml(template.en.html) },
  };
}

export interface MailTemplateDetailPageProps {
  template: MailTemplate;
  index: number;
  total: number;
  onBack: () => void;
  onNavigate: (offset: number) => void;
  onSave: (patch: {
    fr: { subject: string; html: string };
    en: { subject: string; html: string };
  }) => void;
}

export function MailTemplateDetailPage({
  template,
  index,
  total,
  onBack,
  onNavigate,
  onSave,
}: MailTemplateDetailPageProps) {
  const { t, lang } = useTranslation();
  const dfLocale = (lang as Language) === 'en' ? enLocale : frLocale;

  const [contentLang, setContentLang] = useState<ContentLang>('fr');
  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>('desktop');
  const [draft, setDraft] = useState(() => baselineOf(template));
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  // Élément retenu par famille pour les valeurs d'exemple.
  const [selection, setSelection] = useState<ContextSelection>(defaultSelection);
  const values = useMemo(() => resolveValues(selection), [selection]);

  // Le gabarit change sous le composant lors d'une navigation précédent / suivant.
  const [loadedSlug, setLoadedSlug] = useState(template.slug);
  if (loadedSlug !== template.slug) {
    setLoadedSlug(template.slug);
    setDraft(baselineOf(template));
  }

  const baseline = useMemo(() => baselineOf(template), [template]);
  const current = draft[contentLang];
  const isDirty =
    draft.fr.subject !== baseline.fr.subject ||
    draft.fr.html !== baseline.fr.html ||
    draft.en.subject !== baseline.en.subject ||
    draft.en.html !== baseline.en.html;

  const previewDoc = useMemo(
    () => buildPreviewDocument(current.html, values),
    [current.html, values],
  );

  const usedVariables = useMemo(
    () => Array.from(new Set(`${current.subject} ${current.html}`.match(variableMatcher()) ?? [])),
    [current.subject, current.html],
  );

  const proposedNames = template.proposedVariables.map((variable) => variable.name);
  const unknownVariables = usedVariables.filter(
    (variable) => !template.variables.includes(variable) && !proposedNames.includes(variable),
  );

  const updateContent = (patch: Partial<{ subject: string; html: string }>) => {
    setDraft((prev) => ({ ...prev, [contentLang]: { ...prev[contentLang], ...patch } }));
  };

  const insertVariable = (variable: string) => {
    // Insérer depuis l'aperçu n'a pas de sens : on repasse à l'éditeur visuel.
    if (viewMode === 'preview') {
      setViewMode('visual');
      updateContent({ html: `${current.html}${variable}` });
      return;
    }
    const textarea = editorRef.current;
    if (!textarea) {
      updateContent({ html: `${current.html}${variable}` });
      return;
    }
    const start = textarea.selectionStart ?? current.html.length;
    const end = textarea.selectionEnd ?? start;
    const next = `${current.html.slice(0, start)}${variable}${current.html.slice(end)}`;
    updateContent({ html: next });
    requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + variable.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const handleReset = () => {
    setDraft(baselineOf(template));
    toast.info(t('mailTemplates.editor.resetDone'));
  };

  const handleFormat = () => {
    updateContent({ html: formatHtml(current.html) });
    toast.success(t('mailTemplates.editor.formatDone'));
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(current.html).then(
      () => toast.success(t('mailTemplates.toast.copySuccessTitle')),
      () => {},
    );
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col bg-gray-50 dark:bg-gray-950 h-full">
        <PageHeader
          breadcrumb={[{ label: template.name }]}
          onBack={onBack}
          title={template.name}
          subtitle={template.origin}
          secondaryAction={{
            label: t('mailTemplates.editor.reset'),
            icon: <RotateCcw className="w-4 h-4" />,
            onClick: handleReset,
            disabled: !isDirty,
          }}
          primaryAction={{
            label: t('mailTemplates.editor.save'),
            onClick: () => onSave(draft),
            disabled: !isDirty,
          }}
        />

        <div className="px-6 py-6 space-y-4">
          {/* Identité du gabarit et navigation dans la liste */}
          <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <Badge variant="outline" className="gap-1.5 border-gray-200 dark:border-gray-700">
                <span className="text-[10px] font-semibold tabular-nums">
                  {SECTION_NUMBER[template.section]}
                </span>
                <span>{t(`mailTemplates.sections.${template.section}`)}</span>
              </Badge>
              <Badge variant="outline" className="border-gray-200 dark:border-gray-700">
                {t(`mailTemplates.recipient.${template.recipient}`)}
              </Badge>
              <Badge variant="outline" className="border-gray-200 dark:border-gray-700">
                {t(`mailTemplates.trigger.${template.trigger}`)}
              </Badge>
              <Badge variant="outline" className="border-gray-200 dark:border-gray-700">
                {t(`mailTemplates.status.${template.status}`)}
              </Badge>
              <code className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                {template.slug}
              </code>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                {t('mailTemplates.detail.position', { index: index + 1, total })}
              </span>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={index <= 0}
                      onClick={() => onNavigate(-1)}
                      aria-label={t('mailTemplates.detail.previous')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('mailTemplates.detail.previous')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={index >= total - 1}
                      onClick={() => onNavigate(1)}
                      aria-label={t('mailTemplates.detail.next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('mailTemplates.detail.next')}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Variables proposées : à créer avant toute mise en production */}
          {template.proposedVariables.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {t('mailTemplates.editor.proposedTitle')}
                </p>
                <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-100">
                  {t('mailTemplates.editor.proposedBody')}
                </p>
                <ul className="mt-2 space-y-1">
                  {template.proposedVariables.map((variable) => (
                    <li key={variable.name} className="text-sm text-amber-800 dark:text-amber-100">
                      <code className="font-mono">{variable.name}</code>
                      {` — ${variable.note}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Éditeur et aperçu */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
              <Tabs
                value={contentLang}
                onValueChange={(value) => setContentLang(value as ContentLang)}
              >
                <TabsList>
                  {(['fr', 'en'] as ContentLang[]).map((code) => (
                    <TabsTrigger key={code} value={code} className="gap-1.5">
                      <LanguageFlagInline language={code} />
                      <span>{t(`subscriptions.language.${code}`)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Mode d'affichage, et largeur de rendu quand elle s'applique */}
              <div className="flex items-center gap-3">
                <SegmentedControl
                  size="sm"
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as ViewMode)}
                  aria-label={t('mailTemplates.editor.viewMode')}
                  options={[
                    {
                      value: 'visual',
                      label: t('mailTemplates.editor.modeVisual'),
                      icon: <Wand2 className="w-3.5 h-3.5" />,
                    },
                    {
                      value: 'preview',
                      label: t('mailTemplates.editor.modePreview'),
                      icon: <Eye className="w-3.5 h-3.5" />,
                    },
                    {
                      value: 'source',
                      label: t('mailTemplates.editor.modeSource'),
                      icon: <Code2 className="w-3.5 h-3.5" />,
                    },
                  ]}
                />

                {viewMode !== 'source' && (
                  <>
                    <span
                      className="w-px h-6 bg-gray-200 dark:bg-gray-800"
                      aria-hidden
                    />
                    <SegmentedControl
                      size="sm"
                      value={previewWidth}
                      onValueChange={(value) => setPreviewWidth(value as PreviewWidth)}
                      aria-label={t('mailTemplates.editor.previewWidth')}
                      options={[
                        {
                          value: 'desktop',
                          label: t('mailTemplates.editor.widthDesktop'),
                          icon: <Monitor className="w-3.5 h-3.5" />,
                        },
                        {
                          value: 'mobile',
                          label: t('mailTemplates.editor.widthMobile'),
                          icon: <Smartphone className="w-3.5 h-3.5" />,
                        },
                      ]}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <Label htmlFor="template-subject" className="text-xs">
                {t('mailTemplates.editor.subject')}
              </Label>
              <Input
                id="template-subject"
                value={current.subject}
                onChange={(e) => updateContent({ subject: e.target.value })}
                className="mt-2 font-mono"
              />
            </div>

            <div className="flex">
              {/* Surface de travail : éditeur visuel, aperçu rendu ou source */}
              <div className="flex-1 min-w-0 border-r border-gray-100 dark:border-gray-800">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t(`mailTemplates.editor.${SURFACE_LABEL_KEY[viewMode]}`)}
                  </span>
                  <div className="flex items-center gap-2">
                    {viewMode === 'preview' && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {t('mailTemplates.editor.previewHint')}
                      </span>
                    )}
                    {viewMode === 'source' && (
                      <>
                        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                          {t('mailTemplates.editor.charCount', { count: current.html.length })}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleFormat}
                              className="h-8 gap-1.5 text-xs"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                              {t('mailTemplates.editor.format')}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('mailTemplates.editor.formatHint')}</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyHtml}
                          aria-label={t('mailTemplates.editor.copyHtml')}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('mailTemplates.editor.copyHtml')}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {viewMode === 'source' && (
                  <MailTemplateSourceEditor
                    value={current.html}
                    onChange={(html) => updateContent({ html })}
                    ariaLabel={t('mailTemplates.editor.htmlLabel')}
                    editorRef={editorRef}
                  />
                )}

                {viewMode === 'visual' && (
                  <MailTemplateWysiwyg
                    value={current.html}
                    onChange={(html) => updateContent({ html })}
                    ariaLabel={t('mailTemplates.editor.visualLabel')}
                    width={PREVIEW_WIDTH_PX[previewWidth]}
                  />
                )}

                {viewMode === 'preview' && (
                  <div className="h-[600px] overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
                    <div
                      className="mx-auto bg-white shadow-sm"
                      style={{ width: PREVIEW_WIDTH_PX[previewWidth], maxWidth: '100%' }}
                    >
                      <iframe
                        title={t('mailTemplates.editor.previewLabel')}
                        srcDoc={previewDoc}
                        sandbox=""
                        className="w-full h-[520px] border-0 block"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Variables : recherche, familles, glisser-déposer */}
              <div className="w-[280px] shrink-0">
                <MailTemplateVariablePanel
                  templateVariables={template.variables}
                  proposedVariables={proposedNames}
                  usedVariables={usedVariables}
                  values={values}
                  selection={selection}
                  onSelectionChange={(family: SelectableFamily, optionId: string) =>
                    setSelection((prev) => ({ ...prev, [family]: optionId }))
                  }
                  onInsert={insertVariable}
                />
              </div>
            </div>

            {unknownVariables.length > 0 && (
              <p className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-red-600 dark:text-red-400">
                {t('mailTemplates.editor.unknownVariables', {
                  list: unknownVariables.join(', '),
                })}
              </p>
            )}
          </motion.div>

          {/* Suivi */}
          <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 px-4 py-3 flex flex-wrap items-center gap-6">
            <MetaItem
              label={t('mailTemplates.detail.sends')}
              value={template.usageCount.toLocaleString(lang)}
            />
            <MetaItem
              label={t('mailTemplates.detail.lastSent')}
              value={
                template.lastSentAt
                  ? format(parseISO(template.lastSentAt), 'dd/MM/yyyy', { locale: dfLocale })
                  : t('mailTemplates.usage.never')
              }
            />
            <MetaItem
              label={t('mailTemplates.detail.updatedAt')}
              value={format(parseISO(template.updatedAt), 'dd/MM/yyyy', { locale: dfLocale })}
            />
            <MetaItem label={t('mailTemplates.detail.updatedBy')} value={template.updatedBy} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
