import { useMemo } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Download,
  FileText,
  Flag,
  History,
  Lock,
  MessageSquare,
  Radar,
  RefreshCw,
  UserPlus,
  Eye,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Timeline, type TimelineEvent, type TimelineTypeMap } from '../ui/timeline';
import { useTranslation } from '../../utils/languageContext';
import type { EntityAuditEventType, EntityRow } from '../../utils/screeningMock';
import { AUDIT_TYPE_KEY, describeAuditEvent } from './entityDetailShared';

const AUDIT_ICONS: Record<EntityAuditEventType, typeof Radar> = {
  screening_run: Radar,
  match_created: Bell,
  match_changed: RefreshCw,
  match_reopened: BellRing,
  decision: CheckCircle2,
  decision_revised: History,
  comment: MessageSquare,
  assignment: UserPlus,
  monitoring: Eye,
  status: Flag,
  report: FileText,
  export: Download,
  closed: Lock,
};

interface EntityAuditTabProps {
  entity: EntityRow;
}

export function EntityAuditTab({ entity }: EntityAuditTabProps) {
  const { t } = useTranslation();

  const types = useMemo<TimelineTypeMap<EntityAuditEventType>>(() => {
    const map = {} as TimelineTypeMap<EntityAuditEventType>;
    (Object.keys(AUDIT_ICONS) as EntityAuditEventType[]).forEach((type) => {
      map[type] = { label: t(AUDIT_TYPE_KEY[type]), Icon: AUDIT_ICONS[type] };
    });
    return map;
  }, [t]);

  const events = useMemo<TimelineEvent<EntityAuditEventType>[]>(
    () =>
      entity.auditTrail.map((ev) => ({
        id: ev.id,
        type: ev.type,
        timestamp: ev.timestamp,
        actorName: ev.actorName,
        actorSublabel: ev.actorSublabel,
        actorRole: ev.actorRole,
        description: describeAuditEvent(ev, t),
        meta: { matchName: ev.matchName },
      })),
    [entity.auditTrail, t],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('complianceEntities.audit.title')}</CardTitle>
        <CardDescription>{t('complianceEntities.audit.hint')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline<EntityAuditEventType>
          events={events}
          types={types}
          enableFilters
          enableExport
          exportFileName={`audit_${entity.uid}`}
          exportColumns={[
            { header: t('complianceEntities.report.auditCols.date'), value: (e) => e.timestamp },
            { header: t('complianceEntities.report.auditCols.actor'), value: (e) => e.actorName ?? '' },
            { header: t('complianceEntities.report.auditCols.role'), value: (e) => e.actorRole ?? '' },
            { header: t('complianceEntities.report.auditCols.type'), value: (e) => types[e.type].label },
            {
              header: t('complianceEntities.report.auditCols.description'),
              value: (e) => (typeof e.description === 'string' ? e.description : ''),
            },
          ]}
          pageSize={15}
        />
      </CardContent>
    </Card>
  );
}
