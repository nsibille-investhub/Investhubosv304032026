import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Lock,
  Pencil,
} from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { Button } from './button';
import { Card } from './card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { DisabledReason } from './disabled-reason';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { StatusBadge } from '../StatusBadge';
import { cn } from './utils';
import { toneSurface, toneText, type Tone } from './tone';

export type SectionCardMode = 'validation' | 'read' | 'edit';

export interface SectionCardValidationBar {
  label: string;
  actionLabel: string;
  onAction: () => void;
  loading?: boolean;
}

export interface SectionCardEditBar {
  dirty: boolean;
  saving: boolean;
  errorCount?: number;
  onCancel: () => void;
  onSave: () => void;
}

interface SectionCardProps {
  mode: SectionCardMode;
  icon: LucideIcon;
  title: string;
  /** Ligne sous le titre : "n/N répondues", résumé libre... */
  summary?: ReactNode;
  /** Pastilles à droite de l'en-tête. */
  badges?: ReactNode;
  iconTone?: Tone;
  /** Contour primaire : section ciblée par la navigation. */
  active?: boolean;
  /** Repli. Toujours actif en mode validation. */
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Mode validation : barre "Vérifier toutes les réponses / Valider toute la section". */
  validationBar?: SectionCardValidationBar;
  /** Mode lecture : bouton "Modifier" de l'en-tête. */
  onEdit?: () => void;
  editDisabledReason?: string;
  /** Mode lecture : affiche "Enregistré" quelques secondes après un enregistrement. */
  saved?: boolean;
  /** Mode édition : barre collante en bas de carte. */
  editBar?: SectionCardEditBar;
  children?: ReactNode;
  className?: string;
}

function IconTile({ icon: Icon, tone }: { icon: LucideIcon; tone: Tone }) {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: toneSurface(tone).backgroundColor }}
    >
      <Icon className="w-6 h-6" style={toneText(tone)} />
    </div>
  );
}

function HeaderText({ title, summary }: { title: string; summary?: ReactNode }) {
  return (
    <div className="text-left">
      <h3 className="font-semibold text-foreground text-lg mb-1">{title}</h3>
      {summary && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">{summary}</div>
      )}
    </div>
  );
}

