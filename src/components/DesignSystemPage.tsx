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
import logoInvestHub from 'figma:asset/2a84b4397fac896d4ed7e7f4faff09c957de9a6b.png';

type ComponentMeta = {
  name: string;
  file: string;
  role: string;
  status: 'stable' | 'beta';
};

type DoctrineItem = {
  title: string;
  goal: string;
  implications: string[];
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

const primaryBrandColors = [
  { name: 'Bleu solide', hex: '#000E2B', textClass: 'text-white' },
  { name: 'Bleu financier', hex: '#0A3D4A', textClass: 'text-white' },
  { name: 'Vert croissance', hex: '#25563F', textClass: 'text-white' },
  { name: 'Écru papier', hex: '#D9D8CB', textClass: 'text-[#153943]' },
];

const functionalColors = [
  { name: 'Rouge interdiction', usage: 'Erreurs / suppression / blocage', hex: '#DC2626', tailwind: 'red-600', bg: 'bg-red-600' },
  { name: 'Orange warning', usage: 'Avertissement / attention', hex: '#F97316', tailwind: 'orange-500', bg: 'bg-orange-500' },
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

const doctrinePillars: DoctrineItem[] = [
  {
    title: '1) Accélération business & valeur client',
    goal: 'Livrer plus vite de la valeur utile, activable immédiatement.',
    implications: [
      'Time-to-market > perfection technique.',
      'Découpage en lots courts (≤ 1 mois) + validation interne puis client.',
      'Priorisation pilotée par usage réel, criticité et pain points.',
    ],
  },
  {
    title: '2) Simplicité & expérience utilisateur',
    goal: 'Réduire l’effort de compréhension dès la première utilisation.',
    implications: [
      'Explicabilité systémique : labels, feedbacks, droits et erreurs clairs.',
      'Micro-interactions systématiques : une action = une réaction visible.',
      'Suppression des options peu utilisées ou à faible valeur.',
    ],
  },
  {
    title: '3) Qualité, robustesse & observabilité',
    goal: 'Stabilité et détection proactive avant remontée client.',
    implications: [
      'Aucune migration de module sans tests automatiques.',
      'Comportements d’erreur standardisés + logs exploitables.',
      'Monitoring et tracking d’usage pour prioriser avec de la donnée.',
    ],
  },
  {
    title: '4) Scalabilité produit & excellence technique',
    goal: 'Homogénéité, modularité et progression sans régression.',
    implications: [
      'Design System obligatoire + conventions partagées.',
      'Migration brique par brique, modules isolables/remplaçables.',
      'Coexistence v1/v3, rollback possible et migration transparente.',
    ],
  },
];

const v3Checklist = [
  'Chaque composant doit expliciter ses états : default / loading / empty / error / success.',
  'Chaque action utilisateur doit afficher un feedback immédiat (loader, toast, état disabled).',
  'Chaque composant data-first doit supporter skeleton et pagination.',
  'Chaque écran doit distinguer clairement les usages client vs besoins Ops/support.',
  'Chaque nouveauté doit être instrumentée (usage + erreurs) pour prioriser les itérations.',
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
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-2">Identité de marque</h2>
        <p className="text-sm text-[#4F6166] dark:text-[#9DB2AE] mb-4">
          Le logo InvestHub doit être présent sur les zones d’identité (sidebar, login, exports) avec un contraste fort et un espace de respiration suffisant.
        </p>
        <div className="rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A] p-4 bg-[#F8FAFA] dark:bg-[#0F1716]">
          <img src={logoInvestHub} alt="Logo InvestHub" className="h-16 w-auto" />
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">4 couleurs principales (branding)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {primaryBrandColors.map((color) => (
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
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">Couleurs fonctionnelles (hors charte branding)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {functionalColors.map((color) => (
            <article key={color.name} className="rounded-xl border border-[#D4DCDA] dark:border-[#1F2D2A] p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-5 h-5 rounded-full ${color.bg}`} />
                <p className="font-semibold text-[#1F3137] dark:text-[#E8F0EE]">{color.name}</p>
              </div>
              <p className="text-sm text-[#4F6166] dark:text-[#9DB2AE]">{color.usage}</p>
              <div className="mt-3 text-xs flex items-center gap-3">
                <code className="text-[#456B6C] dark:text-[#9BD1C5]">{color.hex}</code>
                <span className="text-[#6A8084] dark:text-[#93AAA6]">({color.tailwind})</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">Doctrine V3 — Piliers fondateurs</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          {doctrinePillars.map((pillar) => (
            <article key={pillar.title} className="rounded-xl border border-[#DDE8E4] dark:border-[#1B2B27] p-4">
              <h3 className="font-semibold text-[#1F3137] dark:text-[#E8F0EE]">{pillar.title}</h3>
              <p className="text-sm text-[#4F6166] dark:text-[#9DB2AE] mt-1">{pillar.goal}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-[#3E575C] dark:text-[#B7CCC7] list-disc pl-5">
                {pillar.implications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
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

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-3">Checklist d’alignement Doctrine V3</h2>
        <ul className="space-y-2 text-sm text-[#415C61] dark:text-[#A9C1BB]">
          {v3Checklist.map((rule) => (
            <li key={rule} className="flex items-start gap-2">
              <BadgeCheck className="w-4 h-4 mt-0.5 text-[#3F7358]" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
