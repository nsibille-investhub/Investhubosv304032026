import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  ShieldCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { FilterCard } from './FilterCard';
import { FilterBar, FilterConfig } from './FilterBar';
import { DataTable, ColumnConfig } from './DataTable';
import { DataPagination } from './ui/data-pagination';
import { Tag } from './Tag';
import { StatusBadge } from './StatusBadge';
import { TableSkeleton } from './TableSkeleton';
import { DocumentPreviewDrawer } from './DocumentPreviewDrawer';
import { useTableSearch } from '../utils/useTableSearch';
import {
  generateValidationDocuments,
  ValidationDocument,
  ValidationStatus,
} from '../utils/validationDocumentsGenerator';

interface ValidationPageProps {
  onBack: () => void;
}

type StatusTab = ValidationStatus | 'all';

const SEARCH_FIELDS: (keyof ValidationDocument | string)[] = [
  'name',
  'comment',
  'createdBy.name',
  'createdBy.role',
  'pathSegments',
  'targeting',
];

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

function buildPath(segments: string[]) {
  return segments.join(' / ');
}

interface TruncatedPathProps {
  segments: string[];
  maxLength?: number;
}

function TruncatedPath({ segments, maxLength = 48 }: TruncatedPathProps) {
  const fullPath = buildPath(segments);
  let display: string = fullPath;

  if (fullPath.length > maxLength && segments.length >= 3) {
    const head = segments[0];
    const tail = segments[segments.length - 1];
    const middle = segments.length > 3 ? `${segments[1]} / …` : '…';
    const candidate = `${head} / ${middle} / ${tail}`;
    display = candidate.length > maxLength
      ? `${head} / … / ${tail}`
      : candidate;
  } else if (fullPath.length > maxLength) {
    const half = Math.floor((maxLength - 3) / 2);
    display = `${fullPath.slice(0, half)}…${fullPath.slice(-half)}`;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex max-w-[280px] items-center gap-1 truncate rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
          <FileText className="h-3 w-3 shrink-0 text-gray-400" />
          <span className="truncate">{display}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-md">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {segments.map((segment, idx) => (
            <span key={idx} className="inline-flex items-center gap-1">
              <span>{segment}</span>
              {idx < segments.length - 1 && (
                <ChevronRight className="h-3 w-3 opacity-60" />
              )}
            </span>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

const STATUS_VARIANT: Record<
  ValidationStatus,
  { label: string; variant: 'warning' | 'success' | 'danger' }
> = {
  pending: { label: 'En attente', variant: 'warning' },
  validated: { label: 'Validé', variant: 'success' },
  rejected: { label: 'Rejeté', variant: 'danger' },
};

export function ValidationPage({ onBack }: ValidationPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<ValidationDocument[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusTab>('pending');
  const [activeFilters, setActiveFilters] = useState<
    Record<string, string | string[]>
  >({});
  const [sortConfig, setSortConfig] = useState<
    { key: string; direction: 'asc' | 'desc' } | null
  >({ key: 'createdAt', direction: 'desc' });
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [previewDocument, setPreviewDocument] =
    useState<ValidationDocument | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setDocuments(generateValidationDocuments());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const counts = useMemo(() => {
    return {
      pending: documents.filter((d) => d.status === 'pending').length,
      validated: documents.filter((d) => d.status === 'validated').length,
      rejected: documents.filter((d) => d.status === 'rejected').length,
      all: documents.length,
    };
  }, [documents]);

  const dataByStatus = useMemo(() => {
    if (activeStatus === 'all') return documents;
    return documents.filter((d) => d.status === activeStatus);
  }, [documents, activeStatus]);

  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchedData,
    hasActiveSearch,
  } = useTableSearch(dataByStatus, SEARCH_FIELDS);

  const allCreators = useMemo(() => {
    const map = new Map<string, string>();
    documents.forEach((d) => map.set(d.createdBy.name, d.createdBy.name));
    return Array.from(map.values()).sort();
  }, [documents]);

  const allTargetings = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => d.targeting.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [documents]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: 'createdBy',
        label: 'Auteur',
        type: 'select',
        isPrimary: true,
        options: allCreators.map((c) => ({ value: c, label: c })),
      },
      {
        id: 'targeting',
        label: 'Ciblage',
        type: 'multiselect',
        isPrimary: true,
        options: allTargetings.map((t) => ({ value: t, label: t })),
      },
      {
        id: 'format',
        label: 'Format',
        type: 'select',
        isPrimary: false,
        options: ['pdf', 'docx', 'xlsx', 'pptx'].map((f) => ({
          value: f,
          label: f.toUpperCase(),
        })),
      },
    ],
    [allCreators, allTargetings],
  );

  const filteredData = useMemo(() => {
    return searchedData.filter((doc) => {
      if (activeFilters.createdBy && doc.createdBy.name !== activeFilters.createdBy) {
        return false;
      }
      if (activeFilters.format && doc.format !== activeFilters.format) {
        return false;
      }
      const targetingFilter = activeFilters.targeting;
      if (Array.isArray(targetingFilter) && targetingFilter.length > 0) {
        const hasAny = targetingFilter.some((t) => doc.targeting.includes(t));
        if (!hasAny) return false;
      }
      return true;
    });
  }, [searchedData, activeFilters]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const items = [...filteredData];
    items.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      const key = sortConfig.key;
      const get = (doc: ValidationDocument): string | number => {
        switch (key) {
          case 'name':
            return doc.name.toLowerCase();
          case 'createdBy':
            return doc.createdBy.name.toLowerCase();
          case 'createdAt':
            return new Date(doc.createdAt).getTime();
          case 'status':
            return doc.status;
          case 'path':
            return buildPath(doc.pathSegments).toLowerCase();
          default:
            return '';
        }
      };
      const va = get(a);
      const vb = get(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return items;
  }, [filteredData, sortConfig]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageData = sortedData.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, activeFilters, searchTerm, pageSize]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const handleFilterChange = (
    filterId: string,
    value: string | string[] | null,
  ) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value === null || (Array.isArray(value) && value.length === 0) || value === '') {
        delete next[filterId];
      } else {
        next[filterId] = value;
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  const updateStatus = (docId: number, status: ValidationStatus) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Vous',
            }
          : d,
      ),
    );
  };

  const handleValidate = (doc: ValidationDocument) => {
    updateStatus(doc.id, 'validated');
    toast.success('Document validé', { description: doc.name });
  };

  const handleReject = (doc: ValidationDocument) => {
    updateStatus(doc.id, 'rejected');
    toast.error('Document rejeté', { description: doc.name });
  };

  const handleRowClick = (doc: ValidationDocument) => {
    setPreviewDocument(doc);
  };

  const columns: ColumnConfig<ValidationDocument>[] = [
    {
      key: 'name',
      label: 'Document',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate font-medium text-gray-900 dark:text-gray-100">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: 'path',
      label: 'Emplacement',
      sortable: false,
      render: (row) => <TruncatedPath segments={row.pathSegments} />,
    },
    {
      key: 'createdBy',
      label: 'Créé par',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {row.createdBy.name}
          </span>
          <span className="text-xs text-gray-500">{row.createdBy.role}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'targeting',
      label: 'Ciblage',
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1">
          {row.targeting.slice(0, 3).map((t) => (
            <Tag key={t} label={t} />
          ))}
          {row.targeting.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-500 cursor-help">
                  +{row.targeting.length - 3}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col gap-1">
                  {row.targeting.slice(3).map((t) => (
                    <span key={t} className="text-xs">{t}</span>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      key: 'comment',
      label: 'Commentaire',
      sortable: false,
      render: (row) =>
        row.comment ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block max-w-[220px] truncate text-sm text-gray-600 dark:text-gray-400 cursor-help">
                {row.comment}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <span className="text-xs leading-snug">{row.comment}</span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (row) => {
        const conf = STATUS_VARIANT[row.status];
        return <StatusBadge label={conf.label} variant={conf.variant} />;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPreviewDocument(row)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aperçu du document</TooltipContent>
          </Tooltip>

          {row.status !== 'validated' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                  onClick={() => handleValidate(row)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Valider</TooltipContent>
            </Tooltip>
          )}

          {row.status !== 'rejected' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                  onClick={() => handleReject(row)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rejeter</TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux espaces
          </Button>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#000E2B' }}
          >
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Validation des documents
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Revue, approbation et rejet des documents avant publication
            </p>
          </div>
        </div>

        {/* Filtering KPI cards */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-primary/5 pb-2 rounded-lg p-2"
        >
          <div className="grid grid-cols-4 gap-1.5 items-center">
            <FilterCard
              status="pending"
              activeStatus={activeStatus}
              onStatusChange={(s) => setActiveStatus(s as StatusTab)}
              label="En attente de validation"
              icon={Clock}
              total={counts.pending}
              metricLabel="À traiter"
              metricValue={`${counts.pending}`}
              averageValue={counts.all > 0
                ? `${Math.round((counts.pending / counts.all) * 100)}%`
                : '0%'}
              iconActiveClassName="text-amber-600"
            />
            <FilterCard
              status="validated"
              activeStatus={activeStatus}
              onStatusChange={(s) => setActiveStatus(s as StatusTab)}
              label="Validés"
              icon={CheckCircle2}
              total={counts.validated}
              metricLabel="Approuvés"
              metricValue={`${counts.validated}`}
              averageValue={counts.all > 0
                ? `${Math.round((counts.validated / counts.all) * 100)}%`
                : '0%'}
              iconActiveClassName="text-emerald-600"
            />
            <FilterCard
              status="rejected"
              activeStatus={activeStatus}
              onStatusChange={(s) => setActiveStatus(s as StatusTab)}
              label="Rejetés"
              icon={XCircle}
              total={counts.rejected}
              metricLabel="Refusés"
              metricValue={`${counts.rejected}`}
              averageValue={counts.all > 0
                ? `${Math.round((counts.rejected / counts.all) * 100)}%`
                : '0%'}
              iconActiveClassName="text-red-600"
            />
            <FilterCard
              status="all"
              activeStatus={activeStatus}
              onStatusChange={(s) => setActiveStatus(s as StatusTab)}
              label="Tous"
              icon={FileText}
              total={counts.all}
              metricLabel="Total"
              metricValue={`${counts.all}`}
              averageValue="100%"
            />
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
        >
          {/* Filter bar */}
          <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800">
            <FilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Rechercher un document, auteur, ciblage..."
              filters={filterConfigs}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Table */}
          <div className="flex-1">
            {isLoading ? (
              <TableSkeleton />
            ) : sortedData.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  Aucun document à afficher
                </p>
                {(hasActiveSearch ||
                  Object.keys(activeFilters).length > 0) && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleClearAll}
                    className="mt-1"
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            ) : (
              <DataTable
                data={pageData}
                columns={columns}
                hoveredRow={hoveredRow}
                setHoveredRow={setHoveredRow}
                onRowClick={handleRowClick}
                sortConfig={sortConfig}
                onSort={handleSort}
                allFilteredData={sortedData}
                searchTerm={searchTerm}
                entityName="document"
              />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && sortedData.length > 0 && (
            <DataPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </motion.div>
      </div>

      {/* Preview drawer */}
      <DocumentPreviewDrawer
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        documentId={previewDocument ? String(previewDocument.id) : ''}
        documentName={previewDocument?.name ?? ''}
        format={previewDocument?.format}
        size={previewDocument?.size}
        date={previewDocument ? formatDate(previewDocument.createdAt) : undefined}
      />
    </div>
  );
}
