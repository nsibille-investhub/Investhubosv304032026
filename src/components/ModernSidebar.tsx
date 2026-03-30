import { motion, AnimatePresence } from 'motion/react';
import icons from '../utils/modernIcons';
import { useState, useEffect } from 'react';
import React from 'react';
import { navigateToPage } from '../utils/routing';
import logoInvestHub from 'figma:asset/2a84b4397fac896d4ed7e7f4faff09c957de9a6b.png';
import logoMinimized from 'figma:asset/2115896087cf66bcb781a8f9d0f680a46ffd65c4.png';
import { FundContextSelectorCompact } from './FundContextSelectorCompact';
import { Fund } from '../utils/fundGenerator';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  currentPage?: string;
  onPageChange?: (page: string) => void;
  entitiesManagementEnabled?: boolean;
  pendingAlertsCount?: number;
  onOpenEcosystem?: () => void;
  selectedFundId?: number | null;
  onSelectFund?: (fundId: number | null) => void;
  allFunds?: Fund[];
}

export function ModernSidebar({ expanded, onToggle, currentPage = 'entities', onPageChange, entitiesManagementEnabled = false, pendingAlertsCount = 0, onOpenEcosystem, selectedFundId, onSelectFund, allFunds = [] }: SidebarProps) {
  const [settingsFocusMode, setSettingsFocusMode] = useState(false);
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    dashboards: false,
    conformite: currentPage === 'entities' || currentPage === 'dossiers' || currentPage === 'monitoring',
    investisseurs: currentPage === 'subscriptions' || currentPage === 'investors',
    partenaires: currentPage === 'partners' || currentPage === 'settings-conventions' || currentPage === 'retrocessions',
    participations: false,
    fundlife: false,
    dataroom: currentPage === 'documents' || currentPage === 'tracking' || currentPage === 'birdview',
    portails: currentPage === 'events' || currentPage === 'news' || currentPage === 'design-system',
    communications: false,
    settings: currentPage?.startsWith('settings-') || false,
  });

  const toggleMenu = (key: string) => {
    if (key === 'settings') {
      if (settingsFocusMode) {
        setSettingsFocusMode(false);
        setOpenMenus(prev => ({ ...prev, settings: false }));
      } else {
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

  useEffect(() => {
    if (!currentPage?.startsWith('settings-')) {
      setSettingsFocusMode(false);
    }
    
    setOpenMenus({
      dashboards: false,
      conformite: currentPage === 'entities' || currentPage === 'dossiers' || currentPage === 'monitoring',
      investisseurs: currentPage === 'subscriptions' || currentPage === 'investors',
      partenaires: currentPage === 'partners' || currentPage === 'settings-conventions' || currentPage === 'retrocessions',
      participations: false,
      fundlife: false,
      dataroom: currentPage === 'documents' || currentPage === 'tracking' || currentPage === 'birdview',
      portails: currentPage === 'events' || currentPage === 'news' || currentPage === 'design-system',
      communications: false,
      settings: currentPage?.startsWith('settings-') || false,
    });
  }, [currentPage]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 280 : 72 }}
      className="bg-[#FAFAFA] dark:bg-[#0A0A0A] border-r border-[#E5E5E5] dark:border-[#1A1A1A] flex flex-col relative z-50 flex-shrink-0"
      style={{
        boxShadow: '0 0 0 1px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)'
      }}
    >
      {/* Logo Section */}
      <div className="px-4 py-4 border-b border-[#E5E5E5] dark:border-[#1A1A1A] flex items-center justify-between min-h-[68px]">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          animate={{ justifyContent: expanded ? 'flex-start' : 'center' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenEcosystem}
          title="Voir l'écosystème InvestHub"
        >
          {expanded ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <img src={logoInvestHub} alt="InvestHub" className="h-9" />
            </motion.div>
          ) : (
            <motion.img
              key="logo-mini"
              src={logoMinimized}
              alt="InvestHub"
              className="h-8 w-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
        {expanded && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggle}
            className="p-1.5 hover:bg-[#F0F0F0] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <icons.Menu className="w-4 h-4 text-[#333333] dark:text-[#A1A1A1]" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#E5E5E5] dark:scrollbar-thumb-[#262626]">
        {/* Bouton retour en mode focus */}
        <AnimatePresence>
          {settingsFocusMode && expanded && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={exitSettingsFocusMode}
              className="w-full mb-3 px-3 py-2 flex items-center gap-2.5 text-[#333333] dark:text-[#A1A1A1] hover:text-[#171717] dark:hover:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-all group"
            >
              <icons.ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[13px]">Retour au menu principal</span>
            </motion.button>
          )}
        </AnimatePresence>
        
        {!settingsFocusMode && (
          <>
            {/* Fund Context Selector */}
            {onSelectFund && (
              <FundContextSelectorCompact
                selectedFundId={selectedFundId || null}
                onSelectFund={onSelectFund}
                allFunds={allFunds}
                expanded={expanded}
              />
            )}
            
            <MenuItem
              icon={icons.LayoutDashboard}
              label="Dashboards"
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.dashboards}
              onToggle={() => toggleMenu('dashboards')}
            >
              <SubMenuItem icon={icons.BarChart3} label="Vue d'ensemble" expanded={expanded} />
              <SubMenuItem icon={icons.TrendingUp} label="Analytics" expanded={expanded} />
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
                onClick={() => onPageChange?.('retrocessions')}
                active={currentPage === 'retrocessions'}
              />
              <SubMenuItem 
                icon={icons.FileSignature} 
                label="Conventions" 
                expanded={expanded}
                onClick={() => navigateToPage('settings-conventions')}
                active={currentPage === 'settings-conventions'}
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
              <SubMenuItem icon={icons.BarChart3} label="Portfolio" expanded={expanded} />
              <SubMenuItem icon={icons.TrendingUp} label="Performance" expanded={expanded} />
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
              <SubMenuItem icon={icons.Settings} label="Paramètres" expanded={expanded} />
              <SubMenuItem icon={icons.DollarSign} label="Appels" expanded={expanded} />
              <SubMenuItem icon={icons.Wallet} label="Capital accounts" expanded={expanded} />
              <SubMenuItem icon={icons.ArrowDownCircle} label="Distributions" expanded={expanded} />
              <SubMenuItem icon={icons.TrendingDown} label="Prévisions de flux" expanded={expanded} />
              <SubMenuItem icon={icons.FileText} label="Contrats" expanded={expanded} />
              <SubMenuItem icon={icons.FileCheck} label="Souscriptions" expanded={expanded} />
              <SubMenuItem icon={icons.Repeat} label="Transferts" expanded={expanded} />
              <SubMenuItem icon={icons.Calendar} label="Évènements" expanded={expanded} />
              <SubMenuItem icon={icons.Store} label="Marché Secondaire" expanded={expanded} />
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
                label="Tracking" 
                expanded={expanded}
                badge="NEW"
                badgeColor="blue"
                isActive={currentPage === 'tracking'}
                onClick={() => onPageChange?.('tracking')}
              />
              <SubMenuItem
                icon={icons.Eye}
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
              <SubMenuItem icon={icons.Globe} label="Branding / Thème" expanded={expanded} />
              <SubMenuItem icon={icons.Users} label="Navigation partenaires" expanded={expanded} />
              <SubMenuItem icon={icons.Building2} label="Navigation investisseurs" expanded={expanded} />
              <SubMenuItem icon={icons.TrendingUp} label="Navigation participations" expanded={expanded} />
              <SubMenuItem icon={icons.FileText} label="Editeur" expanded={expanded} />
              <SubMenuItem icon={icons.MessageSquare} label="Formulaires de contact" expanded={expanded} />
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
                icon={icons.Lightbulb}
                label="Design System" 
                expanded={expanded}
                isActive={currentPage === 'design-system'}
                onClick={() => onPageChange?.('design-system')}
              />
              <SubMenuItem icon={icons.LifeBuoy} label="FAQ" expanded={expanded} />
              <SubMenuItem icon={icons.Users} label="Contacts" expanded={expanded} />
              <SubMenuItem icon={icons.Globe} label="Traductions" expanded={expanded} />
              <SubMenuItem icon={icons.Shield} label="Disclaimers" expanded={expanded} />
            </MenuItem>

            <MenuItem
              icon={icons.Send}
              label="Communications"
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.communications}
              onToggle={() => toggleMenu('communications')}
            >
              <SubMenuItem icon={icons.Send} label="Messages" expanded={expanded} />
              <SubMenuItem icon={icons.MessageSquare} label="Notifications" expanded={expanded} />
            </MenuItem>
          </>
        )}
        
        <div className={!settingsFocusMode ? "mt-3 pt-3 border-t border-[#E5E5E5] dark:border-[#1A1A1A]" : ""}>
          <MenuItem
            icon={icons.Settings}
            label="Paramètres"
            expanded={expanded}
            hasSubmenu
            isOpen={openMenus.settings}
            onToggle={() => toggleMenu('settings')}
          >
            <SubMenuItem 
              icon={icons.Package}
              label="App Store" 
              expanded={expanded}
              isActive={currentPage === 'settings-app-store'}
              onClick={() => onPageChange?.('settings-app-store')}
            />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Utilisateurs & Accès</div>}
            <SubMenuItem icon={icons.Users} label="Utilisateurs" expanded={expanded} isActive={currentPage === 'settings-users'} onClick={() => onPageChange?.('settings-users')} />
            <SubMenuItem icon={icons.Users} label="Équipes" expanded={expanded} isActive={currentPage === 'settings-teams'} onClick={() => onPageChange?.('settings-teams')} />
            <SubMenuItem icon={icons.Shield} label="Droits" expanded={expanded} isActive={currentPage === 'settings-rights'} onClick={() => onPageChange?.('settings-rights')} />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Communication</div>}
            <SubMenuItem icon={icons.Mail} label="Historique des mails" expanded={expanded} isActive={currentPage === 'settings-mail-history'} onClick={() => onPageChange?.('settings-mail-history')} />
            <SubMenuItem icon={icons.MessageSquare} label="Historique des SMS" expanded={expanded} isActive={currentPage === 'settings-sms-history'} onClick={() => onPageChange?.('settings-sms-history')} />
            <SubMenuItem icon={icons.FileText} label="Gabarits des mails" expanded={expanded} isActive={currentPage === 'settings-mail-templates'} onClick={() => onPageChange?.('settings-mail-templates')} />
            <SubMenuItem icon={icons.BarChart3} label="Statistiques des mails" expanded={expanded} isActive={currentPage === 'settings-mail-stats'} onClick={() => onPageChange?.('settings-mail-stats')} />
            <SubMenuItem icon={icons.Users} label="Groupes de mails" expanded={expanded} isActive={currentPage === 'settings-mail-groups'} onClick={() => onPageChange?.('settings-mail-groups')} />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Configuration</div>}
            <SubMenuItem icon={icons.FileCheck} label="Statuts investisseurs" expanded={expanded} isActive={currentPage === 'settings-investor-status'} onClick={() => onPageChange?.('settings-investor-status')} />
            <SubMenuItem icon={icons.FileCheck} label="Statuts deals" expanded={expanded} isActive={currentPage === 'settings-deal-status'} onClick={() => onPageChange?.('settings-deal-status')} />
            <SubMenuItem icon={icons.Folder} label="Types de deals" expanded={expanded} isActive={currentPage === 'settings-deal-types'} onClick={() => onPageChange?.('settings-deal-types')} />
            <SubMenuItem icon={icons.TrendingUp} label="Types de flux actif" expanded={expanded} isActive={currentPage === 'settings-flow-types'} onClick={() => onPageChange?.('settings-flow-types')} />
            <SubMenuItem icon={icons.Building2} label="Sociétés de gestion" expanded={expanded} isActive={currentPage === 'settings-management-companies'} onClick={() => onPageChange?.('settings-management-companies')} />
            <SubMenuItem icon={icons.FileText} label="Champs personnalisés" expanded={expanded} isActive={currentPage === 'settings-custom-fields'} onClick={() => onPageChange?.('settings-custom-fields')} />
            <SubMenuItem icon={icons.FileCheck} label="Status personnalisés" expanded={expanded} isActive={currentPage === 'settings-custom-status'} onClick={() => onPageChange?.('settings-custom-status')} />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Données & Sécurité</div>}
            <SubMenuItem icon={icons.Globe} label="Gestion des pays/risques" expanded={expanded} isActive={currentPage === 'settings-countries-risks'} onClick={() => onPageChange?.('settings-countries-risks')} />
            <SubMenuItem icon={icons.Building2} label="Fournisseurs" expanded={expanded} isActive={currentPage === 'settings-providers'} onClick={() => onPageChange?.('settings-providers')} />
            <SubMenuItem icon={icons.BarChart3} label="Plan comptable" expanded={expanded} isActive={currentPage === 'settings-chart-of-accounts'} onClick={() => onPageChange?.('settings-chart-of-accounts')} />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Logs & Monitoring</div>}
            <SubMenuItem icon={icons.Database} label="Logs" expanded={expanded} isActive={currentPage === 'settings-logs'} onClick={() => onPageChange?.('settings-logs')} />
            <SubMenuItem icon={icons.Database} label="Logs Lemonway" expanded={expanded} isActive={currentPage === 'settings-logs-lemonway'} onClick={() => onPageChange?.('settings-logs-lemonway')} />
            <SubMenuItem icon={icons.Database} label="Logs Harvest" expanded={expanded} isActive={currentPage === 'settings-logs-harvest'} onClick={() => onPageChange?.('settings-logs-harvest')} />
            <SubMenuItem icon={icons.Shield} label="IPs connues" expanded={expanded} isActive={currentPage === 'settings-known-ips'} onClick={() => onPageChange?.('settings-known-ips')} />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Intégrations</div>}
            <SubMenuItem icon={icons.FileText} label="Signatures DocuSign" expanded={expanded} isActive={currentPage === 'settings-docusign'} onClick={() => onPageChange?.('settings-docusign')} />
            <SubMenuItem icon={icons.Shield} label="Contrôles" expanded={expanded} isActive={currentPage === 'settings-controls'} onClick={() => onPageChange?.('settings-controls')} />
            <SubMenuItem icon={icons.Shield} label="AICs" expanded={expanded} isActive={currentPage === 'settings-aics'} onClick={() => onPageChange?.('settings-aics')} />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Imports & Fichiers</div>}
            <SubMenuItem icon={icons.Upload} label="Imports" expanded={expanded} isActive={currentPage === 'settings-imports'} onClick={() => onPageChange?.('settings-imports')} />
            <SubMenuItem icon={icons.Folder} label="Fichiers hébergés" expanded={expanded} isActive={currentPage === 'settings-hosted-files'} onClick={() => onPageChange?.('settings-hosted-files')} />
            <SubMenuItem icon={icons.Folder} label="Catégories de sections" expanded={expanded} isActive={currentPage === 'settings-section-categories'} onClick={() => onPageChange?.('settings-section-categories')} />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Reporting</div>}
            <SubMenuItem icon={icons.BarChart3} label="Reporting" expanded={expanded} isActive={currentPage === 'settings-reporting'} onClick={() => onPageChange?.('settings-reporting')} />
            <SubMenuItem icon={icons.FileText} label="Rapports" expanded={expanded} isActive={currentPage === 'settings-reports'} onClick={() => onPageChange?.('settings-reports')} />
            <SubMenuItem icon={icons.Database} label="Requêtes" expanded={expanded} isActive={currentPage === 'settings-queries'} onClick={() => onPageChange?.('settings-queries')} />
            <SubMenuItem icon={icons.FileText} label="Formatage des variables" expanded={expanded} isActive={currentPage === 'settings-variable-formatting'} onClick={() => onPageChange?.('settings-variable-formatting')} />
            
            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">Outils</div>}
            <SubMenuItem icon={icons.Wrench} label="Outils" expanded={expanded} isActive={currentPage === 'settings-tools'} onClick={() => onPageChange?.('settings-tools')} />
          </MenuItem>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-3 border-t border-[#E5E5E5] dark:border-[#1A1A1A]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-2 flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors"
        >
          <icons.LifeBuoy className="w-4 h-4 text-[#333333] dark:text-[#A1A1A1]" />
        </motion.button>
      </div>
    </motion.aside>
  );
}

