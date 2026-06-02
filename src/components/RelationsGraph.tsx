import * as React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  ChevronRight,
  Expand,
  Globe,
  Landmark,
  MapPin,
  Search,
  Shrink,
  TrendingUp,
  User,
  Users,
  X,
  Calendar,
  ShieldAlert,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import { useTranslation } from '../utils/languageContext';

import {
  type GraphEntity,
  type GraphRelation,
  type EntityType,
  type RelationType,
  RELATION_LABELS,
  ENTITY_TYPE_LABELS,
  getRelationsForEntity,
  expandEntity,
  getEntityById,
  DEFAULT_ROOT_ENTITY_ID,
  getFullGraph,
} from '../utils/relationsGraphMock';

const ENTITY_COLORS: Record<EntityType, { bg: string; border: string; icon: string }> = {
  person: { bg: 'bg-violet-50', border: 'border-violet-400', icon: 'text-violet-600' },
  company: { bg: 'bg-blue-50', border: 'border-blue-400', icon: 'text-blue-600' },
  holding: { bg: 'bg-blue-50', border: 'border-blue-600', icon: 'text-blue-700' },
  fund: { bg: 'bg-emerald-50', border: 'border-emerald-400', icon: 'text-emerald-600' },
};

const ENTITY_ICONS: Record<EntityType, React.ElementType> = {
  person: User,
  company: Building2,
  holding: Landmark,
  fund: TrendingUp,
};

const RISK_COLORS: Record<string, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
};

const EDGE_COLORS: Record<string, string> = {
  president: '#7c3aed',
  directeur_general: '#7c3aed',
  gerant: '#7c3aed',
  administrateur: '#8b5cf6',
  ubo_direct: '#2563eb',
  ubo_indirect: '#3b82f6',
  actionnaire: '#0891b2',
  filiale: '#0891b2',
  commissaire_aux_comptes: '#6b7280',
  conseil: '#6b7280',
};

interface EntityNodeData {
  entity: GraphEntity;
  isRoot: boolean;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onNavigate: (id: string) => void;
  [key: string]: unknown;
}

function EntityNode({ data }: NodeProps<Node<EntityNodeData>>) {
  const { entity, isRoot, isExpanded, onExpand, onSelect, onNavigate } = data;
  const { t } = useTranslation();
  const colors = ENTITY_COLORS[entity.type];
  const Icon = ENTITY_ICONS[entity.type];

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-3 !h-3" />
      <div
        className={cn(
          'group relative rounded-xl border-2 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer',
          colors.border,
          isRoot && 'ring-2 ring-offset-2 ring-blue-500',
        )}
        style={{ minWidth: 180, maxWidth: 220 }}
        onClick={() => onSelect(entity.id)}
        onDoubleClick={() => onNavigate(entity.id)}
      >
        <div className="flex items-start gap-2.5 p-3">
          <div
            className={cn(
              'flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full',
              colors.bg,
            )}
          >
            <Icon className={cn('w-4.5 h-4.5', colors.icon)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold leading-tight truncate text-foreground">
              {entity.name}
            </p>
            {entity.subtitle && (
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {entity.subtitle}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                {t(`compliance.relations.entityTypes.${entity.type}`)}
              </Badge>
              {entity.riskLevel && (
                <span
                  className={cn('inline-block w-2 h-2 rounded-full', RISK_COLORS[entity.riskLevel])}
                  title={t(`compliance.relations.risk.${entity.riskLevel}`)}
                />
              )}
            </div>
          </div>
        </div>
        {!isExpanded && (
          <button
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-border rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(entity.id);
            }}
            title={t('compliance.relations.expand')}
          >
            <Expand className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </>
  );
}

const nodeTypes = { entity: EntityNode };

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB',
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120, marginx: 40, marginy: 40 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 200, height: 80 });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function buildFlowElements(
  graphEntities: GraphEntity[],
  graphRelations: GraphRelation[],
  rootId: string,
  expandedIds: Set<string>,
  onExpand: (id: string) => void,
  onSelect: (id: string) => void,
  onNavigate: (id: string) => void,
  language: string,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = graphEntities.map((entity) => ({
    id: entity.id,
    type: 'entity',
    position: { x: 0, y: 0 },
    data: {
      entity,
      isRoot: entity.id === rootId,
      isExpanded: expandedIds.has(entity.id),
      onExpand,
      onSelect,
      onNavigate,
    },
  }));

  const edges: Edge[] = graphRelations.map((rel) => {
    const labelObj = RELATION_LABELS[rel.type];
    const label = language === 'fr' ? labelObj.fr : labelObj.en;
    const ownershipSuffix = rel.ownership ? ` (${rel.ownership}%)` : '';
    return {
      id: rel.id,
      source: rel.sourceId,
      target: rel.targetId,
      label: `${label}${ownershipSuffix}`,
      type: 'default',
      animated: rel.type === 'ubo_direct' || rel.type === 'ubo_indirect',
      style: { stroke: EDGE_COLORS[rel.type] || '#94a3b8', strokeWidth: 1.5 },
      labelStyle: { fontSize: 10, fontWeight: 500, fill: '#475569' },
      labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: EDGE_COLORS[rel.type] || '#94a3b8',
      },
    };
  });

  return getLayoutedElements(nodes, edges);
}

