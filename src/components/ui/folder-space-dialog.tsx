/**
 * FolderSpaceDialog — Design System component
 * Key: ds-folder-space-dialog
 *
 * Unified dialog for creating / editing folders and spaces in the Data Room.
 *
 * Variants:
 *  - "folder"  → Shows parent folder selector (treeview), targeting is editable
 *                (segments multi-select with inline badges, fund single select).
 *  - "space"   → No parent folder selector, targeting is editable + user types.
 *
 * Targeting inputs:
 *  - Segments: multi-select, selected values appear as badges INSIDE the field
 *  - Fund: single-select, selected value shown INSIDE the field
 *
 * An AudienceCounter is displayed below the targeting showing the number of
 * concerned investors and contacts.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  ChevronDown,
  FolderOpen,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Switch } from './switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { FolderSelectionTreeviewDropdown, FolderOption } from '../DocumentAddModal';
import { AudienceCounter, computeAudience } from '../AudienceCounter';
import { SegmentsMultiSelect, FundSingleSelect } from './targeting-selects';
import { useTranslation } from '../../utils/languageContext';
import { FUNDS } from '../../utils/gedFixtures';

// ---------------------------------------------------------------------------
// Brand color token
// ---------------------------------------------------------------------------
const BRAND_BLUE = '#000E2B';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------
const USER_TYPES = ['Investisseur', 'Participation', 'Partenaire'] as const;
const ALL_SEGMENTS = ['HNWI', 'UHNWI', 'Retail', 'Professional', 'Institutional'] as const;
const ALL_FUNDS = FUNDS.map((f) => f.name);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { FolderOption };

export interface SpaceTargeting {
  userTypes: string[];
  segments: string[];
  funds: string[];
}

export type DisclaimerType = 'standard' | 'confidential' | 'restricted';

export interface DisclaimerConfig {
  enabled: boolean;
  type: DisclaimerType;
}

const DEFAULT_DISCLAIMER: DisclaimerConfig = {
  enabled: false,
  type: 'standard',
};

interface BaseProps {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
}

interface FolderVariantProps extends BaseProps {
  variant: 'folder';
  folderOptions: FolderOption[];
  defaultParentId: string;
  inheritedTargeting: SpaceTargeting;
  folderToEdit?: { id: string; name: string; disclaimer?: DisclaimerConfig } | null;
  onDeleteFolder?: (folderId: string, migrateToFolderId: string) => void;
  onSave?: (data: {
    name: string;
    parentId: string;
    targeting: SpaceTargeting;
    disclaimer: DisclaimerConfig;
  }) => void;
  space?: never;
  onSaveSpace?: never;
  onDeleteSpace?: never;
}

interface SpaceVariantProps extends BaseProps {
  variant: 'space';
  space?: {
    id: string;
    name: string;
    targeting: SpaceTargeting;
    documentCount?: number;
    folderCount?: number;
    disclaimer?: DisclaimerConfig;
  } | null;
  onSaveSpace?: (data: {
    id?: string;
    name: string;
    targeting: SpaceTargeting;
    documentCount: number;
    folderCount: number;
    disclaimer: DisclaimerConfig;
  }) => void;
  onDeleteSpace?: (spaceId: string) => void;
  folderOptions?: never;
  defaultParentId?: never;
  inheritedTargeting?: never;
  folderToEdit?: never;
  onDeleteFolder?: never;
  onSave?: never;
}

export type FolderSpaceDialogProps = FolderVariantProps | SpaceVariantProps;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FolderSpaceDialog(props: FolderSpaceDialogProps) {
  const { variant, open, onClose, mode = 'create' } = props;
  const isSpace = variant === 'space';
  const isEdit = mode === 'edit';
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [targeting, setTargeting] = useState<SpaceTargeting>({ userTypes: [], segments: [], funds: [] });
  const [disclaimer, setDisclaimer] = useState<DisclaimerConfig>(DEFAULT_DISCLAIMER);

  useEffect(() => {
    if (!open) return;

    if (isSpace) {
      const sp = (props as SpaceVariantProps).space;
      setName(sp?.name || '');
      setTargeting(sp?.targeting || { userTypes: [], segments: [], funds: [] });
      setDisclaimer(sp?.disclaimer || DEFAULT_DISCLAIMER);
    } else {
      const fp = props as FolderVariantProps;
      setParentId(fp.defaultParentId);
      setName(isEdit ? fp.folderToEdit?.name || '' : '');
      // For folders: start from inherited targeting so user can customize
      setTargeting({
        userTypes: fp.inheritedTargeting?.userTypes || [],
        segments: fp.inheritedTargeting?.segments || [],
        funds: fp.inheritedTargeting?.funds || [],
      });
      setDisclaimer(fp.folderToEdit?.disclaimer || DEFAULT_DISCLAIMER);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const folderOptions = isSpace ? [] : (props as FolderVariantProps).folderOptions;

  const toggleUserType = (type: string) =>
    setTargeting((prev) => ({
      ...prev,
      userTypes: prev.userTypes.includes(type) ? prev.userTypes.filter((t) => t !== type) : [...prev.userTypes, type],
    }));

  const selectedFund = targeting.funds[0] || null;
  const setSelectedFund = (fund: string | null) =>
    setTargeting((prev) => ({ ...prev, funds: fund ? [fund] : [] }));

  const setSegments = (segs: string[]) =>
    setTargeting((prev) => ({ ...prev, segments: segs }));

  const audience = useMemo(
    () => computeAudience(targeting.segments, selectedFund),
    [targeting.segments, selectedFund],
  );

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (isSpace) {
      const sp = props as SpaceVariantProps;
      sp.onSaveSpace?.({
        id: sp.space?.id,
        name: name.trim(),
        targeting,
        documentCount: sp.space?.documentCount || 0,
        folderCount: sp.space?.folderCount || 0,
        disclaimer,
      });
    } else {
      (props as FolderVariantProps).onSave?.({ name: name.trim(), parentId, targeting, disclaimer });
    }
    onClose();
  };

  const handleDeleteSpace = () => {
    if (isSpace) {
      const sp = props as SpaceVariantProps;
      if (sp.space) {
        sp.onDeleteSpace?.(sp.space.id);
        onClose();
      }
    }
  };

  const title = isSpace
    ? isEdit ? t('ged.dataRoom.folderSpaceDialog.titleSpaceEdit') : t('ged.dataRoom.folderSpaceDialog.titleSpaceCreate')
    : isEdit ? t('ged.dataRoom.folderSpaceDialog.titleFolderEdit') : t('ged.dataRoom.folderSpaceDialog.titleFolderCreate');
  const description = isSpace
    ? t('ged.dataRoom.folderSpaceDialog.descSpace')
    : t('ged.dataRoom.folderSpaceDialog.descFolder');
  const nameLabel = isSpace
    ? t('ged.dataRoom.folderSpaceDialog.nameSpaceLabel')
    : t('ged.dataRoom.folderSpaceDialog.nameFolderLabel');
  const namePlaceholder = isSpace
    ? t('ged.dataRoom.folderSpaceDialog.nameSpacePlaceholder')
    : t('ged.dataRoom.folderSpaceDialog.nameFolderPlaceholder');
  const submitLabel = isSpace
    ? isEdit ? t('ged.dataRoom.folderSpaceDialog.save') : t('ged.dataRoom.folderSpaceDialog.submitSpaceCreate')
    : isEdit ? t('ged.dataRoom.folderSpaceDialog.save') : t('ged.dataRoom.folderSpaceDialog.submitFolderCreate');

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="!max-w-[50vw] !w-[50vw] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Parent folder — folder variant only (tree view) */}
          {!isSpace && (
            <div className="space-y-2">
              <Label>{t('ged.dataRoom.folderSpaceDialog.parentFolder')}</Label>
              <FolderSelectionTreeviewDropdown
                value={parentId}
                onChange={setParentId}
                folderOptions={folderOptions}
              />
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="ds-fsd-name">{nameLabel}</Label>
            <Input
              id="ds-fsd-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              className="w-full"
            />
          </div>

          {/* Targeting */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">{t('ged.dataRoom.folderSpaceDialog.targeting')}</h3>
              <p className="text-xs text-gray-500">
                {isSpace
                  ? t('ged.dataRoom.folderSpaceDialog.targetingDescSpace')
                  : t('ged.dataRoom.folderSpaceDialog.targetingDescFolder')}
              </p>
            </div>

            {/* User types — space variant only */}
            {isSpace && (
              <div className="space-y-2">
                <Label>{t('ged.dataRoom.folderSpaceDialog.userType')}</Label>
                <div className="flex flex-wrap gap-2">
                  {USER_TYPES.map((type) => {
                    const isSelected = targeting.userTypes.includes(type);
                    const Icon = type === 'Investisseur' ? Users : type === 'Participation' ? Building2 : Briefcase;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleUserType(type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected ? 'bg-white' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                        }`}
                        style={isSelected ? { borderColor: BRAND_BLUE, color: BRAND_BLUE } : undefined}
                      >
                        <Icon className="w-4 h-4" style={isSelected ? { color: BRAND_BLUE } : undefined} />
                        <span className="text-sm font-medium">{t(`ged.dataRoom.folderSpaceDialog.userTypes.${type}`)}</span>
                      </button>
                    );
                  })}
                </div>
                {targeting.userTypes.length === 0 && (
                  <p className="text-xs text-amber-600">{t('ged.dataRoom.folderSpaceDialog.noUserTypeWarning')}</p>
                )}
              </div>
            )}

            {/* Segments — multi-select inline badges */}
            <div className="space-y-2">
              <Label>{t('ged.dataRoom.folderSpaceDialog.segmentsLabel')}</Label>
              <SegmentsMultiSelect
                value={targeting.segments}
                onChange={setSegments}
                options={ALL_SEGMENTS}
                placeholder={t('ged.dataRoom.folderSpaceDialog.segmentsAll')}
              />
            </div>

            {/* Fund — single-select inline badge */}
            <div className="space-y-2">
              <Label>{t('ged.dataRoom.folderSpaceDialog.fundsLabel')}</Label>
              <FundSingleSelect
                value={selectedFund}
                onChange={setSelectedFund}
                options={ALL_FUNDS}
                placeholder={t('ged.dataRoom.folderSpaceDialog.fundsAll')}
              />
            </div>
          </div>

          {/* Audience counter */}
          <AudienceCounter
            investors={audience.investors}
            contacts={audience.contacts}
          />

          {/* Disclaimer */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-900 font-medium block">
                    {t('ged.dataRoom.folderSpaceDialog.disclaimerToggleLabel')}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isSpace
                      ? t('ged.dataRoom.folderSpaceDialog.disclaimerToggleDescriptionSpace')
                      : t('ged.dataRoom.folderSpaceDialog.disclaimerToggleDescriptionFolder')}
                  </p>
                </div>
              </div>
              <Switch
                checked={disclaimer.enabled}
                onCheckedChange={(checked) =>
                  setDisclaimer((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>
            {disclaimer.enabled && (
              <div>
                <Label htmlFor="ds-fsd-disclaimer">
                  {t('ged.dataRoom.folderSpaceDialog.disclaimerLabel')}
                </Label>
                <Select
                  value={disclaimer.type}
                  onValueChange={(value) =>
                    setDisclaimer((prev) => ({ ...prev, type: value as DisclaimerType }))
                  }
                >
                  <SelectTrigger id="ds-fsd-disclaimer" className="mt-1.5 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      {t('ged.dataRoom.folderSpaceDialog.disclaimerStandard')}
                    </SelectItem>
                    <SelectItem value="confidential">
                      {t('ged.dataRoom.folderSpaceDialog.disclaimerConfidential')}
                    </SelectItem>
                    <SelectItem value="restricted">
                      {t('ged.dataRoom.folderSpaceDialog.disclaimerRestricted')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between sm:justify-between">
          <div>
            {isSpace && isEdit && (props as SpaceVariantProps).space && (props as SpaceVariantProps).onDeleteSpace && (
              <Button
                variant="outline"
                onClick={handleDeleteSpace}
                className="text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('ged.dataRoom.folderSpaceDialog.delete')}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('ged.dataRoom.folderSpaceDialog.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              className="text-white"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              {submitLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Preview variant — renders inline without Dialog overlay (for Design System)
// ---------------------------------------------------------------------------

interface FolderSpaceDialogPreviewProps {
  variant: 'folder' | 'space';
}

export function FolderSpaceDialogPreview({ variant }: FolderSpaceDialogPreviewProps) {
  const { t } = useTranslation();
  const isSpace = variant === 'space';
  const [targeting, setTargeting] = useState<SpaceTargeting>({
    userTypes: ['Investisseur'],
    segments: ['HNWI', 'UHNWI'],
    funds: FUNDS[0] ? [FUNDS[0].name] : [],
  });

  const selectedFund = targeting.funds[0] || null;
  const setSelectedFund = (fund: string | null) =>
    setTargeting((prev) => ({ ...prev, funds: fund ? [fund] : [] }));
  const setSegments = (segs: string[]) =>
    setTargeting((prev) => ({ ...prev, segments: segs }));
  const toggleUserType = (type: string) =>
    setTargeting((prev) => ({
      ...prev,
      userTypes: prev.userTypes.includes(type) ? prev.userTypes.filter((t) => t !== type) : [...prev.userTypes, type],
    }));

  const audience = useMemo(
    () => computeAudience(targeting.segments, selectedFund),
    [targeting.segments, selectedFund],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND_BLUE }}>
          <FolderOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isSpace ? t('ged.dataRoom.folderSpaceDialog.titleSpaceCreate') : t('ged.dataRoom.folderSpaceDialog.titleFolderCreate')}
          </h3>
          <p className="text-sm text-gray-500">
            {isSpace
              ? t('ged.dataRoom.folderSpaceDialog.descSpace')
              : t('ged.dataRoom.folderSpaceDialog.descFolder')}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!isSpace && (
          <div className="space-y-2">
            <Label>{t('ged.dataRoom.folderSpaceDialog.parentFolder')}</Label>
            <Button variant="outline" className="w-full justify-between font-normal">
              <span className="truncate">Constitutifs du Fonds</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label>
            {isSpace
              ? t('ged.dataRoom.folderSpaceDialog.nameSpaceLabel')
              : t('ged.dataRoom.folderSpaceDialog.nameFolderLabel')}
          </Label>
          <Input
            placeholder={
              isSpace
                ? t('ged.dataRoom.folderSpaceDialog.nameSpacePlaceholder')
                : t('ged.dataRoom.folderSpaceDialog.nameFolderPlaceholder')
            }
            defaultValue=""
          />
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">{t('ged.dataRoom.folderSpaceDialog.targeting')}</h4>
            <p className="text-xs text-gray-500">
              {isSpace
                ? t('ged.dataRoom.folderSpaceDialog.targetingDescSpace')
                : t('ged.dataRoom.folderSpaceDialog.targetingDescFolder')}
            </p>
          </div>

          {isSpace && (
            <div className="space-y-2">
              <Label>{t('ged.dataRoom.folderSpaceDialog.userType')}</Label>
              <div className="flex flex-wrap gap-2">
                {USER_TYPES.map((type) => {
                  const isSelected = targeting.userTypes.includes(type);
                  const Icon = type === 'Investisseur' ? Users : type === 'Participation' ? Building2 : Briefcase;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleUserType(type)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected ? 'bg-white' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                      }`}
                      style={isSelected ? { borderColor: BRAND_BLUE, color: BRAND_BLUE } : undefined}
                    >
                      <Icon className="w-4 h-4" style={isSelected ? { color: BRAND_BLUE } : undefined} />
                      <span className="text-sm font-medium">{t(`ged.dataRoom.folderSpaceDialog.userTypes.${type}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('ged.dataRoom.folderSpaceDialog.segmentsLabel')}</Label>
            <SegmentsMultiSelect
              value={targeting.segments}
              onChange={setSegments}
              options={ALL_SEGMENTS}
              placeholder={t('ged.dataRoom.folderSpaceDialog.segmentsAll')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('ged.dataRoom.folderSpaceDialog.fundsLabel')}</Label>
            <FundSingleSelect
              value={selectedFund}
              onChange={setSelectedFund}
              options={ALL_FUNDS}
              placeholder={t('ged.dataRoom.folderSpaceDialog.fundsAll')}
            />
          </div>
        </div>

        <AudienceCounter
          investors={audience.investors}
          contacts={audience.contacts}
        />
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
        <Button variant="outline">{t('ged.dataRoom.folderSpaceDialog.cancel')}</Button>
        <Button className="text-white" style={{ backgroundColor: BRAND_BLUE }}>
          {isSpace
            ? t('ged.dataRoom.folderSpaceDialog.submitSpaceCreate')
            : t('ged.dataRoom.folderSpaceDialog.submitFolderCreate')}
        </Button>
      </div>
    </div>
  );
}
