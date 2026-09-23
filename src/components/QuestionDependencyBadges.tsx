import { useState } from 'react';
import { ArrowRight, CornerDownRight, Eye, EyeOff, GitBranch } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';

export interface DependencyQuestionSummary {
  id: string;
  label: string;
  sectionTitleKey: string;
  response: string;
}

export interface DependentQuestionEntry extends DependencyQuestionSummary {
  showWhen: string[];
  isActive: boolean;
}

const CHIP_CLASS =
  'inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4 transition-colors';

function AnswerChips({
  answers,
  currentAnswer,
  emptyLabel,
}: {
  answers: string[];
  currentAnswer: string;
  emptyLabel?: string;
}) {
  if (answers.length === 0) {
    return <span className="text-[11px] italic text-muted-foreground">{emptyLabel}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {answers.map(answer => {
        const isCurrent = answer === currentAnswer;
        return (
          <span
            key={answer}
            className={cn(
              'rounded border px-1.5 py-0.5 text-[11px] leading-4',
              isCurrent
                ? 'border-primary bg-primary text-white font-medium'
                : 'border-border bg-muted text-foreground/80',
            )}
          >
            {answer}
          </span>
        );
      })}
    </div>
  );
}

function CurrentAnswer({ response }: { response: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{t('subscriptions.detail.onboarding.dependencies.currentAnswer')}</span>
      {response ? (
        <Badge variant="outline" className="h-5 text-xs font-medium">
          {response}
        </Badge>
      ) : (
        <span className="italic text-muted-foreground/70">{t('subscriptions.detail.onboarding.notProvided')}</span>
      )}
    </div>
  );
}

function VisibilityDot({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-medium',
        isActive ? 'text-emerald-700' : 'text-muted-foreground',
      )}
    >
      {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {isActive
        ? t('subscriptions.detail.onboarding.dependencies.shown')
        : t('subscriptions.detail.onboarding.dependencies.hidden')}
    </span>
  );
}

interface QuestionDependentsBadgeProps {
  currentResponse: string;
  dependents: DependentQuestionEntry[];
  onNavigate: (questionId: string) => void;
}

/** Question pilote : liste des questions dont l'affichage dépend de sa réponse. */
export function QuestionDependentsBadge({
  currentResponse,
  dependents,
  onNavigate,
}: QuestionDependentsBadgeProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (dependents.length === 0) return null;

  const handleNavigate = (questionId: string) => {
    setOpen(false);
    onNavigate(questionId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={event => event.stopPropagation()}
          className={cn(
            CHIP_CLASS,
            'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15',
          )}
        >
          <GitBranch className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {t(
              dependents.length > 1
                ? 'subscriptions.detail.onboarding.dependencies.pilotBadgeMany'
                : 'subscriptions.detail.onboarding.dependencies.pilotBadgeOne',
              { count: dependents.length },
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[26rem] max-w-[calc(100vw-2rem)] p-0">
        <div className="space-y-2 border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {t('subscriptions.detail.onboarding.dependencies.pilotTitle')}
            </span>
            <Badge className="h-5 bg-primary/10 text-primary border-primary/20 text-xs">{dependents.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('subscriptions.detail.onboarding.dependencies.pilotHint')}
          </p>
          <CurrentAnswer response={currentResponse} />
        </div>
        <ul className="max-h-72 divide-y divide-border/50 overflow-y-auto">
          {dependents.map(dependent => (
            <li key={dependent.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-[11px] text-muted-foreground">{t(dependent.sectionTitleKey)}</div>
                <div
                  className={cn(
                    'text-xs font-medium leading-snug',
                    dependent.isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {dependent.label}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">
                    {t('subscriptions.detail.onboarding.dependencies.shownIf')}
                  </span>
                  <AnswerChips answers={dependent.showWhen} currentAnswer={currentResponse} />
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <VisibilityDot isActive={dependent.isActive} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate(dependent.id)}
                  className="h-7 gap-1 px-2 text-xs text-primary hover:bg-primary/5 hover:text-primary"
                >
                  {t('subscriptions.detail.onboarding.dependencies.viewQuestion')}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

interface QuestionDependencyBadgeProps {
  parent: DependencyQuestionSummary;
  showWhen: string[];
  hideWhen: string[];
  isActive: boolean;
  onNavigate: (questionId: string) => void;
}

/** Question dépendante : identifie la question pilote et les réponses qui l'affichent ou la masquent. */
export function QuestionDependencyBadge({
  parent,
  showWhen,
  hideWhen,
  isActive,
  onNavigate,
}: QuestionDependencyBadgeProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleNavigate = () => {
    setOpen(false);
    onNavigate(parent.id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={event => event.stopPropagation()}
          title={t('subscriptions.detail.onboarding.dependencies.dependentTooltip', { question: parent.label })}
          className={cn(
            CHIP_CLASS,
            isActive
              ? 'border-border bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              : 'border-dashed border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
          )}
        >
          {isActive ? (
            <CornerDownRight className="w-3 h-3 shrink-0" />
          ) : (
            <EyeOff className="w-3 h-3 shrink-0" />
          )}
          <span className="shrink-0">
            {isActive
              ? t('subscriptions.detail.onboarding.dependencies.dependentBadge')
              : t('subscriptions.detail.onboarding.dependencies.hidden')}
          </span>
          <span className="shrink-0 opacity-50">·</span>
          <span className="truncate font-normal">{parent.label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[26rem] max-w-[calc(100vw-2rem)] p-0">
        <div className="space-y-1 border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <CornerDownRight className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {t('subscriptions.detail.onboarding.dependencies.dependentTitle')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('subscriptions.detail.onboarding.dependencies.dependentHint')}
          </p>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/40 p-3">
            <div className="text-[11px] text-muted-foreground">{t(parent.sectionTitleKey)}</div>
            <div className="text-xs font-medium leading-snug text-foreground">{parent.label}</div>
            <CurrentAnswer response={parent.response} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <Eye className="w-3 h-3" />
                {t('subscriptions.detail.onboarding.dependencies.shownIf')}
              </div>
              <AnswerChips answers={showWhen} currentAnswer={parent.response} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <EyeOff className="w-3 h-3" />
                {t('subscriptions.detail.onboarding.dependencies.hiddenIf')}
              </div>
              <AnswerChips
                answers={hideWhen}
                currentAnswer={parent.response}
                emptyLabel={t('subscriptions.detail.onboarding.dependencies.anyOtherAnswer')}
              />
            </div>
          </div>

          <div
            className={cn(
              'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs',
              isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800',
            )}
          >
            {isActive ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 shrink-0" />}
            <span>
              {isActive
                ? t('subscriptions.detail.onboarding.dependencies.currentlyShown')
                : t('subscriptions.detail.onboarding.dependencies.currentlyHidden')}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNavigate}
            className="w-full justify-between text-primary hover:text-primary"
          >
            {t('subscriptions.detail.onboarding.dependencies.viewPilotQuestion')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
