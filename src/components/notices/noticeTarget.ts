import { callMailPreview, callRecipients, downloadCsv } from '../../utils/capitalCallRecipients';
import { MAIL_TEMPLATES } from '../../utils/mailTemplatesMockData';
import type { NoticeFamily, NoticeLine, NoticeRules, NoticeSendKind } from '../../utils/noticeActions';

const K = 'funds.notices';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const MAIL_SLUGS: Record<NoticeFamily, Partial<Record<NoticeSendKind, string>>> = {
  capitalCalls: { notification: 'new_call', reminder: 'relance_call' },
  distributions: { notification: 'new_distrib' },
  capitalAccounts: { notification: 'new_capital_account', reminder: 'relance_capital_account' },
  releases: { notification: 'deblocage' },
};

/** Email que recevrait la ligne : même gabarit, mêmes valeurs que l'envoi. */
export function noticeMailPreview(family: NoticeFamily, kind: NoticeSendKind, lang: string, fundName: string) {
  const slug = MAIL_SLUGS[family][kind];
  const template = MAIL_TEMPLATES.find(item => item.slug === slug);
  return template ? { ...callMailPreview(template, lang, { fund: fundName }), slug } : null;
}

export interface TargetGroup<L> {
  parentName: string;
  lines: L[];
}

/**
 * Export de la cible : un seul fichier, une ligne par destinataire, au format de l'export des destinataires de GED+.
 * Les destinataires sont ordonnés par ligne, puis parent, puis contacts du parent.
 */
export function exportNoticeTarget<L extends NoticeLine>(
  t: Translate,
  lang: string,
  rules: NoticeRules<L>,
  groups: TargetGroup<L>[],
  withParentColumn: boolean,
): number {
  const family = `${K}.families.${rules.family}`;
  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const headers = [
    ...(withParentColumn ? [t(`${family}.target.parent`)] : []),
    t(`${family}.target.line`),
    ...(rules.hasReminder ? [t(`${K}.common.target.sendPlanned`)] : []),
    t(`${K}.common.target.name`),
    t(`${K}.common.target.type`),
    t(`${K}.common.target.parent`),
    t(`${K}.common.target.lastNotification`),
    t(`${K}.common.target.lastReception`),
    t(`${K}.common.target.lastOpening`),
  ];
  const roles = { principal: t(`${K}.common.target.roles.principal`), copy: t(`${K}.common.target.roles.copy`) };
  const rows: (string | number)[][] = [];
  groups.forEach(group =>
    [...group.lines]
      .sort((a, b) => a.id - b.id)
      .forEach(line => {
        const kind = rules.sendKind(line);
        const lastSent = line.notifiedAt ? dateFormat.format(line.notifiedAt) : '';
        callRecipients([line], roles).investors.forEach(investor =>
          investor.contacts.forEach(contact =>
            rows.push([
              ...(withParentColumn ? [group.parentName] : []),
              `${line.id} - ${line.subscription}`,
              ...(rules.hasReminder ? [kind ? t(`${K}.common.target.kinds.${kind}`) : ''] : []),
              contact.name,
              contact.role,
              investor.name,
              lastSent,
              lastSent,
              '',
            ]),
          ),
        );
      }),
  );
  downloadCsv(headers, rows, `${t(`${family}.target.fileName`)}.csv`);
  return rows.length;
}
