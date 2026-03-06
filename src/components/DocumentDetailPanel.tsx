import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Download, 
  Share2, 
  Archive, 
  Copy, 
  Edit,
  Eye,
  Users,
  Shield,
  Activity,
  Calendar,
  Tag,
  Droplet,
  Lock,
  Unlock,
  Printer,
  Clock,
  TrendingUp,
  Building2,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserPlus,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Document } from '../utils/documentMockData';
import { calculateTargetingScope, downloadTargetingScopeCSV } from './TargetingScopeBadge';
import { generateDocumentAuditTrail, DocumentAuditEvent } from '../utils/documentAuditGenerator';
import { toast } from 'sonner';

interface DocumentDetailPanelProps {
  document: Document;
  onClose: () => void;
  defaultTab?: string;
}

export function DocumentDetailPanel({ document, onClose, defaultTab = 'details' }: DocumentDetailPanelProps) {
  // Calculer le scope de ciblage
  const targetingScope = calculateTargetingScope(document);
  
  // Générer l'audit trail pour ce document
  const auditEvents = useMemo(() => generateDocumentAuditTrail(document), [document.id]);
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'word': return '📝';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      default: return '📁';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'draft': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const handleDownload = () => {
    toast.success('Téléchargement démarré', {
      description: `${document.name} est en cours de téléchargement`
    });
  };

  const handleShare = () => {
    toast.info('Partage', {
      description: 'Fonctionnalité de partage à venir'
    });
  };

  const handleArchive = () => {
    toast.success('Document archivé', {
      description: `${document.name} a été archivé`
    });
  };

  const handleDuplicate = () => {
    toast.success('Document dupliqué', {
      description: 'Une copie du document a été créée'
    });
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="w-[600px] bg-white border-l border-gray-200 shadow-2xl flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-12 h-12 bg-gradient-to-br from-[#0066FF] to-[#00C2FF] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            >
              <FileText className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{document.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                  {getStatusLabel(document.status)}
                </Badge>
                {document.isNew && (
                  <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Nouveau
                  </Badge>
                )}
                {document.access.watermark && (
                  <Badge className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                    <Droplet className="w-3 h-3" />
                    Watermark
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownload}
            size="sm"
            className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg transition-all duration-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button onClick={handleShare} size="sm" variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button onClick={handleDuplicate} size="sm" variant="outline">
            <Copy className="w-4 h-4" />
          </Button>
          <Button onClick={handleArchive} size="sm" variant="outline">
            <Archive className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b-0">
              <TabsTrigger value="details" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#0066FF] data-[state=active]:bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Détails
              </TabsTrigger>
              <TabsTrigger value="targeting" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#0066FF] data-[state=active]:bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                Accès
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#0066FF] data-[state=active]:bg-transparent">
                <Activity className="w-4 h-4 mr-2" />
                Activité
              </TabsTrigger>
              <TabsTrigger value="audit" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#0066FF] data-[state=active]:bg-transparent">
                <History className="w-4 h-4 mr-2" />
                Piste d'audit
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Details Tab */}
          <TabsContent value="details" className="p-6 space-y-6">
            {/* File Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0066FF]" />
                Informations du fichier
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Format</label>
                  <p className="text-sm text-gray-900 font-medium mt-1">{document.format || 'Folder'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Taille</label>
                  <p className="text-sm text-gray-900 font-medium mt-1">{document.size || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Version</label>
                  <p className="text-sm text-gray-900 font-medium mt-1">v{document.version}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Chemin</label>
                  <p className="text-sm text-gray-600 truncate mt-1" title={document.path}>{document.path}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0066FF]" />
                Métadonnées
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Ajouté par</label>
                  <p className="text-sm text-gray-900 mt-1">{document.uploadedBy}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Date d'ajout</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(document.uploadedAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Dernière modification</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(document.updatedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#0066FF]" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {document.description && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{document.description}</p>
                </div>
              </>
            )}

            {/* Stats */}
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200"
              >
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">Vues</span>
                </div>
                <p className="text-2xl font-semibold text-blue-900">{document.views}</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200"
              >
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Download className="w-4 h-4" />
                  <span className="text-xs font-medium">Téléchargements</span>
                </div>
                <p className="text-2xl font-semibold text-emerald-900">{document.downloads}</p>
              </motion.div>
            </div>
          </TabsContent>

          {/* Targeting Tab - Renommé "Accès" */}
          <TabsContent value="targeting" className="p-6 space-y-6">
            {/* Scope Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#0066FF]" />
                    Scope de Ciblage
                  </h3>
                  <p className="text-xs text-gray-600">
                    Ce document sera visible par les investisseurs suivants
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    downloadTargetingScopeCSV(document, targetingScope);
                    toast.success('Liste exportée', {
                      description: `${targetingScope.investorCount} LPs et ${targetingScope.contactCount} contacts exportés`
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-blue-700 rounded-lg text-xs border border-blue-300 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="font-medium">Export CSV</span>
                </motion.button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-medium">Limited Partners</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{targetingScope.investorCount}</p>
                  <p className="text-xs text-gray-600 mt-1">investisseur{targetingScope.investorCount > 1 ? 's' : ''} concerné{targetingScope.investorCount > 1 ? 's' : ''}</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg p-4 border border-indigo-200"
                >
                  <div className="flex items-center gap-2 text-indigo-700 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-medium">Contacts</span>
                  </div>
                  <p className="text-3xl font-bold text-indigo-900">{targetingScope.contactCount}</p>
                  <p className="text-xs text-gray-600 mt-1">contact{targetingScope.contactCount > 1 ? 's' : ''} concerné{targetingScope.contactCount > 1 ? 's' : ''}</p>
                </motion.div>
              </div>
            </div>
            
            {/* Type de ciblage */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Type de ciblage</h3>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {document.target.type === 'all' 
                    ? 'Tous les investisseurs' 
                    : document.target.type === 'investor' 
                    ? 'Investisseurs spécifiques'
                    : document.target.type === 'subscription'
                    ? 'Souscriptions spécifiques'
                    : document.target.type === 'segment'
                    ? 'Segments spécifiques'
                    : document.target.type}
                </p>
              </div>
            </div>

            {/* Restrictions héritées */}
            {(document.metadata?.fund || (document.metadata?.segments && document.metadata.segments.length > 0)) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    Restrictions héritées
                  </h3>
                  <div className="space-y-2">
                    {document.metadata?.fund && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-lg border border-amber-200">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="text-xs text-amber-600 font-medium">Fonds restreint</p>
                          <p className="text-sm text-amber-900 font-semibold">{document.metadata.fund}</p>
                        </div>
                      </div>
                    )}
                    {document.metadata?.segments && document.metadata.segments.length > 0 && (
                      <div className="space-y-2">
                        {document.metadata.segments.map((segment, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-purple-100/30 rounded-lg border border-purple-200">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="text-xs text-purple-600 font-medium">Segment restreint</p>
                              <p className="text-sm text-purple-900 font-semibold">{segment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {document.target.segments && document.target.segments.length > 0 && !document.metadata?.segments && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Segments ciblés</h3>
                  <div className="space-y-2">
                    {document.target.segments.map((segment, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-purple-100/30 rounded-lg border border-purple-200">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-900 font-medium">{segment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Note: La section "Investisseurs spécifiques" est désormais intégrée dans "Investisseurs concernés" ci-dessous */}

            {document.target.subscriptions && document.target.subscriptions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Souscriptions ciblées ({document.target.subscriptions.length})
                    </h3>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                      Ciblage spécifique
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {document.target.subscriptions.map((sub, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/30 rounded-lg border border-emerald-200">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-emerald-900">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {/* Liste complète des investisseurs concernés */}
            {targetingScope.investors.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {document.target.type === 'investor' && document.target.investors && document.target.investors.length > 0 
                        ? `Investisseur${document.target.investors.length > 1 ? 's' : ''} ciblé${document.target.investors.length > 1 ? 's' : ''} (${targetingScope.investorCount})`
                        : `Investisseurs concernés (${targetingScope.investorCount})`
                      }
                    </h3>
                    {document.target.type === 'investor' && document.target.investors && document.target.investors.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        Ciblage spécifique
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                    {targetingScope.investors.map((investor) => (
                      <motion.div 
                        key={investor.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-sm text-gray-900">{investor.name}</div>
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">
                                {investor.segment}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">{investor.email}</div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs px-2 py-1 flex-shrink-0">
                            {targetingScope.fundLabel || investor.fund}
                          </Badge>
                        </div>
                        
                        {/* Contacts */}
                        {investor.contacts.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-2">
                              {investor.contacts.length} Contact{investor.contacts.length > 1 ? 's' : ''}
                            </div>
                            <div className="space-y-2">
                              {investor.contacts.map((contact) => (
                                <div key={contact.id} className="flex items-center gap-2 text-xs bg-white rounded-md p-2 border border-gray-100">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-semibold text-blue-700">
                                      {contact.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900">{contact.name}</div>
                                    <div className="text-gray-500">{contact.role}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="p-6">
            {document.activities && document.activities.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0066FF]" />
                  Historique d'activité
                </h3>
                <div className="space-y-3">
                  {document.activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'upload' ? 'bg-blue-100' :
                        activity.type === 'download' ? 'bg-emerald-100' :
                        activity.type === 'view' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.type === 'upload' && <FileText className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'download' && <Download className="w-4 h-4 text-emerald-600" />}
                        {activity.type === 'view' && <Eye className="w-4 h-4 text-purple-600" />}
                        {activity.type === 'edit' && <Edit className="w-4 h-4 text-amber-600" />}
                        {activity.type === 'share' && <Share2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">{activity.user}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {activity.details || activity.type}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucune activité enregistrée</p>
              </div>
            )}
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-[#0066FF]" />
                    Historique complet des modifications
                  </h3>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {auditEvents.length} événement{auditEvents.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                {auditEvents.length > 0 ? (
                  <div className="space-y-3">
                    {auditEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                      >
                        {/* Timeline Dot */}
                        <div className="absolute left-[-9px] top-0">
                          <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            event.type === 'upload' ? 'bg-blue-500' :
                            event.type === 'validation' ? 'bg-green-500' :
                            event.type === 'status_change' ? 'bg-purple-500' :
                            event.type === 'access_change' ? 'bg-orange-500' :
                            event.type === 'targeting_change' ? 'bg-indigo-500' :
                            event.type === 'version_update' ? 'bg-cyan-500' :
                            event.type === 'download' ? 'bg-emerald-500' :
                            event.type === 'share' ? 'bg-pink-500' :
                            event.type === 'comment' ? 'bg-amber-500' :
                            'bg-gray-400'
                          }`} />
                        </div>

                        {/* Event Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Avatar */}
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-white text-xs font-semibold">{event.user.avatar}</span>
                              </div>

                              {/* Event Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-gray-900">{event.user.name}</span>
                                  <Badge className={`text-[10px] px-1.5 py-0 ${
                                    event.type === 'upload' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    event.type === 'validation' ? 'bg-green-100 text-green-700 border-green-200' :
                                    event.type === 'status_change' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                    event.type === 'access_change' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                    event.type === 'targeting_change' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                    event.type === 'version_update' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                                    event.type === 'download' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    event.type === 'share' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                                    event.type === 'comment' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                    'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}>
                                    {event.type === 'upload' ? 'Upload' :
                                    event.type === 'validation' ? 'Validation' :
                                    event.type === 'status_change' ? 'Statut' :
                                    event.type === 'access_change' ? 'Accès' :
                                    event.type === 'targeting_change' ? 'Ciblage' :
                                    event.type === 'version_update' ? 'Version' :
                                    event.type === 'download' ? 'Téléchargement' :
                                    event.type === 'share' ? 'Partage' :
                                    event.type === 'comment' ? 'Commentaire' :
                                    event.type === 'metadata_change' ? 'Métadonnées' :
                                    event.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{event.action}</p>
                              </div>
                            </div>

                            {/* Timestamp */}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(event.timestamp).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {/* Details */}
                          {event.details && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              {event.details.description && (
                                <p className="text-xs text-gray-700 mb-2">{event.details.description}</p>
                              )}
                              {event.details.field && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500 font-medium">Champ :</span>
                                  <span className="text-gray-900 font-semibold">{event.details.field}</span>
                                </div>
                              )}
                              {event.details.before && event.details.after && (
                                <div className="flex items-center gap-2 mt-1.5 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-500">Avant :</span>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                                      {typeof event.details.before === 'object' ? JSON.stringify(event.details.before) : event.details.before}
                                    </Badge>
                                  </div>
                                  <span className="text-gray-400">→</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-500">Après :</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                                      {typeof event.details.after === 'object' ? JSON.stringify(event.details.after) : event.details.after}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Comment */}
                          {event.comment && (
                            <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-amber-900 italic">"{event.comment}"</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Aucun événement enregistré</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