interface MenuItemProps {
  icon: any;
  label: string;
  expanded: boolean;
  hasSubmenu?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  isActive?: boolean;
  children?: React.ReactNode;
}

function MenuItem({ icon, label, expanded, hasSubmenu, isOpen, onToggle, isActive, children }: MenuItemProps) {
  return (
    <div className="mb-0.5">
      <motion.button
        whileHover={{ x: expanded ? 2 : 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        style={isActive ? {
          background: 'linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(15,50,61,0.08) 100%)'
        } : undefined}
        className={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 transition-all duration-200 group ${
          isActive 
            ? 'text-[#171717] dark:text-[#FAFAFA]' 
            : 'text-[#333333] dark:text-[#A1A1A1] hover:text-[#171717] dark:hover:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
        }`}
      >
        {React.createElement(icon, {
          className: `w-[18px] h-[18px] transition-colors ${
            isActive ? 'text-[#171717] dark:text-[#FAFAFA]' : 'text-[#333333] dark:text-[#737373] group-hover:text-[#171717] dark:group-hover:text-[#FAFAFA]'
          }`,
          strokeWidth: 1.5
        })}
        <AnimatePresence mode="wait">
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 text-left text-[13px] font-medium"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {hasSubmenu && expanded && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <icons.ChevronUp className="w-3 h-3 text-[#A1A1A1] dark:text-[#737373]" strokeWidth={1.5} />
          </motion.div>
        )}
      </motion.button>
      
      <AnimatePresence>
        {hasSubmenu && isOpen && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.8, 0.25, 1] }}
            className="overflow-hidden ml-3 mt-0.5 relative"
          >
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-[#E5E5E5] dark:from-[#262626] via-[#E5E5E5] dark:via-[#1A1A1A] to-transparent" />
            <div className="space-y-0.5 py-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SubMenuItemProps {
  icon: any;
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
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={itemActive ? {
        background: 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(15,50,61,0.06) 100%)'
      } : undefined}
      className={`w-full pl-6 pr-2.5 py-1.5 rounded-md flex items-center gap-2.5 text-[12px] transition-all duration-150 relative group ${
        itemActive 
          ? 'text-[#171717] dark:text-[#FAFAFA] font-medium' 
          : 'text-[#333333] dark:text-[#A1A1A1] hover:text-[#171717] dark:hover:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'
      }`}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-px bg-gradient-to-r from-[#E5E5E5] dark:from-[#262626] to-transparent" />
      
      {React.createElement(icon, {
        className: `w-3.5 h-3.5 transition-colors flex-shrink-0 ${
          itemActive ? 'text-[#171717] dark:text-[#FAFAFA]' : 'text-[#333333] dark:text-[#737373] group-hover:text-[#525252] dark:group-hover:text-[#D4D4D4]'
        }`,
        strokeWidth: 1.5
      })}
      
      <AnimatePresence mode="wait">
        {expanded && (
          <>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 text-left truncate"
            >
              {label}
            </motion.span>
            {badge && (
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                  badgeColor === 'red' ? 'bg-[#FF4444] text-white' :
                  badgeColor === 'blue' ? 'text-[#0F323D]' :
                  'text-[#171717] dark:text-[#0F323D]'
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
