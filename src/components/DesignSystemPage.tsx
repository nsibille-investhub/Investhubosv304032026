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
  Plus,
  MoreVertical,
  Copy,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { motion } from 'motion/react';
import logoInvestHub from 'figma:asset/2a84b4397fac896d4ed7e7f4faff09c957de9a6b.png';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ClickableText } from './ClickableText';
import { StatusBadge } from './StatusBadge';
import { Tag } from './Tag';
import { ContactsCard } from './ContactsCard';
import { StructuresCell } from './StructuresCell';
import { LastActivityCard } from './LastActivityCard';
import { OriginStructureCell } from './OriginStructureCell';
import { PartnerOriginCell } from './PartnerOriginCell';
import { FolderSelectionTreeviewDropdown } from './DocumentAddModal';
import type { Contact, LegalStructure } from '../utils/investorGenerator';

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

const folderSelectorDemoOptions = (() => {
  const options = [{ id: 'root', label: 'Racine / Documents' }];
  for (let branch = 1; branch <= 12; branch += 1) {
    let currentPath = 'Racine / Documents';
    for (let level = 1; level <= 5; level += 1) {
      currentPath = `${currentPath} / Dossier ${branch}.${level}`;
      options.push({
        id: `branch-${branch}-level-${level}`,
        label: currentPath,
      });
    }
  }
  return options;
})();

