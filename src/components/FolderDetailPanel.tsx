import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Folder,
  Save,
  Users,
  TrendingUp,
  Building2,
  AlertCircle,
  ChevronDown,
  Download,
  Droplet,
  ShieldAlert
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from './ui/badge';
import { Document } from '../utils/documentMockData';
import { calculateTargetingScope, downloadTargetingScopeCSV } from './TargetingScopeBadge';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';

interface FolderDetailPanelProps {
  folder: Document;
  onClose: () => void;
  allFolders: Document[];
}

export function FolderDetailPanel({ folder, onClose, allFolders }: FolderDetailPanelProps) {
  const { t } = useTranslation();
  const targetingScope = calculateTargetingScope(folder);
  
  const initialDisclaimer = folder.metadata?.disclaimer || 'none';
  const initialWatermark = (folder.metadata as { watermark?: string })?.watermark || 'none';

  const [formData, setFormData] = useState({
    name: folder.name,
    parentId: folder.parentId || 'root',
    targetType: folder.target?.type || 'all',
    segment: folder.target?.segments?.[0] || '',
    fund: folder.metadata?.fund || '',
    disclaimerEnabled: initialDisclaimer !== 'none',
    disclaimer: initialDisclaimer === 'none' ? 'standard' : initialDisclaimer,
    watermarkEnabled: initialWatermark !== 'none',
    watermark: initialWatermark === 'none' ? 'confidential' : initialWatermark,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success(t('ged.folderDetail.folderUpdatedToast'), {
      description: t('ged.folderDetail.folderUpdatedToastDesc', { name: formData.name })
    });
    setHasChanges(false);
  };

  // Build folder hierarchy for parent selection
  const buildFolderPath = (folderId: string): string => {
    const folderItem = allFolders.find(f => f.id === folderId);
    if (!folderItem || folderItem.id === 'root') return '/';
    
    const parent = allFolders.find(f => f.id === folderItem.parentId);
    if (!parent || parent.id === 'root') return `/${folderItem.name}`;
    
    return `${buildFolderPath(parent.id)}/${folderItem.name}`;
  };

  const getFolderLevel = (folderId: string): number => {
    const folderItem = allFolders.find(f => f.id === folderId);
    if (!folderItem || folderItem.id === 'root') return 0;
    
    return 1 + getFolderLevel(folderItem.parentId || 'root');
  };

  // Flatten all folders for selection (excluding current folder and its children)
  const getSelectableFolders = (): Document[] => {
    const isChildOf = (folderId: string, potentialParentId: string): boolean => {
      if (folderId === potentialParentId) return true;
      const folderItem = allFolders.find(f => f.id === folderId);
      if (!folderItem || !folderItem.parentId || folderItem.parentId === 'root') return false;
      return isChildOf(folderItem.parentId, potentialParentId);
    };

    return allFolders.filter(f => 
      f.type === 'folder' && 
      f.id !== folder.id && 
      !isChildOf(f.id, folder.id)
    );
  };

  const selectableFolders = getSelectableFolders();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-[40%] min-w-[450px] max-w-[600px] bg-white border-l border-gray-200 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('ged.folderDetail.title')}</h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {folder.path}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-amber-200/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">{t('ged.folderDetail.unsavedChanges')}</p>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-600" />
              {t('ged.folderDetail.generalInfo')}
            </h4>

            {/* Nom */}
            <div>
              <Label htmlFor="folder-name">{t('ged.folderDetail.nameLabel')}</Label>
              <Input
                id="folder-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('ged.folderDetail.namePlaceholder')}
                className="mt-1.5"
              />
            </div>

            {/* Parent */}
            <div>
              <Label htmlFor="folder-parent">{t('ged.folderDetail.parentLabel')}</Label>
              <Select 
                value={formData.parentId} 
                onValueChange={(value) => handleChange('parentId', value)}
              >
                <SelectTrigger id="folder-parent" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectableFolders.map((f) => {
                    const level = getFolderLevel(f.id);
                    
                    return (
                      <SelectItem key={f.id} value={f.id}>
                        <div className="flex items-center gap-2">
                          {level > 0 && (
                            <span className="text-gray-400" style={{ marginLeft: `${level * 12}px` }}>
                              └─
                            </span>
                          )}
                          <Folder className={`w-4 h-4 ${f.id === 'root' ? 'text-blue-600' : 'text-amber-500'}`} />
                          <span className={f.id === 'root' ? 'text-blue-700 font-medium' : ''}>
                            {f.name}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1.5">
                {t('ged.folderDetail.pathPrefix')} <span className="font-medium text-gray-700">{buildFolderPath(formData.parentId)}</span>
              </p>
            </div>
          </div>

          {/* Ciblage */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {t('ged.folderDetail.targetingAccess')}
              </h4>
            </div>
            
            {/* Scope Summary */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="text-xs font-semibold text-gray-900 mb-0.5">{t('ged.folderDetail.currentScope')}</h5>
                  <p className="text-[10px] text-gray-600">{t('ged.folderDetail.currentScopeDesc')}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    downloadTargetingScopeCSV(folder, targetingScope);
                    toast.success(t('ged.folderDetail.listExported'), {
                      description: t('ged.folderDetail.listExportedDesc', { lps: targetingScope.investorCount, contacts: targetingScope.contactCount })
                    });
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-white hover:bg-gray-50 text-blue-700 rounded-md text-[10px] border border-blue-300 hover:border-blue-400 transition-all duration-200"
                >
                  <Download className="w-3 h-3" />
                  <span className="font-medium">CSV</span>
                </motion.button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{t('ged.folderDetail.lpsLabel')}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{targetingScope.investorCount}</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-indigo-200">
                  <div className="flex items-center gap-1.5 text-indigo-700 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{t('ged.folderDetail.contactsLabel')}</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-900">{targetingScope.contactCount}</p>
                </div>
              </div>
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="folder-type">{t('ged.folderDetail.typeLabel')}</Label>
              <Select
                value={formData.targetType}
                onValueChange={(value) => handleChange('targetType', value)}
              >
                <SelectTrigger id="folder-type" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      {t('ged.folderDetail.typeAll')}
                    </div>
                  </SelectItem>
                  <SelectItem value="investor">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      {t('ged.folderDetail.typeInvestor')}
                    </div>
                  </SelectItem>
                  <SelectItem value="distributor">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      {t('ged.folderDetail.typeDistributor')}
                    </div>
                  </SelectItem>
                  <SelectItem value="subscription">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {t('ged.folderDetail.typeSubscription')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Segment d'investisseur */}
            <div>
              <Label htmlFor="folder-segment">{t('ged.folderDetail.segmentLabel')}</Label>
              <Input
                id="folder-segment"
                value={formData.segment}
                onChange={(e) => handleChange('segment', e.target.value)}
                placeholder={t('ged.folderDetail.segmentPlaceholder')}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                {t('ged.folderDetail.segmentExamples')}
              </p>
            </div>
          </div>

          {/* Configuration avancée */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              {t('ged.folderDetail.configuration')}
            </h4>

            {/* Fonds */}
            <div>
              <Label htmlFor="folder-fund">{t('ged.folderDetail.fundLabel')}</Label>
              <Select
                value={formData.fund}
                onValueChange={(value) => handleChange('fund', value)}
              >
                <SelectTrigger id="folder-fund" className="mt-1.5">
                  <SelectValue placeholder={t('ged.folderDetail.pickFund')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('ged.folderDetail.fundAll')}</SelectItem>
                  <SelectItem value="pere1">PERE 1</SelectItem>
                  <SelectItem value="pere2">PERE 2</SelectItem>
                  <SelectItem value="fund-a">Fonds A</SelectItem>
                  <SelectItem value="fund-b">Fonds B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Disclaimer */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="text-sm text-gray-900 font-medium">
                      {t('ged.folderDetail.disclaimerToggleLabel')}
                    </span>
                    <p className="text-xs text-gray-500">
                      {t('ged.folderDetail.disclaimerToggleDescription')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.disclaimerEnabled}
                  onCheckedChange={(checked) => handleChange('disclaimerEnabled', checked)}
                />
              </div>
              {formData.disclaimerEnabled && (
                <div>
                  <Label htmlFor="folder-disclaimer">{t('ged.folderDetail.disclaimerLabel')}</Label>
                  <Select
                    value={formData.disclaimer}
                    onValueChange={(value) => handleChange('disclaimer', value)}
                  >
                    <SelectTrigger id="folder-disclaimer" className="mt-1.5 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">{t('ged.folderDetail.disclaimerStandard')}</SelectItem>
                      <SelectItem value="confidential">{t('ged.folderDetail.disclaimerConfidential')}</SelectItem>
                      <SelectItem value="restricted">{t('ged.folderDetail.disclaimerRestricted')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Watermark */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-sm text-gray-900 font-medium">
                      {t('ged.folderDetail.watermarkToggleLabel')}
                    </span>
                    <p className="text-xs text-gray-500">
                      {t('ged.folderDetail.watermarkToggleDescription')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.watermarkEnabled}
                  onCheckedChange={(checked) => handleChange('watermarkEnabled', checked)}
                />
              </div>
              {formData.watermarkEnabled && (
                <div>
                  <Label htmlFor="folder-watermark">{t('ged.folderDetail.watermarkLabel')}</Label>
                  <Select
                    value={formData.watermark}
                    onValueChange={(value) => handleChange('watermark', value)}
                  >
                    <SelectTrigger id="folder-watermark" className="mt-1.5 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidential">{t('ged.folderDetail.watermarkConfidential')}</SelectItem>
                      <SelectItem value="internal">{t('ged.folderDetail.watermarkInternal')}</SelectItem>
                      <SelectItem value="draft">{t('ged.folderDetail.watermarkDraft')}</SelectItem>
                      <SelectItem value="personalized">{t('ged.folderDetail.watermarkPersonalized')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {t('ged.folderDetail.watermarkHelp')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Info */}
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{t('ged.folderDetail.createdBy')}</span>
                <p className="font-medium text-gray-900">{folder.uploadedBy}</p>
              </div>
              <div>
                <span className="text-gray-500">{t('ged.folderDetail.createdAt')}</span>
                <p className="font-medium text-gray-900">
                  {new Date(folder.uploadedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">{t('ged.folderDetail.lastUpdate')}</span>
                <p className="font-medium text-gray-900">
                  {new Date(folder.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">{t('ged.folderDetail.version')}</span>
                <p className="font-medium text-gray-900">v{folder.version}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            {t('ged.folderDetail.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('ged.folderDetail.save')}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
