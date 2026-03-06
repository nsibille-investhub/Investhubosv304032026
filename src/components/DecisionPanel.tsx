import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Calendar, ExternalLink, Bell, Clock, History, Download, FileDown, Link as LinkIcon, Eye, EyeOff, Check } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import { Alert } from '../utils/mockData';
import { AuditTrail } from './AuditTrail';
import { EntityLinks } from './EntityLinks';
import { AnalystSelector } from './AnalystSelector';
import { exportAuditTrailToCSV, exportEntityToPDF } from '../utils/exportUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

interface DecisionPanelProps {
  entity: any;
  onClose: () => void;
  onMonitoringChange?: (entityId: number, newState: boolean) => void;
  onAnalystChange?: (entityId: number, newAnalyst: string) => void;
}

export function DecisionPanel({ entity, onClose, onMonitoringChange, onAnalystChange }: DecisionPanelProps) {
  const alerts = entity?.details?.alerts || [];
  const auditTrail = entity?.details?.auditTrail || [];
  
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(
    alerts.length > 0 ? alerts[0] : null
  );
  const [currentDecision, setCurrentDecision] = useState<'unsure' | 'false_hit' | 'true_hit' | null>(
    alerts.length > 0 ? (alerts[0]?.decision || null) : null
  );
  const [currentComment, setCurrentComment] = useState(
    alerts.length > 0 ? (alerts[0]?.comment || '') : ''
  );
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);

  const handleExportAuditCSV = () => {
    exportAuditTrailToCSV(auditTrail, entity.name);
    toast.success('Audit trail exporté', {
      description: 'Le fichier CSV a été téléchargé',
    });
  };

  const handleExportEntityPDF = () => {
    exportEntityToPDF(entity);
    toast.success('Fiche entité exportée', {
      description: 'Le rapport HTML a été téléchargé',
    });
  };

  const handleAlertSelect = (alert: Alert) => {
    setSelectedAlert(alert);
    setCurrentDecision(alert.decision);
    setCurrentComment(alert.comment);
  };

  const handleDecisionChange = (decision: 'unsure' | 'false_hit' | 'true_hit') => {
    setCurrentDecision(decision);
    toast.success(`Décision changée`, {
      description: `${decision === 'unsure' ? 'Unsure' : decision === 'false_hit' ? 'Clear' : 'True Hit'} sélectionné`,
    });
  };

  const handleConfirm = () => {
    if (!currentDecision) {
      toast.error('Veuillez sélectionner une décision');
      return;
    }
    if (!currentComment.trim()) {
      toast.error('Le commentaire est obligatoire');
      return;
    }
    toast.success(`Décision confirmée`, {
      description: `${currentDecision === 'unsure' ? 'Unsure' : currentDecision === 'false_hit' ? 'Clear' : 'True Hit'} pour ${selectedAlert?.name}`,
    });
  };

  const getAlertIcon = (alert: Alert) => {
    if (!alert.decision) {
      return <Bell className="w-4 h-4 text-amber-600" />;
    }
    switch (alert.decision) {
      case 'true_hit':
        return <Bell className="w-4 h-4 text-red-600 font-bold" />;
      case 'false_hit':
        return <Bell className="w-4 h-4 text-gray-400" />;
      case 'unsure':
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAlertClassName = (alert: Alert) => {
    if (!alert.decision) {
      return '';
    }
    switch (alert.decision) {
      case 'true_hit':
        return '';
      case 'false_hit':
        return 'opacity-50 line-through';
      case 'unsure':
        return 'opacity-60';
    }
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="w-[58%] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex"
    >
      {/* Left sidebar - Related alerts */}
      <div className="w-64 border-r border-gray-200 bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              {alerts.length === 0 ? 'Aucun Match' : 'Matches'}
            </span>
            <Badge className={`px-2 py-0.5 rounded ${
              alerts.length === 0 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-gray-900 text-white'
            }`}>
              {alerts.length}
            </Badge>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Name"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900 transition-all"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1 h-7 px-3 bg-gray-900 hover:bg-gray-800"
            >
              Filter
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="p-2">
            {alerts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-semibold text-gray-900 mb-2">Aucun match détecté</p>
                <p className="text-sm text-gray-600 mb-3 max-w-[200px] mx-auto leading-relaxed">
                  Cette entité n'a généré aucun match lors du screening
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-700">Statut: Clear</span>
                </div>
              </motion.div>
            ) : (
              alerts.map((alert: Alert, idx: number) => (
                <motion.div
                  key={alert.id}
                  whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                  onClick={() => handleAlertSelect(alert)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
                    selectedAlert?.id === alert.id ? 'bg-gray-100 border border-gray-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert)}
                    </div>
                    <div className={`font-medium text-sm text-gray-900 truncate min-w-0 flex-1 ${getAlertClassName(alert)}`}>
                      {alert.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="text-xs text-gray-500 truncate">{alert.similarity}% similarity</div>
                    {alert.decision && (
                      <Badge
                        className={`text-xs px-1.5 py-0 flex-shrink-0 ${
                          alert.decision === 'true_hit'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : alert.decision === 'false_hit'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {alert.decision === 'true_hit' ? 'True' : alert.decision === 'false_hit' ? 'Clear' : 'Unsure'}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-white to-[#F8FAFC]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{entity.name}</h2>
                {selectedAlert && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-lg border border-orange-200"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs font-medium">{selectedAlert.similarity}%</span>
                  </motion.div>
                )}
                <Badge
                  className={`${
                    entity.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : entity.status === 'Clear'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : entity.status === 'True Hit'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  } border`}
                >
                  {entity.status}
                </Badge>
              </div>
              
              {/* Entity Links - Positioned directly under the name */}
              {entity.links && entity.links.length > 0 && (
                <div className="mb-3">
                  <EntityLinks links={entity.links} maxVisible={4} />
                </div>
              )}
              
              {/* Analyst Assignment & Monitoring */}
              <div className="space-y-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analyst</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  </div>
                  <AnalystSelector
                    currentAnalyst={entity.analyst}
                    onAnalystChange={(analystName) => {
                      if (onAnalystChange) {
                        onAnalystChange(entity.id, analystName);
                      }
                    }}
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm text-gray-600">Monitoring:</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={entity.monitoring}
                          onCheckedChange={(checked) => {
                            if (onMonitoringChange) {
                              onMonitoringChange(entity.id, checked);
                            }
                          }}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#0066FF] data-[state=checked]:to-[#00C2FF] transition-all duration-300"
                        />
                        <span className={`text-sm font-medium ${entity.monitoring ? 'text-blue-600' : 'text-gray-400'}`}>
                          {entity.monitoring ? 'Active' : 'Inactive'}
                        </span>
                        {entity.monitoring ? (
                          <Eye className="w-4 h-4 text-blue-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {entity.monitoring 
                        ? 'This entity is being actively monitored. Click to disable monitoring.'
                        : 'Monitoring is disabled. Click to enable continuous monitoring.'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Audit Trail Dialog Button */}
              <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 relative group"
                    title="View Audit Trail"
                  >
                    <History className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    {auditTrail?.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                        {auditTrail.length}
                      </span>
                    )}
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0 gap-0">
                  <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Audit Trail
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                      {entity.name} - Complete activity history
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <AuditTrail 
                      entityName={entity.name}
                      events={auditTrail}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Export Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportEntityPDF} className="cursor-pointer">
                    <FileDown className="w-4 h-4 mr-2" />
                    Export Entity Report (HTML)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportAuditCSV} className="cursor-pointer">
                    <Download className="w-4 h-4 mr-2" />
                    Export Audit Trail (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>

          {selectedAlert && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4" />
                <span>{selectedAlert.date}</span>
                {selectedAlert.analyst && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Analyst: {selectedAlert.analyst}</span>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Analysis
                </motion.button>
              </div>

              {/* Previous comment (if exists) */}
              {selectedAlert.decision && selectedAlert.comment && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                      Previous Decision
                    </Badge>
                    <span className="text-xs text-blue-600">
                      {selectedAlert.decision === 'true_hit' ? 'True Hit' : selectedAlert.decision === 'false_hit' ? 'Clear' : 'Unsure'}
                    </span>
                  </div>
                  <Textarea
                    value={currentComment}
                    onChange={(e) => setCurrentComment(e.target.value)}
                    className="min-h-[60px] resize-none bg-white border-blue-200 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end items-center mt-2">
                    <span className="text-xs text-gray-400">{currentComment.length} / 1,234</span>
                  </div>
                </div>
              )}

              {/* New comment section (if no previous decision) */}
              {!selectedAlert.decision && (
                <>
                  <Textarea
                    value={currentComment}
                    onChange={(e) => setCurrentComment(e.target.value)}
                    placeholder="Comment is mandatory for your decisions"
                    className="min-h-[80px] resize-none bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
                  />
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-gray-400">{currentComment.length} / 1,234</span>
                  </div>
                </>
              )}

              {/* Decision buttons - Compact & Elegant */}
              <div className="flex items-center gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDecisionChange('unsure')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-semibold border ${
                    currentDecision === 'unsure'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${currentDecision === 'unsure' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                  <span>Unsure</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDecisionChange('false_hit')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-semibold border ${
                    currentDecision === 'false_hit'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${currentDecision === 'false_hit' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span>False Hit</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDecisionChange('true_hit')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-semibold border ${
                    currentDecision === 'true_hit'
                      ? 'bg-red-50 text-red-700 border-red-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${currentDecision === 'true_hit' ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <span>True Hit</span>
                </motion.button>
                
                <div className="flex-1" />
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="px-5 py-1.5 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-lg hover:shadow-lg transition-all duration-200 text-xs font-semibold shadow-md"
                >
                  Confirm
                </motion.button>
              </div>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {!selectedAlert && alerts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-16"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-12 h-12 text-emerald-600" />
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-gray-900 mb-3"
                  >
                    Aucun Match Détecté
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-gray-600 max-w-md leading-relaxed mb-6"
                  >
                    Cette entité a été screenée et aucune correspondance n'a été trouvée dans les listes de sanctions ou de surveillance. L'entité est considérée comme conforme.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-3 w-full max-w-sm"
                  >
                    <div className="flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-semibold text-emerald-700">Statut: Clear</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-gray-500 mb-1">Matches détectés</div>
                        <div className="font-bold text-gray-900">0</div>
                      </div>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-gray-500 mb-1">Décisions</div>
                        <div className="font-bold text-gray-900">0</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : selectedAlert ? (
                <>
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                    className="w-full flex items-center gap-2 p-3 rounded-lg transition-colors mb-4"
                  >
                    <span className="text-sm font-medium text-gray-900">Details</span>
                  </motion.button>

                  <div className="space-y-6">
                    {/* DETAILED INFORMATION - Enriched details if available */}
                    {selectedAlert.enrichedDetails?.fullDescription && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 }}
                          className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                              Alert Details
                            </h4>
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed font-mono bg-white/50 rounded-lg p-3 border border-amber-100">
                            {selectedAlert.enrichedDetails.fullDescription}
                          </div>
                        </motion.div>
                        
                        <Separator />
                      </>
                    )}
                    
                    {/* KEYWORDS */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">
                        KEYWORDS
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.details.keywords.map((keyword, idx) => (
                          <Badge
                            key={idx}
                            className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>

                    <Separator />

                    {/* IDENTIFICATION */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        IDENTIFICATION
                      </h4>
                      <div className="space-y-3">
                        {selectedAlert.details.identification.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="text-sm text-gray-500 min-w-[200px]">{item.label}:</span>
                            <span className="text-sm text-gray-900 font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <Separator />

                    {/* External Links */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        SOURCES
                      </h4>
                      <div className="space-y-2">
                        {selectedAlert.details.sources.map((source, idx) => (
                          <motion.a
                            key={idx}
                            whileHover={{ x: 4 }}
                            href={source.url}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 group"
                          >
                            <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="group-hover:underline">{source.label}</span>
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
}