const iconFamilies: Array<{
  family: string;
  items: Array<{ name: string; code: string; icon: LucideIcon }>;
}> = [
  {
    family: 'accounting',
    items: [
      { name: 'Gestion > Factures en attente', code: 'accounting-pending', icon: Receipt },
      { name: 'Gestion > Toutes les pièces', code: 'accounting-all', icon: FileText },
      { name: 'Gestion > Exports', code: 'accounting-exports', icon: FileSpreadsheet },
      { name: 'Paramètres > Fournisseurs', code: 'settings-suppliers', icon: Truck },
      { name: 'Paramètres > Comptes bancaires', code: 'settings-accounts', icon: Landmark },
      { name: 'Paramètres > Plan comptable', code: 'settings-accounting', icon: BookOpen },
    ],
  },
  {
    family: 'administration',
    items: [
      { name: 'Paramètres > Utilisateurs', code: 'settings-users', icon: Users },
      { name: 'Paramètres > Outils', code: 'settings-tools', icon: Settings },
      { name: 'Paramètres > Champs personnalisés', code: 'settings-fields', icon: Clipboard },
      { name: 'Onboardings', code: 'onboardings', icon: UserPlus },
      { name: 'Paramètres > Droits', code: 'settings-rights', icon: Shield },
      { name: 'Paramètres > Requêtes', code: 'settings-queries', icon: Database },
    ],
  },
  {
    family: 'communication',
    items: [
      { name: 'Outils > Communication', code: 'tools-comm', icon: Mail },
      { name: 'Outils > Sondages', code: 'tools-surveys', icon: Clipboard },
      { name: 'Paramètres > Historique mails', code: 'settings-history', icon: FileClock },
      { name: 'Paramètres > Historique SMS', code: 'settings-smshistory', icon: FileText },
      { name: 'Paramètres > Gabarits mails', code: 'settings-templates', icon: FileText },
    ],
  },
  {
    family: 'compliance',
    items: [
      { name: 'Campagnes > Validation', code: 'campaigns-validation', icon: Shield },
      { name: 'Investisseurs > Campagnes KYC', code: 'investors-kycs', icon: UserRoundCog },
      { name: 'Screening > Worldcheck', code: 'worldchecks', icon: Search },
      { name: 'Screening > Alertes', code: 'worldchecks-alerts', icon: TriangleAlert },
      { name: 'Screening > Orias checks', code: 'oriaschecks', icon: Search },
      { name: 'Screening > Alertes Orias', code: 'oriaschecks-alerts', icon: TriangleAlert },
    ],
  },
  {
    family: 'funds',
    items: [
      { name: 'Fonds', code: 'funds', icon: Landmark },
      { name: 'Fonds > Rachats', code: 'funds-rebuy', icon: RotateCcw },
      { name: 'Campagnes > Participations', code: 'campaigns-portfolio', icon: PieChart },
      { name: 'Campagnes > Contrats', code: 'campaigns-contracts', icon: FileSignature },
      { name: 'Campagnes > Transferts', code: 'campaigns-transfers', icon: ArrowLeftRight },
      { name: 'Campagnes > Prévisions de flux', code: 'campaigns-futureflows', icon: ChartLine },
    ],
  },
  {
    family: 'investors',
    items: [
      { name: 'Investisseurs', code: 'investors', icon: Users },
      { name: 'Investisseurs > Liste', code: 'investors-list', icon: User },
      { name: 'Contacts', code: 'contacts', icon: UserRoundCog },
      { name: 'Investisseurs > Alertes', code: 'investors-alerts', icon: TriangleAlert },
      { name: 'Accès tous investisseurs', code: 'all-investors', icon: UsersRound },
      { name: 'Paramètres > Statuts investisseurs', code: 'settings-investorstatuses', icon: Settings },
    ],
  },
  {
    family: 'network',
    items: [
      { name: 'Distribution > Partenaires', code: 'distribution-partners', icon: Handshake },
      { name: 'Distribution > Commissions', code: 'distribution-commissions', icon: Banknote },
      { name: 'Distribution > Contrats', code: 'distribution-contracts', icon: FileSignature },
      { name: 'Partenaires', code: 'partners', icon: UsersRound },
      { name: 'Partenaires > Documents', code: 'partner-documents', icon: File },
      { name: 'Partenaires > Connexion tiers', code: 'distribution-impersonate', icon: Globe },
    ],
  },
  {
    family: 'portal / reporting / subscriptions',
    items: [
      { name: 'Contenu', code: 'content', icon: SquarePen },
      { name: 'FAQ', code: 'faq', icon: CircleHelp },
      { name: 'Actualités', code: 'news', icon: Newspaper },
      { name: 'Reporting', code: 'reporting', icon: BarChart3 },
      { name: 'Souscriptions', code: 'subscriptions', icon: FileSignature },
      { name: 'Souscriptions > Validation', code: 'subscriptions-validation', icon: Shield },
    ],
  },
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

const investorListingColumnSpecs = [
  {
    column: 'NOM',
    component: 'ClickableText',
    functional: 'Identifier rapidement l’investisseur et copier son identifiant.',
    guidelines: 'Nom: text-sm/font-medium, couleur primaire lien; ID: text-xs gray-500; icône copy 12px.',
    variants: 'Personne physique / Personne morale, nom long tronqué, état copié (check vert).',
  },
  {
    column: 'INVESTOR',
    component: 'Investor',
    functional: 'Afficher le nom investisseur et son type (Company/Individual) dans une cellule compacte.',
    guidelines: 'Nom cliquable text-sm font-medium couleur #114154; sous-ligne text-sm gris avec icône building 14px.',
    variants: 'Company, Individual, nom long tronqué, entité morale avec raison sociale complète.',
  },
  {
    column: 'CONTACTS',
    component: 'ContactsCard',
    functional: 'Afficher contact principal et accès au détail one-to-many.',
    guidelines: 'Ligne principale text-sm, secondaire action text-[#114154] font-medium.',
    variants: '0 contact, 1 contact, plusieurs contacts (+n more).',
  },
  {
    column: 'STRUCTURE',
    component: 'StructuresCell',
    functional: 'Visualiser la structure juridique liée à l’investisseur.',
    guidelines: 'Texte principal text-sm, sous-ligne de profondeur “+n more”.',
    variants: 'Structure unique, structure multiple, donnée absente.',
  },
  {
    column: 'TYPE',
    component: 'Badge (variant="outline")',
    functional: 'Qualifier la nature de l’investisseur.',
    guidelines: 'Badge arrondi, text-sm, border neutre, icône contextuelle.',
    variants: 'Company / Individual.',
  },
  {
    column: 'STATUT',
    component: 'StatusBadge',
    functional: 'Montrer le statut business courant de façon scannable.',
    guidelines: 'Badge pill contrasté; couleur sémantique (vert/orange/…); text-sm.',
    variants: 'Prospect, En discussion, En relation, Archivé…',
  },
  {
    column: 'DATE D’INSCRIPTION',
    component: 'formatDate()',
    functional: 'Afficher la date d’entrée au format FR.',
    guidelines: 'Texte de cellule en style corps (table body), lisible et neutre (gris foncé).',
    variants: 'Date valide, valeur vide/indisponible.',
  },
  {
    column: 'CAPITAL INVESTI',
    component: 'formatCurrency()',
    functional: 'Afficher le montant investi en euros.',
    guidelines: 'Valeur forte: font-semibold, alignement visuel à droite recommandé.',
    variants: '0 €, montant élevé, décimales nulles.',
  },
  {
    column: 'SOUSCRIPTIONS',
    component: 'Badge + Button (subscription count)',
    functional: 'Montrer le volume de souscriptions et ouvrir le détail.',
    guidelines: 'Pill neutre avec icône fichier + count, interaction hover claire.',
    variants: '0, 1, n souscriptions.',
  },
  {
    column: 'SEGMENT',
    component: 'Tag',
    functional: 'Classifier l’investisseur pour filtres et reporting.',
    guidelines: 'Tag outline léger, text-sm, espacement compact.',
    variants: 'HNWI / Retail / Professional / UHNWI…',
  },
  {
    column: 'CLICKABLE TAG',
    component: 'clickableTag',
    functional: 'Afficher une donnée comptée (ex: souscriptions) et ouvrir le détail au clic.',
    guidelines: 'Pill cliquable arrondie, icône document 14px + count text-sm, chevron de navigation à droite.',
    variants: '0 / 1 / n éléments, état hover (élévation légère), état disabled.',
  },
  {
    column: 'DERNIÈRE ACTIVITÉ',
    component: 'Duration (LastActivityCard)',
    functional: 'Afficher le temps écoulé depuis la dernière interaction investisseur.',
    guidelines: 'Carte compacte inline-flex, libellé text-xs semibold + date text-[11px], icône calendrier 14px.',
    variants: 'Il y a 2 mois / Il y a 3 mois / Il y a 1 sem, tonalité neutre ou contextualisée selon fraîcheur.',
  },
  {
    column: 'Investor-structure',
    component: 'OriginStructureCell (structure)',
    functional: 'Prévisualiser le rendu souscription quand l’investisseur passe via une structure.',
    guidelines: 'Nom cliquable text-sm + ligne secondaire gérée par OriginStructureCell (structure cliquable).',
    variants: 'Structure longue tronquée + hover, nom investisseur standard.',
  },
  {
    column: 'Investor-individual',
    component: 'OriginStructureCell (individual)',
    functional: 'Prévisualiser le rendu souscription pour une personne physique en direct.',
    guidelines: 'Nom cliquable text-sm + sous-ligne Individual avec icône neutre.',
    variants: 'Nom long tronqué, Individual direct sans structure.',
  },
  {
    column: 'Investor-company',
    component: 'OriginStructureCell (company)',
    functional: 'Prévisualiser le rendu souscription pour une société en direct.',
    guidelines: 'Nom cliquable text-sm + sous-ligne Company avec icône neutre.',
    variants: 'Raison sociale longue tronquée, Company direct sans structure.',
  },
  {
    column: 'DISTRIBUTION PARTNER',
    component: 'distribution-partner',
    functional: 'Afficher l’origine de distribution d’une souscription (Direct ou via partenaire).',
    guidelines: 'Icône + libellé compact en text-xs, nom partenaire tronqué et cliquable.',
    variants: 'Direct (sans partenaire), partenaire CGP/distributeur.',
  },
];

const previewContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Valérie',
    lastName: 'Dupont',
    function: 'Directrice',
    email: 'valerie.dupont@vertex.com',
    phone: '+33 6 12 34 56 78',
    isPrimary: true,
    hasPortalAccess: true,
  },
  {
    id: '2',
    firstName: 'Paul',
    lastName: 'Martin',
    function: 'CFO',
    email: 'paul.martin@vertex.com',
    phone: '+33 6 98 76 54 32',
    isPrimary: false,
    hasPortalAccess: false,
  },
];

