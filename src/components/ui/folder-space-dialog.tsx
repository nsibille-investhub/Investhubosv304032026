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
  Check,
  Landmark,
  Layers3,
  FolderOpen,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { FolderSelectionTreeviewDropdown, FolderOption } from '../DocumentAddModal';
import { AudienceCounter, computeAudience } from '../AudienceCounter';

// ---------------------------------------------------------------------------
// Brand color token
// ---------------------------------------------------------------------------
const BRAND_BLUE = '#000E2B';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------
const USER_TYPES = ['Investisseur', 'Participation', 'Partenaire'] as const;
const ALL_SEGMENTS = ['HNWI', 'UHNWI', 'Retail', 'Professional', 'Institutional'] as const;
const ALL_FUNDS = ['VENTECH I', 'VENTECH II', 'KORELYA I'] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { FolderOption };

export interface SpaceTargeting {
  userTypes: string[];
  segments: string[];
  funds: string[];
}

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
  folderToEdit?: { id: string; name: string } | null;
  onDeleteFolder?: (folderId: string, migrateToFolderId: string) => void;
  onSave?: (data: { name: string; parentId: string; targeting: SpaceTargeting }) => void;
  space?: never;
  onSaveSpace?: never;
  onDeleteSpace?: never;
}

interface SpaceVariantProps extends BaseProps {
  variant: 'space';
  space?: { id: string; name: string; targeting: SpaceTargeting; documentCount?: number; folderCount?: number } | null;
  onSaveSpace?: (data: { id?: string; name: string; targeting: SpaceTargeting; documentCount: number; folderCount: number }) => void;
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
// Inline multi-select with badges (segments)
// ---------------------------------------------------------------------------

interface SegmentsMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  options: readonly string[];
  placeholder?: string;
}

