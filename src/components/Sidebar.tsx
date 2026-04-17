import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import icons from '../utils/fontAwesomeIcons';
import { useState, useEffect } from 'react';
import { navigateToPage } from '../utils/routing';
import logoInvestHub from 'figma:asset/2a84b4397fac896d4ed7e7f4faff09c957de9a6b.png';
import logoMinimized from 'figma:asset/2115896087cf66bcb781a8f9d0f680a46ffd65c4.png';
import logoBPI from 'figma:asset/fbd92a3821f271de40d6b58cd6b5b1f28a6e8ca5.png';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  currentPage?: string;
  onPageChange?: (page: string) => void;
  entitiesManagementEnabled?: boolean;
  pendingAlertsCount?: number;
  onOpenEcosystem?: () => void;
}

export function Sidebar({ expanded, onToggle, currentPage = 'entities', onPageChange, entitiesManagementEnabled = false, pendingAlertsCount = 0, onOpenEcosystem }: SidebarProps) {
  const [settingsFocusMode, setSettingsFocusMode] = useState(false);
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    dashboards: false,
    conformite: currentPage === 'entities' || currentPage === 'dossiers' || currentPage === 'monitoring',
    investisseurs: currentPage === 'subscriptions' || currentPage === 'investors',
    partenaires: currentPage === 'partners',
    participations: false,
    fundlife: false,
    dataroom: currentPage === 'documents' || currentPage === 'tracking' || currentPage === 'birdview',
    portails: currentPage === 'events' || currentPage === 'news',
    communications: false,
    settings: currentPage?.startsWith('settings-') || false,
  });

  const toggleMenu = (key: string) => {
    if (key === 'settings') {
      // Toggle le mode focus paramètres
      if (settingsFocusMode) {
        // Si déjà en mode focus, on ferme tout
        setSettingsFocusMode(false);
        setOpenMenus(prev => ({ ...prev, settings: false }));
      } else {
        // Sinon on active le mode focus
        setSettingsFocusMode(true);
        setOpenMenus(prev => ({ ...prev, settings: true }));
      }
    } else {
      setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };
  
  const exitSettingsFocusMode = () => {
    setSettingsFocusMode(false);
    setOpenMenus(prev => ({ ...prev, settings: false }));
  };

  // Mettre à jour les menus ouverts quand la page change
  useEffect(() => {
    // Si on navigue vers une page non-paramètres, désactiver le mode focus
    if (!currentPage?.startsWith('settings-')) {
      setSettingsFocusMode(false);
    }
    
    setOpenMenus({
      dashboards: false,
      conformite: currentPage === 'entities' || currentPage === 'dossiers' || currentPage === 'monitoring',
      investisseurs: currentPage === 'subscriptions' || currentPage === 'investors',
      partenaires: currentPage === 'partners',
      participations: false,
      fundlife: false,
      dataroom: currentPage === 'documents' || currentPage === 'tracking' || currentPage === 'birdview',
      portails: currentPage === 'events' || currentPage === 'news',
      communications: false,
      settings: currentPage?.startsWith('settings-') || false,
    });
  }, [currentPage]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 280 : 80 }}
      className="bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm relative z-50 flex-shrink-0"
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between min-h-[73px]">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          animate={{ justifyContent: expanded ? 'flex-start' : 'center' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenEcosystem}
          title="Voir l'écosystème InvestHub"
        >
          {expanded ? (
            <motion.div
              key="logo-full"
              className="flex flex-col gap-2 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={logoInvestHub}
                alt="InvestHub"
                className="h-10"
              />

            </motion.div>
          ) : (
            <motion.img
              key="logo-mini"
              src={logoMinimized}
              alt="InvestHub"
              className="h-auto w-auto max-h-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
        {expanded && (
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={icons.Menu} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
        {/* Bouton de retour en mode focus paramètres */}
        <AnimatePresence>
          {settingsFocusMode && expanded && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={exitSettingsFocusMode}
              className="w-full mb-4 px-3 py-2.5 flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-all group"
            >
              <FontAwesomeIcon icon={icons.ArrowLeft} className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Retour au menu principal</span>
            </motion.button>
          )}
        </AnimatePresence>
        
        {!settingsFocusMode && (
          <>
            <MenuItem
              icon={icons.LayoutDashboard}
              label="Dashboards"
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.dashboards}
              onToggle={() => toggleMenu('dashboards')}
            >
          <SubMenuItem 
            icon={icons.BarChart3}
            label="Vue d'ensemble" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.TrendingUp}
            label="Analytics" 
            expanded={expanded}
          />
        </MenuItem>

        <MenuItem
          icon={icons.FolderOpen}
          label="Conformité"
          expanded={expanded}
          hasSubmenu
          isOpen={openMenus.conformite}
          onToggle={() => toggleMenu('conformite')}
        >
          <SubMenuItem 
            icon={icons.FolderLock}
            label="Dossiers" 
            expanded={expanded}
            badge="NEW"
            badgeColor="blue"
            isActive={currentPage === 'dossiers'}
            onClick={() => onPageChange?.('dossiers')}
          />
          <SubMenuItem 
            icon={icons.UserCircle}
            label="Entités" 
            expanded={expanded}
            badge={!entitiesManagementEnabled ? 'NEW' : undefined}
            badgeColor="blue"
            isActive={currentPage === 'entities'}
            onClick={() => onPageChange?.('entities')}
          />
          <SubMenuItem 
            icon={icons.AlertTriangle}
            label="Alertes" 
            expanded={expanded}
            badge={!entitiesManagementEnabled ? 'NEW' : (pendingAlertsCount > 0 ? pendingAlertsCount.toString() : undefined)}
            badgeColor={!entitiesManagementEnabled ? 'blue' : 'red'}
            isActive={currentPage === 'monitoring'}
            onClick={() => onPageChange?.('monitoring')}
          />
        </MenuItem>

        <MenuItem
          icon={icons.UsersRound}
          label="Investisseurs"
          expanded={expanded}
          hasSubmenu
          isOpen={openMenus.investisseurs}
          onToggle={() => toggleMenu('investisseurs')}
        >
          <SubMenuItem 
            icon={icons.Users}
            label="Investisseurs" 
            expanded={expanded}
            isActive={currentPage === 'investors'}
            onClick={() => onPageChange?.('investors')}
          />
          <SubMenuItem 
            icon={icons.FileCheck}
            label="Souscriptions" 
            expanded={expanded}
            isActive={currentPage === 'subscriptions'}
            onClick={() => onPageChange?.('subscriptions')}
          />
        </MenuItem>

        <MenuItem
          icon={icons.Handshake}
          label="Partenaires"
          expanded={expanded}
          hasSubmenu
          isOpen={openMenus.partenaires}
          onToggle={() => toggleMenu('partenaires')}
        >
          <SubMenuItem 
            icon={icons.Users}
            label="Partenaires" 
            expanded={expanded}
            onClick={() => navigateToPage('partners')}
            active={currentPage === 'partners'}
          />
          <SubMenuItem 
            icon={icons.ArrowLeftRight}
            label="Rétrocessions" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.FileSignature}
            label="Conventions" 
            expanded={expanded}
          />
        </MenuItem>

        <MenuItem
          icon={icons.TrendingUp}
          label="Participations"
          expanded={expanded}
          hasSubmenu
          isOpen={openMenus.participations}
          onToggle={() => toggleMenu('participations')}
        >
          <SubMenuItem 
            icon={icons.BarChart3}
            label="Portfolio" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.TrendingUp}
            label="Performance" 
            expanded={expanded}
          />
        </MenuItem>

        <MenuItem
          icon={icons.Briefcase}
          label="Fund Life"
          expanded={expanded}
          hasSubmenu
          isOpen={openMenus.fundlife}
          onToggle={() => toggleMenu('fundlife')}
        >
          <SubMenuItem 
            icon={icons.Briefcase}
            label="Tous les fonds" 
            expanded={expanded}
            isActive={currentPage === 'allfunds'}
            onClick={() => onPageChange?.('allfunds')}
          />
          <SubMenuItem 
            icon={icons.Settings}
            label="Paramètres" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.DollarSign}
            label="Appels" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Wallet}
            label="Capital accounts" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.ArrowDownCircle}
            label="Distributions" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.TrendingDown}
            label="Prévisions de flux" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.FileText}
            label="Contrats" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.FileCheck}
            label="Souscriptions" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Repeat}
            label="Transferts" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Calendar}
            label="Évènements" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Store}
            label="Marché Secondaire" 
            expanded={expanded}
          />
        </MenuItem>

        <MenuItem
          icon={icons.FolderOpen}
          label="Data Room"
          expanded={expanded}
          hasSubmenu
          isOpen={openMenus.dataroom}
          onToggle={() => toggleMenu('dataroom')}
        >
          <SubMenuItem 
            icon={icons.Folder}
            label="Documents" 
            expanded={expanded}
            badge={!entitiesManagementEnabled ? 'NEW' : undefined}
            badgeColor="blue"
            isActive={currentPage === 'documents'}
            onClick={() => onPageChange?.('documents')}
          />
          <SubMenuItem
            icon={icons.Activity}
            label="Bird View"
            expanded={expanded}
            isActive={currentPage === 'birdview'}
            onClick={() => onPageChange?.('birdview')}
          />
        </MenuItem>

        <MenuItem
          icon={icons.ExternalLink}
          label="Portails et Contenu"
          expanded={expanded}
          hasSubmenu
          isOpen={openMenus.portails}
          onToggle={() => toggleMenu('portails')}
        >
          <SubMenuItem 
            icon={icons.Globe}
            label="Branding / Thème" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Users}
            label="Navigation partenaires" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Building2}
            label="Navigation investisseurs" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.TrendingUp}
            label="Navigation participations" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.FileText}
            label="Editeur" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.MessageSquare}
            label="Formulaires de contact" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.FileText}
            label="Actualités" 
            expanded={expanded}
            isActive={currentPage === 'news'}
            onClick={() => onPageChange?.('news')}
          />
          <SubMenuItem 
            icon={icons.Calendar}
            label="Événements" 
            expanded={expanded}
            isActive={currentPage === 'events'}
            onClick={() => onPageChange?.('events')}
          />
          <SubMenuItem 
            icon={icons.LifeBuoy}
            label="FAQ" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Users}
            label="Contacts" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Globe}
            label="Traductions" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.Shield}
            label="Disclaimers" 
            expanded={expanded}
          />
        </MenuItem>

        <MenuItem
          icon={icons.AlertTriangle}
          label="Communications"
          expanded={expanded}
          hasSubmenu
          isOpen={openMenus.communications}
          onToggle={() => toggleMenu('communications')}
        >
          <SubMenuItem 
            icon={icons.Send}
            label="Messages" 
            expanded={expanded}
          />
          <SubMenuItem 
            icon={icons.MessageSquare}
            label="Notifications" 
            expanded={expanded}
          />
        </MenuItem>
          </>
        )}
        
        <div className={!settingsFocusMode ? "mt-4 pt-4 border-t border-gray-200 dark:border-gray-800" : ""}>
          <MenuItem
            icon={icons.Settings}
            label="Paramètres"
            expanded={expanded}
            hasSubmenu
            isOpen={openMenus.settings}
            onToggle={() => toggleMenu('settings')}
          >
            {/* App Store */}
            <SubMenuItem 
              icon={icons.Package}
              label="App Store" 
              expanded={expanded}
              isActive={currentPage === 'settings-app-store'}
              onClick={() => onPageChange?.('settings-app-store')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-4" />}
            
            {/* Utilisateurs & Accès */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">Utilisateurs & Accès</div>}
            <SubMenuItem 
              icon={icons.Users}
              label="Utilisateurs" 
              expanded={expanded}
              isActive={currentPage === 'settings-users'}
              onClick={() => onPageChange?.('settings-users')}
            />
            <SubMenuItem 
              icon={icons.Users}
              label="Équipes" 
              expanded={expanded}
              isActive={currentPage === 'settings-teams'}
              onClick={() => onPageChange?.('settings-teams')}
            />
            <SubMenuItem 
              icon={icons.Shield}
              label="Droits" 
              expanded={expanded}
              isActive={currentPage === 'settings-rights'}
              onClick={() => onPageChange?.('settings-rights')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-4" />}
            
            {/* Communication */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">Communication</div>}
            <SubMenuItem 
              icon={icons.Mail}
              label="Historique des mails" 
              expanded={expanded}
              isActive={currentPage === 'settings-mail-history'}
              onClick={() => onPageChange?.('settings-mail-history')}
            />
            <SubMenuItem 
              icon={icons.MessageSquare}
              label="Historique des SMS" 
              expanded={expanded}
              isActive={currentPage === 'settings-sms-history'}
              onClick={() => onPageChange?.('settings-sms-history')}
            />
            <SubMenuItem 
              icon={icons.FileText}
              label="Gabarits des mails" 
              expanded={expanded}
              isActive={currentPage === 'settings-mail-templates'}
              onClick={() => onPageChange?.('settings-mail-templates')}
            />
            <SubMenuItem 
              icon={icons.BarChart3}
              label="Statistiques des mails" 
              expanded={expanded}
              isActive={currentPage === 'settings-mail-stats'}
              onClick={() => onPageChange?.('settings-mail-stats')}
            />
            <SubMenuItem 
              icon={icons.Users}
              label="Groupes de mails" 
              expanded={expanded}
              isActive={currentPage === 'settings-mail-groups'}
              onClick={() => onPageChange?.('settings-mail-groups')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-4" />}
            
            {/* Configuration */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">Configuration</div>}
            <SubMenuItem 
              icon={icons.FileCheck}
              label="Statuts investisseurs" 
              expanded={expanded}
              isActive={currentPage === 'settings-investor-status'}
              onClick={() => onPageChange?.('settings-investor-status')}
            />
            <SubMenuItem 
              icon={icons.FileCheck}
              label="Statuts deals" 
              expanded={expanded}
              isActive={currentPage === 'settings-deal-status'}
              onClick={() => onPageChange?.('settings-deal-status')}
            />
            <SubMenuItem 
              icon={icons.Folder}
              label="Types de deals" 
              expanded={expanded}
              isActive={currentPage === 'settings-deal-types'}
              onClick={() => onPageChange?.('settings-deal-types')}
            />
            <SubMenuItem 
              icon={icons.TrendingUp}
              label="Types de flux actif" 
              expanded={expanded}
              isActive={currentPage === 'settings-flow-types'}
              onClick={() => onPageChange?.('settings-flow-types')}
            />
            <SubMenuItem 
              icon={icons.Building2}
              label="Sociétés de gestion" 
              expanded={expanded}
              isActive={currentPage === 'settings-management-companies'}
              onClick={() => onPageChange?.('settings-management-companies')}
            />
            <SubMenuItem 
              icon={icons.FileText}
              label="Champs personnalisés" 
              expanded={expanded}
              isActive={currentPage === 'settings-custom-fields'}
              onClick={() => onPageChange?.('settings-custom-fields')}
            />
            <SubMenuItem 
              icon={icons.FileCheck}
              label="Status personnalisés" 
              expanded={expanded}
              isActive={currentPage === 'settings-custom-status'}
              onClick={() => onPageChange?.('settings-custom-status')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-4" />}
            
            {/* Données & Sécurité */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">Données & Sécurité</div>}
            <SubMenuItem 
              icon={icons.Globe}
              label="Gestion des pays/risques" 
              expanded={expanded}
              isActive={currentPage === 'settings-countries-risks'}
              onClick={() => onPageChange?.('settings-countries-risks')}
            />
            <SubMenuItem 
              icon={icons.Building2}
              label="Fournisseurs" 
              expanded={expanded}
              isActive={currentPage === 'settings-providers'}
              onClick={() => onPageChange?.('settings-providers')}
            />
            <SubMenuItem 
              icon={icons.BarChart3}
              label="Plan comptable" 
              expanded={expanded}
              isActive={currentPage === 'settings-chart-of-accounts'}
              onClick={() => onPageChange?.('settings-chart-of-accounts')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-4" />}
            
            {/* Logs & Monitoring */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">Logs & Monitoring</div>}
            <SubMenuItem 
              icon={icons.Database}
              label="Logs" 
              expanded={expanded}
              isActive={currentPage === 'settings-logs'}
              onClick={() => onPageChange?.('settings-logs')}
            />
            <SubMenuItem 
              icon={icons.Database}
              label="Logs Lemonway" 
              expanded={expanded}
              isActive={currentPage === 'settings-logs-lemonway'}
              onClick={() => onPageChange?.('settings-logs-lemonway')}
            />
            <SubMenuItem 
              icon={icons.Database}
              label="Logs Harvest" 
              expanded={expanded}
              isActive={currentPage === 'settings-logs-harvest'}
              onClick={() => onPageChange?.('settings-logs-harvest')}
            />
            <SubMenuItem 
              icon={icons.Shield}
              label="IPs connues" 
              expanded={expanded}
              isActive={currentPage === 'settings-known-ips'}
              onClick={() => onPageChange?.('settings-known-ips')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-4" />}
            
            {/* Intégrations */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">Intégrations</div>}
            <SubMenuItem 
              icon={icons.FileText}
              label="Signatures DocuSign" 
              expanded={expanded}
              isActive={currentPage === 'settings-docusign'}
              onClick={() => onPageChange?.('settings-docusign')}
            />
            <SubMenuItem 
              icon={icons.Shield}
              label="Contrôles" 
              expanded={expanded}
              isActive={currentPage === 'settings-controls'}
              onClick={() => onPageChange?.('settings-controls')}
            />
            <SubMenuItem 
              icon={icons.Shield}
              label="AICs" 
              expanded={expanded}
              isActive={currentPage === 'settings-aics'}
              onClick={() => onPageChange?.('settings-aics')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-4" />}
            
            {/* Imports & Fichiers */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">Imports & Fichiers</div>}
            <SubMenuItem 
              icon={icons.Upload}
              label="Imports" 
              expanded={expanded}
              isActive={currentPage === 'settings-imports'}
              onClick={() => onPageChange?.('settings-imports')}
            />
            <SubMenuItem 
              icon={icons.Folder}
              label="Fichiers hébergés" 
              expanded={expanded}
              isActive={currentPage === 'settings-hosted-files'}
              onClick={() => onPageChange?.('settings-hosted-files')}
            />
            <SubMenuItem 
              icon={icons.Folder}
              label="Catégories de sections" 
              expanded={expanded}
              isActive={currentPage === 'settings-section-categories'}
              onClick={() => onPageChange?.('settings-section-categories')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-4" />}
            
            {/* Reporting */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">Reporting</div>}
            <SubMenuItem 
              icon={icons.BarChart3}
              label="Reporting" 
              expanded={expanded}
              isActive={currentPage === 'settings-reporting'}
              onClick={() => onPageChange?.('settings-reporting')}
            />
            <SubMenuItem 
              icon={icons.FileText}
              label="Rapports" 
              expanded={expanded}
              isActive={currentPage === 'settings-reports'}
              onClick={() => onPageChange?.('settings-reports')}
            />
            <SubMenuItem 
              icon={icons.Database}
              label="Requêtes" 
              expanded={expanded}
              isActive={currentPage === 'settings-queries'}
              onClick={() => onPageChange?.('settings-queries')}
            />
            <SubMenuItem 
              icon={icons.FileText}
              label="Formatage des variables" 
              expanded={expanded}
              isActive={currentPage === 'settings-variable-formatting'}
              onClick={() => onPageChange?.('settings-variable-formatting')}
            />
            
            {/* Séparateur visuel */}
            {expanded && <div className="h-px bg-gray-100 my-1.5 mx-4" />}
            
            {/* Outils */}
            {expanded && <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-400">Outils</div>}
            <SubMenuItem 
              icon={icons.Wrench}
              label="Outils" 
              expanded={expanded}
              isActive={currentPage === 'settings-tools'}
              onClick={() => onPageChange?.('settings-tools')}
            />
          </MenuItem>
        </div>
      </nav>

      {/* Footer */}
      <motion.div 
        className="px-3 py-4 border-t border-gray-200 dark:border-gray-800"
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={icons.LifeBuoy} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </motion.div>
    </motion.aside>
  );
}

interface MenuItemProps {
  icon: any; // IconDefinition from FontAwesome
  label: string;
  expanded: boolean;
  hasSubmenu?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  isActive?: boolean;
  children?: React.ReactNode;
}

function MenuItem({ 
  icon, 
  label, 
  expanded, 
  hasSubmenu, 
  isOpen, 
  onToggle,
  isActive,
  children 
}: MenuItemProps) {
  return (
    <div className="mb-1">
      <motion.button
        whileHover={{ x: 2, backgroundColor: isActive ? undefined : 'rgba(0,0,0,0.03)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        style={isActive ? {
          background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)'
        } : undefined}
        className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 cursor-pointer ${
          isActive 
            ? 'text-white shadow-lg shadow-black/20' 
            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <FontAwesomeIcon icon={icon} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
        </motion.div>
        <AnimatePresence mode="wait">
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 text-left text-sm font-medium"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {hasSubmenu && expanded && (
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FontAwesomeIcon icon={icons.ChevronRight} className="w-4 h-4" />
          </motion.div>
        )}
      </motion.button>
      
      {/* Submenu avec connexion visuelle */}
      <AnimatePresence>
        {hasSubmenu && isOpen && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden ml-4 mt-1 relative"
          >
            {/* Ligne de connexion verticale */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 dark:from-gray-700 via-gray-200 dark:via-gray-800 to-transparent" />
            
            <div className="space-y-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SubMenuItemProps {
  icon: any; // IconDefinition from FontAwesome
  label: string;
  expanded: boolean;
  isActive?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: 'green' | 'red' | 'blue';
  active?: boolean;
}

function SubMenuItem({ icon, label, expanded, isActive, onClick, badge, badgeColor = 'green', active }: SubMenuItemProps) {
  const itemActive = isActive || active;
  
  return (
    <motion.button
      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={itemActive ? {
        background: 'linear-gradient(62.32deg, rgba(0,0,0,0.1) 10.53%, rgba(15,50,61,0.15) 88.82%)'
      } : undefined}
      className={`w-full pl-7 pr-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-all duration-200 relative cursor-pointer ${
        itemActive 
          ? 'text-gray-900 dark:text-gray-100 font-medium' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
      }`}
    >
      {/* Point de connexion */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent" />
      
      {/* Icône */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <FontAwesomeIcon icon={icon} className={`w-4 h-4 ${itemActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'}`} />
      </motion.div>
      
      <AnimatePresence mode="wait">
        {expanded && (
          <>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 text-left"
            >
              {label}
            </motion.span>
            {badge && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  badgeColor === 'red' ? 'bg-red-500 text-white' :
                  badgeColor === 'blue' ? 'text-[#0F323D]' :
                  'text-gray-900'
                }`}
                style={
                  badgeColor === 'blue' ? { backgroundColor: '#DCFDBC' } :
                  badgeColor === 'green' ? { backgroundColor: '#DCFDBC' } : 
                  undefined
                }
              >
                {badge}
              </motion.span>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
