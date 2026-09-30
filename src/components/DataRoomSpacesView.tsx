import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { animate, motion } from 'motion/react';
import { Plus, Folder, Settings, Users, Handshake, TrendingUp, Target, ArrowRight, Search, FileText, FileUp, FolderOpen, Landmark, Tag as TagIcon, MoreVertical, Presentation, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';
import { getTreeForSpace, TreeNode } from '../utils/dataRoomTreeData';
import { Input } from './ui/input';
import { useTranslation } from '../utils/languageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { navigateToPage } from '../utils/routing';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export interface GlobalSearchHit {
  id: string;
  name: string;
  type: 'folder' | 'file';
  pathSegments: string[];
  path: string;
  spaceId: string;
  spaceName: string;
}

interface DataRoomSpacesViewProps {
  spaces: DataRoomSpace[];
  onSpaceSelect: (space: DataRoomSpace) => void;
  onAddSpace: () => void;
  onMassUpload: () => void;
  onConfigureSpace: (space: DataRoomSpace) => void;
  onSearchResultSelect?: (result: GlobalSearchHit) => void;
  /** Move a space to a 0-based position among the spaces of the same section. */
  onReorderSpace?: (spaceId: string, sectionIds: string[], toIndex: number) => void;
}

type Box = { left: number; top: number; width: number; height: number };

type InsertMarker = { anchorId: string; side: 'before' | 'after' };

interface SpaceDrag {
  id: string;
  sectionIds: string[];
  pointer: { x: number; y: number };
  offset: { x: number; y: number };
  origin: Box;
  insert: InsertMarker | null;
  returning: boolean;
}

/** Share of a card width, on each side, that means "insert here"; the centre means "drop on the space". */
const EDGE_ZONE = 0.3;
/** How far the neighbour on the right slides to open the insertion gap. */
const GAP_SHIFT = 18;

const toBox = (rect: DOMRect): Box => ({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });

