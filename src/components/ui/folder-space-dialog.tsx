/**
 * FolderSpaceDialog — Design System component
 * Key: ds-folder-space-dialog
 *
 * Unified dialog for creating / editing folders and spaces in the Data Room.
 *
 * Variants:
 *  - "folder"  → Shows parent folder selector, targeting is read-only (inherited from space).
 *  - "space"   → No parent folder selector, targeting is editable.
 *
 * Usage:
 *  <FolderSpaceDialog variant="folder" ... />
 *  <FolderSpaceDialog variant="space" ... />
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  Target,
  ChevronDown,
  Check,
  Folder,
  FolderOpen,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

// ---------------------------------------------------------------------------
// Brand color token
// ---------------------------------------------------------------------------
const BRAND_BLUE = '#000E2B';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------
const USER_TYPES = ['Investisseur', 'Participation', 'Partenaire'] as const;
const ALL_SEGMENTS = ['HNWI', 'UHNWI', 'Retail', 'Professional', 'Institutional'] as const;
const ALL_FUNDS = ['Tous les fonds', 'VENTECH I', 'VENTECH II', 'KORELYA I'] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FolderOption {
  id: string;
  label: string;
}

export interface SpaceTargeting {
  userTypes: string[];
  segments: string[];
  funds: string[];
}

/** Props shared by both variants. */
interface BaseProps {
  open: boolean;
  onClose: () => void;
  /** 'create' (default) or 'edit' */
  mode?: 'create' | 'edit';
}

/** Folder-specific props. */
interface FolderVariantProps extends BaseProps {
  variant: 'folder';
  /** Available parent folders. */
  folderOptions: FolderOption[];
  /** Pre-selected parent folder ID. */
  defaultParentId: string;
  /** Targeting inherited from the parent space (read-only). */
  inheritedTargeting: SpaceTargeting;
  /** Existing folder data when editing. */
  folderToEdit?: { id: string; name: string } | null;
  /** Callback when the user confirms deletion + migration. */
  onDeleteFolder?: (folderId: string, migrateToFolderId: string) => void;
  /** Called on save with the folder name and selected parentId. */
  onSave?: (data: { name: string; parentId: string }) => void;
  /* Space-only props — absent */
  space?: never;
  onSaveSpace?: never;
  onDeleteSpace?: never;
}

/** Space-specific props. */
interface SpaceVariantProps extends BaseProps {
  variant: 'space';
  /** Existing space data when editing. null for creation. */
  space?: { id: string; name: string; targeting: SpaceTargeting; documentCount?: number; folderCount?: number } | null;
  /** Called on save with name + targeting. */
  onSaveSpace?: (data: { id?: string; name: string; targeting: SpaceTargeting; documentCount: number; folderCount: number }) => void;
  /** Called on delete with space ID. */
  onDeleteSpace?: (spaceId: string) => void;
  /* Folder-only props — absent */
  folderOptions?: never;
  defaultParentId?: never;
  inheritedTargeting?: never;
  folderToEdit?: never;
  onDeleteFolder?: never;
  onSave?: never;
}

