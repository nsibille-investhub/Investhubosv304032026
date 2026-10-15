import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Archive,
  ArchiveRestore,
  ArrowUpRight,
  BookOpen,
  Building2,
  Calendar,
  CalendarRange,
  Check,
  Coins,
  Copy,
  CreditCard,
  FileSignature,
  FileText,
  FlaskConical,
  Handshake,
  Hash,
  History,
  Landmark,
  LayoutDashboard,
  Layers3,
  LineChart,
  Network,
  Receipt,
  Repeat,
  Send,
  Settings2,
  ShieldCheck,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type { Fund } from '../../utils/fundGenerator';
import { useTranslation } from '../../utils/languageContext';
import { formatDate } from '../../utils/formatters';
import { copyToClipboard } from '../../utils/clipboard';
import {
  buildFundDetail,
  FUND_SCENARIOS,
  type FieldTarget,
  type FundDetail,
  type FundScenario,
} from '../../utils/fundDetailMock';
import { EmptyState } from '../EmptyState';
import { FundStatusBadge } from '../FundStatusBadge';
import { BlockersPanel } from '../ui/blockers-panel';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { DetailLink } from '../ui/detail-summary';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { DisabledReason } from '../ui/disabled-reason';
import { EffectsPanel } from '../ui/effects-panel';
import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from '../ui/page-header';
import { PageStateBanner } from '../ui/page-state-banner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DetailTabsList } from '../ui/detail-tabs';
import { Tabs, TabsContent } from '../ui/tabs';
import { toneSurface } from '../ui/tone';
import { getFundActionStates } from './fundActions';
import { applySettingsToDetail, buildSettingsValues, computeMissingConfig } from './settings/settingsValues';
import { buildShareValues } from './shares/shareValues';
import type { NavChange } from './navs/navEffects';
import type { FundShare } from '../../utils/fundDetailMock';
import type { SettingsValues } from './settings/settingsSchema';
import { FundNavsTab } from './FundNavsTab';
import { FundOverviewTab } from './FundOverviewTab';
import { FundSettingsTab } from './FundSettingsTab';
import { FundSharesTab } from './FundSharesTab';

const K = 'funds.detail';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type TabId =
  | 'overview'
  | 'settings'
  | 'shares'
  | 'navs'
  | 'documents'
  | 'distribution'
  | 'operations'
  | 'journal';

interface FundDetailPageProps {
  fund: Fund;
  onBack: () => void;
  onOpenSubscriptions: (fund: Fund) => void;
}

function LinkedScreenTab({ titleKey, descriptionKey, icon }: { titleKey: string; descriptionKey: string; icon: typeof FileText }) {
  const { t } = useTranslation();
  return (
    <Card className="shadow-sm">
      <EmptyState
        icon={icon}
        title={t(titleKey)}
        description={t(descriptionKey)}
        action={
          <DisabledReason reason={t(`${K}.linked.unavailable`)}>
            <Button variant="outline" disabled>
              {t(`${K}.linked.open`)}
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </DisabledReason>
        }
      />
    </Card>
  );
}

function ComingSoonTab({ icon }: { icon: typeof FileText }) {
  const { t } = useTranslation();
  return (
    <Card className="shadow-sm">
      <EmptyState icon={icon} title={t(`${K}.comingSoon`)} description={t(`${K}.comingSoonDescription`)} />
    </Card>
  );
}

