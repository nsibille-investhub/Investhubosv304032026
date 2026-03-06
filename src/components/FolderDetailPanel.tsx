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
  Download
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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

interface FolderDetailPanelProps {
  folder: Document;
  onClose: () => void;
  allFolders: Document[];
}

export function FolderDetailPanel({ folder, onClose, allFolders }: FolderDetailPanelProps) {
  // Calculer le scope de ciblage
  const targetingScope = calculateTargetingScope(folder);
  
  const [formData, setFormData] = useState({
    name: folder.name,
    parentId: folder.parentId || 'root',
    targetType: folder.target?.type || 'all',
    segment: folder.target?.segments?.[0] || '',
    fund: folder.metadata?.fund || '',
    disclaimer: folder.metadata?.disclaimer || 'none'
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Dossier mis à jour', {
      description: `Les modifications de "${formData.name}" ont été enregistrées`
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
                <h3 className="font-semibold text-gray-900">Éditer le dossier</h3>
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
              <p className="text-sm text-blue-700">Vous avez des modifications non enregistrées</p>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-600" />
              Informations générales
            </h4>

            {/* Nom */}
            <div>
              <Label htmlFor="folder-name">Nom</Label>
              <Input
                id="folder-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nom du dossier..."
                className="mt-1.5"
              />
            </div>

            {/* Parent */}
            <div>
              <Label htmlFor="folder-parent">Parent</Label>
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
                Chemin : <span className="font-medium text-gray-700">{buildFolderPath(formData.parentId)}</span>
              </p>
            </div>
          </div>

          {/* Ciblage */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Ciblage et accès
              </h4>
            </div>
            
            {/* Scope Summary */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="text-xs font-semibold text-gray-900 mb-0.5">Scope Actuel</h5>
                  <p className="text-[10px] text-gray-600">Investisseurs qui verront ce dossier</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    downloadTargetingScopeCSV(folder, targetingScope);
                    toast.success('Liste exportée', {
                      description: `${targetingScope.investorCount} LPs et ${targetingScope.contactCount} contacts exportés`
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
                    <span className="text-[10px] font-medium">LPs</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{targetingScope.investorCount}</p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-indigo-200">
                  <div className="flex items-center gap-1.5 text-indigo-700 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-medium">Contacts</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-900">{targetingScope.contactCount}</p>
                </div>
              </div>
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="folder-type">Type</Label>
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
                      Tous
                    </div>
                  </SelectItem>
                  <SelectItem value="investor">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Investisseur
                    </div>
                  </SelectItem>
                  <SelectItem value="distributor">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Distributeur
                    </div>
                  </SelectItem>
                  <SelectItem value="subscription">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Souscription
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Segment d'investisseur */}
            <div>
              <Label htmlFor="folder-segment">Segment d'investisseur</Label>
              <Input
                id="folder-segment"
                value={formData.segment}
                onChange={(e) => handleChange('segment', e.target.value)}
                placeholder="Choisissez un segment d'investisseur"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Exemples : Investisseurs Qualifiés, LP Premium, Family Offices
              </p>
            </div>
          </div>

          {/* Configuration avancée */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              Configuration
            </h4>

            {/* Fonds */}
            <div>
              <Label htmlFor="folder-fund">Fonds</Label>
              <Select 
                value={formData.fund} 
                onValueChange={(value) => handleChange('fund', value)}
              >
                <SelectTrigger id="folder-fund" className="mt-1.5">
                  <SelectValue placeholder="Sélectionner un fonds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous fonds</SelectItem>
                  <SelectItem value="pere1">PERE 1</SelectItem>
                  <SelectItem value="pere2">PERE 2</SelectItem>
                  <SelectItem value="fund-a">Fonds A</SelectItem>
                  <SelectItem value="fund-b">Fonds B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Disclaimer */}
            <div>
              <Label htmlFor="folder-disclaimer">Disclaimer</Label>
              <Select 
                value={formData.disclaimer} 
                onValueChange={(value) => handleChange('disclaimer', value)}
              >
                <SelectTrigger id="folder-disclaimer" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="confidential">Confidentiel</SelectItem>
                  <SelectItem value="restricted">Restreint</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metadata Info */}
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Créé par</span>
                <p className="font-medium text-gray-900">{folder.uploadedBy}</p>
              </div>
              <div>
                <span className="text-gray-500">Date de création</span>
                <p className="font-medium text-gray-900">
                  {new Date(folder.uploadedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Dernière modification</span>
                <p className="font-medium text-gray-900">
                  {new Date(folder.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Version</span>
                <p className="font-medium text-gray-900">v{folder.version}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
