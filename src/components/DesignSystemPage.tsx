import {
  Users,
  User,
  FileSignature,
  Layers,
  ChartLine,
  Shield,
  Handshake,
  UserRoundCog,
  PieChart,
  File,
  Landmark,
  Settings,
  Phone,
  Wallet,
  Banknote,
  RotateCcw,
  FileText,
  ArrowLeftRight,
  Calendar,
  Search,
  TriangleAlert,
  Receipt,
  Building2,
  RefreshCw,
  Clipboard,
  UserPlus,
  CircleHelp,
  Briefcase,
  Globe,
  Palette,
  Compass,
  SquarePen,
  Newspaper,
  Languages,
  BarChart3,
  FileSpreadsheet,
  Mail,
  Clapperboard,
  UsersRound,
  FileClock,
  FileInput,
  Truck,
  BookOpen,
  Database,
  Table,
  Filter,
  Columns3,
  ArrowUpDown,
  Eye,
  Download,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react';

type ComponentMeta = {
  name: string;
  file: string;
  role: string;
  status: 'stable' | 'beta';
};

const colorTokens = [
  { name: 'Noir brut', hex: '#000000', textClass: 'text-white' },
  { name: 'Marron', hex: '#2E211C', textClass: 'text-white' },
  { name: 'Vert de gris', hex: '#456B6C', textClass: 'text-white' },
  { name: 'Bleu xxx', hex: '#8DB4B8', textClass: 'text-white' },
  { name: 'Vert forêt', hex: '#3F7358', textClass: 'text-white' },
  { name: 'Vert lumière', hex: '#B6E68A', textClass: 'text-[#213547]' },
  { name: 'Beige clair', hex: '#B4AEA4', textClass: 'text-[#213547]' },
  { name: 'Blanc pur', hex: '#FFFFFF', textClass: 'text-[#213547]' },
];

const metierIcons: Array<{ label: string; className: string; icon: LucideIcon }> = [
  { label: 'Tous les investisseurs', className: 'fa-users', icon: Users },
  { label: 'Profil Investisseur', className: 'fa-user', icon: User },
  { label: 'Souscriptions', className: 'fa-file-signature', icon: FileSignature },
  { label: 'Segments', className: 'fa-layer-group', icon: Layers },
  { label: 'Statistiques', className: 'fa-chart-line', icon: ChartLine },
  { label: 'Campagnes KYC', className: 'fa-shield', icon: Shield },
  { label: 'Partenaires', className: 'fa-handshake', icon: Handshake },
  { label: 'Conseillers', className: 'fa-user-tie', icon: UserRoundCog },
  { label: 'Participations', className: 'fa-chart-pie', icon: PieChart },
  { label: 'Documents', className: 'fa-file', icon: File },
  { label: 'Fonds', className: 'fa-building-columns', icon: Landmark },
  { label: 'Paramètres', className: 'fa-gear', icon: Settings },
  { label: 'Appels', className: 'fa-phone', icon: Phone },
  { label: 'Capital accounts', className: 'fa-wallet', icon: Wallet },
  { label: 'Distributions', className: 'fa-money-bill', icon: Banknote },
  { label: 'Rachats', className: 'fa-arrow-rotate-left', icon: RotateCcw },
  { label: 'Contrats', className: 'fa-file-contract', icon: FileText },
  { label: 'Transferts', className: 'fa-right-left', icon: ArrowLeftRight },
  { label: 'Évènements', className: 'fa-calendar', icon: Calendar },
  { label: 'Screening', className: 'fa-magnifying-glass', icon: Search },
  { label: 'Alertes / Risque', className: 'fa-triangle-exclamation', icon: TriangleAlert },
  { label: 'Factures', className: 'fa-file-invoice', icon: Receipt },
  { label: 'Comptes bancaires', className: 'fa-building', icon: Building2 },
  { label: 'Opérations', className: 'fa-arrows-rotate', icon: RefreshCw },
  { label: 'Formulaires / Sondages', className: 'fa-clipboard', icon: Clipboard },
  { label: 'Onboarding', className: 'fa-user-plus', icon: UserPlus },
  { label: 'Questions', className: 'fa-circle-question', icon: CircleHelp },
  { label: 'Dealflow', className: 'fa-briefcase', icon: Briefcase },
  { label: 'Portail', className: 'fa-globe', icon: Globe },
  { label: 'Branding', className: 'fa-palette', icon: Palette },
  { label: 'Navigation', className: 'fa-compass', icon: Compass },
  { label: 'Éditeur', className: 'fa-pen-to-square', icon: SquarePen },
  { label: 'Actualités', className: 'fa-newspaper', icon: Newspaper },
  { label: 'Traductions', className: 'fa-language', icon: Languages },
  { label: 'Reporting', className: 'fa-chart-column', icon: BarChart3 },
  { label: 'Excel', className: 'fa-file-excel', icon: FileSpreadsheet },
  { label: 'Communication', className: 'fa-envelope', icon: Mail },
  { label: 'Campagnes', className: 'fa-clapperboard', icon: Clapperboard },
  { label: 'Équipe', className: 'fa-people-group', icon: UsersRound },
  { label: 'Logs', className: 'fa-file-lines', icon: FileClock },
  { label: 'Imports', className: 'fa-file-import', icon: FileInput },
  { label: 'Fournisseurs', className: 'fa-truck', icon: Truck },
  { label: 'Plan comptable', className: 'fa-book', icon: BookOpen },
  { label: 'Requêtes', className: 'fa-database', icon: Database },
];

const tableComponents: ComponentMeta[] = [
  { name: 'DataTable', file: 'src/components/DataTable.tsx', role: 'Table générique tri/filtre', status: 'stable' },
  { name: 'InvestorDataTable', file: 'src/components/InvestorDataTable.tsx', role: 'Table investisseurs', status: 'stable' },
  { name: 'SubscriptionDataTable', file: 'src/components/SubscriptionDataTable.tsx', role: 'Table souscriptions', status: 'stable' },
  { name: 'SubscriptionDynamicTable', file: 'src/components/SubscriptionDynamicTable.tsx', role: 'Table dynamique colonnes', status: 'beta' },
  { name: 'AlertDataTable', file: 'src/components/AlertDataTable.tsx', role: 'Table alertes conformité', status: 'stable' },
  { name: 'TableSkeleton', file: 'src/components/TableSkeleton.tsx', role: 'État de chargement tableau', status: 'stable' },
  { name: 'StatusBadge', file: 'src/components/StatusBadge.tsx', role: 'Statut visuel en cellule', status: 'stable' },
  { name: 'DateTimeCell', file: 'src/components/DateTimeCell.tsx', role: 'Format date/heure', status: 'stable' },
  { name: 'SubscriptionNameCell', file: 'src/components/SubscriptionNameCell.tsx', role: 'Cellule métier souscription', status: 'stable' },
  { name: 'SignatureProgressCell', file: 'src/components/SignatureProgressCell.tsx', role: 'Progression signature', status: 'stable' },
  { name: 'FundShareCell', file: 'src/components/FundShareCell.tsx', role: 'Valeurs de part de fonds', status: 'stable' },
  { name: 'CalledAmountCell', file: 'src/components/CalledAmountCell.tsx', role: 'Montant appelé', status: 'stable' },
];

const coreComponents: ComponentMeta[] = [
  { name: 'Button', file: 'src/components/ui/button.tsx', role: 'Actions principales', status: 'stable' },
  { name: 'Input', file: 'src/components/ui/input.tsx', role: 'Saisie texte', status: 'stable' },
  { name: 'Select', file: 'src/components/ui/select.tsx', role: 'Choix unique', status: 'stable' },
  { name: 'Dialog', file: 'src/components/ui/dialog.tsx', role: 'Modales', status: 'stable' },
  { name: 'DropdownMenu', file: 'src/components/ui/dropdown-menu.tsx', role: 'Menus contextuels', status: 'stable' },
  { name: 'Tabs', file: 'src/components/ui/tabs.tsx', role: 'Navigation secondaire', status: 'stable' },
  { name: 'Tooltip', file: 'src/components/ui/tooltip.tsx', role: 'Aide contextuelle', status: 'stable' },
  { name: 'Pagination', file: 'src/components/ui/pagination.tsx', role: 'Pagination standard', status: 'stable' },
  { name: 'Badge', file: 'src/components/ui/badge.tsx', role: 'Indicateurs compacts', status: 'stable' },
  { name: 'Card', file: 'src/components/ui/card.tsx', role: 'Conteneur contenu', status: 'stable' },
];

function ComponentLibraryTable({ title, items, icon: Icon }: { title: string; items: ComponentMeta[]; icon: LucideIcon }) {
  return (
    <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[#3F7358]" />
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE]">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-[#E2E8E6] dark:border-[#1F2D2A]">
              <th className="py-2 pr-4">Composant</th>
              <th className="py-2 pr-4">Rôle</th>
              <th className="py-2 pr-4">Fichier</th>
              <th className="py-2">État</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name} className="border-b border-[#EEF3F1] dark:border-[#15201D] align-top">
                <td className="py-2 pr-4 font-medium text-[#1F3137] dark:text-[#E8F0EE]">{item.name}</td>
                <td className="py-2 pr-4 text-[#4F6166] dark:text-[#9DB2AE]">{item.role}</td>
                <td className="py-2 pr-4"><code className="text-xs text-[#456B6C] dark:text-[#9BD1C5]">{item.file}</code></td>
                <td className="py-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${item.status === 'stable' ? 'bg-[#E9F6EF] text-[#2E6B4E]' : 'bg-[#FFF6E5] text-[#966500]'}`}>
                    <BadgeCheck className="w-3 h-3" />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DesignSystemPage() {
  return (
    <div className="flex-1 overflow-auto px-6 py-6 space-y-6 bg-[#F8FAFA] dark:bg-[#0B0D0D]">
      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#456B6C] mb-2">Design System</p>
        <h1 className="text-3xl font-semibold text-[#1F3137] dark:text-[#E8F0EE]">InvestHub Foundation</h1>
        <p className="mt-2 text-sm text-[#4F6166] dark:text-[#9DB2AE] max-w-4xl">
          Bibliothèque complète des composants. On commence par la couche tableaux (data-intensive), puis les composants coeur.
        </p>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">Couleurs de base</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {colorTokens.map((color) => (
            <article key={color.name} className="rounded-xl overflow-hidden border border-[#D4DCDA] dark:border-[#1F2D2A]">
              <div className={`h-28 p-4 ${color.textClass}`} style={{ backgroundColor: color.hex }}>
                <p className="text-base font-semibold">{color.name}</p>
              </div>
              <div className="p-3 bg-white dark:bg-[#0F1514] text-sm">
                <code className="text-[#456B6C] dark:text-[#9BD1C5]">{color.hex}</code>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">Icônes métier (style line)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {metierIcons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-lg border border-[#D7E0DD] dark:border-[#1F2D2A] px-3 py-2.5 flex items-center justify-between gap-2 bg-[#FCFDFC] dark:bg-[#101716]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 text-[#3F7358] flex-shrink-0" />
                  <span className="text-xs text-[#2A4148] dark:text-[#D7E6E2] truncate">{item.label}</span>
                </div>
                <code className="text-[11px] text-[#5A7376] dark:text-[#9DB2AE]">{item.className}</code>
              </div>
            );
          })}
        </div>
      </section>

      <ComponentLibraryTable title="01 — Composants Tableaux" items={tableComponents} icon={Table} />
      <ComponentLibraryTable title="02 — Filtres / Colonnes / Data UX" items={[
        { name: 'FilterBar', file: 'src/components/FilterBar.tsx', role: 'Barre filtres globale', status: 'stable' },
        { name: 'DocumentFilterBar', file: 'src/components/DocumentFilterBar.tsx', role: 'Filtres documents', status: 'stable' },
        { name: 'InvestorFilterBar', file: 'src/components/InvestorFilterBar.tsx', role: 'Filtres investisseurs', status: 'stable' },
        { name: 'PartnerFilterBar', file: 'src/components/PartnerFilterBar.tsx', role: 'Filtres partenaires', status: 'stable' },
        { name: 'StatusTabs', file: 'src/components/StatusTabs.tsx', role: 'Segments de statut', status: 'stable' },
        { name: 'SubscriptionStatusTabs', file: 'src/components/SubscriptionStatusTabs.tsx', role: 'Tabs statut souscriptions', status: 'stable' },
      ]} icon={Filter} />
      <ComponentLibraryTable title="03 — Composants Core UI" items={coreComponents} icon={Columns3} />

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">Guidelines d’usage</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A] p-4"><Table className="w-4 h-4 mb-2 text-[#3F7358]" /><p className="font-semibold">Data d’abord</p><p className="mt-2 text-[#4F6166] dark:text-[#9DB2AE]">Commencer par les composants tableaux pour cadrer les colonnes, tri, filtres et actions bulk.</p></div>
          <div className="rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A] p-4"><ArrowUpDown className="w-4 h-4 mb-2 text-[#3F7358]" /><p className="font-semibold">Interaction explicite</p><p className="mt-2 text-[#4F6166] dark:text-[#9DB2AE]">Chaque action de colonne doit avoir un état hover, sorting actif, et feedback visuel immédiat.</p></div>
          <div className="rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A] p-4"><Eye className="w-4 h-4 mb-2 text-[#3F7358]" /><p className="font-semibold">Lisibilité opérationnelle</p><p className="mt-2 text-[#4F6166] dark:text-[#9DB2AE]">Cellules clés en priorité visuelle, labels courts, et exports contextualisés.</p></div>
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-[#C5D4CF] dark:border-[#2C413B] px-4 py-3 text-sm text-[#4F6166] dark:text-[#9DB2AE] flex items-center gap-2">
          <Download className="w-4 h-4" />
          Prochaine étape : enrichir la bibliothèque avec exemples interactifs composant par composant.
        </div>
      </section>
    </div>
  );
}
