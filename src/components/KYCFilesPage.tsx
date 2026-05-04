import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  DownloadCloud,
  Eye,
  RefreshCw,
  UserCircle,
  Building2,
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

  const sortedData = useMemo(() => {
    if (!sortConfig) return allTableData;

    const sorted = [...allTableData].sort((a, b) => {
      let aVal = a[sortConfig.key as keyof KYCFile];
      let bVal = b[sortConfig.key as keyof KYCFile];

      if (sortConfig.key === 'lastActivity') {
        aVal = (a.lastActivity as any).timestamp;
        bVal = (b.lastActivity as any).timestamp;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [allTableData, sortConfig]);

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
      render: (file) =>
        file.nextReview ? (
          <span className="text-sm text-foreground">{file.nextReview}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
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
    <div className="flex-1 px-6 pt-6 pb-6 flex gap-4">
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

          <CardContent className="p-0 flex flex-col">
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <TableSkeleton />
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
