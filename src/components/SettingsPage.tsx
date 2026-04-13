import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Package, 
  Users, 
  Shield, 
  Mail, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Globe, 
  Building2, 
  Database, 
  ClipboardList, 
  FileSearch, 
  Upload, 
  Wrench,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { AppStore } from './settings/AppStore';
import { InvestorStatusSettings } from './settings/InvestorStatusSettings';
import { UsersSettings } from './settings/UsersSettings';
import { TeamsSettings } from './settings/TeamsSettings';
import { RightsSettings } from './settings/RightsSettings';
import SegmentsSettings from './settings/SegmentsSettings';
import { MailHistorySettings } from './settings/MailHistorySettings';
import { SmsHistorySettings } from './settings/SmsHistorySettings';
import { MailTemplatesSettings } from './settings/MailTemplatesSettings';
import { MailStatsSettings } from './settings/MailStatsSettings';
import { MailGroupsSettings } from './settings/MailGroupsSettings';
import { DealStatusSettings } from './settings/DealStatusSettings';
import { DealTypesSettings } from './settings/DealTypesSettings';
import { FlowTypesSettings } from './settings/FlowTypesSettings';
import { ManagementCompaniesSettings } from './settings/ManagementCompaniesSettings';
import { CustomFieldsSettings } from './settings/CustomFieldsSettings';
import { CustomStatusSettings } from './settings/CustomStatusSettings';
import { CountriesRisksSettings } from './settings/CountriesRisksSettings';
import { ProvidersSettings } from './settings/ProvidersSettings';
import { ChartOfAccountsSettings } from './settings/ChartOfAccountsSettings';
import { ControlsSettings } from './settings/ControlsSettings';
import { AICsSettings } from './settings/AICsSettings';
import { LogsSettings } from './settings/LogsSettings';
import { LemonwayLogsSettings } from './settings/LemonwayLogsSettings';
import { HarvestLogsSettings } from './settings/HarvestLogsSettings';
import { KnownIPsSettings } from './settings/KnownIPsSettings';
import { ImportsSettings } from './settings/ImportsSettings';
import { HostedFilesSettings } from './settings/HostedFilesSettings';
import { SectionCategoriesSettings } from './settings/SectionCategoriesSettings';
import { ReportingSettings } from './settings/ReportingSettings';
import { ReportsSettings } from './settings/ReportsSettings';
import { QueriesSettings } from './settings/QueriesSettings';
import { VariableFormattingSettings } from './settings/VariableFormattingSettings';
import { DocuSignSettings } from './settings/DocuSignSettings';
import { ToolsSettings } from './settings/ToolsSettings';
import EventsSettings from './settings/EventsSettings';

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  component: React.ReactNode;
}

const menuCategories: MenuCategory[] = [
  {
    id: 'app-store',
    label: 'App Store',
    icon: <Package className="w-4 h-4" />,
    items: [
      { id: 'app-store', label: 'App Store', component: <AppStore /> }
    ]
  },
  {
    id: 'users-access',
    label: 'Utilisateurs & Accès',
    icon: <Users className="w-4 h-4" />,
    items: [
      { id: 'users', label: 'Utilisateurs', component: <UsersSettings /> },
      { id: 'teams', label: 'Équipes', component: <TeamsSettings /> },
      { id: 'rights', label: 'Droits', component: <RightsSettings /> },
      { id: 'segments', label: 'Segments', component: <SegmentsSettings /> }
    ]
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: <Mail className="w-4 h-4" />,
    items: [
      { id: 'mail-history', label: 'Historique des mails', component: <MailHistorySettings /> },
      { id: 'sms-history', label: 'Historique des SMS', component: <SmsHistorySettings /> },
      { id: 'mail-templates', label: 'Gabarits des mails', component: <MailTemplatesSettings /> },
      { id: 'mail-stats', label: 'Statistiques des mails', component: <MailStatsSettings /> },
      { id: 'mail-groups', label: 'Groupes de mails', component: <MailGroupsSettings /> }
    ]
  },
  {
    id: 'business-config',
    label: 'Configuration métier',
    icon: <Settings className="w-4 h-4" />,
    items: [
      { id: 'investor-status', label: 'Statuts investisseurs', component: <InvestorStatusSettings /> },
      { id: 'deal-status', label: 'Statuts deals', component: <DealStatusSettings /> },
      { id: 'deal-types', label: 'Types de deals', component: <DealTypesSettings /> },
      { id: 'flow-types', label: 'Types de flux actif', component: <FlowTypesSettings /> },
      { id: 'management-companies', label: 'Sociétés de gestion', component: <ManagementCompaniesSettings /> },
      { id: 'section-categories', label: 'Catégories de sections', component: <SectionCategoriesSettings /> },
      { id: 'custom-fields', label: 'Champs personnalisés', component: <CustomFieldsSettings /> },
      { id: 'custom-status', label: 'Status personnalisés', component: <CustomStatusSettings /> }
    ]
  },
  {
    id: 'referentials',
    label: 'Référentiels',
    icon: <Globe className="w-4 h-4" />,
    items: [
      { id: 'countries-risks', label: 'Gestion des pays/risques', component: <CountriesRisksSettings /> },
      { id: 'providers', label: 'Fournisseurs', component: <ProvidersSettings /> },
      { id: 'chart-of-accounts', label: 'Plan comptable', component: <ChartOfAccountsSettings /> }
    ]
  },
  {
    id: 'integrations-logs',
    label: 'Intégrations & Logs',
    icon: <Database className="w-4 h-4" />,
    items: [
      { id: 'logs', label: 'Logs', component: <LogsSettings /> },
      { id: 'logs-lemonway', label: 'Logs Lemonway', component: <LemonwayLogsSettings /> },
      { id: 'logs-harvest', label: 'Logs Harvest', component: <HarvestLogsSettings /> },
      { id: 'known-ips', label: 'IPs connues', component: <KnownIPsSettings /> },
      { id: 'docusign', label: 'Signatures DocuSign', component: <DocuSignSettings /> }
    ]
  },
  {
    id: 'controls-compliance',
    label: 'Contrôles & Conformité',
    icon: <Shield className="w-4 h-4" />,
    items: [
      { id: 'controls', label: 'Contrôles', component: <ControlsSettings /> },
      { id: 'aics', label: 'AICs', component: <AICsSettings /> }
    ]
  },
  {
    id: 'data-imports',
    label: 'Données & Imports',
    icon: <Upload className="w-4 h-4" />,
    items: [
      { id: 'imports', label: 'Imports', component: <ImportsSettings /> },
      { id: 'hosted-files', label: 'Fichiers hébergés', component: <HostedFilesSettings /> }
    ]
  },
  {
    id: 'reports-analysis',
    label: 'Rapports & Analyse',
    icon: <BarChart3 className="w-4 h-4" />,
    items: [
      { id: 'reporting', label: 'Reporting', component: <ReportingSettings /> },
      { id: 'reports', label: 'Rapports', component: <ReportsSettings /> },
      { id: 'queries', label: 'Requêtes', component: <QueriesSettings /> },
      { id: 'variable-formatting', label: 'Formatage des variables', component: <VariableFormattingSettings /> }
    ]
  },
  {
    id: 'tools',
    label: 'Outils',
    icon: <Wrench className="w-4 h-4" />,
    items: [
      { id: 'tools', label: 'Outils', component: <ToolsSettings /> }
    ]
  },
  {
    id: 'portals-content',
    label: 'Portails et Contenu',
    icon: <ExternalLink className="w-4 h-4" />,
    items: [
      { id: 'events', label: 'Événements', component: <EventsSettings /> }
    ]
  }
];

