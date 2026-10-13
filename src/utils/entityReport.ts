import type { Language } from './languageContext';
import type { EntityRow, ScreeningEntity, ScreeningMatch } from './screeningMock';
import { matchOpenStatus } from './screeningMock';
import {
  AUDIT_TYPE_KEY,
  CATEGORY_KEY,
  DECISION_KEY,
  ENTITY_STATUS_KEY,
  ENTITY_TYPE_KEY,
  OPEN_STATUS_KEY,
  PARENT_TYPE_KEY,
  RISK_KEY,
  ROLE_KEY,
  describeAuditEvent,
  formatDate,
  formatDateTime,
} from '../components/entity-detail/entityDetailShared';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

interface ReportOptions {
  entity: EntityRow;
  matches: ScreeningMatch[];
  t: Translate;
  lang: Language;
  generatedBy: { name: string; email: string };
}

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const nl2br = (value: string) => escapeHtml(value).replace(/\n/g, '<br />');

function buildReference(entity: EntityRow): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `RPT-${entity.uid.slice(0, 8).toUpperCase()}-${stamp}`;
}

function identityRows(entity: EntityRow, t: Translate, lang: Language): Array<[string, string]> {
  if (entity.identity.kind === 'Individual') {
    const id = entity.identity;
    return [
      [t('complianceEntities.detail.summary.individual.lastName'), id.lastName],
      [t('complianceEntities.detail.summary.individual.firstName'), id.firstName],
      [t('complianceEntities.detail.summary.individual.birthDate'), formatDate(id.birthDate, lang)],
      [t('complianceEntities.detail.summary.individual.birthPlace'), id.birthPlace],
      [t('complianceEntities.detail.summary.individual.nationality'), id.nationality],
      [t('complianceEntities.detail.summary.individual.residence'), id.countryOfResidence],
    ];
  }
  const id = entity.identity;
  return [
    [t('complianceEntities.detail.summary.corporate.legalName'), id.legalName],
    [t('complianceEntities.detail.summary.corporate.legalForm'), id.legalForm],
    [t('complianceEntities.detail.summary.corporate.registration'), id.registrationNumber],
    [t('complianceEntities.detail.summary.corporate.incorporation'), formatDate(id.incorporationDate, lang)],
    [t('complianceEntities.detail.summary.corporate.country'), id.country],
    [t('complianceEntities.detail.summary.corporate.headOffice'), id.headOffice],
  ];
}

const statusClass: Record<string, string> = {
  todo: 'badge-warning',
  unsure: 'badge-warning',
  confirmed: 'badge-danger',
  rejected: 'badge-neutral',
};