export type FolderSpaceDialogProps = FolderVariantProps | SpaceVariantProps;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FolderSpaceDialog(props: FolderSpaceDialogProps) {
  const { variant, open, onClose, mode = 'create' } = props;
  const isSpace = variant === 'space';
  const isEdit = mode === 'edit';

  // ---- Local state ----
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [parentOpen, setParentOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [migrationTargetId, setMigrationTargetId] = useState('');

  // Space-only: editable targeting
  const [targeting, setTargeting] = useState<SpaceTargeting>({ userTypes: [], segments: [], funds: [] });

  // ---- Reset on open ----
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ---- Derived ----
  const folderOptions = isSpace ? [] : (props as FolderVariantProps).folderOptions;
  const selectedParentLabel = useMemo(
    () => folderOptions.find((f) => f.id === parentId)?.label || 'Racine / Documents',
    [folderOptions, parentId],
  );

  // Read-only targeting for folder variant
  const displayTargeting: SpaceTargeting = isSpace
    ? targeting
    : (props as FolderVariantProps).inheritedTargeting;
  const displayUserTypes = displayTargeting.userTypes.length ? displayTargeting.userTypes : [...USER_TYPES];
  const segmentsLabel = displayTargeting.segments.length
    ? displayTargeting.segments.join(', ')
    : 'Tous les investisseurs / Participation / Partenaires';
  const fundsLabel = displayTargeting.funds.length
    ? displayTargeting.funds.join(', ')
    : 'Tous les fonds';

  // ---- Handlers ----
  const toggleUserType = (type: string) =>
    setTargeting((prev) => ({
      ...prev,
      userTypes: prev.userTypes.includes(type) ? prev.userTypes.filter((t) => t !== type) : [...prev.userTypes, type],
    }));

  const toggleSegment = (seg: string) =>
    setTargeting((prev) => ({
      ...prev,
      segments: prev.segments.includes(seg) ? prev.segments.filter((s) => s !== seg) : [...prev.segments, seg],
    }));

  const toggleFund = (fund: string) =>
    setTargeting((prev) => ({
      ...prev,
      funds: prev.funds.includes(fund) ? prev.funds.filter((f) => f !== fund) : [...prev.funds, fund],
    }));

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (isSpace) {
      const sp = (props as SpaceVariantProps);
      sp.onSaveSpace?.({
        id: sp.space?.id,
        name: name.trim(),
        targeting,
        documentCount: sp.space?.documentCount || 0,
        folderCount: sp.space?.folderCount || 0,
      });
    } else {
      (props as FolderVariantProps).onSave?.({ name: name.trim(), parentId });
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
      const sp = (props as SpaceVariantProps);
      if (sp.space) {
        sp.onDeleteSpace?.(sp.space.id);
        onClose();
      }
    }
  };

  // ---- Title / labels ----
  const title = isSpace
    ? isEdit ? "Configurer l'espace" : 'Nouvel espace'
    : isEdit ? 'Modifier le dossier' : 'Nouveau dossier';
  const nameLabel = isSpace ? "Nom de l'espace *" : 'Nom du dossier *';
  const namePlaceholder = isSpace
    ? 'Ex: Investisseurs LP, Documentation Partenaires...'
    : 'Ex: Rapports investisseurs Q2';
  const submitLabel = isSpace
    ? isEdit ? 'Enregistrer' : "Créer l'espace"
    : isEdit ? 'Enregistrer' : 'Créer le dossier';

  // ---- Render ----
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="!max-w-[50vw] !w-[50vw] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white">
        {/* Header */}
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
              <DialogDescription>Définissez le nom et le ciblage de l&apos;espace</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Delete section (folder edit only) */}
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

          {/* Parent folder (folder variant only) */}
          {!isSpace && (
            <div className="space-y-2">
              <Label>Dossier parent</Label>
              <Popover open={parentOpen} onOpenChange={setParentOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    <span className="truncate">{selectedParentLabel}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher un dossier..." />
                    <CommandList>
                      <CommandEmpty>Aucun dossier trouvé.</CommandEmpty>
                      <CommandGroup>
                        {folderOptions.map((folder) => (
                          <CommandItem
                            key={folder.id}
                            value={folder.label}
                            onSelect={() => { setParentId(folder.id); setParentOpen(false); }}
                            className="flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Folder className="w-4 h-4" style={{ color: BRAND_BLUE }} />
                              {folder.label}
                            </span>
                            {folder.id === parentId && <Check className="w-4 h-4" style={{ color: BRAND_BLUE }} />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                {isSpace ? "Définissez qui peut accéder à cet espace" : "Hérité directement de l'espace (lecture seule)"}
              </p>
            </div>

            {/* User types */}
            <div className="space-y-2">
              <Label>Type d&apos;utilisateur</Label>
              <div className="flex flex-wrap gap-2">
                {USER_TYPES.map((type) => {
                  const isSelected = isSpace ? targeting.userTypes.includes(type) : displayUserTypes.includes(type);
                  const Icon = type === 'Investisseur' ? Users : type === 'Participation' ? Building2 : Briefcase;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={isSpace ? () => toggleUserType(type) : undefined}
                      disabled={!isSpace}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-white'
                          : 'border-gray-200 bg-white text-gray-400'
                      } ${isSpace && !isSelected ? 'hover:border-gray-300 cursor-pointer' : ''} ${!isSpace ? 'cursor-default' : 'cursor-pointer'}`}
                      style={isSelected ? { borderColor: BRAND_BLUE, color: BRAND_BLUE } : undefined}
                    >
                      <Icon className="w-4 h-4" style={isSelected ? { color: BRAND_BLUE } : undefined} />
                      <span className="text-sm font-medium">{type}</span>
                    </button>
                  );
                })}
              </div>
              {isSpace && targeting.userTypes.length === 0 && (
                <p className="text-xs text-amber-600">Aucun type d&apos;utilisateur sélectionné</p>
              )}
            </div>

            {/* Segments */}
            <div className="space-y-2">
              <Label>Segments</Label>
              {isSpace ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="text-sm">
                        {targeting.segments.length > 0
                          ? `${targeting.segments.length} segment${targeting.segments.length > 1 ? 's' : ''} sélectionné${targeting.segments.length > 1 ? 's' : ''}`
                          : 'Sélectionner des segments'}
                      </span>
                      <Target className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {ALL_SEGMENTS.map((seg) => (
                      <DropdownMenuCheckboxItem key={seg} checked={targeting.segments.includes(seg)} onCheckedChange={() => toggleSegment(seg)}>
                        {seg}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {targeting.segments.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setTargeting((p) => ({ ...p, segments: [] }))} className="text-red-600">
                          <X className="w-3.5 h-3.5 mr-2" />
                          Tout désélectionner
                        </DropdownMenuCheckboxItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" className="w-full justify-between" disabled>
                  <span className="text-sm text-left truncate">Limiter à des segments : {segmentsLabel}</span>
                  <Target className="w-4 h-4 ml-2" />
                </Button>
              )}
              {displayTargeting.segments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {displayTargeting.segments.map((seg) => (
                    <Badge key={seg} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {seg}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Funds */}
            <div className="space-y-2">
              <Label>Fonds</Label>
              {isSpace ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="text-sm">
                        {targeting.funds.length > 0
                          ? `${targeting.funds.length} fond${targeting.funds.length > 1 ? 's' : ''} sélectionné${targeting.funds.length > 1 ? 's' : ''}`
                          : 'Sélectionner des fonds'}
                      </span>
                      <Target className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {ALL_FUNDS.map((fund) => (
                      <DropdownMenuCheckboxItem key={fund} checked={targeting.funds.includes(fund)} onCheckedChange={() => toggleFund(fund)}>
                        {fund}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {targeting.funds.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setTargeting((p) => ({ ...p, funds: [] }))} className="text-red-600">
                          <X className="w-3.5 h-3.5 mr-2" />
                          Tout désélectionner
                        </DropdownMenuCheckboxItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" className="w-full justify-between" disabled>
                  <span className="text-sm text-left truncate">Limiter à un fonds : {fundsLabel}</span>
                  <Target className="w-4 h-4 ml-2" />
                </Button>
              )}
              {displayTargeting.funds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {displayTargeting.funds.map((fund) => (
                    <Badge key={fund} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {fund}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
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
