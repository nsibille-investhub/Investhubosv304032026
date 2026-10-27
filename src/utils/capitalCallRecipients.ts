import type { ScopeAudience, ScopeAudienceInvestor } from '../components/ui/document-scope';
import { buildPreviewDocument } from '../components/settings/MailTemplateDetailPage';
import { MAIL_TEMPLATES, PREVIEW_VALUES, type MailTemplate } from './mailTemplatesMockData';

/** Une ligne de l'appel vue côté envoi : l'investisseur et sa souscription. */
export interface CallRecipientLine {
  investor: string;
  subscription: string;
}

const STRUCTURE_PREFIXES = ['Holding', 'SCI', 'Fondation', 'Family Office', 'Mutuelle'];

/**
 * Destinataires d'un appel, un rang par investisseur : l'adresse de la souscription en principal,
 * plus le contact de la structure en copie pour une personne morale (moteur d'emails commun).
 */
export function callRecipients(lines: CallRecipientLine[], labels: { principal: string; copy: string }): ScopeAudience {
  const byInvestor = new Map<string, ScopeAudienceInvestor>();
  lines.forEach(line => {
    const current = byInvestor.get(line.investor);
    if (current) {
      current.structure = `${current.structure}, ${line.subscription}`;
      return;
    }
    const corporate = STRUCTURE_PREFIXES.some(prefix => line.investor.startsWith(prefix));
    byInvestor.set(line.investor, {
      id: line.investor,
      name: line.investor,
      structure: line.subscription,
      contacts: [
        { id: `${line.investor}-principal`, name: line.investor, role: labels.principal },
        ...(corporate ? [{ id: `${line.investor}-copy`, name: `${line.investor} - ${labels.copy}`, role: labels.copy }] : []),
      ],
    });
  });
  const investors = Array.from(byInvestor.values());
  return {
    investors,
    investorCount: investors.length,
    contactCount: investors.reduce((sum, investor) => sum + investor.contacts.length, 0),
  };
}

/** Gabarit de notification : l'avis combiné a son propre gabarit quand les avis combinés sont actifs. */
export function callTemplate(combinedNotices: boolean): MailTemplate | undefined {
  const slug = combinedNotices ? 'new_call_bulk' : 'new_call';
  return MAIL_TEMPLATES.find(item => item.slug === slug) ?? MAIL_TEMPLATES.find(item => item.slug === 'new_call');
}

/** Aperçu du mail de notification, variables de l'appel résolues, investisseur fictif. */
export function callMailPreview(template: MailTemplate, lang: string, values: { fund?: string; dueDate?: string; message?: string }) {
  const content = template[lang === 'en' ? 'en' : 'fr'];
  const previewValues: Record<string, string> = {
    ...PREVIEW_VALUES,
    ...(values.fund ? { $campaign: values.fund } : {}),
    ...(values.dueDate ? { $date: values.dueDate } : {}),
    $pitch: values.message ?? '',
  };
  const subject = content.subject.replace(/\$[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)*/g, token => previewValues[token] ?? token);
  return { subject, html: buildPreviewDocument(content.html, previewValues) };
}

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

/** Export CSV (séparateur point-virgule, BOM pour Excel). */
export function downloadCsv(headers: string[], rows: (string | number)[][], fileName: string) {
  const content = [headers, ...rows].map(row => row.map(csvCell).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
