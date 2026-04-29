import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ShieldAlert, Trash2 } from 'lucide-react';
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
import { Label } from './ui/label';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';
import { isSpaceCompatibleSource } from '../utils/folderDeletion';
import { useTranslation } from '../utils/languageContext';

interface SpaceDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  space: DataRoomSpace | null;
  spaces: DataRoomSpace[];
  onConfirm: (spaceId: string, migrateToSpaceId: string | null) => void;
}

function formatTargetingSummary(space: DataRoomSpace, fallback: string): string {
  const parts: string[] = [];
  if (space.targeting.funds.length > 0) parts.push(space.targeting.funds.join(', '));
  if (space.targeting.segments.length > 0) parts.push(space.targeting.segments.join(', '));
  if (space.targeting.userTypes.length > 0) parts.push(space.targeting.userTypes.join(', '));
  return parts.length > 0 ? parts.join(' · ') : fallback;
}

export function SpaceDeleteDialog({ open, onClose, space, spaces, onConfirm }: SpaceDeleteDialogProps) {
  const { t } = useTranslation();
  const [destinationId, setDestinationId] = useState<string>('');

  useEffect(() => {
    if (!open) setDestinationId('');
  }, [open]);

  const totalItems = (space?.documentCount ?? 0) + (space?.folderCount ?? 0);
  const isEmpty = totalItems === 0;

  const compatibleDestinations = useMemo<DataRoomSpace[]>(() => {
    if (!space) return [];
    return spaces.filter((candidate) => {
      if (candidate.id === space.id) return false;
      return isSpaceCompatibleSource(candidate.targeting, space.targeting);
    });
  }, [space, spaces]);

  if (!space) return null;

  const noCompatibleDestination = !isEmpty && compatibleDestinations.length === 0;
  const noRestriction = t('ged.spaceDelete.noRestriction');

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('ged.spaceDelete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {isEmpty
              ? t('ged.spaceDelete.confirmEmpty', { name: space.name })
              : t(
                  space.documentCount > 1
                    ? 'ged.spaceDelete.reassignMany'
                    : 'ged.spaceDelete.reassignOne',
                  { name: space.name, count: space.documentCount },
                )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isEmpty && (
          <div className="space-y-3 py-2">
            {noCompatibleDestination ? (
              <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                <ShieldAlert className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-900">
                  {t('ged.spaceDelete.noCompatible')}
                </div>
              </div>
            ) : (
              <>
                <Label htmlFor="ds-space-delete-target">
                  {t('ged.spaceDelete.targetLabel')}
                </Label>
                <select
                  id="ds-space-delete-target"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-white text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">{t('ged.spaceDelete.targetPlaceholder')}</option>
                  {compatibleDestinations.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} — {formatTargetingSummary(candidate, noRestriction)}
                    </option>
                  ))}
                </select>
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>{t('ged.spaceDelete.restrictionHint')}</span>
                </div>
              </>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{t('ged.listView.cancel')}</AlertDialogCancel>
          {isEmpty ? (
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center"
              onClick={() => {
                onConfirm(space.id, null);
                onClose();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('ged.listView.delete')}
            </AlertDialogAction>
          ) : (
            !noCompatibleDestination && (
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:pointer-events-none"
                disabled={!destinationId}
                onClick={() => {
                  if (!destinationId) return;
                  onConfirm(space.id, destinationId);
                  onClose();
                }}
              >
                {t('ged.spaceDelete.reassignCta')}
              </AlertDialogAction>
            )
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