function SegmentsMultiSelect({ value, onChange, options, placeholder = 'Tous les segments' }: SegmentsMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (seg: string) => {
    if (value.includes(seg)) onChange(value.filter((v) => v !== seg));
    else onChange([...value, seg]);
  };

  const remove = (seg: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(value.filter((v) => v !== seg));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full min-h-[44px] px-3 py-2 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-between gap-2"
        >
          <div className="flex-1 flex flex-wrap gap-1.5 items-center min-h-[26px]">
            {value.length === 0 ? (
              <span className="text-sm text-gray-500">{placeholder}</span>
            ) : (
              value.map((seg) => (
                <span
                  key={seg}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                  style={{ color: '#7a7a7a', borderColor: '#ddd7cc', backgroundColor: '#f5f3ee' }}
                >
                  <Users className="w-3 h-3" />
                  {seg}
                  <span
                    onClick={(e) => remove(seg, e)}
                    className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 cursor-pointer inline-flex"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <div className="max-h-64 overflow-y-auto">
          {options.map((seg) => {
            const selected = value.includes(seg);
            return (
              <button
                key={seg}
                type="button"
                onClick={() => toggle(seg)}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md text-left ${
                  selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selected ? 'border-transparent' : 'border-gray-300'
                  }`}
                  style={selected ? { backgroundColor: BRAND_BLUE } : undefined}
                >
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span>{seg}</span>
              </button>
            );
          })}
          {value.length > 0 && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md text-left text-red-600 hover:bg-red-50"
              >
                <X className="w-3.5 h-3.5" />
                Tout désélectionner
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Inline single-select with badge (fund)
// ---------------------------------------------------------------------------

interface FundSingleSelectProps {
  value: string | null;
  onChange: (next: string | null) => void;
  options: readonly string[];
  placeholder?: string;
}

function FundSingleSelect({ value, onChange, options, placeholder = 'Tous les fonds' }: FundSingleSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full min-h-[44px] px-3 py-2 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-between gap-2"
        >
          <div className="flex-1 flex items-center min-h-[26px]">
            {!value ? (
              <span className="text-sm text-gray-500">{placeholder}</span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                style={{ color: '#7a7a7a', borderColor: '#ddd7cc', backgroundColor: '#f5f3ee' }}
              >
                <Landmark className="w-3 h-3" />
                {value}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                  }}
                  className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 cursor-pointer inline-flex"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <div className="max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md text-left ${
              !value ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <Layers3 className="w-3.5 h-3.5 text-gray-500" />
            <span>Tous les fonds</span>
            {!value && <Check className="w-4 h-4 ml-auto text-blue-600" />}
          </button>
          <div className="border-t border-gray-100 my-1" />
          {options.map((fund) => {
            const selected = value === fund;
            return (
              <button
                key={fund}
                type="button"
                onClick={() => {
                  onChange(fund);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md text-left ${
                  selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-gray-500" />
                <span>{fund}</span>
                {selected && <Check className="w-4 h-4 ml-auto text-blue-600" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FolderSpaceDialog(props: FolderSpaceDialogProps) {
  const { variant, open, onClose, mode = 'create' } = props;
  const isSpace = variant === 'space';
  const isEdit = mode === 'edit';

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [migrationTargetId, setMigrationTargetId] = useState('');
  const [targeting, setTargeting] = useState<SpaceTargeting>({ userTypes: [], segments: [], funds: [] });

  useEffect(() => {
    if (!open) return;
    setDeleteMode(false);
    setMigrationTargetId('');

    if (isSpace) {
      const sp = (props as SpaceVariantProps).space;
      setName(sp?.name || '');
      setTargeting(sp?.targeting || { userTypes: [], segments: [], funds: [] });
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
      });
    } else {
      (props as FolderVariantProps).onSave?.({ name: name.trim(), parentId, targeting });
    }
    onClose();
  };

  const handleDeleteFolder = () => {
    if (!isSpace) {
      const fp = props as FolderVariantProps;
      if (fp.folderToEdit && migrationTargetId) {
        fp.onDeleteFolder?.(fp.folderToEdit.id, migrationTargetId);
        onClose();
      }
    }
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
    ? isEdit ? "Configurer l'espace" : 'Nouvel espace'
    : isEdit ? 'Modifier le dossier' : 'Nouveau dossier';
  const description = isSpace
    ? "Définissez le nom et le ciblage de l'espace"
    : 'Définissez le dossier parent, le nom et le ciblage du dossier';
  const nameLabel = isSpace ? "Nom de l'espace *" : 'Nom du dossier *';
  const namePlaceholder = isSpace
    ? 'Ex: Investisseurs LP, Documentation Partenaires...'
    : 'Ex: Rapports investisseurs Q2';
  const submitLabel = isSpace
    ? isEdit ? 'Enregistrer' : "Créer l'espace"
    : isEdit ? 'Enregistrer' : 'Créer le dossier';

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
          {/* Delete section — folder edit only */}
          {!isSpace && isEdit && (props as FolderVariantProps).folderToEdit && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-red-700">Suppression du dossier</p>
                <p className="text-xs text-red-600 mt-1">
                  La migration vers un autre dossier est obligatoire avant suppression.
                </p>
              </div>
              {deleteMode ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Dossier de migration (obligatoire)</Label>
                    <select
                      value={migrationTargetId}
                      onChange={(e) => setMigrationTargetId(e.target.value)}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                    >
                      <option value="">Sélectionner un dossier de destination</option>
                      {folderOptions
                        .filter((o) => o.id !== (props as FolderVariantProps).folderToEdit?.id)
                        .map((o) => (
                          <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeleteMode(false)}>Annuler</Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteFolder}
                      disabled={!migrationTargetId}
                    >
                      Confirmer la suppression
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="border-red-300 text-red-700" onClick={() => setDeleteMode(true)}>
                  Supprimer ce dossier
                </Button>
              )}
            </div>
          )}

          {/* Parent folder — folder variant only (tree view) */}
          {!isSpace && (
            <div className="space-y-2">
              <Label>Dossier parent</Label>
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
              <h3 className="text-sm font-medium text-gray-900 mb-1">Ciblage</h3>
              <p className="text-xs text-gray-500">
                {isSpace
                  ? 'Définissez qui peut accéder à cet espace'
                  : 'Affiner le ciblage hérité de l\'espace pour ce dossier'}
              </p>
            </div>

            {/* User types — space variant only */}
            {isSpace && (
              <div className="space-y-2">
                <Label>Type d&apos;utilisateur</Label>
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
                        <span className="text-sm font-medium">{type}</span>
                      </button>
                    );
                  })}
                </div>
                {targeting.userTypes.length === 0 && (
                  <p className="text-xs text-amber-600">Aucun type d&apos;utilisateur sélectionné</p>
                )}
              </div>
            )}

            {/* Segments — multi-select inline badges */}
            <div className="space-y-2">
              <Label>Segments</Label>
              <SegmentsMultiSelect
                value={targeting.segments}
                onChange={setSegments}
                options={ALL_SEGMENTS}
                placeholder="Tous les segments"
              />
            </div>

            {/* Fund — single-select inline badge */}
            <div className="space-y-2">
              <Label>Fonds</Label>
              <FundSingleSelect
                value={selectedFund}
                onChange={setSelectedFund}
                options={ALL_FUNDS}
                placeholder="Tous les fonds"
              />
            </div>
          </div>

          {/* Audience counter */}
          <AudienceCounter
            investors={audience.investors}
            contacts={audience.contacts}
          />
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
                Supprimer
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
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
  const isSpace = variant === 'space';
  const [targeting, setTargeting] = useState<SpaceTargeting>({
    userTypes: ['Investisseur'],
    segments: ['HNWI', 'UHNWI'],
    funds: ['VENTECH I'],
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
            {isSpace ? 'Nouvel espace' : 'Nouveau dossier'}
          </h3>
          <p className="text-sm text-gray-500">
            {isSpace
              ? "Définissez le nom et le ciblage de l'espace"
              : 'Définissez le dossier parent, le nom et le ciblage du dossier'}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!isSpace && (
          <div className="space-y-2">
            <Label>Dossier parent</Label>
            <Button variant="outline" className="w-full justify-between font-normal">
              <span className="truncate">Constitutifs du Fonds</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label>{isSpace ? "Nom de l'espace *" : 'Nom du dossier *'}</Label>
          <Input
            placeholder={isSpace ? 'Ex: Investisseurs LP, Documentation Partenaires...' : 'Ex: Rapports investisseurs Q2'}
            defaultValue=""
          />
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Ciblage</h4>
            <p className="text-xs text-gray-500">
              {isSpace ? 'Définissez qui peut accéder à cet espace' : "Affiner le ciblage hérité de l'espace pour ce dossier"}
            </p>
          </div>

          {isSpace && (
            <div className="space-y-2">
              <Label>Type d&apos;utilisateur</Label>
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
                      <span className="text-sm font-medium">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Segments</Label>
            <SegmentsMultiSelect
              value={targeting.segments}
              onChange={setSegments}
              options={ALL_SEGMENTS}
            />
          </div>

          <div className="space-y-2">
            <Label>Fonds</Label>
            <FundSingleSelect
              value={selectedFund}
              onChange={setSelectedFund}
              options={ALL_FUNDS}
            />
          </div>
        </div>

        <AudienceCounter
          investors={audience.investors}
          contacts={audience.contacts}
        />
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
        <Button variant="outline">Annuler</Button>
        <Button className="text-white" style={{ backgroundColor: BRAND_BLUE }}>
          {isSpace ? "Créer l'espace" : 'Créer le dossier'}
        </Button>
      </div>
    </div>
  );
}
