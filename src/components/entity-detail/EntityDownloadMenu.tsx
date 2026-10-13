import { useCallback, type SyntheticEvent } from 'react';
import { motion } from 'motion/react';
import { FileDown, FileText, MoreVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useCompliance } from '../../utils/complianceContext';
import { useTranslation } from '../../utils/languageContext';
import {
  downloadAlertAuditTrail,
  downloadEntityAuditTrail,
  downloadProviderReport,
} from '../../utils/entityReport';
import type { ScreeningEntity } from '../../utils/screeningMock';

/** Téléchargements fournisseur (IC-5557, IC-5558, IC-5559) partagés par les écrans de screening. */
export function useScreeningDownloads() {
  const { t, lang } = useTranslation();
  const { canViewScreening, getEntityMatches, getMatch, entities } = useCompliance();

  const downloadReport = useCallback(
    (entity: ScreeningEntity): boolean => {
      const ok = downloadProviderReport(entity, getEntityMatches(entity.id), t, lang);
      if (!ok) toast.error(t('complianceEntities.downloads.reportUnavailable'));
      return ok;
    },
    [getEntityMatches, t, lang],
  );

  const downloadEntityTrail = useCallback(
    (entity: ScreeningEntity) => downloadEntityAuditTrail(entity, getEntityMatches(entity.id), t),
    [getEntityMatches, t],
  );

  const downloadAlertTrail = useCallback(
    (matchId: string) => {
      const match = getMatch(matchId);
      const entity = match && entities.find((e) => e.id === match.entityId);
      if (match && entity) downloadAlertAuditTrail(match, entity, t);
    },
    [getMatch, entities, t],
  );

  return { canViewScreening, downloadReport, downloadEntityTrail, downloadAlertTrail };
}

interface EntityDownloadMenuProps {
  entity: ScreeningEntity;
  onReportDownloaded?: (entity: ScreeningEntity) => void;
}

/** Menu secondaire d'une ligne d'entité : rapport fournisseur puis piste d'audit. */
export function EntityDownloadMenu({ entity, onReportDownloaded }: EntityDownloadMenuProps) {
  const { t } = useTranslation();
  const { canViewScreening, downloadReport, downloadEntityTrail } = useScreeningDownloads();

  if (!canViewScreening) return null;

  const stop = (event: SyntheticEvent) => event.stopPropagation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={stop}
          onKeyDown={stop}
          aria-label={t('complianceEntities.downloads.menuLabel', { name: entity.name })}
          title={t('complianceEntities.downloads.menuLabel', { name: entity.name })}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={stop} onKeyDown={stop}>
        {entity.controlCompleted && (
          <DropdownMenuItem
            onClick={() => {
              if (downloadReport(entity)) onReportDownloaded?.(entity);
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('complianceEntities.downloads.downloadReport')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => downloadEntityTrail(entity)}>
          <FileDown className="w-4 h-4 mr-2" />
          {t('complianceEntities.downloads.downloadAuditTrail')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