export function FundDetailPage({ fund, onBack, onOpenSubscriptions }: FundDetailPageProps) {
  const { t, lang } = useTranslation();
  const [scenario, setScenario] = useState<FundScenario>('default');
  const initial = useMemo(() => buildFundDetail(fund, scenario), [fund, scenario]);
  const [detail, setDetail] = useState<FundDetail>(initial);
  const [tab, setTab] = useState<TabId>('overview');
  const [idCopied, setIdCopied] = useState(false);
  const [target, setTarget] = useState<FieldTarget | null>(null);
  const [pending, setPending] = useState<null | 'publish' | 'duplicate' | 'archive' | 'unarchive' | 'propagate' | 'delete'>(null);
  const [dialog, setDialog] = useState<null | 'archive' | 'propagate' | 'delete' | 'blockers'>(null);
  const [settingsValues, setSettingsValues] = useState<SettingsValues>(() => buildSettingsValues(initial));
  const [shareValues, setShareValues] = useState<Record<string, SettingsValues>>(() =>
    Object.fromEntries(initial.shares.map(share => [share.id, buildShareValues(share)])),
  );
  /** Une section modifiée et non enregistrée dans l'onglet courant (Paramètres ou Parts). */
  const [tabDirty, setTabDirty] = useState(false);
  const [navShareId, setNavShareId] = useState<string | null>(null);
  const clearNavShare = useCallback(() => setNavShareId(null), []);
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);

  useEffect(() => {
    setDetail(initial);
    setSettingsValues(buildSettingsValues(initial));
    setShareValues(Object.fromEntries(initial.shares.map(share => [share.id, buildShareValues(share)])));
    setTabDirty(false);
    setTab('overview');
    setTarget(null);
  }, [initial]);

  const actions = getFundActionStates(detail, t);
  const clearTarget = useCallback(() => setTarget(null), []);
  const pendingSubscriptions = detail.pendingSubscriptions.reduce((acc, item) => acc + item.count, 0);
  const blockersTotal = Object.values(detail.deleteBlockers).reduce((acc, value) => acc + value, 0);

  /** Quitter l'onglet Paramètres avec une section modifiée demande confirmation. */
  const changeTab = (next: TabId) => {
    if (next !== tab && tabDirty) setPendingTab(next);
    else setTab(next);
  };

  const navigateTo = (next: FieldTarget) => {
    changeTab(next.tab);
    setTarget(next);
  };

  const updateShares = (shares: FundShare[], values: Record<string, SettingsValues>) => {
    setShareValues(values);
    setDetail(current => {
      const next = { ...current, shares };
      return { ...next, missingConfig: computeMissingConfig(next, settingsValues) };
    });
  };

  /** Valeurs liquidatives : tableau, dernière valeur des parts, alerte et prix nominaux reportés. */
  const applyNavChange = (change: NavChange) => {
    const nominalIds = Object.keys(change.nominalUpdates);
    if (nominalIds.length > 0) {
      setShareValues(prev => {
        const next = { ...prev };
        nominalIds.forEach(id => {
          next[id] = { ...next[id], nominalPrice: change.nominalUpdates[id] };
        });
        return next;
      });
    }
    setDetail(current => {
      const latest = change.navs.find(row => row.netAsset !== null);
      const next = {
        ...current,
        navs: change.navs,
        shares: change.shares,
        expectedNavMissing: change.expectedNavMissing,
        netAsset: latest ? { value: latest.netAsset as number, date: latest.date } : null,
      };
      return { ...next, missingConfig: computeMissingConfig(next, settingsValues) };
    });
  };

  const saveSettings = (changes: SettingsValues) => {
    const merged = { ...settingsValues, ...changes };
    setSettingsValues(merged);
    setDetail(current => applySettingsToDetail(current, merged));
  };

  const run = async (kind: NonNullable<typeof pending>, apply: () => void, messageKey: string) => {
    setPending(kind);
    await wait(1000);
    apply();
    setPending(null);
    setDialog(null);
    toast.success(t(messageKey, { name: detail.name }));
  };

  const copyId = async () => {
    const success = await copyToClipboard(String(detail.id));
    if (!success) return;
    setIdCopied(true);
    toast.success(t(`${K}.header.idCopied`), { description: String(detail.id) });
    setTimeout(() => setIdCopied(false), 2000);
  };

  const formatLongDate = (date: Date) =>
    date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const publish = () =>
    run(
      'publish',
      // Règle serveur simulée (PRD section 9.4) : la publication passe au statut calculé suivant.
      () =>
        setDetail(prev => ({
          ...prev,
          status: prev.collectionStart && prev.collectionStart > new Date() ? 'upcoming' : 'collecting',
        })),
      `${K}.toast.published`,
    );

  const archive = () =>
    run(
      'archive',
      () =>
        setDetail(prev => ({
          ...prev,
          statusBeforeArchive: prev.status,
          status: 'archived',
          archived: { date: new Date(), author: 'Camille' },
        })),
      `${K}.toast.archived`,
    );

  const unarchive = () =>
    run(
      'unarchive',
      () => setDetail(prev => ({ ...prev, status: prev.statusBeforeArchive, archived: null })),
      `${K}.toast.unarchived`,
    );

  const tabs: { id: TabId; icon: typeof FileText; count?: number; visible: boolean }[] = [
    { id: 'overview', icon: LayoutDashboard, visible: true },
    { id: 'settings', icon: Settings2, visible: true },
    { id: 'shares', icon: Layers3, count: detail.shares.length, visible: true },
    { id: 'navs', icon: LineChart, count: detail.navs.length, visible: true },
    { id: 'documents', icon: FileText, count: detail.counts.documents, visible: true },
    { id: 'distribution', icon: Handshake, count: detail.counts.distributors, visible: detail.modules.partners },
    { id: 'operations', icon: Receipt, visible: detail.modules.operations },
    { id: 'journal', icon: History, visible: true },
  ];

  const hasBanner = Boolean(
    detail.archived || detail.locked || detail.mirrorOf || detail.sendingNotices || (!detail.rights.edit && tab !== 'settings'),
  );

  const blockedDuringNotices = [t(`${K}.blocked.delete`), t(`${K}.blocked.archive`), t(`${K}.blocked.propagate`), t(`${K}.blocked.publish`)];

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-muted">
      <div className="flex flex-wrap items-center justify-end gap-3 border-b border-border px-6 py-2" style={toneSurface('info')}>
        <span className="inline-flex items-center gap-2 text-xs font-medium">
          <FlaskConical className="w-3.5 h-3.5" aria-hidden />
          {t(`${K}.scenario.label`)}
        </span>
        <Select value={scenario} onValueChange={value => setScenario(value as FundScenario)}>
          <SelectTrigger size="sm" className="w-56 border-border bg-card" aria-label={t(`${K}.scenario.label`)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FUND_SCENARIOS.map(item => (
              <SelectItem key={item} value={item}>
                {t(`${K}.scenario.options.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            {detail.name}
            <FundStatusBadge status={detail.status} />
          </span>
        }
        subtitle={
          <PageHeaderSubtitle>
            <PageHeaderSubtitleItem icon={Hash} className="group">
              <span>{t(`${K}.header.id`, { id: detail.id })}</span>
              <button
                type="button"
                onClick={copyId}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                title={t(`${K}.header.copyId`)}
                aria-label={t(`${K}.header.copyId`)}
              >
                {idCopied ? (
                  <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </PageHeaderSubtitleItem>

            <PageHeaderSubtitleSeparator />

            <PageHeaderSubtitleItem icon={Landmark}>
              {detail.legalForm}
              <span aria-hidden>·</span>
              {t(`${K}.type.${detail.fundType}`)}
            </PageHeaderSubtitleItem>

            {detail.parent && (
              <>
                <PageHeaderSubtitleSeparator />
                <DetailLink
                  icon={Building2}
                  className="text-sm"
                  onClick={() => toast.info(t(`${K}.toast.parentNotInMockup`, { name: detail.parent!.name }))}
                >
                  {t(`${K}.compartmentOf`, { name: detail.parent.name })}
                </DetailLink>
              </>
            )}
            {detail.isMaster && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={Network}>{t(`${K}.masterOf`, { count: detail.mirrorsCount })}</PageHeaderSubtitleItem>
              </>
            )}

            <PageHeaderSubtitleSeparator />

            <PageHeaderSubtitleItem icon={Coins}>{t(`${K}.header.currency`, { currency: detail.currency })}</PageHeaderSubtitleItem>

            <PageHeaderSubtitleSeparator />

            <PageHeaderSubtitleItem icon={CreditCard}>
              {t(`${K}.header.paymentMode`, { mode: t(`${K}.paymentMode.${detail.paymentMode}`) })}
            </PageHeaderSubtitleItem>

            <PageHeaderSubtitleSeparator />

            <PageHeaderSubtitleItem icon={CalendarRange}>
              {detail.collectionStart && detail.collectionEnd
                ? t(`${K}.header.collectionRange`, {
                    from: formatDate(detail.collectionStart),
                    to: formatDate(detail.collectionEnd),
                  })
                : detail.collectionStart
                  ? t(`${K}.header.collectionFrom`, { from: formatDate(detail.collectionStart) })
                  : t(`${K}.header.collectionNone`)}
            </PageHeaderSubtitleItem>

            <PageHeaderSubtitleSeparator />

            <PageHeaderSubtitleItem icon={Calendar}>
              {t(`${K}.header.createdOn`, { date: formatLongDate(detail.createdAt), author: detail.createdBy })}
            </PageHeaderSubtitleItem>
          </PageHeaderSubtitle>
        }
        primaryAction={
          actions.publish.visible
            ? {
                label: t(`${K}.actions.publish`),
                icon: <Send className="w-4 h-4" />,
                onClick: publish,
                loading: pending === 'publish',
                disabledReason: actions.publish.disabledReason,
              }
            : undefined
        }
        extraActions={[
          {
            label: t(`${K}.actions.duplicate`),
            icon: <Copy className="w-4 h-4" />,
            onClick: () => run('duplicate', () => undefined, `${K}.toast.duplicated`),
            loading: pending === 'duplicate',
            disabledReason: actions.duplicate.disabledReason,
          },
          actions.unarchive.visible
            ? {
                label: t(`${K}.actions.unarchive`),
                icon: <ArchiveRestore className="w-4 h-4" />,
                onClick: unarchive,
                loading: pending === 'unarchive',
                disabledReason: actions.unarchive.disabledReason,
              }
            : {
                label: t(`${K}.actions.archive`),
                icon: <Archive className="w-4 h-4" />,
                onClick: () => setDialog('archive'),
                disabledReason: actions.archive.disabledReason,
              },
          ...(actions.propagate.visible
            ? [
                {
                  label: t(`${K}.actions.propagate`),
                  icon: <TrendingUp className="w-4 h-4" />,
                  onClick: () => setDialog('propagate'),
                  disabledReason: actions.propagate.disabledReason,
                },
              ]
            : []),
        ]}
        tertiaryLabel={t(`${K}.actions.more`)}
        tertiaryActions={[
          {
            label: t(`${K}.actions.journal`),
            icon: <BookOpen className="w-4 h-4" />,
            onClick: () => changeTab('journal'),
          },
          {
            label: t(`${K}.actions.delete`),
            icon: <Trash2 className="w-4 h-4" />,
            destructive: true,
            separatorBefore: true,
            disabledReason: actions.delete.disabledReason,
            // Le serveur refuse la suppression d'un fonds qui porte des objets (PRD section 9.3).
            onClick: () => setDialog(blockersTotal > 0 ? 'blockers' : 'delete'),
          },
        ]}
      />

      {hasBanner && (
      <div className="space-y-3 px-8 pt-4">
        {detail.archived && (
          <PageStateBanner
            variant="archived"
            date={formatDate(detail.archived.date)}
            author={detail.archived.author}
            onUnarchive={unarchive}
            unarchiving={pending === 'unarchive'}
            unarchiveDisabledReason={actions.unarchive.disabledReason}
          />
        )}
        {detail.locked && (
          <PageStateBanner variant="locked" date={formatDate(detail.locked.date)} reason={detail.locked.reason} />
        )}
        {detail.mirrorOf && (
          <PageStateBanner
            variant="mirror"
            masterName={detail.mirrorOf.name}
            onOpenMaster={() => toast.info(t(`${K}.toast.parentNotInMockup`, { name: detail.mirrorOf!.name }))}
          />
        )}
        {detail.sendingNotices && <PageStateBanner variant="sendingNotices" blockedActions={blockedDuringNotices} />}
        {!detail.rights.edit && tab !== 'settings' && <PageStateBanner variant="readOnly" />}
      </div>
      )}

      <Tabs value={tab} onValueChange={value => changeTab(value as TabId)} className="w-full gap-0">
        <div className="px-8 bg-card border-b border-border">
          <DetailTabsList
            overflow="scroll"
            items={tabs
              .filter(item => item.visible)
              .map(item => ({ value: item.id, icon: item.icon, label: t(`${K}.tabs.${item.id}`), badge: item.count }))}
          />
        </div>
        <div className="px-8 py-6">
          <TabsContent value="overview">
            <FundOverviewTab
              detail={detail}
              onNavigate={navigateTo}
              onOpenTab={next => setTab(next as TabId)}
              onOpenSubscriptions={() => onOpenSubscriptions(fund)}
            />
          </TabsContent>
          <TabsContent value="settings">
            <FundSettingsTab
              key={scenario}
              detail={detail}
              values={settingsValues}
              onValuesSaved={saveSettings}
              target={target}
              onTargetHandled={clearTarget}
              canEdit={detail.rights.edit}
              editReason={detail.rights.edit ? actions.editReason : undefined}
              onDirtyChange={setTabDirty}
              extraSubTabs={[
                ...(detail.modules.secondaryMarket
                  ? [
                      {
                        id: 'secondary',
                        icon: Repeat,
                        label: t(`${K}.tabs.secondary`),
                        count: detail.counts.secondaryMarket,
                        content: <ComingSoonTab icon={Repeat} />,
                      },
                    ]
                  : []),
                ...(detail.modules.contracts
                  ? [
                      {
                        id: 'contracts',
                        icon: FileSignature,
                        label: t(`${K}.tabs.contracts`),
                        content: (
                          <LinkedScreenTab
                            icon={FileSignature}
                            titleKey={`${K}.linked.contractsTitle`}
                            descriptionKey={`${K}.linked.contractsDescription`}
                          />
                        ),
                      },
                    ]
                  : []),
                ...(detail.counts.controls > 0
                  ? [
                      {
                        id: 'controls',
                        icon: ShieldCheck,
                        label: t(`${K}.tabs.controls`),
                        count: detail.counts.controls,
                        content: <ComingSoonTab icon={ShieldCheck} />,
                      },
                    ]
                  : []),
              ]}
            />
          </TabsContent>
          <TabsContent value="shares">
            <FundSharesTab
              detail={detail}
              shareValues={shareValues}
              fundValues={settingsValues}
              onSharesChange={updateShares}
              target={target}
              onTargetHandled={clearTarget}
              canEdit={detail.rights.edit}
              editReason={detail.rights.edit ? actions.editReason : undefined}
              onOpenNavs={shareId => {
                setNavShareId(shareId ?? null);
                changeTab('navs');
              }}
              onDirtyChange={setTabDirty}
            />
          </TabsContent>
          <TabsContent value="navs">
            <FundNavsTab
              detail={detail}
              canEdit={detail.rights.edit}
              editReason={detail.rights.edit ? actions.editReason : undefined}
              initialShareId={navShareId}
              onInitialShareHandled={clearNavShare}
              onNavChange={applyNavChange}
            />
          </TabsContent>
          <TabsContent value="operations">
            <LinkedScreenTab icon={Receipt} titleKey={`${K}.linked.operationsTitle`} descriptionKey={`${K}.linked.operationsDescription`} />
          </TabsContent>
          {(
            [
              ['documents', FileText],
              ['distribution', Handshake],
              ['journal', History],
            ] as const
          ).map(([id, icon]) => (
            <TabsContent key={id} value={id}>
              <ComingSoonTab icon={icon} />
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <ConfirmDialog
        open={pendingTab !== null}
        onOpenChange={open => !open && setPendingTab(null)}
        title={t(`${K}.settings.leave.title`)}
        description={t(`${K}.settings.leave.description`)}
        confirmLabel={t(`${K}.settings.leave.confirm`)}
        cancelLabel={t(`${K}.settings.leave.stay`)}
        destructive
        onConfirm={() => {
          setTabDirty(false);
          if (pendingTab) setTab(pendingTab);
          setPendingTab(null);
        }}
      />

      <ConfirmDialog
        open={dialog === 'archive'}
        onOpenChange={open => setDialog(open ? 'archive' : null)}
        title={t(`${K}.dialogs.archive.title`, { name: detail.name })}
        description={t(`${K}.dialogs.archive.description`, {
          status: t(`funds.status.${detail.status}`),
          count: pendingSubscriptions,
        })}
        confirmLabel={t(`${K}.actions.archive`)}
        loading={pending === 'archive'}
        onConfirm={archive}
      >
        {detail.status === 'collecting' && (
          <div className="rounded-lg border px-3 py-2 text-sm" style={toneSurface('warning')} role="alert">
            {t(`${K}.dialogs.archive.collectingWarning`)}
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'propagate'}
        onOpenChange={open => setDialog(open ? 'propagate' : null)}
        title={t(`${K}.dialogs.propagate.title`)}
        description={t(`${K}.dialogs.propagate.description`, { count: detail.mirrorsCount })}
        confirmLabel={t(`${K}.actions.propagate`)}
        loading={pending === 'propagate'}
        onConfirm={() => run('propagate', () => undefined, `${K}.toast.propagated`)}
      >
        <EffectsPanel
          effects={[
            {
              id: 'mirrors',
              icon: Copy,
              label: t(`${K}.dialogs.propagate.effects.fields`),
              reversible: false,
              objects: Array.from({ length: detail.mirrorsCount }, (_, index) => ({
                id: `mirror-${index}`,
                label: t(`${K}.dialogs.propagate.mirrorName`, { name: detail.name, index: index + 1 }),
              })),
            },
            { id: 'journal', icon: History, label: t(`${K}.dialogs.propagate.effects.journal`), reversible: true },
          ]}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={open => setDialog(open ? 'delete' : null)}
        title={t(`${K}.dialogs.delete.title`, { name: detail.name })}
        description={t(`${K}.dialogs.delete.description`)}
        confirmLabel={t(`${K}.actions.delete`)}
        destructive
        loading={pending === 'delete'}
        onConfirm={async () => {
          await run('delete', () => undefined, `${K}.toast.deleted`);
          onBack();
        }}
      />

      <Dialog open={dialog === 'blockers'} onOpenChange={open => setDialog(open ? 'blockers' : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`${K}.actions.delete`)}</DialogTitle>
            <DialogDescription>{detail.name}</DialogDescription>
          </DialogHeader>
          <BlockersPanel
            title={t(`${K}.dialogs.blockers.title`)}
            blockers={(
              [
                ['subscriptions', FileSignature, () => onOpenSubscriptions(fund)],
                ['operations', Receipt, () => changeTab('operations')],
                ['navs', LineChart, () => changeTab('navs')],
                ['contracts', FileText, () => navigateTo({ tab: 'settings', sectionId: 'contracts', fieldId: 'contracts' })],
              ] as const
            )
              .filter(([key]) => detail.deleteBlockers[key] > 0)
              .map(([key, icon, open]) => ({
                id: key,
                icon,
                label: t(`${K}.dialogs.blockers.${key}`),
                count: detail.deleteBlockers[key],
                onOpen: () => {
                  setDialog(null);
                  open();
                },
              }))}
            alternative={
              actions.archive.visible
                ? {
                    label: t(`${K}.actions.archiveFund`),
                    description: t(`${K}.dialogs.blockers.archiveDescription`),
                    disabledReason: actions.archive.disabledReason,
                    onAction: () => setDialog('archive'),
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
