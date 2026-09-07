import { useMemo } from 'react';
import {
  ArrowRight,
  Building2,
  ChevronRight,
  ExternalLink,
  FileText,
  Fingerprint,
  Link2,
  Radar,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { StatusBadge } from '../StatusBadge';
import { Tag } from '../Tag';
import { useTranslation } from '../../utils/languageContext';
import type { EntityRow, ScreeningMatch, ScreeningRunKind } from '../../utils/screeningMock';
import type { AlertListCategory } from '../../utils/alertsGenerator';
import type { EntityLink } from '../EntityLinks';
import {
  CATEGORY_KEY,
  PARENT_TYPE_KEY,
  ROLE_KEY,
  describeAuditEvent,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  openDossierPage,
  openLinkPage,
  openParentPage,
} from './entityDetailShared';

interface EntitySummaryTabProps {
  entity: EntityRow;
  matches: ScreeningMatch[];
  onOpenAudit: () => void;
  onOpenMatches: (category?: AlertListCategory) => void;
}

const RUN_ICON: Record<ScreeningRunKind, typeof Radar> = {
  initial: Radar,
  manual: RefreshCw,
  ongoing: ShieldAlert,
};

const LINK_ICON: Record<EntityLink['type'], typeof User> = {
  investor: TrendingUp,
  distributor: Users,
  participation: Building2,
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground truncate" title={value}>
        {value || '-'}
      </dd>
    </div>
  );
}

export function EntitySummaryTab({ entity, matches, onOpenAudit, onOpenMatches }: EntitySummaryTabProps) {
  const { t, lang } = useTranslation();

  const exposure = useMemo(() => {
    const counts = new Map<AlertListCategory, number>();
    matches.forEach((mt) => mt.categories.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [matches]);

  const runs = useMemo(
    () => [...entity.runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entity.runs],
  );

  const recentEvents = entity.auditTrail.slice(0, 4);

  const identityFields: Array<[string, string]> =
    entity.identity.kind === 'Individual'
      ? [
          [t('complianceEntities.detail.summary.individual.lastName'), entity.identity.lastName],
          [t('complianceEntities.detail.summary.individual.firstName'), entity.identity.firstName],
          [t('complianceEntities.detail.summary.individual.birthDate'), formatDate(entity.identity.birthDate, lang)],
          [t('complianceEntities.detail.summary.individual.birthPlace'), entity.identity.birthPlace],
          [t('complianceEntities.detail.summary.individual.nationality'), entity.identity.nationality],
          [t('complianceEntities.detail.summary.individual.residence'), entity.identity.countryOfResidence],
        ]
      : [
          [t('complianceEntities.detail.summary.corporate.legalName'), entity.identity.legalName],
          [t('complianceEntities.detail.summary.corporate.legalForm'), entity.identity.legalForm],
          [t('complianceEntities.detail.summary.corporate.registration'), entity.identity.registrationNumber],
          [t('complianceEntities.detail.summary.corporate.incorporation'), formatDate(entity.identity.incorporationDate, lang)],
          [t('complianceEntities.detail.summary.corporate.country'), entity.identity.country],
          [t('complianceEntities.detail.summary.corporate.headOffice'), entity.identity.headOffice],
        ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-muted-foreground" />
              {t('complianceEntities.detail.summary.identity')}
            </CardTitle>
            <CardDescription>{t('complianceEntities.detail.summary.identityHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              {identityFields.map(([label, value]) => (
                <Field key={label} label={label} value={value} />
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              {t('complianceEntities.detail.summary.relation')}
            </CardTitle>
            <CardDescription>{t('complianceEntities.detail.summary.relationHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              onClick={() => openParentPage(entity.parent, t)}
              className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary shrink-0">
                  {entity.parent.entityType === 'Individual' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:underline">{entity.parent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(PARENT_TYPE_KEY[entity.parent.type])} · {t(ROLE_KEY[entity.relation])}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            <button
              type="button"
              onClick={openDossierPage}
              className="w-full flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:underline">{entity.dossierRef}</p>
                  <p className="text-xs text-muted-foreground">{t('complianceEntities.detail.dossier')}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {t('complianceEntities.detail.summary.links')}
              </p>
              {entity.links.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('complianceEntities.detail.summary.noLinks')}</p>
              ) : (
                <ul className="space-y-1.5">
                  {entity.links.map((link) => {
                    const Icon = LINK_ICON[link.type];
                    return (
                      <li key={link.id}>
                        <button
                          type="button"
                          onClick={() => openLinkPage(link, t)}
                          className="w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/50 transition-colors group"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm text-foreground truncate group-hover:underline">{link.name}</span>
                          </span>
                          <span className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                            {link.percentage ?? link.amount}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Radar className="w-4 h-4 text-muted-foreground" />
              {t('complianceEntities.detail.summary.screening')}
            </CardTitle>
            <CardDescription>{t('complianceEntities.detail.summary.screeningHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {runs.map((run) => {
                const Icon = RUN_ICON[run.kind];
                return (
                  <li key={run.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center justify-center size-8 rounded-full bg-muted shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {t(`complianceEntities.detail.summary.runs.${run.kind}`)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(run.date, lang)} · {run.by}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[11px]">
                        {t('complianceEntities.detail.summary.runs.matchesFound', { count: run.matchesFound })}
                      </Badge>
                      {run.newMatches > 0 && (
                        <StatusBadge
                          label={t('complianceEntities.detail.summary.runs.newMatches', { count: run.newMatches })}
                          variant="warning"
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-muted-foreground" />
              {t('complianceEntities.detail.summary.exposure')}
            </CardTitle>
            <CardDescription>{t('complianceEntities.detail.summary.exposureHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            {exposure.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('complianceEntities.detail.summary.noExposure')}</p>
            ) : (
              <ul className="space-y-2">
                {exposure.map(([category, count]) => (
                  <li key={category}>
                    <button
                      type="button"
                      onClick={() => onOpenMatches(category)}
                      className="w-full flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                    >
                      <Tag label={t(CATEGORY_KEY[category])} />
                      <span className="text-sm font-semibold tabular-nums text-foreground">{count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{t('complianceEntities.detail.summary.recentActivity')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onOpenAudit} className="gap-1.5">
              {t('complianceEntities.detail.summary.seeAll')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {recentEvents.map((ev) => (
              <li key={ev.id} className="py-2.5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{describeAuditEvent(ev, t)}</p>
                  <p className="text-xs text-muted-foreground">
                    {ev.actorName}
                    {ev.actorRole ? ` · ${ev.actorRole}` : ''}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap" title={formatDateTime(ev.timestamp, lang)}>
                  {formatRelativeTime(new Date(ev.timestamp).getTime(), t)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