const previewStructures: LegalStructure[] = [
  {
    id: '1',
    name: 'Vertex Capital SA',
    type: 'SA',
    contactsCount: 2,
    subscriptionsCount: 3,
    totalInvested: 1657494,
  },
];

function renderSubscriptionInvestorPreview(contrepartie: { name: string; type: 'individual' | 'corporate'; structure?: string; investor?: string; investorType?: string; }) {
  return (
    <div className="flex flex-col gap-1 min-w-[220px] max-w-[280px]">
      <motion.span whileHover={{ x: 2 }} className="truncate text-sm font-medium text-[#114154]">
        <ClickableText>{contrepartie.name}</ClickableText>
      </motion.span>
      <OriginStructureCell contrepartie={contrepartie} />
    </div>
  );
}

function renderInvestorColumnPreview(column: string) {
  switch (column) {
    case 'NOM':
      return (
        <div className="flex flex-col gap-1 max-w-[220px]">
          <motion.div whileHover={{ x: 2 }} className="text-sm font-medium cursor-pointer truncate">
            <ClickableText>NextGen Ventures</ClickableText>
          </motion.div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">ID: 1</span>
            <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
              <Copy className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      );
    case 'INVESTOR':
      return (
        <div className="flex flex-col gap-1 min-w-[190px]">
          <ClickableText className="text-[#114154] text-sm font-medium">Anne Rousseau</ClickableText>
          <div className="inline-flex items-center gap-1.5 text-sm text-[#6C7A89]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Company</span>
          </div>
        </div>
      );
    case 'CONTACTS':
      return <ContactsCard contacts={previewContacts} investorName="Vertex Capital SA" />;
    case 'STRUCTURE':
      return <StructuresCell structures={previewStructures} />;
    case 'TYPE':
      return <Badge variant="outline">Individual</Badge>;
    case 'STATUT':
      return <StatusBadge label="En discussion" variant="warning" />;
    case 'DATE D’INSCRIPTION':
      return <span>10/05/2022</span>;
    case 'CAPITAL INVESTI':
      return <span className="font-semibold">1 657 494 €</span>;
    case 'SOUSCRIPTIONS':
      return <Badge variant="outline">2</Badge>;
    case 'SEGMENT':
      return <Tag label="HNWI" />;
    case 'CLICKABLE TAG':
      return (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border transition-all duration-200 group hover:scale-[1.03] hover:shadow-md hover:border-border/80 hover:bg-white"
        >
          <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">0</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
        </button>
      );
    case 'DERNIÈRE ACTIVITÉ':
      return (
        <LastActivityCard
          date={new Date('2026-01-17T07:33:00')}
          relativeTime="Il y a 2 mois"
          fullDate="17 janv. 2026, 07:33"
          variant="neutral"
        />
      );
    case 'Investor-structure':
      return renderSubscriptionInvestorPreview({
        name: 'Sophie Martin',
        type: 'individual',
        structure: 'SCI Rousseau Patrimoine',
      });
    case 'Investor-individual':
      return renderSubscriptionInvestorPreview({
        name: 'Jean Dubois',
        type: 'individual',
      });
    case 'Investor-company':
      return renderSubscriptionInvestorPreview({
        name: 'Epsilon Fund',
        type: 'corporate',
      });
    case 'DISTRIBUTION PARTNER':
      return (
        <div className="flex flex-col gap-2">
          <PartnerOriginCell partenaire={null} />
          <PartnerOriginCell
            partenaire={{
              id: 'partner-42',
              name: 'Masséna Wealth Management',
              type: 'corporate',
            }}
          />
        </div>
      );
    default:
      return null;
  }
}

