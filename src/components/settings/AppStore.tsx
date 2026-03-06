import React, { useState } from 'react';
import { Search, Package, Check, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useAppStore } from '../../utils/appStoreContext';
import { toast } from 'sonner';

interface Module {
  id: string;
  name: string;
  description: string;
  category: 'module' | 'provider' | 'integration';
  status: 'active' | 'inactive';
  icon?: string;
  version?: string;
  lastUpdate?: string;
}

const mockModules: Module[] = [
  {
    id: '1',
    name: 'Compliance Plus',
    description: 'Module avancé de gestion de la compliance avec screening automatisé et monitoring continu',
    category: 'module',
    status: 'active',
    version: '2.1.0',
    lastUpdate: '2025-10-15'
  },
  {
    id: '2',
    name: 'KYC Advanced',
    description: 'Module KYC avec vérification d\'identité biométrique et analyse documentaire IA',
    category: 'module',
    status: 'active',
    version: '3.0.2',
    lastUpdate: '2025-10-20'
  },
  {
    id: '3',
    name: 'Lemonway',
    description: 'Intégration avec le service de paiement Lemonway pour la gestion des flux financiers',
    category: 'provider',
    status: 'active',
    version: '1.5.0',
    lastUpdate: '2025-09-30'
  },
  {
    id: '4',
    name: 'Harvest',
    description: 'Provider de données enrichies pour le scoring et la validation des entreprises',
    category: 'provider',
    status: 'inactive',
    version: '2.0.1',
    lastUpdate: '2025-10-10'
  },
  {
    id: '5',
    name: 'DocuSign',
    description: 'Intégration pour la signature électronique de documents',
    category: 'integration',
    status: 'active',
    version: '4.2.0',
    lastUpdate: '2025-10-25'
  },
  {
    id: '6',
    name: 'Mailjet',
    description: 'Service d\'envoi d\'emails transactionnels et marketing',
    category: 'integration',
    status: 'active',
    version: '1.8.3',
    lastUpdate: '2025-10-12'
  },
  {
    id: '7',
    name: 'Analytics Pro',
    description: 'Module d\'analyse avancée avec tableaux de bord personnalisables et exports',
    category: 'module',
    status: 'inactive',
    version: '1.0.0',
    lastUpdate: '2025-10-01'
  },
  {
    id: '8',
    name: 'WorldCheck',
    description: 'Provider de screening pour la détection de personnes politiquement exposées',
    category: 'provider',
    status: 'inactive',
    version: '3.1.0',
    lastUpdate: '2025-09-15'
  },
  {
    id: '9',
    name: 'Twilio SMS',
    description: 'Intégration pour l\'envoi de SMS et notifications',
    category: 'integration',
    status: 'inactive',
    version: '2.3.1',
    lastUpdate: '2025-10-18'
  },
  {
    id: '10',
    name: 'Document AI',
    description: 'Module d\'extraction intelligente de données depuis les documents',
    category: 'module',
    status: 'active',
    version: '1.2.5',
    lastUpdate: '2025-10-22'
  }
];

export function AppStore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { modules: contextModules, toggleModule } = useAppStore();
  
  // Merge context modules with mockModules data
  const modules = mockModules.map(mock => {
    const contextModule = contextModules.find(m => m.name === mock.name);
    return {
      ...mock,
      status: contextModule?.status || mock.status
    };
  });

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'Tous', count: modules.length },
    { id: 'module', label: 'Modules', count: modules.filter(m => m.category === 'module').length },
    { id: 'provider', label: 'Providers', count: modules.filter(m => m.category === 'provider').length },
    { id: 'integration', label: 'Intégrations', count: modules.filter(m => m.category === 'integration').length }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl mb-2">App Store</h1>
          <p className="text-gray-600">Gérez les modules, providers et intégrations de votre plateforme InvestHub</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un module, provider ou intégration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-black to-[#0F323D] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Modules actifs</div>
            <div className="text-2xl">{modules.filter(m => m.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Providers connectés</div>
            <div className="text-2xl">{modules.filter(m => m.category === 'provider' && m.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Intégrations actives</div>
            <div className="text-2xl">{modules.filter(m => m.category === 'integration' && m.status === 'active').length}</div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map(module => (
            <div key={module.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-black to-[#0F323D] flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm mb-1">{module.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={module.category === 'module' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                module.category === 'provider' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                'bg-green-50 text-green-700 border-green-200'}
                    >
                      {module.category === 'module' ? 'Module' : 
                       module.category === 'provider' ? 'Provider' : 
                       'Intégration'}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {module.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  v{module.version} • MAJ {new Date(module.lastUpdate!).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={module.status === 'active'}
                    onCheckedChange={() => {
                      toggleModule(module.id);
                      const newStatus = module.status === 'active' ? 'inactive' : 'active';
                      toast.success(newStatus === 'active' ? `${module.name} activé` : `${module.name} désactivé`);
                    }}
                  />
                  <span className="text-xs text-gray-600">
                    {module.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Aucun module trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
