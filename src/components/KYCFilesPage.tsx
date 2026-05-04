import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  CalendarClock,
  CalendarRange,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Copy,
  Check,
  Download,
  DownloadCloud,
  Eye,
  Filter,
  RefreshCw,
  UserCircle,
  Building2,
  X,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { generateKYCFiles, KYCFile } from '../utils/kycFileGenerator';
import { DataTable, ColumnConfig } from './DataTable';
import { TableSkeleton } from './TableSkeleton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DataPagination } from './ui/data-pagination';
import { FilterCard } from './ui/filter-card';
import { SearchInput } from './ui/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { StatusBadge } from './StatusBadge';
import { Tag } from './Tag';
import { KYCThirdPartiesCell } from './KYCThirdPartiesCell';
import { KYCDossierDetail } from './KYCDossierDetail';
import type {
  DossierStatus,
  KYCDossierDetail as KYCDossierDetailModel,
  RiskLevel,
} from './KYCDossierDetail.types';
import { mockEntityDossier, mockIndividualDossier } from '../utils/kycDossierMock';
import { copyToClipboard } from '../utils/clipboard';
import { cn } from './ui/utils';
import { useTranslation } from '../utils/languageContext';

const LISTING_STATUS_TO_DETAIL: Record<KYCFile['status'], DossierStatus> = {
  Rejeté: 'rejected',
  Brouillon: 'to_review',
  Ouvert: 'in_review',
  Approuvé: 'approved',
};

const LISTING_RISK_TO_LEVEL: Record<NonNullable<KYCFile['risk']>, RiskLevel> = {
  Bloqué: 'high',
  Élevé: 'high',
  Moyen: 'medium',
  Faible: 'low',
};

function buildDossierFromRow(row: KYCFile): KYCDossierDetailModel {
  const isEntity = row.type === 'Personne morale';
  const base = isEntity ? mockEntityDossier : mockIndividualDossier;
  return {
    ...base,
    id: `kyc-${row.id}`,
    reference: row.uid,
    displayName: row.name.replace(/^KYB - /, ''),
    status: LISTING_STATUS_TO_DETAIL[row.status],
    riskLevel: row.risk ? LISTING_RISK_TO_LEVEL[row.risk] : 'low',
  };
}

type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral';

const STATUS_VARIANT: Record<string, StatusVariant> = {
  Rejeté: 'danger',
  Brouillon: 'neutral',
  Ouvert: 'success',
  Approuvé: 'success',
};

const RISK_CONFIG: Record<string, { token: string; bars: number }> = {
  Bloqué: { token: 'var(--danger)', bars: 4 },
  Élevé: { token: 'var(--warning)', bars: 3 },
  Moyen: { token: 'var(--warning)', bars: 2 },
  Faible: { token: 'var(--success)', bars: 1 },
};

type ReviewWindowKey = 'overdue' | '1w' | '1m' | '3m' | '6m';

const DAY_MS = 24 * 60 * 60 * 1000;

const REVIEW_WINDOWS: Array<{
  key: ReviewWindowKey;
  label: string;
  metricLabel: string;
  icon: typeof AlertTriangle;
  iconActiveClassName: string;
  match: (deltaDays: number) => boolean;
}> = [
  {
    key: 'overdue',
    label: 'En retard',
    metricLabel: 'Dépassées',
    icon: AlertTriangle,
    iconActiveClassName: 'text-red-600',
    match: (d) => d < 0,
  },
  {
    key: '1w',
    label: 'Dans 1 semaine',
    metricLabel: 'À revoir',
    icon: CalendarClock,
    iconActiveClassName: 'text-amber-600',
    match: (d) => d >= 0 && d <= 7,
  },
  {
    key: '1m',
    label: 'Dans 1 mois',
    metricLabel: 'À revoir',
    icon: CalendarRange,
    iconActiveClassName: 'text-amber-600',
    match: (d) => d >= 0 && d <= 30,
  },
  {
    key: '3m',
    label: 'Dans 3 mois',
    metricLabel: 'À revoir',
    icon: CalendarDays,
    iconActiveClassName: 'text-primary',
    match: (d) => d >= 0 && d <= 90,
  },
  {
    key: '6m',
    label: 'Dans 6 mois',
    metricLabel: 'À revoir',
    icon: CalendarCheck,
    iconActiveClassName: 'text-primary',
    match: (d) => d >= 0 && d <= 180,
  },
];

type ProgressKey = 'En révision' | 'En collecte' | 'Recollecte' | 'Finalisation';

const PROGRESS_CONFIG: Record<
  ProgressKey,
  { icon: typeof Eye; tokenColor: string; bgClass: string }