export function DesignSystemPage() {
  const [switchOn, setSwitchOn] = React.useState(true);
  const [designSystemFolderId, setDesignSystemFolderId] = React.useState('branch-7-level-5');

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
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-1">Storybook intégré (Foundations)</h2>
        <p className="text-sm text-[#4F6166] dark:text-[#9DB2AE] mb-4">
          Les composants sont affichés ici directement (pas de page Storybook séparée).
        </p>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Navigation</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="breadcrumb">
                <TabsList>
                  <TabsTrigger value="breadcrumb">Breadcrumb</TabsTrigger>
                  <TabsTrigger value="tabs">Tabs</TabsTrigger>
                </TabsList>
                <TabsContent value="breadcrumb">
                  <div className="flex items-center gap-2 text-[#8B96A8]"><span>InvestHub OS</span><span>/</span><span className="font-semibold text-[#1F2937]">Investisseurs</span></div>
                </TabsContent>
                <TabsContent value="tabs">
                  <Tabs defaultValue="foundation">
                    <TabsList>
                      <TabsTrigger value="foundation">Foundation</TabsTrigger>
                      <TabsTrigger value="inputs">Inputs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="foundation">Tokens, couleurs, typo.</TabsContent>
                    <TabsContent value="inputs">Boutons, champs, filtres.</TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Inputs & Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Rechercher un investisseur..." />
              <div className="grid grid-cols-3 gap-2">
                <Select defaultValue="structure"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="structure">Structure</SelectItem></SelectContent></Select>
                <Select defaultValue="segment"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="segment">Segment</SelectItem></SelectContent></Select>
                <Button variant="secondary">Filtres</Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button className="bg-gradient-to-r from-black to-[#0D4A5A] text-white"><Plus className="w-4 h-4" />Nouvel Investisseur</Button>
                <Button variant="secondary" className="w-10 h-10 p-0"><MoreVertical className="w-4 h-4" /></Button>
                <Checkbox defaultChecked />
                <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Data Display</CardTitle></CardHeader>
            <CardContent>
              <UITable>
                <TableHeader>
                  <TableRow>
                    <TableHead>NOM</TableHead>
                    <TableHead>STATUT</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>CAPITAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-[300px]">
                        <motion.div
                          whileHover={{ x: 2 }}
                          title="NextGen Ventures"
                          className="text-sm font-medium cursor-pointer transition-all truncate"
                        >
                          <ClickableText>NextGen Ventures</ClickableText>
                        </motion.div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">ID: 1</span>
                          <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-emerald-50 text-emerald-800 border-emerald-200">En relation</Badge></TableCell>
                    <TableCell>27/12/2023</TableCell>
                    <TableCell className="font-semibold">1 141 699 €</TableCell>
                  </TableRow>
                </TableBody>
              </UITable>
              <Alert className="mt-3">
                <AlertTitle>Aucun investisseur trouvé</AlertTitle>
                <AlertDescription>Les filtres appliqués ne correspondent à aucun investisseur.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Columns3 className="w-4 h-4 text-[#3F7358]" />
          <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE]">Composants affichés — Inputs & Navigation</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Nom du composant" />
              <Select defaultValue="stable">
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un état" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked />
                <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation & feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="foundation">
                <TabsList>
                  <TabsTrigger value="foundation">Foundation</TabsTrigger>
                  <TabsTrigger value="inputs">Inputs</TabsTrigger>
                </TabsList>
                <TabsContent value="foundation" className="text-sm text-muted-foreground">Tokens, couleurs, typo.</TabsContent>
                <TabsContent value="inputs" className="text-sm text-muted-foreground">Boutons, champs, sélection.</TabsContent>
              </Tabs>
              <Alert>
                <AlertTitle>Documentation active</AlertTitle>
                <AlertDescription>Chaque composant est affiché directement dans cette page.</AlertDescription>
              </Alert>
              <div className="flex items-center gap-2">
                <Avatar><AvatarFallback>IH</AvatarFallback></Avatar>
                <Badge variant="outline">Avatar</Badge>
                <Badge variant="destructive">Error</Badge>
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-2">Composant GED — folder-selection-treeview-dropdown</h2>
        <p className="text-sm text-[#4F6166] dark:text-[#9DB2AE] mb-4">
          Sélecteur GED affiché directement dans le Design System (sans drawer), avec hover sur la valeur et hiérarchie occidentale.
        </p>
        <div className="max-w-[300px]">
          <FolderSelectionTreeviewDropdown
            value={designSystemFolderId}
            onChange={setDesignSystemFolderId}
            folderOptions={folderSelectorDemoOptions}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-2">Référentiel colonnes</h2>
        <p className="text-sm text-[#4F6166] dark:text-[#9DB2AE] mb-4">
          Tableau de référence des composants utilisés par colonne, avec description fonctionnelle, guidelines UI et variants.
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A]">
          <UITable>
            <TableHeader>
              <TableRow>
                <TableHead>Aperçu</TableHead>
                <TableHead>Composant</TableHead>
                <TableHead>Description fonctionnelle</TableHead>
                <TableHead>Guidelines (police / taille / couleur)</TableHead>
                <TableHead>Variants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investorListingColumnSpecs.map((spec) => (
                <TableRow key={spec.column}>
                  <TableCell>{renderInvestorColumnPreview(spec.column)}</TableCell>
                  <TableCell>{spec.component}</TableCell>
                  <TableCell className="whitespace-normal">{spec.functional}</TableCell>
                  <TableCell className="whitespace-normal">{spec.guidelines}</TableCell>
                  <TableCell className="whitespace-normal">{spec.variants}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UITable>
        </div>
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
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">Icônes métier (organisées par famille)</h2>
        <div className="space-y-4">
          {iconFamilies.map((family) => (
            <div key={family.family} className="rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A] p-4 bg-[#FCFDFC] dark:bg-[#101716]">
              <p className="text-xs uppercase tracking-widest text-[#5A7376] dark:text-[#9DB2AE] mb-3">{family.family}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {family.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.code}
                      className="rounded-lg border border-[#D7E0DD] dark:border-[#1F2D2A] px-3 py-2.5 flex items-center justify-between gap-2 bg-white dark:bg-[#0E1514]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-4 h-4 text-[#3F7358] flex-shrink-0" />
                        <span className="text-xs text-[#2A4148] dark:text-[#D7E6E2] truncate">{item.name}</span>
                      </div>
                      <code className="text-[11px] text-[#5A7376] dark:text-[#9DB2AE]">{item.code}</code>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Table className="w-4 h-4 text-[#3F7358]" />
          <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE]">Composants affichés — Data & Table</h2>
        </div>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Table UI</CardTitle>
            <CardDescription>Exemple direct d’un composant tableau réutilisable.</CardDescription>
          </CardHeader>
          <CardContent>
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead>Composant</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>État</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>DataTable</TableCell>
                  <TableCell>Data Display</TableCell>
                  <TableCell><Badge>Stable</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>TableSkeleton</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell><Badge variant="secondary">Loading</Badge></TableCell>
                </TableRow>
              </TableBody>
            </UITable>
          </CardContent>
        </Card>
      </section>

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