export function DataRoomSpacesView({
  spaces,
  onSpaceSelect,
  onAddSpace,
  onMassUpload,
  onConfigureSpace,
  onSearchResultSelect,
  onReorderSpace,
}: DataRoomSpacesViewProps) {
  const { t } = useTranslation();
  const [globalSearch, setGlobalSearch] = useState('');
  const [drag, setDrag] = useState<SpaceDrag | null>(null);
  const [landing, setLanding] = useState<{ id: string; from: Box } | null>(null);
  const dragRef = useRef<SpaceDrag | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rectsRef = useRef<Record<string, Box>>({});

  const getTargetIcon = (userTypes: string[]) => {
    if (userTypes.includes('Investisseur')) return Users;
    if (userTypes.includes('Partenaire')) return Handshake;
    if (userTypes.includes('Participation')) return TrendingUp;
    return Target;
  };

  const flattenTree = (nodes: TreeNode[], space: DataRoomSpace, parentPath: string[] = []): GlobalSearchHit[] => {
    return nodes.flatMap((node) => {
      const pathParts = [...parentPath, node.name];
      const current: GlobalSearchHit = {
        id: node.id,
        name: node.name,
        type: node.type === 'folder' ? 'folder' : 'file',
        pathSegments: pathParts,
        path: pathParts.join(' / '),
        spaceId: space.id,
        spaceName: space.name,
      };

      const children = node.children ? flattenTree(node.children, space, pathParts) : [];
      return [current, ...children];
    });
  };

  const indexedContent = useMemo(() => {
    return spaces.flatMap((space) => {
      const tree = getTreeForSpace(space.id);
      return flattenTree(tree, space);
    });
  }, [spaces]);

  const normalizedQuery = globalSearch.trim().toLowerCase();
  const globalResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return indexedContent
      .filter((item) => {
        const haystack = `${item.name} ${item.path} ${item.spaceName}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 30);
  }, [indexedContent, normalizedQuery]);

  const matchedSpaceIds = useMemo(() => {
    if (!normalizedQuery) return new Set<string>();
    return new Set(globalResults.map((item) => item.spaceId));
  }, [globalResults, normalizedQuery]);

  const visibleSpaces = normalizedQuery
    ? spaces.filter((space) => matchedSpaceIds.has(space.id) || space.name.toLowerCase().includes(normalizedQuery))
    : spaces;

  const investorSpaces = visibleSpaces.filter((space) => space.targeting.userTypes[0] === 'Investisseur');
  const partnerSpaces = visibleSpaces.filter((space) => space.targeting.userTypes[0] !== 'Investisseur');

  const dragDisabledReason = normalizedQuery ? t('ged.rank.handle.lockedSearchSpaces') : null;

  const updateDrag = (next: SpaceDrag | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  /** Final 0-based index of the dragged space, or null when it keeps its place. */
  const targetIndex = (d: SpaceDrag, insert: InsertMarker | null): number | null => {
    if (!insert) return null;
    const base = d.sectionIds.filter((id) => id !== d.id);
    const anchor = base.indexOf(insert.anchorId);
    if (anchor < 0) return null;
    const to = insert.side === 'before' ? anchor : anchor + 1;
    return to === d.sectionIds.indexOf(d.id) ? null : to;
  };

  const hitTest = (d: SpaceDrag, x: number, y: number): InsertMarker | null => {
    const others = d.sectionIds.filter((id) => id !== d.id);
    let nearest: { id: string; box: Box; dist: number } | null = null;
    for (const id of others) {
      const box = rectsRef.current[id];
      if (!box) continue;
      const inside = x >= box.left && x <= box.left + box.width && y >= box.top && y <= box.top + box.height;
      if (inside) {
        const rel = (x - box.left) / box.width;
        if (rel < EDGE_ZONE) return { anchorId: id, side: 'before' };
        if (rel > 1 - EDGE_ZONE) return { anchorId: id, side: 'after' };
        return null;
      }
      const dx = Math.max(box.left - x, 0, x - (box.left + box.width));
      const dy = Math.max(box.top - y, 0, y - (box.top + box.height));
      const dist = Math.hypot(dx, dy);
      if (!nearest || dist < nearest.dist) nearest = { id, box, dist };
    }
    const own = d.origin;
    const onOwnPlace = x >= own.left && x <= own.left + own.width && y >= own.top && y <= own.top + own.height;
    if (onOwnPlace || !nearest || nearest.dist > 64) return null;
    return { anchorId: nearest.id, side: x < nearest.box.left + nearest.box.width / 2 ? 'before' : 'after' };
  };

  const startSpaceDrag = (event: ReactPointerEvent, space: DataRoomSpace, sectionIds: string[]) => {
    if (dragDisabledReason || event.button !== 0) return;
    const card = cardRefs.current[space.id];
    if (!card) return;
    event.preventDefault();
    event.stopPropagation();
    const origin = toBox(card.getBoundingClientRect());
    rectsRef.current = {};
    sectionIds.forEach((id) => {
      const el = cardRefs.current[id];
      if (el) rectsRef.current[id] = toBox(el.getBoundingClientRect());
    });
    updateDrag({
      id: space.id,
      sectionIds,
      pointer: { x: event.clientX, y: event.clientY },
      offset: { x: event.clientX - origin.left, y: event.clientY - origin.top },
      origin,
      insert: null,
      returning: false,
    });
  };

  useEffect(() => {
    if (!drag || drag.returning) return;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || d.returning) return;
      const hit = hitTest(d, e.clientX, e.clientY);
      const insert = targetIndex(d, hit) === null ? null : hit;
      updateDrag({ ...d, pointer: { x: e.clientX, y: e.clientY }, insert });
    };
    const finish = (cancel: boolean) => {
      const d = dragRef.current;
      if (!d || d.returning) return;
      const to = cancel ? null : targetIndex(d, d.insert);
      if (to === null) {
        updateDrag({ ...d, insert: null, returning: true });
        return;
      }
      const from = { ...d.origin, left: d.pointer.x - d.offset.x, top: d.pointer.y - d.offset.y };
      updateDrag(null);
      setLanding({ id: d.id, from });
      onReorderSpace?.(d.id, d.sectionIds, to);
    };
    const onUp = () => finish(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish(true);
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.id, drag?.returning]);

  // The dropped card glides from where it was released to its new slot.
  useLayoutEffect(() => {
    if (!landing) return;
    const el = cardRefs.current[landing.id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = landing.from.left - rect.left;
    const dy = landing.from.top - rect.top;
    const controls = animate(el, { x: [dx, 0], y: [dy, 0] }, { type: 'spring', stiffness: 320, damping: 32 });
    controls.then(() => setLanding(null));
    return () => controls.stop();
  }, [landing]);

  const shiftedIdFor = (d: SpaceDrag | null): string | null => {
    if (!d?.insert) return null;
    if (d.insert.side === 'before') return d.insert.anchorId;
    const base = d.sectionIds.filter((id) => id !== d.id);
    const next = base[base.indexOf(d.insert.anchorId) + 1];
    if (!next) return null;
    const anchorBox = rectsRef.current[d.insert.anchorId];
    const nextBox = rectsRef.current[next];
    return anchorBox && nextBox && Math.abs(anchorBox.top - nextBox.top) < 4 ? next : null;
  };

  const renderSpaceCard = (space: DataRoomSpace, index: number, sectionIds: string[], isClone = false) => {
    const TargetIcon = getTargetIcon(space.targeting.userTypes);
    return (
      <motion.div
        initial={isClone ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isClone ? 0 : index * 0.05 }}
        whileHover={drag || isClone ? undefined : { scale: 1.02, y: -4 }}
        whileTap={drag || isClone ? undefined : { scale: 0.98 }}
        className="group relative h-full bg-white rounded-2xl border-2 border-gray-200 hover:border-[#0D2F39] shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col"
      >
        <div className="h-24 bg-gray-100 transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02]" />
          {onReorderSpace && (
            <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex rounded-lg bg-white/80 shadow-sm">
                    <button
                      type="button"
                      className="ged-rank-handle"
                      style={{ touchAction: 'none' }}
                      disabled={!!dragDisabledReason}
                      aria-label={t('ged.rank.handle.aria', { name: space.name })}
                      onPointerDown={(event) => startSpaceDrag(event, space, sectionIds)}
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </span>
                </TooltipTrigger>
                {!drag && (
                  <TooltipContent side="right">
                    <span className="text-xs">{dragDisabledReason ?? t('ged.rank.handle.dragSpace')}</span>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfigureSpace(space);
            }}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 -mt-10 relative flex-1 flex flex-col">
          <div
            className="w-16 h-16 rounded-xl bg-financial-blue flex items-center justify-center shadow-lg mb-4 border border-financial-blue"
            style={{ backgroundColor: '#060D19' }}
          >
            <Folder className="w-8 h-8 text-white" />
          </div>

          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {space.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <TargetIcon className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-2 text-xs">
              {(() => {
                const userType = space.targeting.userTypes[0];
                if (!userType) return t('ged.dataRoom.spacesView.noUserType');
                const translated = t(`ged.dataRoom.spacesView.userTypeLabels.${userType}`);
                return translated.startsWith('ged.dataRoom.spacesView.userTypeLabels.')
                  ? userType
                  : translated;
              })()}
            </span>
          </div>
          <div className="space-y-1.5 mb-4">
            {space.targeting.segments.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <TagIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1" title={space.targeting.segments.join(', ')}>
                  <span className="font-medium text-gray-700">{t('ged.dataRoom.spacesView.segmentsPrefix')}</span> {space.targeting.segments.join(', ')}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Landmark className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1" title={space.targeting.funds.join(', ') || t('ged.dataRoom.spacesView.allFunds')}>
                <span className="font-medium text-gray-700">{t('ged.dataRoom.spacesView.fundsPrefix')}</span> {space.targeting.funds.join(', ') || t('ged.dataRoom.spacesView.allFunds')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#000E2B' }} />
              <span>{t('ged.dataRoom.spacesView.documentsCount', { count: space.documentCount })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#000E2B' }} />
              <span>{t('ged.dataRoom.spacesView.foldersCount', { count: space.folderCount })}</span>
            </div>
          </div>

          <button
            onClick={() => onSpaceSelect(space)}
            className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-financial-blue border border-financial-blue text-white transition-all group/btn"
            style={{ backgroundColor: '#060D19' }}
          >
            <span className="font-medium">{t('ged.dataRoom.spacesView.openSpace')}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col px-6 pb-6 bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 pt-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t('ged.dataRoom.spacesView.title')}</h1>
            <p className="text-gray-500 mt-1">
              {t('ged.dataRoom.spacesView.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onMassUpload}
              variant="secondary"
              className="gap-2"
            >
              <FileUp className="w-4 h-4" />
              {t('ged.dataRoom.spacesView.import')}
            </Button>
            <Button
              onClick={onAddSpace}
              variant="primary"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('ged.dataRoom.spacesView.newSpace')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('ged.pitchDeck.moreActionsLabel')}
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem
                  onClick={() => navigateToPage('pitch-deck')}
                  className="cursor-pointer flex items-start gap-3 py-2.5"
                >
                  <Presentation className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#25563F' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {t('ged.pitchDeck.menuLabel')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('ged.pitchDeck.menuDescription')}
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Global Search Across Spaces */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-gray-200 bg-white p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={t('ged.dataRoom.spacesView.globalSearchPlaceholder')}
            className="pl-10"
          />
        </div>

        {normalizedQuery && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">
              {t(globalResults.length > 1 ? 'ged.dataRoom.spacesView.resultsCountMany' : 'ged.dataRoom.spacesView.resultsCountOne', { count: globalResults.length, spaces: matchedSpaceIds.size })}
            </p>

            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-100">
              {globalResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  {t('ged.dataRoom.spacesView.noResultsFor', { query: globalSearch })}
                </div>
              ) : (
                globalResults.map((result) => (
                  <button
                    key={`${result.spaceId}-${result.id}`}
                    onClick={() => {
                      if (onSearchResultSelect) {
                        onSearchResultSelect(result);
                      } else {
                        const space = spaces.find((s) => s.id === result.spaceId);
                        if (space) {
                          onSpaceSelect(space);
                        }
                      }
                    }}
                    className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-blue-50/60"
                  >
                    <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
                      {result.type === 'folder' ? <FolderOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{result.name}</p>
                      <p className="truncate text-xs text-gray-500">{result.spaceName} · {result.path}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {result.type === 'folder' ? t('ged.dataRoom.spacesView.folder') : t('ged.dataRoom.spacesView.document')}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Spaces by zone */}
      {[
        { title: t('ged.dataRoom.spacesView.investorSpaces'), spaces: investorSpaces },
        { title: t('ged.dataRoom.spacesView.partnerSpaces'), spaces: partnerSpaces },
      ].map((section) => {
        const sectionIds = section.spaces.map((s) => s.id);
        const shiftedId = drag && sectionIds.includes(drag.id) ? shiftedIdFor(drag) : null;
        return (
        <div key={section.title} className="mb-8 last:mb-0">
          {section.spaces.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{section.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {section.spaces.map((space, index) => {
                  const isDragged = drag?.id === space.id;
                  const marker = drag?.insert?.anchorId === space.id ? drag.insert.side : null;
                  return (
                    <motion.div
                      key={space.id}
                      layout={landing?.id !== space.id}
                      animate={{ x: shiftedId === space.id ? GAP_SHIFT : 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      className="relative"
                    >
                      {marker && (
                        <motion.div
                          aria-hidden
                          initial={{ opacity: 0, scaleY: 0.7 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          className="pointer-events-none absolute rounded-lg"
                          style={{
                            top: 8,
                            bottom: 8,
                            width: 10,
                            [marker === 'before' ? 'left' : 'right']: -17,
                            border: '2px dashed #2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.06)',
                          }}
                        />
                      )}
                      <div
                        ref={(el) => { cardRefs.current[space.id] = el; }}
                        className="h-full"
                        style={isDragged ? { opacity: 0.35 } : undefined}
                      >
                        {renderSpaceCard(space, index, sectionIds)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        );
      })}

      {drag && typeof document !== 'undefined' && createPortal(
        (() => {
          const space = spaces.find((s) => s.id === drag.id);
          if (!space) return null;
          const left = drag.returning ? drag.origin.left : drag.pointer.x - drag.offset.x;
          const top = drag.returning ? drag.origin.top : drag.pointer.y - drag.offset.y;
          return (
            <motion.div
              className="pointer-events-none fixed z-50"
              style={{ width: drag.origin.width, height: drag.origin.height }}
              initial={false}
              animate={{ left, top, rotate: drag.returning ? 0 : 1.5, scale: drag.returning ? 1 : 1.02 }}
              transition={drag.returning ? { type: 'spring', stiffness: 300, damping: 30 } : { duration: 0 }}
              onAnimationComplete={() => {
                if (dragRef.current?.returning) updateDrag(null);
              }}
            >
              <div className="h-full rounded-2xl shadow-2xl">{renderSpaceCard(space, 0, [], true)}</div>
            </motion.div>
          );
        })(),
        document.body,
      )}

      {/* Empty State */}
      {visibleSpaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Folder className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {normalizedQuery ? t('ged.dataRoom.spacesView.emptyNoMatch') : t('ged.dataRoom.spacesView.emptyNone')}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            {normalizedQuery
              ? t('ged.dataRoom.spacesView.emptyHintFilter', { query: globalSearch })
              : t('ged.dataRoom.spacesView.emptyHint')}
          </p>
          <Button
            onClick={onAddSpace}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('ged.dataRoom.spacesView.createSpace')}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