export function buildEntityReportHtml({ entity, matches, t, lang, generatedBy }: ReportOptions): string {
  const r = (key: string, vars?: Record<string, string | number>) => t(`complianceEntities.report.${key}`, vars);
  const now = new Date();
  const reference = buildReference(entity);
  const counters = entity.counters;
  const sortedMatches = [...matches].sort((a, b) => {
    const order = { todo: 0, unsure: 1, confirmed: 2, rejected: 3 } as const;
    return order[matchOpenStatus(a)] - order[matchOpenStatus(b)] || b.score - a.score;
  });

  const kv = (rows: Array<[string, string]>) =>
    `<dl class="kv">${rows
      .map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`)
      .join('')}</dl>`;

  const summaryRows: Array<[string, string]> = [
    [r('labels.status'), t(ENTITY_STATUS_KEY[entity.status])],
    [r('labels.risk'), t(RISK_KEY[entity.riskLevel])],
    [r('labels.monitoring'), entity.monitoring ? t('complianceEntities.detail.rail.monitoringOn') : t('complianceEntities.detail.rail.monitoringOff')],
    [r('labels.provider'), entity.provider],
    [r('labels.analyst'), entity.analyst],
    [r('labels.parent'), `${entity.parent.name} (${t(PARENT_TYPE_KEY[entity.parent.type])})`],
    [r('labels.relation'), t(ROLE_KEY[entity.relation])],
    [r('labels.dossier'), entity.dossierRef],
    [r('labels.createdAt'), formatDateTime(entity.createdAt, lang)],
    [r('labels.lastScreening'), formatDateTime(entity.lastScreening, lang)],
  ];

  const countersHtml = `
    <div class="counters">
      <div><span class="num">${counters.total}</span><span>${escapeHtml(r('labels.totalMatches'))}</span></div>
      <div class="warn"><span class="num">${counters.todo}</span><span>${escapeHtml(r('labels.todo'))}</span></div>
      <div class="warn"><span class="num">${counters.unsure}</span><span>${escapeHtml(r('labels.unsure'))}</span></div>
      <div class="danger"><span class="num">${counters.confirmed}</span><span>${escapeHtml(r('labels.confirmed'))}</span></div>
      <div><span class="num">${counters.rejected}</span><span>${escapeHtml(r('labels.rejected'))}</span></div>
    </div>`;

  const runsHtml = entity.runs.length
    ? `<table><thead><tr><th>${escapeHtml(r('table.date'))}</th><th>${escapeHtml(r('labels.runKind'))}</th><th>${escapeHtml(r('labels.runBy'))}</th><th>${escapeHtml(r('labels.totalMatches'))}</th></tr></thead><tbody>${[...entity.runs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(
          (run) =>
            `<tr><td>${escapeHtml(formatDateTime(run.date, lang))}</td><td>${escapeHtml(t(`complianceEntities.detail.summary.runs.${run.kind}`))}</td><td>${escapeHtml(run.by)}</td><td>${run.matchesFound}</td></tr>`,
        )
        .join('')}</tbody></table>`
    : '';

  const matchesTable = sortedMatches.length
    ? `<table>
        <thead><tr>
          <th>${escapeHtml(r('table.hit'))}</th>
          <th>${escapeHtml(r('table.score'))}</th>
          <th>${escapeHtml(r('table.categories'))}</th>
          <th>${escapeHtml(r('table.source'))}</th>
          <th>${escapeHtml(r('table.decision'))}</th>
          <th>${escapeHtml(r('table.analyst'))}</th>
          <th>${escapeHtml(r('table.date'))}</th>
        </tr></thead>
        <tbody>${sortedMatches
          .map((mt) => {
            const status = matchOpenStatus(mt);
            return `<tr>
              <td><strong>${escapeHtml(mt.profileName)}</strong></td>
              <td>${mt.score} %</td>
              <td>${mt.categories.map((c) => escapeHtml(t(CATEGORY_KEY[c]))).join(', ')}</td>
              <td>${escapeHtml(mt.source)}</td>
              <td><span class="badge ${statusClass[status]}">${escapeHtml(t(OPEN_STATUS_KEY[status]))}</span></td>
              <td>${escapeHtml(mt.currentDecision?.analyst ?? '')}</td>
              <td>${escapeHtml(mt.currentDecision ? formatDateTime(mt.currentDecision.date, lang) : formatDateTime(mt.lastUpdate, lang))}</td>
            </tr>`;
          })
          .join('')}</tbody></table>`
    : `<p class="muted">${escapeHtml(r('noMatches'))}</p>`;

  const matchDetails = sortedMatches
    .map((mt) => {
      const status = matchOpenStatus(mt);
      const enriched = mt.profile.enrichedDetails;
      const details = mt.profile.details;
      const decisionsHtml = mt.decisions.length
        ? `<table class="compact"><thead><tr><th>#</th><th>${escapeHtml(r('table.decision'))}</th><th>${escapeHtml(r('table.analyst'))}</th><th>${escapeHtml(r('table.date'))}</th><th>${escapeHtml(r('table.comment'))}</th></tr></thead><tbody>${[...mt.decisions]
            .sort((a, b) => b.revision - a.revision)
            .map(
              (d) =>
                `<tr><td>${d.revision}</td><td>${escapeHtml(t(DECISION_KEY[d.decision]))}</td><td>${escapeHtml(d.analyst)}</td><td>${escapeHtml(formatDateTime(d.date, lang))}</td><td>${escapeHtml(d.comment)}</td></tr>`,
            )
            .join('')}</tbody></table>`
        : `<p class="muted">${escapeHtml(r('noDecision'))}</p>`;
      const alertsHtml = `<ul class="plain">${[...mt.alerts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(
          (al) =>
            `<li>${escapeHtml(formatDateTime(al.date, lang))} · ${escapeHtml(t(`complianceEntities.matches.history.${al.kind}`))} · ${escapeHtml(t('complianceEntities.matches.history.scoreAt', { score: al.score }))}</li>`,
        )
        .join('')}</ul>`;

      const profileBlocks: string[] = [];
      if (enriched?.warningsNote) profileBlocks.push(`<h4>${escapeHtml(r('profile.warnings'))}</h4><p>${nl2br(enriched.warningsNote)}</p>`);
      if (enriched?.biography) profileBlocks.push(`<h4>${escapeHtml(r('profile.biography'))}</h4><p>${nl2br(enriched.biography)}</p>`);
      if (details?.identification?.length)
        profileBlocks.push(
          `<h4>${escapeHtml(r('profile.identification'))}</h4>${kv(details.identification.map((i) => [i.label, i.value] as [string, string]))}`,
        );
      if (enriched?.names?.length) profileBlocks.push(`<h4>${escapeHtml(r('profile.names'))}</h4><ul class="plain">${enriched.names.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>`);
      if (enriched?.reports) profileBlocks.push(`<h4>${escapeHtml(r('profile.reports'))}</h4><p>${nl2br(enriched.reports)}</p>`);
      if (enriched?.sources?.length) profileBlocks.push(`<h4>${escapeHtml(r('profile.sources'))}</h4><ul class="plain">${enriched.sources.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>`);

      return `
        <article class="match">
          <header>
            <div>
              <h3>${escapeHtml(mt.profileName)}</h3>
              <p class="muted">${escapeHtml(mt.source)} · ${mt.categories.map((c) => escapeHtml(t(CATEGORY_KEY[c]))).join(', ')} · ${escapeHtml(r('table.score'))} ${mt.score} %</p>
            </div>
            <span class="badge ${statusClass[status]}">${escapeHtml(t(OPEN_STATUS_KEY[status]))}</span>
          </header>
          <div class="cols">
            <section>
              <h4>${escapeHtml(t('complianceEntities.matches.history.decisions'))}</h4>
              ${decisionsHtml}
              <h4>${escapeHtml(t('complianceEntities.matches.history.alerts'))}</h4>
              ${alertsHtml}
            </section>
            <section>${profileBlocks.join('')}</section>
          </div>
        </article>`;
    })
    .join('');

  const auditRows = entity.auditTrail
    .map(
      (ev) =>
        `<tr><td class="nowrap">${escapeHtml(formatDateTime(ev.timestamp, lang))}</td><td>${escapeHtml(ev.actorName)}${ev.actorSublabel ? `<br /><span class="muted">${escapeHtml(ev.actorSublabel)}</span>` : ''}</td><td>${escapeHtml(ev.actorRole ?? '')}</td><td>${escapeHtml(t(AUDIT_TYPE_KEY[ev.type]))}</td><td>${escapeHtml(describeAuditEvent(ev, t))}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(r('title'))} - ${escapeHtml(entity.name)}</title>
<style>
  @page { size: A4; margin: 18mm 14mm 20mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; font-size: 12px; line-height: 1.5; background: #fff; }
  .toolbar { position: sticky; top: 0; display: flex; justify-content: flex-end; gap: 8px; padding: 8px 0 16px; background: #fff; }
  .toolbar button { border: 1px solid #0b3c49; background: #0b3c49; color: #fff; border-radius: 8px; padding: 8px 14px; font-size: 13px; cursor: pointer; }
  .cover { border-bottom: 3px solid #0b3c49; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; gap: 24px; }
  .brand { color: #0b3c49; font-weight: 700; letter-spacing: 0.04em; font-size: 14px; text-transform: uppercase; }
  h1 { font-size: 26px; margin: 4px 0 2px; }
  h2 { font-size: 15px; color: #0b3c49; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 28px 0 12px; page-break-after: avoid; }
  h3 { font-size: 14px; margin: 0; }
  h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin: 12px 0 4px; }
  .meta { text-align: right; color: #64748b; font-size: 11px; }
  .meta strong { color: #0f172a; display: block; font-size: 12px; }
  .muted { color: #64748b; }
  .nowrap { white-space: nowrap; }
  .kv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 24px; margin: 0; }
  .kv div { display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 4px 0; border-bottom: 1px dotted #e2e8f0; }
  .kv dt { color: #64748b; margin: 0; }
  .kv dd { margin: 0; font-weight: 500; }
  .counters { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
  .counters div { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; }
  .counters .num { font-size: 22px; font-weight: 700; }
  .counters .warn .num { color: #b45309; }
  .counters .danger .num { color: #dc2626; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 11px; }
  th { text-align: left; background: #f1f5f9; padding: 6px 8px; border-bottom: 1px solid #cbd5e1; font-weight: 600; }
  td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  table.compact td, table.compact th { padding: 4px 6px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; border: 1px solid transparent; white-space: nowrap; }
  .badge-warning { background: #fef3c7; color: #b45309; border-color: #fcd34d; }
  .badge-danger { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }
  .badge-neutral { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
  .match { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin: 12px 0; page-break-inside: avoid; }
  .match header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  ul.plain { margin: 4px 0; padding-left: 16px; }
  ul.plain li { margin: 2px 0; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 10px; display: flex; justify-content: space-between; }
  @media print { .toolbar { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="toolbar"><button type="button" onclick="window.print()">${escapeHtml(r('print'))}</button></div>
  <header class="cover">
    <div>
      <div class="brand">InvestHub · ${escapeHtml(t('breadcrumb.compliance'))}</div>
      <h1>${escapeHtml(entity.name)}</h1>
      <p class="muted">${escapeHtml(r('title'))} · ${escapeHtml(r('subtitle'))}</p>
      <p class="muted">${escapeHtml(t(ENTITY_TYPE_KEY[entity.type]))} · ID ${escapeHtml(entity.uid)} · ${escapeHtml(t('complianceEntities.detail.providerRef'))} ${escapeHtml(entity.providerRef)}</p>
    </div>
    <div class="meta">
      <strong>${escapeHtml(r('reference'))} ${escapeHtml(reference)}</strong>
      ${escapeHtml(r('generatedOn'))} ${escapeHtml(formatDateTime(now.toISOString(), lang))}<br />
      ${escapeHtml(r('generatedBy'))} ${escapeHtml(generatedBy.name)} (${escapeHtml(generatedBy.email)})
    </div>
  </header>

  <h2>${escapeHtml(r('sections.summary'))}</h2>
  ${kv(summaryRows)}
  ${countersHtml}

  <h2>${escapeHtml(r('sections.identity'))}</h2>
  ${kv(identityRows(entity, t, lang))}

  <h2>${escapeHtml(r('sections.screening'))}</h2>
  ${runsHtml}

  <h2>${escapeHtml(r('sections.matches'))}</h2>
  ${matchesTable}

  ${sortedMatches.length ? `<h2>${escapeHtml(r('sections.matchDetail'))}</h2>${matchDetails}` : ''}

  <h2>${escapeHtml(r('sections.audit'))}</h2>
  ${
    entity.auditTrail.length
      ? `<table><thead><tr><th>${escapeHtml(r('auditCols.date'))}</th><th>${escapeHtml(r('auditCols.actor'))}</th><th>${escapeHtml(r('auditCols.role'))}</th><th>${escapeHtml(r('auditCols.type'))}</th><th>${escapeHtml(r('auditCols.description'))}</th></tr></thead><tbody>${auditRows}</tbody></table>`
      : `<p class="muted">${escapeHtml(r('noAudit'))}</p>`
  }

  <footer>
    <span>${escapeHtml(r('confidential'))}</span>
    <span>${escapeHtml(reference)}</span>
  </footer>
</body>
</html>`;
}

/**
 * Opens the report in a new tab. The browser print dialog produces the PDF.
 * Returns false when the popup was blocked.
 */
export function openEntityReport(options: ReportOptions): { ok: boolean; reference: string } {
  const html = buildEntityReportHtml(options);
  const reference = buildReference(options.entity);
  const win = window.open('', '_blank');
  if (!win) return { ok: false, reference };
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  return { ok: true, reference };
}

function downloadCsv(rows: string[][], filename: string) {
  const content = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const slug = (value: string) => value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
const today = () => new Date().toISOString().split('T')[0];

export function exportEntityMatchesCsv(entity: EntityRow, matches: ScreeningMatch[], t: Translate, lang: Language) {
  const r = (key: string) => t(`complianceEntities.report.${key}`);
  const rows: string[][] = [
    [
      r('table.hit'),
      r('table.score'),
      r('table.categories'),
      r('table.source'),
      r('table.decision'),
      r('table.analyst'),
      r('table.date'),
      r('table.comment'),
      t('complianceEntities.matches.firstSeen'),
      t('complianceEntities.matches.lastUpdate'),
    ],
    ...matches.map((mt) => [
      mt.profileName,
      `${mt.score}`,
      mt.categories.map((c) => t(CATEGORY_KEY[c])).join(' | '),
      mt.source,
      t(OPEN_STATUS_KEY[matchOpenStatus(mt)]),
      mt.currentDecision?.analyst ?? '',
      mt.currentDecision ? formatDateTime(mt.currentDecision.date, lang) : '',
      mt.currentDecision?.comment ?? '',
      formatDateTime(mt.firstSeen, lang),
      formatDateTime(mt.lastUpdate, lang),
    ]),
  ];
  downloadCsv(rows, `matches_${slug(entity.name)}_${today()}.csv`);
}

export function exportEntityAuditCsv(entity: EntityRow, t: Translate, lang: Language) {
  const r = (key: string) => t(`complianceEntities.report.${key}`);
  const rows: string[][] = [
    [r('auditCols.date'), r('auditCols.actor'), 'Email', r('auditCols.role'), r('auditCols.type'), r('auditCols.description'), t('complianceEntities.matches.hit')],
    ...entity.auditTrail.map((ev) => [
      formatDateTime(ev.timestamp, lang),
      ev.actorName,
      ev.actorSublabel ?? '',
      ev.actorRole ?? '',
      t(AUDIT_TYPE_KEY[ev.type]),
      describeAuditEvent(ev, t),
      ev.matchName ?? '',
    ]),
  ];
  downloadCsv(rows, `audit_trail_${slug(entity.name)}_${today()}.csv`);
}

// ---------------------------------------------------------------------------
// Téléchargements fournisseur : rapport PDF (IC-5557) et pistes d'audit CSV
// (IC-5558 par alerte, IC-5559 par entité)
// ---------------------------------------------------------------------------

const d = (key: string) => `complianceEntities.downloads.${key}`;

const AUDIT_CSV_COLUMNS = [
  'date',
  'eventType',
  'status',
  'qualification',
  'comment',
  'author',
  'alertRef',
  'entity',
  'score',
  'lists',
  'changeType',
  'provider',
  'providerRef',
] as const;

type AuditEventTypeKey = 'creation' | 'decision' | 'requalification' | 'escalation' | 'commentEdit';
type AuditStatusKey = 'pending' | 'confirmed' | 'rejected';
type AuditChangeKey = 'new' | 'modified' | 'deleted';

const AUDIT_STATUS_KEY: Record<AuditStatusKey, string> = {
  pending: 'complianceAlerts.status.pending',
  confirmed: 'complianceAlerts.status.confirmed',
  rejected: 'complianceAlerts.status.rejected',
};

const AUDIT_CHANGE_KEY: Record<AuditChangeKey, string> = {
  new: 'complianceAlerts.changes.new',
  modified: 'complianceAlerts.changes.modified',
  deleted: d('csv.changeDeleted'),
};

const DECISION_STATUS: Record<ScreeningMatch['decisions'][number]['decision'], AuditStatusKey> = {
  true_hit: 'confirmed',
  false_hit: 'rejected',
  unsure: 'pending',
};

interface AuditCsvEvent {
  date: string;
  order: number;
  cells: string[];
}

const toUtcIso = (value: string) => new Date(value).toISOString().replace(/\.\d{3}Z$/, 'Z');

const csvCell = (value: string) => (/[;",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

function alertAuditEvents(match: ScreeningMatch, entity: ScreeningEntity, t: Translate): AuditCsvEvent[] {
  type Step =
    | { kind: 'provider'; date: string; score: number; change: AuditChangeKey }
    | { kind: 'decision'; date: string; decision: ScreeningMatch['decisions'][number] }
    | { kind: 'commentEdit'; date: string; comment: string; analyst: string };

  const steps: Step[] = [
    ...match.alerts.map<Step>((al) => ({
      kind: 'provider',
      date: al.date,
      score: al.score,
      change: al.kind === 'new' ? 'new' : 'modified',
    })),
    ...match.decisions.map<Step>((dec) => ({ kind: 'decision', date: dec.date, decision: dec })),
    ...(match.commentEdits ?? []).map<Step>((edit) => ({
      kind: 'commentEdit',
      date: edit.date,
      comment: edit.comment,
      analyst: edit.analyst,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const lists = match.categories.map((c) => t(CATEGORY_KEY[c])).join(', ');
  let status: AuditStatusKey = 'pending';
  let qualification = '';
  let score = match.alerts[0]?.score ?? match.score;
  let change: AuditChangeKey = 'new';

  return steps.map((step, index) => {
    let eventType: AuditEventTypeKey;
    let comment = '';
    let author = t(d('csv.providerAuthor'));
    let rowQualification = '';

    if (step.kind === 'provider') {
      eventType = 'creation';
      status = 'pending';
      score = step.score;
      change = step.change;
    } else if (step.kind === 'decision') {
      const dec = step.decision;
      eventType = dec.decision === 'unsure' ? 'escalation' : dec.revision > 1 ? 'requalification' : 'decision';
      status = DECISION_STATUS[dec.decision];
      qualification = t(DECISION_KEY[dec.decision]);
      rowQualification = qualification;
      comment = dec.comment;
      author = dec.analyst;
    } else {
      eventType = 'commentEdit';
      rowQualification = qualification;
      comment = step.comment;
      author = step.analyst;
    }

    return {
      date: step.date,
      order: index,
      cells: [
        toUtcIso(step.date),
        t(d(`csv.eventTypes.${eventType}`)),
        t(AUDIT_STATUS_KEY[status]),
        rowQualification,
        comment,
        author,
        match.reference,
        entity.name,
        `${score} %`,
        lists,
        t(AUDIT_CHANGE_KEY[change]),
        entity.provider,
        entity.providerCaseRef,
      ],
    };
  });
}

function auditCsvContent(events: AuditCsvEvent[], t: Translate): string {
  const header = AUDIT_CSV_COLUMNS.map((col) => t(d(`csv.columns.${col}`)));
  const rows = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.order - b.order)
    .map((ev) => ev.cells);
  return [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n') + '\r\n';
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const csvBlob = (content: string) => new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' });

/** IC-5558 : piste d'audit d'une seule alerte. */
export function downloadAlertAuditTrail(match: ScreeningMatch, entity: ScreeningEntity, t: Translate) {
  const content = auditCsvContent(alertAuditEvents(match, entity, t), t);
  triggerDownload(csvBlob(content), `piste-audit-alerte-${match.reference}-${today()}.csv`);
}

/** IC-5559 : piste d'audit de toutes les alertes de l'entité, en ordre chronologique global. */
export function downloadEntityAuditTrail(entity: ScreeningEntity, matches: ScreeningMatch[], t: Translate) {
  const unique = Array.from(new Map(matches.map((mt) => [mt.id, mt])).values());
  let order = 0;
  const events = unique
    .flatMap((mt) => alertAuditEvents(mt, entity, t))
    .map((ev) => ({ ...ev, order: order++ }));
  const content = auditCsvContent(events, t);
  triggerDownload(csvBlob(content), `audit-trail-entity-${entity.uid}-${today()}.csv`);
}

const WIN_ANSI_EXTRA: Record<string, number> = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89,
  'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95,
  '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
  ' ': 0x20,
};

function pdfText(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    const byte = code < 0x80 || (code >= 0xa0 && code <= 0xff) ? code : WIN_ANSI_EXTRA[ch] ?? 0x3f;
    const c = String.fromCharCode(byte);
    out += c === '(' || c === ')' || c === '\\' ? `\\${c}` : c;
  }
  return out;
}

function wrap(value: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = '';
  value.split(/\s+/).forEach((word) => {
    if (current && (current + ' ' + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function buildSinglePagePdf(title: string, blocks: Array<{ text: string; bold?: boolean; size?: number; gap?: number }>, footer: string): Uint8Array {
  const ops: string[] = [
    '0.043 0.235 0.286 rg 0 772 595 70 re f',
    `BT /F2 18 Tf 1 1 1 rg 40 800 Td (${pdfText(title)}) Tj ET`,
  ];
  let y = 740;
  blocks.forEach((block) => {
    const size = block.size ?? 10;
    y -= block.gap ?? 0;
    wrap(block.text, Math.floor(1000 / size)).forEach((line) => {
      if (y < 70) return;
      ops.push(`BT /${block.bold ? 'F2' : 'F1'} ${size} Tf 0.06 0.09 0.16 rg 40 ${y} Td (${pdfText(line)}) Tj ET`);
      y -= size + 5;
    });
  });
  ops.push('0.8 0.84 0.88 RG 0.5 w 40 60 m 555 60 l S');
  ops.push(`BT /F1 8 Tf 0.39 0.45 0.55 rg 40 46 Td (${pdfText(footer)}) Tj ET`);
  const stream = ops.join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    `<< /Title (${pdfText(title)}) /Producer (InvestHub) >>`,
  ];

  let pdf = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}

export function buildProviderReportPdf(
  entity: ScreeningEntity,
  matches: ScreeningMatch[],
  t: Translate,
  lang: Language,
): Uint8Array {
  const lastRun = [...entity.runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const label = (key: string, value: string) => ({ text: `${t(d(`pdf.${key}`))} : ${value}` });
  const sorted = [...matches].sort((a, b) => new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime());

  const blocks: Array<{ text: string; bold?: boolean; size?: number; gap?: number }> = [
    { text: t(d('pdf.subtitle'), { provider: entity.provider }), bold: true, size: 12 },
    { ...label('entity', `${entity.name} (${t(ENTITY_TYPE_KEY[entity.type])})`), gap: 8 },
    label('entityRef', entity.uid),
    label('provider', entity.provider),
    label('providerRef', entity.providerCaseRef),
    label('controlDate', lastRun ? formatDateTime(lastRun.date, lang) : '-'),
    label('generatedOn', formatDateTime(new Date().toISOString(), lang)),
    { text: t(d('pdf.matchesTitle'), { count: sorted.length }), bold: true, size: 12, gap: 14 },
    ...(sorted.length
      ? sorted.map((mt) => ({
          text: [
            mt.reference,
            mt.profileName,
            `${mt.score} %`,
            mt.categories.map((c) => t(CATEGORY_KEY[c])).join(', '),
            t(OPEN_STATUS_KEY[matchOpenStatus(mt)]),
          ].join(' · '),
        }))
      : [{ text: t(d('pdf.noMatch')) }]),
  ];

  return buildSinglePagePdf(
    t(d('pdf.title'), { provider: entity.provider, name: entity.name }),
    blocks,
    t(d('pdf.footer')),
  );
}

/**
 * IC-5557 : rapport PDF du fournisseur qui a contrôlé l'entité.
 * Renvoie false quand le fournisseur ne fournit pas de rapport (aucun fichier).
 */
export function downloadProviderReport(
  entity: ScreeningEntity,
  matches: ScreeningMatch[],
  t: Translate,
  lang: Language,
): boolean {
  if (!entity.controlCompleted || !entity.providerReportAvailable) return false;
  const bytes = buildProviderReportPdf(entity, matches, t, lang);
  triggerDownload(
    new Blob([bytes], { type: 'application/pdf' }),
    `rapport-${entity.provider.toLowerCase()}-${entity.uid}-${today()}.pdf`,
  );
  return true;
}