> = {
  'En révision': {
    icon: Eye,
    tokenColor: 'var(--primary)',
    bgClass: 'bg-primary/10',
  },
  'En collecte': {
    icon: DownloadCloud,
    tokenColor: 'var(--warning)',
    bgClass: 'bg-muted',
  },
  Recollecte: {
    icon: RefreshCw,
    tokenColor: 'var(--warning)',
    bgClass: 'bg-muted',
  },
  Finalisation: {
    icon: CheckCircle2,
    tokenColor: 'var(--success)',
    bgClass: 'bg-muted',
  },
};

export function KYCFilesPage() {
  const { t } = useTranslation();
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<KYCFile | null>(null);
  const [openedDossier, setOpenedDossier] = useState<KYCFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [allTableData, setAllTableData] = useState<KYCFile[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | KYCFile['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | KYCFile['type']>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'none' | NonNullable<KYCFile['risk']>>('all');
  const [reviewWindow, setReviewWindow] = useState<ReviewWindowKey | null>(null);

  useEffect(() => {
    if (allTableData.length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        const generatedData = generateKYCFiles(100);
        setAllTableData(generatedData);
        setIsLoading(false);
        toast.success(t('ged.kyc.loadedToast'), {
          description: `${generatedData.length}`,
        });
      }, 800);
    }
  }, []);

  const reviewCounts = useMemo(() => {
    const now = Date.now();
    const init: Record<ReviewWindowKey, number> = {
      overdue: 0,
      '1w': 0,
      '1m': 0,
      '3m': 0,
      '6m': 0,
    };
    for (const file of allTableData) {
      if (!file.nextReview) continue;
      const deltaDays = (file.nextReview.timestamp - now) / DAY_MS;
      for (const win of REVIEW_WINDOWS) {
        if (win.match(deltaDays)) init[win.key] += 1;
      }
    }
    return init;
  }, [allTableData]);

  const filteredData = useMemo(() => {
    const now = Date.now();
    const search = searchQuery.trim().toLowerCase();
    const activeWindow = reviewWindow
      ? REVIEW_WINDOWS.find((w) => w.key === reviewWindow)
      : null;

    return allTableData.filter((file) => {
      if (search) {
        const haystack = `${file.name} ${file.uid}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (statusFilter !== 'all' && file.status !== statusFilter) return false;
      if (typeFilter !== 'all' && file.type !== typeFilter) return false;
      if (riskFilter !== 'all') {
        if (riskFilter === 'none') {
          if (file.risk !== null) return false;
        } else if (file.risk !== riskFilter) {
          return false;
        }
      }
      if (activeWindow) {
        if (!file.nextReview) return false;
        const deltaDays = (file.nextReview.timestamp - now) / DAY_MS;
        if (!activeWindow.match(deltaDays)) return false;
      }
      return true;
    });
  }, [allTableData, searchQuery, statusFilter, typeFilter, riskFilter, reviewWindow]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aVal: unknown = a[sortConfig.key as keyof KYCFile];
      let bVal: unknown = b[sortConfig.key as keyof KYCFile];

      if (sortConfig.key === 'lastActivity') {
        aVal = a.lastActivity.timestamp;
        bVal = b.lastActivity.timestamp;
      } else if (sortConfig.key === 'nextReview') {
        aVal = a.nextReview?.timestamp ?? Number.POSITIVE_INFINITY;
        bVal = b.nextReview?.timestamp ?? Number.POSITIVE_INFINITY;
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const hasActiveFilters =
    !!searchQuery ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    riskFilter !== 'all' ||
    reviewWindow !== null;

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setRiskFilter('all');
    setReviewWindow(null);
    setPaginationPage(1);
  };

  useEffect(() => {
    setPaginationPage(1);
  }, [searchQuery, statusFilter, typeFilter, riskFilter, reviewWindow]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tableData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleRowClick = (row: KYCFile) => {
    setSelectedFile(row);
    setOpenedDossier(row);
  };

  const handleBackToList = () => {
    setOpenedDossier(null);
  };

  const handleDossierAction = (action: string) => {
    toast.info(action);
  };

  const handlePageChange = (page: number) => {
    setPaginationPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPaginationPage(1);
  };

  const handleCopyId = async (uid: string, fileId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(uid);
    if (success) {
      setCopiedId(fileId);
      toast.success(t('ged.kyc.copyIdToast'), { description: uid });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error(t('ged.kyc.copyError'), { description: t('ged.kyc.copyErrorDesc') });
    }
  };

  const columns: ColumnConfig<KYCFile>[] = [
    {
      key: 'name',
      label: t('ged.kyc.columns.name'),
      sortable: true,
      render: (file) => (
        <div className="flex flex-col gap-1 max-w-[300px]">
          <motion.span
            whileHover={{ x: 2 }}
            className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer hover:underline transition-all truncate"
          >
            {file.name}
          </motion.span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">ID: {file.uid}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleCopyId(file.uid, file.id, e)}
              className="p-0.5 hover:bg-muted rounded transition-colors"
            >
              {copiedId === file.id ? (
                <Check className="w-3 h-3" style={{ color: 'var(--success)' }} />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </motion.button>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: t('ged.kyc.columns.type'),
      sortable: true,
      render: (file) => {
        const isIndividual = file.type === 'Personne physique';
        return (
          <div className="flex items-center gap-2">
            {isIndividual ? (
              <UserCircle className="w-4 h-4 text-primary" />
            ) : (
              <Building2 className="w-4 h-4 text-muted-foreground" />
            )}
            <Badge variant="secondary" className="text-xs font-medium">
              {file.type}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: t('ged.kyc.columns.status'),
      sortable: true,
      render: (file) => (
        <StatusBadge
          label={file.status}
          variant={STATUS_VARIANT[file.status] ?? 'neutral'}
        />
      ),
    },
    {
      key: 'nextReview',
      label: t('ged.kyc.columns.nextReview'),
      sortable: true,
      render: (file) => {
        if (!file.nextReview) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        const deltaDays = (file.nextReview.timestamp - Date.now()) / DAY_MS;
        const isOverdue = deltaDays < 0;
        const isUrgent = deltaDays >= 0 && deltaDays <= 7;
        return (
          <div className="flex flex-col">
            <span
              className={cn(
                'text-sm',
                isOverdue
                  ? 'font-medium'
                  : 'text-foreground',
              )}
              style={isOverdue ? { color: 'var(--danger)' } : undefined}
            >
              {file.nextReview.text}
            </span>
            {(isOverdue || isUrgent) && (
              <span
                className="text-[11px]"
                style={{
                  color: isOverdue ? 'var(--danger)' : 'var(--warning)',
                }}
              >
                {isOverdue
                  ? `En retard de ${Math.abs(Math.round(deltaDays))} j`
                  : `Dans ${Math.max(1, Math.round(deltaDays))} j`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'progress',
      label: t('ged.kyc.columns.progress'),
      sortable: false,
      render: (file) => {
        const config = PROGRESS_CONFIG[file.progress.status as ProgressKey];
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center justify-center rounded-full size-6',
                config.bgClass,
              )}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: config.tokenColor }} />
            </span>
            <span className="text-sm text-foreground">{file.progress.status}</span>
          </div>
        );
      },
    },
    {
      key: 'risk',
      label: t('ged.kyc.columns.risk'),
      sortable: true,
      render: (file) => {
        if (!file.risk) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }

        const config = RISK_CONFIG[file.risk];

        return (
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 h-4">
              {[1, 2, 3, 4].map((bar) => {
                const isActive = bar <= config.bars;
                return (
                  <div
                    key={bar}
                    className={cn('w-1 rounded-sm transition-all', !isActive && 'bg-muted')}
                    style={{
                      height: `${bar * 25}%`,
                      backgroundColor: isActive ? config.token : undefined,
                    }}
                  />
                );
              })}
            </div>
            <span className="text-sm text-foreground">{file.risk}</span>
          </div>
        );
      },
    },
    {
      key: 'onboarding',
      label: t('ged.kyc.columns.onboarding'),
      sortable: true,
      render: (file) => (
        <span className="text-sm text-foreground truncate max-w-[180px] block">
          {file.onboarding}
        </span>
      ),
    },
    {
      key: 'thirdParties',
      label: t('ged.kyc.columns.thirdParties'),
      sortable: false,
      render: (file) => (
        <KYCThirdPartiesCell
          parties={file.thirdParties}
          emptyLabel={t('ged.kyc.thirdParties.empty')}
          popoverLabel={t('ged.kyc.thirdParties.title')}
        />
      ),
    },
    {
      key: 'tags',
      label: t('ged.kyc.columns.tags'),
      sortable: false,
      render: (file) => {
        if (file.tags.length === 0) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {file.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
            {file.tags.length > 2 && <Tag label={`+${file.tags.length - 2}`} />}
          </div>
        );
      },
    },
    {
      key: 'assignee',
      label: t('ged.kyc.columns.assignedTo'),
      sortable: false,
      render: (file) => {
        if (!file.assignee) {
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserCircle className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{t('ged.kyc.unassigned')}</span>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {file.assignee.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">{file.assignee.name}</span>
          </div>
        );
      },
    },
    {
      key: 'lastActivity',
      label: t('ged.kyc.columns.lastActivity'),
      sortable: true,
      render: (file) => (
        <span className="text-sm text-muted-foreground">{file.lastActivity.text}</span>
      ),
    },
  ];

  if (openedDossier) {
    const dossier = buildDossierFromRow(openedDossier);
    return (
      <KYCDossierDetail
        {...dossier}
        onBack={handleBackToList}
        onValidate={() => handleDossierAction('Dossier validé')}
        onReject={() => handleDossierAction('Dossier rejeté')}
        onRequestComplement={() => handleDossierAction('Demande de complément envoyée')}
        onReassign={() => handleDossierAction('Dossier réassigné')}
        onRunScreening={() => handleDossierAction('Screening relancé')}
        onCommentSubmit={(body) =>
          handleDossierAction(`Note publiée : « ${body.slice(0, 60)} »`)
        }
      />
    );
  }

  return (
    <div className="flex-1 px-6 pt-6 pb-6 flex flex-col gap-4">
      <section aria-label="Prochaines révisions">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Prochaines révisions
          </h3>
          {reviewWindow !== null && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setReviewWindow(null)}
            >
              <X className="w-3 h-3" />
              Désactiver le filtre
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {REVIEW_WINDOWS.map((win) => {
            const count = reviewCounts[win.key];
            const totalReviewable = allTableData.filter((f) => f.nextReview).length;
            const ratio =
              totalReviewable > 0
                ? `${Math.round((count / totalReviewable) * 100)}%`
                : '0%';
            return (
              <FilterCard
                key={win.key}
                status={win.key}
                activeStatus={reviewWindow ?? ''}
                onStatusChange={(s) =>
                  setReviewWindow((current) =>
                    current === (s as ReviewWindowKey) ? null : (s as ReviewWindowKey),
                  )
                }
                label={win.label}
                icon={win.icon}
                total={count}
                metricLabel={win.metricLabel}
                metricValue={`${count}`}
                averageValue={ratio}
                iconActiveClassName={win.iconActiveClassName}
              />
            );
          })}
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <Card className="overflow-hidden p-0 gap-0 hover:shadow-lg transition-shadow duration-500">
          <CardHeader className="px-6 py-4 border-b border-border bg-card">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-xl font-semibold text-foreground">
                  {t('ged.kyc.title')}
                </CardTitle>
                <CardDescription className="mt-1">
                  {t('ged.kyc.subtitle')}
                </CardDescription>
              </div>
              <Button variant="primary" className="gap-2">
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </CardHeader>

          <div className="px-6 py-3 border-b border-border bg-muted/30 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              Filtres
            </div>
            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Rechercher par nom ou ID…"
              className="w-full sm:w-72"
              inputClassName="h-9"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger size="sm" className="h-9 w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="Ouvert">Ouvert</SelectItem>
                <SelectItem value="Brouillon">Brouillon</SelectItem>
                <SelectItem value="Approuvé">Approuvé</SelectItem>
                <SelectItem value="Rejeté">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
            >
              <SelectTrigger size="sm" className="h-9 w-[170px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="Personne physique">Personne physique</SelectItem>
                <SelectItem value="Personne morale">Personne morale</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={riskFilter}
              onValueChange={(v) => setRiskFilter(v as typeof riskFilter)}
            >
              <SelectTrigger size="sm" className="h-9 w-[150px]">
                <SelectValue placeholder="Risque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous risques</SelectItem>
                <SelectItem value="Bloqué">Bloqué</SelectItem>
                <SelectItem value="Élevé">Élevé</SelectItem>
                <SelectItem value="Moyen">Moyen</SelectItem>
                <SelectItem value="Faible">Faible</SelectItem>
                <SelectItem value="none">Non noté</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {totalItems} dossier{totalItems > 1 ? 's' : ''}
                {hasActiveFilters && allTableData.length !== totalItems && (
                  <span className="text-muted-foreground/70"> / {allTableData.length}</span>
                )}
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={handleResetFilters}
                >
                  <X className="w-3.5 h-3.5" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          <CardContent className="p-0 flex flex-col">
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <TableSkeleton />
              ) : tableData.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aucun dossier ne correspond aux filtres actuels.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-xs"
                      onClick={handleResetFilters}
                    >
                      Réinitialiser les filtres
                    </Button>
                  )}
                </div>
              ) : (
                <DataTable
                  data={tableData}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRow}
                  onRowClick={handleRowClick}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  compactMode={false}
                  columns={columns}
                />
              )}
            </div>

            {!isLoading && (
              <DataPagination
                currentPage={paginationPage}
                totalPages={totalPages}
                pageSize={itemsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handleItemsPerPageChange}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