function ValidationBar({ bar }: { bar: SectionCardValidationBar }) {
  return (
    <div className="px-4 py-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-primary">
        <CheckCircle2 className="w-4 h-4" />
        <span>{bar.label}</span>
      </div>
      <Button
        size="sm"
        onClick={bar.onAction}
        disabled={bar.loading}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        {bar.loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {bar.actionLabel}
      </Button>
    </div>
  );
}

function EditBar({ bar }: { bar: SectionCardEditBar }) {
  const { t } = useTranslation();
  const errorCount = bar.errorCount ?? 0;

  let status: ReactNode;
  if (errorCount > 0) {
    status = (
      <span className="text-xs font-medium" style={toneText('danger')}>
        {t(errorCount === 1 ? 'common.sectionCard.errorsOne' : 'common.sectionCard.errorsMany', {
          count: errorCount,
        })}
      </span>
    );
  } else if (bar.dirty) {
    status = (
      <span className="inline-flex items-center gap-2 text-xs font-medium" style={toneText('warning')}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
        {t('common.sectionCard.unsavedChanges')}
      </span>
    );
  } else {
    status = (
      <span className="text-xs text-muted-foreground">{t('common.sectionCard.noChanges')}</span>
    );
  }

  return (
    <div
      className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-card px-5 py-3 shadow-sm"
      role="region"
      aria-label={t('common.sectionCard.editBarLabel')}
    >
      <div aria-live="polite">{status}</div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={bar.onCancel} disabled={bar.saving}>
          {t('common.sectionCard.cancel')}
        </Button>
        <Button size="sm" onClick={bar.onSave} disabled={!bar.dirty || bar.saving}>
          {bar.saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {bar.saving ? t('common.sectionCard.saving') : t('common.sectionCard.save')}
        </Button>
      </div>
    </div>
  );
}

/**
 * Carte de section d'une page de détail.
 * - validation : revue des réponses d'onboarding (en-tête repliable, barre de validation) ;
 * - read : lignes libellé et valeur, bouton "Modifier" dans l'en-tête ;
 * - edit : les lignes deviennent des champs, barre d'enregistrement collante en bas.
 */
export function SectionCard({
  mode,
  icon,
  title,
  summary,
  badges,
  iconTone = 'info',
  active = false,
  collapsible = false,
  open,
  onOpenChange,
  validationBar,
  onEdit,
  editDisabledReason,
  saved = false,
  editBar,
  children,
  className,
}: SectionCardProps) {
  const { t } = useTranslation();
  const activeStyle = active ? { boxShadow: '0 0 0 1px var(--color-primary)' } : undefined;

  if (mode === 'validation') {
    return (
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <Card
          className={cn('overflow-hidden hover:shadow-md transition-shadow', className)}
          style={activeStyle}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-5 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <IconTile icon={icon} tone={iconTone} />
                <HeaderText title={title} summary={summary} />
              </div>
              <div className="flex items-center gap-3">
                {badges}
                {open ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground/60" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground/60" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-border/50">
              {validationBar && <ValidationBar bar={validationBar} />}
              {children}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  const isOpen = collapsible ? open ?? true : true;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card
        className={cn('gap-0 transition-shadow', className)}
        style={{ overflow: 'clip', ...activeStyle }}
      >
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-4">
            <IconTile icon={icon} tone={iconTone} />
            <HeaderText title={title} summary={summary} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {badges}
            {mode === 'read' && saved && (
              <span aria-live="polite">
                <StatusBadge label={t('common.sectionCard.saved')} variant="success" icon={Check} />
              </span>
            )}
            {mode === 'read' && onEdit && (
              <DisabledReason reason={editDisabledReason}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  disabled={Boolean(editDisabledReason)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t('common.sectionCard.edit')}
                </Button>
              </DisabledReason>
            )}
            {collapsible && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    isOpen ? t('common.sectionCard.collapse') : t('common.sectionCard.expand')
                  }
                >
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>

        <CollapsibleContent>
          <div className="border-t border-border divide-y divide-border">{children}</div>
          {mode === 'edit' && editBar && <EditBar bar={editBar} />}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface SectionFieldRowProps {
  label: string;
  mode: 'read' | 'edit';
  /** Valeur affichée en lecture. Vide : "Non renseigné". */
  value?: ReactNode;
  /** Champ de saisie du design system, rendu en mode édition. */
  children?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** Ligne en lecture seule, même en édition : cadenas et motif au survol. */
  lockedReason?: string;
  /** Ligne issue d'un ancien paramètre d'application : effet affiché au survol. */
  legacySettingEffect?: string;
  error?: string;
  hint?: string;
}

const isEmptyValue = (value: ReactNode) =>
  value === undefined || value === null || value === '' || value === false;

/** Ligne libellé et valeur d'une SectionCard en lecture ou en édition. */
export function SectionFieldRow({
  label,
  mode,
  value,
  children,
  htmlFor,
  required = false,
  lockedReason,
  legacySettingEffect,
  error,
  hint,
}: SectionFieldRowProps) {
  const { t } = useTranslation();
  const editable = mode === 'edit' && !lockedReason;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  const display = isEmptyValue(value) ? (
    <span className="text-muted-foreground/60 italic">{t('common.sectionCard.notProvided')}</span>
  ) : (
    value
  );

  return (
    <div className="grid grid-cols-3 gap-4 px-5 py-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={editable ? htmlFor : undefined} className="text-sm text-muted-foreground">
          {label}
          {required && editable && <span aria-hidden> *</span>}
        </label>
        {legacySettingEffect && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground cursor-help"
              >
                <Info className="w-3 h-3" />
                {t('common.sectionCard.legacySetting')}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <span className="text-xs">{legacySettingEffect}</span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="col-span-2 flex flex-col gap-1">
        {editable ? (
          children
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {display}
            {lockedReason && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label={lockedReason}
                    className="inline-flex text-muted-foreground cursor-help"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <span className="text-xs">{lockedReason}</span>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
        {editable && error && (
          <p id={errorId} className="text-xs" style={toneText('danger')} role="alert">
            {error}
          </p>
        )}
        {editable && !error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

type FieldErrors = Record<string, string>;

interface UseSectionEditorOptions<T extends Record<string, unknown>> {
  initialValues: T;
  /** Enregistrement côté serveur. Retourne les erreurs par champ, ou rien en cas de succès. */
  onSave: (draft: T) => Promise<FieldErrors | void>;
  savedDurationMs?: number;
}

/** État d'édition d'une SectionCard : brouillon, enregistrement, erreurs par champ, "Enregistré". */
export function useSectionEditor<T extends Record<string, unknown>>({
  initialValues,
  onSave,
  savedDurationMs = 3000,
}: UseSectionEditorOptions<T>) {
  const [mode, setMode] = useState<'read' | 'edit'>('read');
  const [values, setValues] = useState<T>(initialValues);
  const [draft, setDraft] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const dirty = (Object.keys(draft) as (keyof T)[]).some(key => draft[key] !== values[key]);

  const startEdit = useCallback(() => {
    setDraft(values);
    setErrors({});
    setSaved(false);
    setMode('edit');
  }, [values]);

  const cancel = useCallback(() => {
    setDraft(values);
    setErrors({});
    setMode('read');
  }, [values]);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      if (!((key as string) in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const result = await onSave(draft);
    setSaving(false);
    if (result && Object.keys(result).length > 0) {
      setErrors(result);
      return;
    }
    setValues(draft);
    setMode('read');
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), savedDurationMs);
  }, [draft, onSave, savedDurationMs]);

  return {
    mode,
    values,
    draft,
    errors,
    saving,
    saved,
    dirty,
    startEdit,
    cancel,
    setField,
    save,
    editBar: {
      dirty,
      saving,
      errorCount: Object.keys(errors).length,
      onCancel: cancel,
      onSave: save,
    } satisfies SectionCardEditBar,
  };
}
