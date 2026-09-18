import { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  Link2,
  RefreshCw,
  RotateCcw,
  TerminalSquare,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useTranslation } from '../utils/languageContext';
import {
  INTEGRATION_KEYS,
  useSubscriptionDemo,
  type IntegrationKey,
} from '../utils/subscriptionDemoContext';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';

export type SyncDirection = 'incoming' | 'outgoing' | 'bidirectional';

export type SyncStatus = 'not_triggered' | 'pending' | 'in_progress' | 'success' | 'failed';

export interface SyncLog {
  id: string;
  timestamp: Date;
  status: SyncStatus;
  message: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
  endpoint?: string;
  statusCode?: number;
  executionTimeMs?: number;
}

export interface IntegrationSync {
  id: string;
  name: string;
  direction: SyncDirection;
  status: SyncStatus;
  triggerInWorkflow: string;
  lastSyncAt?: Date;
  lastMessage?: string;
  logs: SyncLog[];
}

const statusConfig: Record<SyncStatus, { labelKey: string; className: string }> = {
  success: {
    labelKey: 'subscriptions.detail.integrations.status.success',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  pending: {
    labelKey: 'subscriptions.detail.integrations.status.pending',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  in_progress: {
    labelKey: 'subscriptions.detail.integrations.status.inProgress',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  failed: {
    labelKey: 'subscriptions.detail.integrations.status.failed',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  not_triggered: {
    labelKey: 'subscriptions.detail.integrations.status.notTriggered',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

const directionConfig: Record<SyncDirection, { labelKey: string; className: string }> = {
  incoming: {
    labelKey: 'subscriptions.detail.integrations.direction.incoming',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  outgoing: {
    labelKey: 'subscriptions.detail.integrations.direction.outgoing',
    className: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  bidirectional: {
    labelKey: 'subscriptions.detail.integrations.direction.bidirectional',
    className: 'bg-violet-100 text-violet-800 border-violet-200',
  },
};

const mockIntegrations: IntegrationSync[] = [
  {
    id: 'lemonway',
    name: 'Lemonway',
    direction: 'bidirectional',
    status: 'success',
    triggerInWorkflow: 'Triggered when subscription payment instruction is validated.',
    lastSyncAt: new Date('2026-03-31T10:32:00Z'),
    lastMessage: 'Payment successfully created.',
    logs: [
      {
        id: 'lw-1',
        timestamp: new Date('2026-03-31T10:32:00Z'),
        status: 'success',
        message: 'Sent payment order to Lemonway.',
        endpoint: '/api/lemonway/payments',
        request: { subscriptionId: 'SUB-10442', amount: 250000, currency: 'EUR' },
        response: { paymentId: 'PMT-88412', status: 'accepted' },
        statusCode: 201,
        executionTimeMs: 487,
      },
    ],
  },
  {
    id: 'dotfile',
    name: 'Dotfile',
    direction: 'incoming',
    status: 'failed',
    triggerInWorkflow: 'Triggered after KYC package is submitted by the investor.',
    lastSyncAt: new Date('2026-03-31T10:33:00Z'),
    lastMessage: 'KYC rejected – missing document.',
    logs: [
      {
        id: 'df-1',
        timestamp: new Date('2026-03-31T10:33:00Z'),
        status: 'failed',
        message: 'Callback received - missing proof of address.',
        endpoint: '/webhooks/dotfile/kyc',
        request: { checkId: 'KYC-99231', investorId: 'INV-882' },
        response: { status: 'rejected', reason: 'missing_document' },
        statusCode: 422,
        executionTimeMs: 212,
      },
    ],
  },
  {
    id: 'dealfabric',
    name: 'DealFabric',
    direction: 'outgoing',
    status: 'in_progress',
    triggerInWorkflow: 'Triggered when subscription stage changes to Signed.',
    lastSyncAt: new Date('2026-03-31T10:35:00Z'),
    lastMessage: 'Subscription update currently pushed to CRM.',
    logs: [
      {
        id: 'dc-1',
        timestamp: new Date('2026-03-31T10:35:00Z'),
        status: 'in_progress',
        message: 'CRM payload queued and being delivered.',
        endpoint: '/api/dealfabric/subscriptions',
        request: { subscriptionId: 'SUB-10442', stage: 'signed' },
      },
    ],
  },
  {
    id: 'dynamo',
    name: 'Dynamo',
    direction: 'bidirectional',
    status: 'pending',
    triggerInWorkflow: 'Triggered after portfolio data enrichment starts.',
    lastMessage: 'Webhook expected, waiting for confirmation callback.',
    logs: [
      {
        id: 'dy-1',
        timestamp: new Date('2026-03-31T10:38:00Z'),
        status: 'pending',
        message: 'Payload sent successfully. Awaiting webhook receipt.',
        endpoint: '/api/dynamo/sync',
        request: { subscriptionId: 'SUB-10442' },
        response: { ack: true },
        statusCode: 202,
        executionTimeMs: 133,
      },
    ],
  },
  {
    id: 'flaminem',
    name: 'Flaminem',
    direction: 'outgoing',
    status: 'not_triggered',
    triggerInWorkflow: 'To clarify: currently planned for downstream compliance exports.',
    lastMessage: 'No sync triggered for this subscription yet.',
    logs: [],
  },
];

const formatDateTime = (date?: Date) => (date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(date) : '—');


const INTEGRATION_KEY = 'subscriptions.detail.integrations';

/** Données propres à chaque intégration, telles que la V1 les expose. */
const INTEGRATION_DETAILS: Record<IntegrationKey, Array<{ labelKey: string; value: string }>> = {
  dotfile: [
    { labelKey: `${INTEGRATION_KEY}.dotfile.caseName`, value: 'KYC Epsilon Fund' },
    { labelKey: `${INTEGRATION_KEY}.dotfile.caseId`, value: 'KYC-99231' },
    { labelKey: `${INTEGRATION_KEY}.dotfile.caseStatus`, value: 'rejected' },
  ],
  dynamo: [{ labelKey: `${INTEGRATION_KEY}.dynamo.accountStatus`, value: 'toCreate' }],
  flaminem: [],
  dealfabric: [],
  lemonway: [
    { labelKey: `${INTEGRATION_KEY}.lemonway.accountId`, value: 'LW-ACC-44821' },
    { labelKey: `${INTEGRATION_KEY}.lemonway.walletId`, value: 'LW-WAL-99120' },
    { labelKey: `${INTEGRATION_KEY}.lemonway.mandate`, value: 'MND-2026-0042' },
    { labelKey: `${INTEGRATION_KEY}.lemonway.rum`, value: 'RUM-FR-882194' },
    { labelKey: `${INTEGRATION_KEY}.lemonway.paymentStatus`, value: 'sddSent' },
    { labelKey: `${INTEGRATION_KEY}.lemonway.iban`, value: 'FR76 **** **** **** 4412' },
    { labelKey: `${INTEGRATION_KEY}.lemonway.bic`, value: 'CRLYFRPP' },
    { labelKey: `${INTEGRATION_KEY}.lemonway.reference`, value: 'SUB-15-VRST' },
    { labelKey: `${INTEGRATION_KEY}.lemonway.openBanking`, value: 'pending' },
  ],
};

/** Valeurs techniques traduites (statuts de cas, de compte, de paiement). */
const DETAIL_VALUE_KEYS: Record<string, string> = {
  rejected: `${INTEGRATION_KEY}.values.rejected`,
  toCreate: `${INTEGRATION_KEY}.values.accountToCreate`,
  created: `${INTEGRATION_KEY}.values.accountCreated`,
  sddSent: `${INTEGRATION_KEY}.values.sddSent`,
  pending: `${INTEGRATION_KEY}.values.pending`,
};

/**
 * Actions propres à une intégration : la V1 en propose un jeu différent pour
 * chacune, en plus du rejeu et des journaux communs.
 */
function IntegrationSpecifics({ integration }: { integration: IntegrationSync }) {
  const { t } = useTranslation();
  const [confirmResend, setConfirmResend] = useState(false);
  const key = integration.id as IntegrationKey;
  const details = INTEGRATION_DETAILS[key] ?? [];

  const notify = (labelKey: string) =>
    toast.success(t(labelKey), { description: integration.name });

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {details.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {details.map(detail => (
            <div key={detail.labelKey} className="flex items-baseline justify-between gap-2">
              <dt className="text-gray-500">{t(detail.labelKey)}</dt>
              <dd className="truncate font-medium text-gray-800">
                {DETAIL_VALUE_KEYS[detail.value] ? t(DETAIL_VALUE_KEYS[detail.value]) : detail.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {key === 'dotfile' && (
          <>
            <Button variant="outline" size="sm" onClick={() => notify(`${INTEGRATION_KEY}.dotfile.attach`)}>
              <Link2 className="mr-1 h-3.5 w-3.5" />
              {t(`${INTEGRATION_KEY}.dotfile.attach`)}
            </Button>
            <Button variant="outline" size="sm" onClick={() => notify(`${INTEGRATION_KEY}.dotfile.changeId`)}>
              {t(`${INTEGRATION_KEY}.dotfile.changeId`)}
            </Button>
            <Button variant="outline" size="sm" onClick={() => notify(`${INTEGRATION_KEY}.dotfile.recreate`)}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              {t(`${INTEGRATION_KEY}.dotfile.recreate`)}
            </Button>
            <Button variant="outline" size="sm" onClick={() => notify(`${INTEGRATION_KEY}.dotfile.updateDocuments`)}>
              <Upload className="mr-1 h-3.5 w-3.5" />
              {t(`${INTEGRATION_KEY}.dotfile.updateDocuments`)}
            </Button>
          </>
        )}

        {key === 'dynamo' && (
          <Button variant="outline" size="sm" onClick={() => setConfirmResend(true)}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            {t(`${INTEGRATION_KEY}.dynamo.resend`)}
          </Button>
        )}

        {key === 'flaminem' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => notify(`${INTEGRATION_KEY}.flaminem.open`)}
            >
              {t(`${INTEGRATION_KEY}.flaminem.open`)}
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => notify(`${INTEGRATION_KEY}.flaminem.logs`)}
            >
              <TerminalSquare className="mr-1 h-3.5 w-3.5" />
              {t(`${INTEGRATION_KEY}.flaminem.logs`)}
            </Button>
          </>
        )}

        {key === 'dealfabric' && (
          <Button variant="outline" size="sm" onClick={() => notify(`${INTEGRATION_KEY}.dealfabric.refresh`)}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            {t(`${INTEGRATION_KEY}.dealfabric.refresh`)}
          </Button>
        )}
      </div>

      <AlertDialog open={confirmResend} onOpenChange={setConfirmResend}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              {t(`${INTEGRATION_KEY}.dynamo.resend`)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${INTEGRATION_KEY}.dynamo.resendWarning`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('subscriptions.detail.action.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => notify(`${INTEGRATION_KEY}.dynamo.resent`)}>
              {t('subscriptions.detail.action.common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const IntegrationCard = ({
  integration,
  onViewDetails,
  onRetry,
  onForceSync,
  onViewLogs,
}: {
  integration: IntegrationSync;
  onViewDetails: (integration: IntegrationSync) => void;
  onRetry: (integrationId: string) => void;
  onForceSync: (integrationId: string) => void;
  onViewLogs: (integration: IntegrationSync) => void;
}) => {
  const { t } = useTranslation();
  const canRetry = integration.status === 'failed' || integration.status === 'pending' || integration.status === 'in_progress';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
          <p className="mt-1 text-xs text-gray-500">{integration.triggerInWorkflow}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Badge className={`border text-xs ${directionConfig[integration.direction].className}`}>
            {t(directionConfig[integration.direction].labelKey)}
          </Badge>
          <Badge className={`border text-xs ${statusConfig[integration.status].className}`}>
            {t(statusConfig[integration.status].labelKey)}
          </Badge>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <p>
          <span className="font-medium text-gray-700">
            {t('subscriptions.detail.integrations.lastSync')}
          </span>{' '}
          {formatDateTime(integration.lastSyncAt)}
        </p>
        <p>
          <span className="font-medium text-gray-700">
            {t('subscriptions.detail.integrations.summary')}
          </span>{' '}
          {integration.lastMessage || t('subscriptions.detail.integrations.noMessage')}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(integration)}>
          {t('subscriptions.detail.integrations.viewDetails')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onViewLogs(integration)}>
          <TerminalSquare className="mr-1 h-3.5 w-3.5" />
          {t('subscriptions.detail.integrations.viewLogs')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onRetry(integration.id)} disabled={!canRetry}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          {t('subscriptions.detail.integrations.retrySync')}
        </Button>
        <Button size="sm" onClick={() => onForceSync(integration.id)}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          {t('subscriptions.detail.integrations.forceSync')}
        </Button>
      </div>

      <IntegrationSpecifics integration={integration} />
    </div>
  );
};

const IntegrationDetailsDrawer = ({ integration, open, onOpenChange }: { integration: IntegrationSync | null; open: boolean; onOpenChange: (open: boolean) => void; }) => {
  const latestLog = integration?.logs[0];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full max-w-2xl overflow-y-auto p-0">
        <DrawerHeader className="border-b border-gray-100">
          <DrawerTitle>{integration?.name || 'Integration details'}</DrawerTitle>
          <DrawerDescription>{integration?.triggerInWorkflow}</DrawerDescription>
        </DrawerHeader>

        {integration && (
          <div className="space-y-6 p-4">
            <section className="rounded-lg border border-gray-200 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Technical details</h4>
              <div className="space-y-2 text-xs text-gray-700">
                <p><span className="font-medium">Endpoint called:</span> {latestLog?.endpoint || 'N/A'}</p>
                <p><span className="font-medium">Status code:</span> {latestLog?.statusCode ?? 'N/A'}</p>
                <p><span className="font-medium">Execution time:</span> {latestLog?.executionTimeMs ? `${latestLog.executionTimeMs} ms` : 'N/A'}</p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-700">Payload (JSON)</p>
                  <pre className="max-h-44 overflow-auto rounded bg-gray-950 p-3 text-[11px] text-gray-100">{JSON.stringify(latestLog?.request ?? {}, null, 2)}</pre>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-700">Response</p>
                  <pre className="max-h-44 overflow-auto rounded bg-gray-950 p-3 text-[11px] text-gray-100">{JSON.stringify(latestLog?.response ?? {}, null, 2)}</pre>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Timeline / History</h4>
              <div className="space-y-2">
                {integration.logs.length === 0 ? (
                  <p className="text-xs text-gray-500">No sync logs available.</p>
                ) : (
                  integration.logs.map((log) => (
                    <div key={log.id} className="rounded border border-gray-100 bg-gray-50 p-2 text-xs text-gray-700">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span>{formatDateTime(log.timestamp)}</span>
                        <Badge className={`border text-[10px] ${statusConfig[log.status].className}`}>{statusConfig[log.status].label}</Badge>
                      </div>
                      <p>{log.message}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 p-4">
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Error explanation</h4>
              {integration.status === 'failed' ? (
                <>
                  <p className="text-xs text-gray-700">The last synchronization failed because required data was missing in the incoming payload.</p>
                  <p className="mt-2 text-xs text-gray-700"><span className="font-medium">Suggested resolution:</span> Update the missing fields and relaunch with "Retry sync".</p>
                </>
              ) : (
                <p className="text-xs text-gray-600">No blocking error currently detected.</p>
              )}
            </section>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export function IntegrationsTab() {
  const { t } = useTranslation();
  const { config: demo } = useSubscriptionDemo();
  const [integrations, setIntegrations] = useState<IntegrationSync[]>(mockIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationSync | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshSelectedIntegration = (nextIntegrations: IntegrationSync[], integrationId: string) => {
    if (selectedIntegration?.id === integrationId) {
      setSelectedIntegration(nextIntegrations.find((item) => item.id === integrationId) || null);
    }
  };

  const appendLogForIntegration = (integrationId: string, status: SyncStatus, message: string) => {
    setIntegrations((prev) => {
      const next = prev.map((integration) => {
        if (integration.id !== integrationId) {
          return integration;
        }

        const newLog: SyncLog = {
          id: `${integrationId}-${Date.now()}`,
          timestamp: new Date(),
          status,
          message,
          endpoint: integration.logs[0]?.endpoint,
          request: integration.logs[0]?.request,
          response: status === 'success' ? { retriggered: true } : { retriggered: false },
          statusCode: status === 'success' ? 200 : 500,
          executionTimeMs: 180,
        };

        return {
          ...integration,
          status,
          lastSyncAt: newLog.timestamp,
          lastMessage: message,
          logs: [newLog, ...integration.logs],
        };
      });

      refreshSelectedIntegration(next, integrationId);
      return next;
    });
  };

  const handlers = {
    retrySync: (integrationId: string) => {
      appendLogForIntegration(integrationId, 'success', 'Retry completed successfully with last payload.');
      toast.success('Sync retried', { description: 'A new log entry has been created.' });
    },
    forceSync: (integrationId: string) => {
      appendLogForIntegration(integrationId, 'in_progress', 'Manual sync triggered by operator.');
      toast.info('Manual sync launched', { description: 'Synchronization has been manually triggered.' });
    },
    fetchLogs: (integration: IntegrationSync) => {
      setSelectedIntegration(integration);
      setDrawerOpen(true);
    },
    viewDetails: (integration: IntegrationSync) => {
      setSelectedIntegration(integration);
      setDrawerOpen(true);
    },
  };

  const visibleIntegrations = integrations.filter(integration =>
    INTEGRATION_KEYS.includes(integration.id as IntegrationKey)
      ? demo.settings.integrations[integration.id as IntegrationKey]
      : true,
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {t('subscriptions.detail.integrations.title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('subscriptions.detail.integrations.subtitle')}
          </p>
        </div>
        <Badge className="border bg-gray-100 text-gray-700">
          <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
          {t('subscriptions.detail.integrations.count', { count: visibleIntegrations.length })}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onViewDetails={handlers.viewDetails}
            onRetry={handlers.retrySync}
            onForceSync={handlers.forceSync}
            onViewLogs={handlers.fetchLogs}
          />
        ))}
      </div>

      <IntegrationDetailsDrawer integration={selectedIntegration} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
