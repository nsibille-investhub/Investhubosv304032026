import { useState } from 'react';
import { ArrowUpDown, RefreshCw, RotateCcw, TerminalSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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

const statusConfig: Record<SyncStatus, { label: string; className: string }> = {
  success: { label: 'Success', className: 'bg-green-100 text-green-800 border-green-200' },
  pending: { label: 'Pending', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
  not_triggered: { label: 'Not triggered', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const directionConfig: Record<SyncDirection, { label: string; className: string }> = {
  incoming: { label: 'Incoming', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  outgoing: { label: 'Outgoing', className: 'bg-sky-100 text-sky-800 border-sky-200' },
  bidirectional: { label: 'Bidirectional', className: 'bg-violet-100 text-violet-800 border-violet-200' },
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
  const canRetry = integration.status === 'failed' || integration.status === 'pending' || integration.status === 'in_progress';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
          <p className="mt-1 text-xs text-gray-500">{integration.triggerInWorkflow}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Badge className={`border text-xs ${directionConfig[integration.direction].className}`}>{directionConfig[integration.direction].label}</Badge>
          <Badge className={`border text-xs ${statusConfig[integration.status].className}`}>{statusConfig[integration.status].label}</Badge>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <p><span className="font-medium text-gray-700">Last sync:</span> {formatDateTime(integration.lastSyncAt)}</p>
        <p><span className="font-medium text-gray-700">Summary:</span> {integration.lastMessage || 'No message yet.'}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(integration)}>
          View details
        </Button>
        <Button variant="outline" size="sm" onClick={() => onViewLogs(integration)}>
          <TerminalSquare className="mr-1 h-3.5 w-3.5" />
          View logs
        </Button>
        <Button variant="outline" size="sm" onClick={() => onRetry(integration.id)} disabled={!canRetry}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Retry sync
        </Button>
        <Button size="sm" onClick={() => onForceSync(integration.id)}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          Force sync
        </Button>
      </div>
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

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Subscription integrations</h2>
          <p className="text-sm text-gray-600">Monitor outbound API calls and inbound webhooks across the subscription lifecycle.</p>
        </div>
        <Badge className="border bg-gray-100 text-gray-700">
          <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
          {integrations.length} integrations
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {integrations.map((integration) => (
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
