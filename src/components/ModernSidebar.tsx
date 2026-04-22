import { motion, AnimatePresence } from 'motion/react';
import icons from '../utils/modernIcons';
import { useState, useEffect } from 'react';
import React from 'react';
import { navigateToPage } from '../utils/routing';
import logoInvestHub from 'figma:asset/2a84b4397fac896d4ed7e7f4faff09c957de9a6b.png';
import logoMinimized from 'figma:asset/2115896087cf66bcb781a8f9d0f680a46ffd65c4.png';
import { FundContextSelectorCompact } from './FundContextSelectorCompact';
import { Fund } from '../utils/fundGenerator';
import { useTranslation } from '../utils/languageContext';

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
  const { t } = useTranslation();
  const [settingsFocusMode, setSettingsFocusMode] = useState(false);
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    dashboards: false,
    conformite: currentPage === 'entities' || currentPage === 'dossiers' || currentPage === 'monitoring',
    investisseurs: currentPage === 'subscriptions' || currentPage === 'investors',
    partenaires: currentPage === 'partners' || currentPage === 'settings-conventions' || currentPage === 'retrocessions',
    participations: false,
    fundlife: false,
    dataroom: currentPage === 'documents' || currentPage === 'tracking' || currentPage === 'birdview',
    portails: currentPage === 'events' || currentPage === 'news' || currentPage === 'datahub',
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
      portails: currentPage === 'events' || currentPage === 'news' || currentPage === 'datahub',
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
          title={t('sidebar.ecosystemTooltip')}
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
              <span className="text-[13px]">{t('sidebar.backToMainMenu')}</span>
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
              label={t('sidebar.menu.dashboards')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.dashboards}
              onToggle={() => toggleMenu('dashboards')}
            >
              <SubMenuItem icon={icons.BarChart3} label={t('sidebar.submenu.overview')} expanded={expanded} />
              <SubMenuItem icon={icons.TrendingUp} label={t('sidebar.submenu.analytics')} expanded={expanded} />
            </MenuItem>

            <MenuItem
              icon={icons.FolderOpen}
              label={t('sidebar.menu.compliance')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.conformite}
              onToggle={() => toggleMenu('conformite')}
            >
              <SubMenuItem
                icon={icons.FolderLock}
                label={t('sidebar.submenu.dossiers')}
                expanded={expanded}
                badge="NEW"
                badgeColor="blue"
                isActive={currentPage === 'dossiers'}
                onClick={() => onPageChange?.('dossiers')}
              />
              <SubMenuItem
                icon={icons.UserCircle}
                label={t('sidebar.submenu.entities')}
                expanded={expanded}
                badge={!entitiesManagementEnabled ? 'NEW' : undefined}
                badgeColor="blue"
                isActive={currentPage === 'entities'}
                onClick={() => onPageChange?.('entities')}
              />
              <SubMenuItem
                icon={icons.AlertTriangle}
                label={t('sidebar.submenu.alerts')}
                expanded={expanded}
                badge={!entitiesManagementEnabled ? 'NEW' : (pendingAlertsCount > 0 ? pendingAlertsCount.toString() : undefined)}
                badgeColor={!entitiesManagementEnabled ? 'blue' : 'red'}
                isActive={currentPage === 'monitoring'}
                onClick={() => onPageChange?.('monitoring')}
              />
            </MenuItem>

            <MenuItem
              icon={icons.UsersRound}
              label={t('sidebar.menu.investors')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.investisseurs}
              onToggle={() => toggleMenu('investisseurs')}
            >
              <SubMenuItem
                icon={icons.Users}
                label={t('sidebar.submenu.investors')}
                expanded={expanded}
                isActive={currentPage === 'investors'}
                onClick={() => onPageChange?.('investors')}
              />
              <SubMenuItem
                icon={icons.FileCheck}
                label={t('sidebar.submenu.subscriptions')}
                expanded={expanded}
                isActive={currentPage === 'subscriptions'}
                onClick={() => onPageChange?.('subscriptions')}
              />
            </MenuItem>

            <MenuItem
              icon={icons.Handshake}
              label={t('sidebar.menu.partners')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.partenaires}
              onToggle={() => toggleMenu('partenaires')}
            >
              <SubMenuItem
                icon={icons.Users}
                label={t('sidebar.submenu.partners')}
                expanded={expanded}
                onClick={() => navigateToPage('partners')}
                active={currentPage === 'partners'}
              />
              <SubMenuItem
                icon={icons.ArrowLeftRight}
                label={t('sidebar.submenu.retrocessions')}
                expanded={expanded}
                onClick={() => onPageChange?.('retrocessions')}
                active={currentPage === 'retrocessions'}
              />
              <SubMenuItem
                icon={icons.FileSignature}
                label={t('sidebar.submenu.conventions')}
                expanded={expanded}
                onClick={() => navigateToPage('settings-conventions')}
                active={currentPage === 'settings-conventions'}
              />
            </MenuItem>

            <MenuItem
              icon={icons.TrendingUp}
              label={t('sidebar.menu.participations')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.participations}
              onToggle={() => toggleMenu('participations')}
            >
              <SubMenuItem icon={icons.BarChart3} label={t('sidebar.submenu.portfolio')} expanded={expanded} />
              <SubMenuItem icon={icons.TrendingUp} label={t('sidebar.submenu.performance')} expanded={expanded} />
            </MenuItem>

            <MenuItem
              icon={icons.Briefcase}
              label={t('sidebar.menu.fundLife')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.fundlife}
              onToggle={() => toggleMenu('fundlife')}
            >
              <SubMenuItem
                icon={icons.Briefcase}
                label={t('sidebar.submenu.allFunds')}
                expanded={expanded}
                isActive={currentPage === 'allfunds'}
                onClick={() => onPageChange?.('allfunds')}
              />
              <SubMenuItem icon={icons.Settings} label={t('sidebar.submenu.settings')} expanded={expanded} />
              <SubMenuItem icon={icons.DollarSign} label={t('sidebar.submenu.calls')} expanded={expanded} />
              <SubMenuItem icon={icons.Wallet} label={t('sidebar.submenu.capitalAccounts')} expanded={expanded} />
              <SubMenuItem icon={icons.ArrowDownCircle} label={t('sidebar.submenu.distributions')} expanded={expanded} />
              <SubMenuItem icon={icons.TrendingDown} label={t('sidebar.submenu.cashFlowForecasts')} expanded={expanded} />
              <SubMenuItem icon={icons.FileText} label={t('sidebar.submenu.contracts')} expanded={expanded} />
              <SubMenuItem icon={icons.FileCheck} label={t('sidebar.submenu.subscriptions')} expanded={expanded} />
              <SubMenuItem icon={icons.Repeat} label={t('sidebar.submenu.transfers')} expanded={expanded} />
              <SubMenuItem icon={icons.Calendar} label={t('sidebar.submenu.events')} expanded={expanded} />
              <SubMenuItem icon={icons.Store} label={t('sidebar.submenu.secondaryMarket')} expanded={expanded} />
            </MenuItem>

            <MenuItem
              icon={icons.FolderOpen}
              label={t('sidebar.menu.dataRoom')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.dataroom}
              onToggle={() => toggleMenu('dataroom')}
            >
              <SubMenuItem
                icon={icons.Folder}
                label={t('sidebar.submenu.documents')}
                expanded={expanded}
                badge={!entitiesManagementEnabled ? 'NEW' : undefined}
                badgeColor="blue"
                isActive={currentPage === 'documents'}
                onClick={() => onPageChange?.('documents')}
              />
              <SubMenuItem
                icon={icons.Activity}
                label={t('sidebar.submenu.birdView')}
                expanded={expanded}
                isActive={currentPage === 'birdview'}
                onClick={() => onPageChange?.('birdview')}
              />
            </MenuItem>

            <MenuItem
              icon={icons.ExternalLink}
              label={t('sidebar.menu.portalsAndContent')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.portails}
              onToggle={() => toggleMenu('portails')}
            >
              <SubMenuItem icon={icons.Globe} label={t('sidebar.submenu.brandingTheme')} expanded={expanded} />
              <SubMenuItem icon={icons.Users} label={t('sidebar.submenu.partnersNavigation')} expanded={expanded} />
              <SubMenuItem icon={icons.Building2} label={t('sidebar.submenu.investorsNavigation')} expanded={expanded} />
              <SubMenuItem icon={icons.TrendingUp} label={t('sidebar.submenu.participationsNavigation')} expanded={expanded} />
              <SubMenuItem
                icon={icons.Database}
                label="DataHub"
                expanded={expanded}
                isActive={currentPage === 'datahub'}
                onClick={() => onPageChange?.('datahub')}
                badge="NEW"
              />
              <SubMenuItem icon={icons.FileText} label={t('sidebar.submenu.editor')} expanded={expanded} />
              <SubMenuItem icon={icons.MessageSquare} label={t('sidebar.submenu.contactForms')} expanded={expanded} />
              <SubMenuItem
                icon={icons.FileText}
                label={t('sidebar.submenu.news')}
                expanded={expanded}
                isActive={currentPage === 'news'}
                onClick={() => onPageChange?.('news')}
              />
              <SubMenuItem
                icon={icons.Calendar}
                label={t('sidebar.submenu.eventsPortal')}
                expanded={expanded}
                isActive={currentPage === 'events'}
                onClick={() => onPageChange?.('events')}
              />
              <SubMenuItem icon={icons.LifeBuoy} label={t('sidebar.submenu.faq')} expanded={expanded} />
              <SubMenuItem icon={icons.Users} label={t('sidebar.submenu.contacts')} expanded={expanded} />
              <SubMenuItem icon={icons.Globe} label={t('sidebar.submenu.translations')} expanded={expanded} />
              <SubMenuItem icon={icons.Shield} label={t('sidebar.submenu.disclaimers')} expanded={expanded} />
            </MenuItem>

            <MenuItem
              icon={icons.Send}
              label={t('sidebar.menu.communications')}
              expanded={expanded}
              hasSubmenu
              isOpen={openMenus.communications}
              onToggle={() => toggleMenu('communications')}
            >
              <SubMenuItem icon={icons.Send} label={t('sidebar.submenu.messages')} expanded={expanded} />
              <SubMenuItem icon={icons.MessageSquare} label={t('sidebar.submenu.notifications')} expanded={expanded} />
            </MenuItem>
          </>
        )}
        
        <div className={!settingsFocusMode ? "mt-3 pt-3 border-t border-[#E5E5E5] dark:border-[#1A1A1A]" : ""}>
          <MenuItem
            icon={icons.Settings}
            label={t('sidebar.menu.settings')}
            expanded={expanded}
            hasSubmenu
            isOpen={openMenus.settings}
            onToggle={() => toggleMenu('settings')}
          >
            <SubMenuItem
              icon={icons.Package}
              label={t('sidebar.submenu.appStore')}
              expanded={expanded}
              isActive={currentPage === 'settings-app-store'}
              onClick={() => onPageChange?.('settings-app-store')}
            />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.usersAccess')}</div>}
            <SubMenuItem icon={icons.Users} label={t('sidebar.submenu.users')} expanded={expanded} isActive={currentPage === 'settings-users'} onClick={() => onPageChange?.('settings-users')} />
            <SubMenuItem icon={icons.Users} label={t('sidebar.submenu.teams')} expanded={expanded} isActive={currentPage === 'settings-teams'} onClick={() => onPageChange?.('settings-teams')} />
            <SubMenuItem icon={icons.Shield} label={t('sidebar.submenu.rights')} expanded={expanded} isActive={currentPage === 'settings-rights'} onClick={() => onPageChange?.('settings-rights')} />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.communication')}</div>}
            <SubMenuItem icon={icons.Mail} label={t('sidebar.submenu.mailHistory')} expanded={expanded} isActive={currentPage === 'settings-mail-history'} onClick={() => onPageChange?.('settings-mail-history')} />
            <SubMenuItem icon={icons.MessageSquare} label={t('sidebar.submenu.smsHistory')} expanded={expanded} isActive={currentPage === 'settings-sms-history'} onClick={() => onPageChange?.('settings-sms-history')} />
            <SubMenuItem icon={icons.FileText} label={t('sidebar.submenu.mailTemplates')} expanded={expanded} isActive={currentPage === 'settings-mail-templates'} onClick={() => onPageChange?.('settings-mail-templates')} />
            <SubMenuItem icon={icons.BarChart3} label={t('sidebar.submenu.mailStats')} expanded={expanded} isActive={currentPage === 'settings-mail-stats'} onClick={() => onPageChange?.('settings-mail-stats')} />
            <SubMenuItem icon={icons.Users} label={t('sidebar.submenu.mailGroups')} expanded={expanded} isActive={currentPage === 'settings-mail-groups'} onClick={() => onPageChange?.('settings-mail-groups')} />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.configuration')}</div>}
            <SubMenuItem icon={icons.FileCheck} label={t('sidebar.submenu.investorStatus')} expanded={expanded} isActive={currentPage === 'settings-investor-status'} onClick={() => onPageChange?.('settings-investor-status')} />
            <SubMenuItem icon={icons.FileCheck} label={t('sidebar.submenu.dealStatus')} expanded={expanded} isActive={currentPage === 'settings-deal-status'} onClick={() => onPageChange?.('settings-deal-status')} />
            <SubMenuItem icon={icons.Folder} label={t('sidebar.submenu.dealTypes')} expanded={expanded} isActive={currentPage === 'settings-deal-types'} onClick={() => onPageChange?.('settings-deal-types')} />
            <SubMenuItem icon={icons.TrendingUp} label={t('sidebar.submenu.flowTypes')} expanded={expanded} isActive={currentPage === 'settings-flow-types'} onClick={() => onPageChange?.('settings-flow-types')} />
            <SubMenuItem icon={icons.Building2} label={t('sidebar.submenu.managementCompanies')} expanded={expanded} isActive={currentPage === 'settings-management-companies'} onClick={() => onPageChange?.('settings-management-companies')} />
            <SubMenuItem icon={icons.FileText} label={t('sidebar.submenu.customFields')} expanded={expanded} isActive={currentPage === 'settings-custom-fields'} onClick={() => onPageChange?.('settings-custom-fields')} />
            <SubMenuItem icon={icons.FileCheck} label={t('sidebar.submenu.customStatus')} expanded={expanded} isActive={currentPage === 'settings-custom-status'} onClick={() => onPageChange?.('settings-custom-status')} />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.dataSecurity')}</div>}
            <SubMenuItem icon={icons.Globe} label={t('sidebar.submenu.countriesRisks')} expanded={expanded} isActive={currentPage === 'settings-countries-risks'} onClick={() => onPageChange?.('settings-countries-risks')} />
            <SubMenuItem icon={icons.Building2} label={t('sidebar.submenu.providers')} expanded={expanded} isActive={currentPage === 'settings-providers'} onClick={() => onPageChange?.('settings-providers')} />
            <SubMenuItem icon={icons.BarChart3} label={t('sidebar.submenu.chartOfAccounts')} expanded={expanded} isActive={currentPage === 'settings-chart-of-accounts'} onClick={() => onPageChange?.('settings-chart-of-accounts')} />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.logsMonitoring')}</div>}
            <SubMenuItem icon={icons.Database} label={t('sidebar.submenu.logs')} expanded={expanded} isActive={currentPage === 'settings-logs'} onClick={() => onPageChange?.('settings-logs')} />
            <SubMenuItem icon={icons.Database} label={t('sidebar.submenu.logsLemonway')} expanded={expanded} isActive={currentPage === 'settings-logs-lemonway'} onClick={() => onPageChange?.('settings-logs-lemonway')} />
            <SubMenuItem icon={icons.Database} label={t('sidebar.submenu.logsHarvest')} expanded={expanded} isActive={currentPage === 'settings-logs-harvest'} onClick={() => onPageChange?.('settings-logs-harvest')} />
            <SubMenuItem icon={icons.Shield} label={t('sidebar.submenu.knownIps')} expanded={expanded} isActive={currentPage === 'settings-known-ips'} onClick={() => onPageChange?.('settings-known-ips')} />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.integrations')}</div>}
            <SubMenuItem icon={icons.FileText} label={t('sidebar.submenu.docusign')} expanded={expanded} isActive={currentPage === 'settings-docusign'} onClick={() => onPageChange?.('settings-docusign')} />
            <SubMenuItem icon={icons.Shield} label={t('sidebar.submenu.controls')} expanded={expanded} isActive={currentPage === 'settings-controls'} onClick={() => onPageChange?.('settings-controls')} />
            <SubMenuItem icon={icons.Shield} label={t('sidebar.submenu.aics')} expanded={expanded} isActive={currentPage === 'settings-aics'} onClick={() => onPageChange?.('settings-aics')} />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.importsFiles')}</div>}
            <SubMenuItem icon={icons.Upload} label={t('sidebar.submenu.imports')} expanded={expanded} isActive={currentPage === 'settings-imports'} onClick={() => onPageChange?.('settings-imports')} />
            <SubMenuItem icon={icons.Folder} label={t('sidebar.submenu.hostedFiles')} expanded={expanded} isActive={currentPage === 'settings-hosted-files'} onClick={() => onPageChange?.('settings-hosted-files')} />
            <SubMenuItem icon={icons.Folder} label={t('sidebar.submenu.sectionCategories')} expanded={expanded} isActive={currentPage === 'settings-section-categories'} onClick={() => onPageChange?.('settings-section-categories')} />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.reporting')}</div>}
            <SubMenuItem icon={icons.BarChart3} label={t('sidebar.submenu.reporting')} expanded={expanded} isActive={currentPage === 'settings-reporting'} onClick={() => onPageChange?.('settings-reporting')} />
            <SubMenuItem icon={icons.FileText} label={t('sidebar.submenu.reports')} expanded={expanded} isActive={currentPage === 'settings-reports'} onClick={() => onPageChange?.('settings-reports')} />
            <SubMenuItem icon={icons.Database} label={t('sidebar.submenu.queries')} expanded={expanded} isActive={currentPage === 'settings-queries'} onClick={() => onPageChange?.('settings-queries')} />
            <SubMenuItem icon={icons.FileText} label={t('sidebar.submenu.variableFormatting')} expanded={expanded} isActive={currentPage === 'settings-variable-formatting'} onClick={() => onPageChange?.('settings-variable-formatting')} />

            {expanded && <div className="h-px bg-[#E5E5E5] dark:bg-[#1A1A1A] my-1.5 mx-3" />}
            {expanded && <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A1A1A1] dark:text-[#525252]">{t('sidebar.section.tools')}</div>}
            <SubMenuItem icon={icons.Wrench} label={t('sidebar.submenu.tools')} expanded={expanded} isActive={currentPage === 'settings-tools'} onClick={() => onPageChange?.('settings-tools')} />
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
  onClick?: () => void;
  isActive?: boolean;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

function MenuItem({ icon, label, expanded, hasSubmenu, isOpen, onToggle, onClick, isActive, badge, children }: MenuItemProps) {
  return (
    <div className="mb-0.5">
      <motion.button
        whileHover={{ x: expanded ? 2 : 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={hasSubmenu ? onToggle : onClick}
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
        {badge && expanded && (
          <span className="ml-auto flex items-center">{badge}</span>
        )}
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