interface DetailPanelProps {
  entity: GraphEntity;
  relations: GraphRelation[];
  allEntities: GraphEntity[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}

function DetailPanel({ entity, relations, allEntities, onClose, onNavigate }: DetailPanelProps) {
  const { t, lang } = useTranslation();
  const colors = ENTITY_COLORS[entity.type];
  const Icon = ENTITY_ICONS[entity.type];

  const entityRelations = relations.filter(
    (r) => r.sourceId === entity.id || r.targetId === entity.id,
  );

  const groupedRelations = entityRelations.reduce<
    Record<string, { relation: GraphRelation; other: GraphEntity; direction: 'from' | 'to' }[]>
  >((acc, r) => {
    const isSource = r.sourceId === entity.id;
    const otherId = isSource ? r.targetId : r.sourceId;
    const other = allEntities.find((e) => e.id === otherId);
    if (!other) return acc;
    const key = r.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ relation: r, other, direction: isSource ? 'to' : 'from' });
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 w-[340px] bg-white border-l shadow-xl z-50 overflow-y-auto"
    >
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full',
                colors.bg,
              )}
            >
              <Icon className={cn('w-5 h-5', colors.icon)} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{entity.name}</h3>
              <p className="text-xs text-muted-foreground">
                {t(`compliance.relations.entityTypes.${entity.type}`)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {(entity.siren || entity.address || entity.capital || entity.revenue || entity.birthYear || entity.nationality) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('compliance.relations.details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entity.siren && (
                <div className="flex items-center gap-2 text-xs">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">SIREN</span>
                  <span className="ml-auto font-medium">{entity.siren}</span>
                </div>
              )}
              {entity.address && (
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{t('compliance.relations.address')}</span>
                  <span className="ml-auto font-medium text-right max-w-[160px]">{entity.address}</span>
                </div>
              )}
              {entity.capital && (
                <div className="flex items-center gap-2 text-xs">
                  <Landmark className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('compliance.relations.capital')}</span>
                  <span className="ml-auto font-medium">{entity.capital}</span>
                </div>
              )}
              {entity.revenue && (
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('compliance.relations.revenue')}</span>
                  <span className="ml-auto font-medium">{entity.revenue}</span>
                </div>
              )}
              {entity.incorporationDate && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('compliance.relations.incorporationDate')}</span>
                  <span className="ml-auto font-medium">{entity.incorporationDate}</span>
                </div>
              )}
              {entity.birthYear && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('compliance.relations.birthYear')}</span>
                  <span className="ml-auto font-medium">{entity.birthYear}</span>
                </div>
              )}
              {entity.nationality && (
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('compliance.relations.nationality')}</span>
                  <span className="ml-auto font-medium">{entity.nationality}</span>
                </div>
              )}
              {entity.riskLevel && (
                <div className="flex items-center gap-2 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('compliance.relations.riskLevel')}</span>
                  <span className="ml-auto">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        entity.riskLevel === 'low' && 'border-emerald-300 text-emerald-700 bg-emerald-50',
                        entity.riskLevel === 'medium' && 'border-amber-300 text-amber-700 bg-amber-50',
                        entity.riskLevel === 'high' && 'border-red-300 text-red-700 bg-red-50',
                      )}
                    >
                      {t(`compliance.relations.risk.${entity.riskLevel}`)}
                    </Badge>
                  </span>
                </div>
              )}
              {entity.status && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{t('compliance.relations.status')}</span>
                  <span className="ml-auto">
                    <Badge variant="outline" className="text-[10px]">
                      {t(`compliance.relations.statuses.${entity.status}`)}
                    </Badge>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('compliance.relations.relationships')} ({entityRelations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(groupedRelations).map(([relType, items]) => {
              const label = lang === 'fr'
                ? RELATION_LABELS[relType as RelationType].fr
                : RELATION_LABELS[relType as RelationType].en;
              return (
                <div key={relType}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {label}
                  </p>
                  {items.map(({ relation, other, direction }) => {
                    const OtherIcon = ENTITY_ICONS[other.type];
                    const otherColors = ENTITY_COLORS[other.type];
                    return (
                      <button
                        key={relation.id}
                        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        onClick={() => onNavigate(other.id)}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center w-7 h-7 rounded-full',
                            otherColors.bg,
                          )}
                        >
                          <OtherIcon className={cn('w-3.5 h-3.5', otherColors.icon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{other.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {direction === 'to'
                              ? t('compliance.relations.directionTo')
                              : t('compliance.relations.directionFrom')}
                            {relation.ownership ? ` · ${relation.ownership}%` : ''}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => onNavigate(entity.id)}
        >
          <Search className="w-4 h-4 mr-2" />
          {t('compliance.relations.exploreFrom')}
        </Button>
      </div>
    </motion.div>
  );
}

interface LegendItem {
  type: EntityType | RelationType;
  kind: 'entity' | 'relation';
}

const LEGEND_ENTITIES: EntityType[] = ['person', 'company', 'holding', 'fund'];
const LEGEND_RELATIONS: RelationType[] = [
  'president',
  'ubo_direct',
  'actionnaire',
  'commissaire_aux_comptes',
];

function Legend() {
  const { t, lang } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border shadow-sm">
      <button
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Users className="w-3.5 h-3.5" />
        {t('compliance.relations.legend')}
        <ChevronRight
          className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-90')}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <Separator />
          <div className="space-y-1.5">
            {LEGEND_ENTITIES.map((type) => {
              const colors = ENTITY_COLORS[type];
              const Icon = ENTITY_ICONS[type];
              return (
                <div key={type} className="flex items-center gap-2 text-[10px]">
                  <div
                    className={cn(
                      'flex items-center justify-center w-5 h-5 rounded-full',
                      colors.bg,
                    )}
                  >
                    <Icon className={cn('w-3 h-3', colors.icon)} />
                  </div>
                  <span>{t(`compliance.relations.entityTypes.${type}`)}</span>
                </div>
              );
            })}
          </div>
          <Separator />
          <div className="space-y-1.5">
            {LEGEND_RELATIONS.map((type) => (
              <div key={type} className="flex items-center gap-2 text-[10px]">
                <div
                  className="w-5 h-0.5 rounded-full"
                  style={{ backgroundColor: EDGE_COLORS[type] }}
                />
                <span>
                  {lang === 'fr' ? RELATION_LABELS[type].fr : RELATION_LABELS[type].en}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export interface RelationsGraphProps {
  rootEntityId?: string;
}

export function RelationsGraph({ rootEntityId }: RelationsGraphProps) {
  const { t, lang } = useTranslation();
  const [rootId, setRootId] = React.useState(rootEntityId || DEFAULT_ROOT_ENTITY_ID);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => new Set([rootId]));
  const [selectedEntityId, setSelectedEntityId] = React.useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = React.useState<string[]>([rootId]);
  const [graphData, setGraphData] = React.useState(() => getRelationsForEntity(rootId));
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const rebuildGraph = React.useCallback(
    (data: { entities: GraphEntity[]; relations: GraphRelation[] }, root: string, expanded: Set<string>) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = buildFlowElements(
        data.entities,
        data.relations,
        root,
        expanded,
        (id) => {
          setExpandedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          setGraphData((prev) => expandEntity(prev.entities, prev.relations, id));
        },
        (id) => setSelectedEntityId(id),
        (id) => handleNavigate(id),
        lang,
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    },
    [lang, setNodes, setEdges],
  );

  React.useEffect(() => {
    rebuildGraph(graphData, rootId, expandedIds);
  }, [graphData, rootId, expandedIds, rebuildGraph]);

  const handleNavigate = React.useCallback(
    (entityId: string) => {
      const newData = getRelationsForEntity(entityId);
      setRootId(entityId);
      setExpandedIds(new Set([entityId]));
      setSelectedEntityId(null);
      setGraphData(newData);
      setBreadcrumb((prev) => {
        const idx = prev.indexOf(entityId);
        if (idx >= 0) return prev.slice(0, idx + 1);
        return [...prev, entityId];
      });
    },
    [],
  );

  const handleShowAll = React.useCallback(() => {
    const full = getFullGraph();
    setGraphData(full);
    setExpandedIds(new Set(full.entities.map((e) => e.id)));
    setSelectedEntityId(null);
  }, []);

  const selectedEntity = selectedEntityId ? getEntityById(selectedEntityId) : null;

  const filteredEntities = searchQuery.trim()
    ? graphData.entities.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const toggleFullscreen = React.useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative bg-slate-50 rounded-xl border overflow-hidden', isFullscreen ? 'h-screen' : 'h-[600px]')}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-50"
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls
          showInteractive={false}
          className="!bg-white !border !shadow-sm !rounded-lg"
        />
        <MiniMap
          nodeColor={(node) => {
            const type = (node.data as EntityNodeData)?.entity?.type;
            if (type === 'person') return '#8b5cf6';
            if (type === 'company') return '#3b82f6';
            if (type === 'holding') return '#1d4ed8';
            if (type === 'fund') return '#059669';
            return '#94a3b8';
          }}
          maskColor="rgba(0,0,0,0.08)"
          className="!bg-white/90 !border !shadow-sm !rounded-lg"
          pannable
          zoomable
        />

        <Panel position="top-left" className="!m-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={t('compliance.relations.searchPlaceholder')}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="h-8 w-48 pl-8 text-xs bg-white"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white"
              onClick={handleShowAll}
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              {t('compliance.relations.showAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Shrink className="w-3.5 h-3.5" />
              ) : (
                <Expand className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>

          {searchQuery.trim() && filteredEntities.length > 0 && (
            <Card className="w-48 max-h-40 overflow-y-auto">
              <CardContent className="p-1">
                {filteredEntities.map((entity) => {
                  const Icon = ENTITY_ICONS[entity.type];
                  const colors = ENTITY_COLORS[entity.type];
                  return (
                    <button
                      key={entity.id}
                      className="flex items-center gap-2 w-full p-1.5 rounded hover:bg-muted/50 text-left"
                      onClick={() => {
                        handleNavigate(entity.id);
                        setSearchQuery('');
                      }}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center w-5 h-5 rounded-full',
                          colors.bg,
                        )}
                      >
                        <Icon className={cn('w-3 h-3', colors.icon)} />
                      </div>
                      <span className="text-xs truncate">{entity.name}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </Panel>

        <Panel position="top-right" className="!m-3">
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-lg border shadow-sm px-2 py-1.5 text-xs max-w-[400px] overflow-x-auto">
            {breadcrumb.map((id, idx) => {
              const entity = getEntityById(id);
              if (!entity) return null;
              return (
                <React.Fragment key={id}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                  <button
                    className={cn(
                      'px-1.5 py-0.5 rounded hover:bg-muted/50 truncate max-w-[120px] transition-colors',
                      idx === breadcrumb.length - 1
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground',
                    )}
                    onClick={() => handleNavigate(id)}
                  >
                    {entity.name}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </Panel>

        <Panel position="bottom-left" className="!m-3">
          <Legend />
        </Panel>

        <Panel position="bottom-right" className="!m-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg border shadow-sm px-3 py-1.5 text-[10px] text-muted-foreground">
            {t('compliance.relations.nodeCount', { count: String(graphData.entities.length) })}
            {' · '}
            {t('compliance.relations.edgeCount', { count: String(graphData.relations.length) })}
          </div>
        </Panel>
      </ReactFlow>

      <AnimatePresence>
        {selectedEntity && (
          <DetailPanel
            entity={selectedEntity}
            relations={graphData.relations}
            allEntities={graphData.entities}
            onClose={() => setSelectedEntityId(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