export function SettingsPage() {
  const [selectedMenuItem, setSelectedMenuItem] = useState('app-store');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['app-store'])
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getActiveComponent = () => {
    for (const category of menuCategories) {
      const item = category.items.find(item => item.id === selectedMenuItem);
      if (item) return item.component;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Settings Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)'
              }}
            >
              <Settings className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-gray-900">Paramètres</h2>
              <p className="text-xs text-gray-500 mt-0.5">Configuration de l'application</p>
            </div>
          </motion.div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          {menuCategories.map((category, categoryIndex) => (
            <motion.div 
              key={category.id} 
              className="mb-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: categoryIndex * 0.05 }}
            >
              <motion.button
                whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  toggleCategory(category.id);
                  // Si la catégorie n'a qu'un seul élément, on le sélectionne directement
                  if (category.items.length === 1) {
                    setSelectedMenuItem(category.items[0].id);
                  }
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                  expandedCategories.has(category.id)
                    ? 'text-gray-900'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="flex-shrink-0"
                >
                  {React.cloneElement(category.icon as React.ReactElement, {
                    className: `w-5 h-5 ${expandedCategories.has(category.id) ? 'text-gray-900' : 'text-gray-600'}`
                  })}
                </motion.div>
                <span className="flex-1 text-left text-sm font-medium">
                  {category.label}
                </span>
                {category.items.length > 1 && (
                  <motion.div
                    animate={{ rotate: expandedCategories.has(category.id) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.div>
                )}
              </motion.button>
              
              {/* Submenu avec connexion visuelle */}
              <AnimatePresence>
                {expandedCategories.has(category.id) && category.items.length > 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden ml-4 mt-1 relative"
                  >
                    {/* Ligne de connexion verticale */}
                    <div className="absolute left-2 top-0 bottom-2 w-px bg-gradient-to-b from-gray-300 via-gray-200 to-transparent" />
                    
                    <div className="space-y-0.5">
                      {category.items.map((item, itemIndex) => (
                        <motion.button
                          key={item.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: itemIndex * 0.03 }}
                          whileHover={{ x: 4, backgroundColor: selectedMenuItem === item.id ? undefined : 'rgba(0,0,0,0.03)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMenuItem(item.id)}
                          style={selectedMenuItem === item.id ? {
                            background: 'linear-gradient(62.32deg, rgba(0,0,0,0.1) 10.53%, rgba(15,50,61,0.15) 88.82%)'
                          } : undefined}
                          className={`w-full pl-7 pr-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-all duration-200 relative cursor-pointer ${
                            selectedMenuItem === item.id
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {/* Point de connexion */}
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-px bg-gradient-to-r from-gray-300 to-transparent" />
                          
                          <span className="flex-1 text-left">
                            {item.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={selectedMenuItem}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {getActiveComponent()}
        </motion.div>
      </div>
    </div>
  );
}
