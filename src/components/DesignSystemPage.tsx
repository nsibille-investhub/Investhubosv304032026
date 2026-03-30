import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUser,
  faFileSignature,
  faLayerGroup,
  faChartLine,
  faShield,
  faHandshake,
  faUserTie,
  faChartPie,
  faFile,
  faBuildingColumns,
  faGear,
  faPhone,
  faWallet,
  faMoneyBill,
  faArrowRotateLeft,
  faFileContract,
  faRightLeft,
  faCalendar,
  faMagnifyingGlass,
  faTriangleExclamation,
  faFileInvoice,
  faBuilding,
  faArrowsRotate,
  faClipboard,
  faUserPlus,
  faCircleQuestion,
  faBriefcase,
  faGlobe,
  faPalette,
  faCompass,
  faPenToSquare,
  faNewspaper,
  faLanguage,
  faChartColumn,
  faFileExcel,
  faEnvelope,
  faClapperboard,
  faPeopleGroup,
  faFileLines,
  faFileImport,
  faTruck,
  faBook,
  faDatabase,
} from '@fortawesome/free-solid-svg-icons';

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

const métierIcons = [
  { label: 'Tous les investisseurs', icon: faUsers },
  { label: 'Profil Investisseur', icon: faUser },
  { label: 'Souscriptions', icon: faFileSignature },
  { label: 'Segments', icon: faLayerGroup },
  { label: 'Statistiques', icon: faChartLine },
  { label: 'Campagnes KYC', icon: faShield },
  { label: 'Partenaires', icon: faHandshake },
  { label: 'Conseillers', icon: faUserTie },
  { label: 'Participations', icon: faChartPie },
  { label: 'Documents', icon: faFile },
  { label: 'Fonds', icon: faBuildingColumns },
  { label: 'Paramètres', icon: faGear },
  { label: 'Appels', icon: faPhone },
  { label: 'Capital accounts', icon: faWallet },
  { label: 'Distributions', icon: faMoneyBill },
  { label: 'Rachats', icon: faArrowRotateLeft },
  { label: 'Contrats', icon: faFileContract },
  { label: 'Transferts', icon: faRightLeft },
  { label: 'Évènements', icon: faCalendar },
  { label: 'Screening', icon: faMagnifyingGlass },
  { label: 'Alertes / Risque', icon: faTriangleExclamation },
  { label: 'Factures', icon: faFileInvoice },
  { label: 'Comptes bancaires', icon: faBuilding },
  { label: 'Opérations', icon: faArrowsRotate },
  { label: 'Formulaires / Sondages', icon: faClipboard },
  { label: 'Onboarding', icon: faUserPlus },
  { label: 'Questions', icon: faCircleQuestion },
  { label: 'Dealflow', icon: faBriefcase },
  { label: 'Portail', icon: faGlobe },
  { label: 'Branding', icon: faPalette },
  { label: 'Navigation', icon: faCompass },
  { label: 'Éditeur', icon: faPenToSquare },
  { label: 'Actualités', icon: faNewspaper },
  { label: 'Traductions', icon: faLanguage },
  { label: 'Reporting', icon: faChartColumn },
  { label: 'Excel', icon: faFileExcel },
  { label: 'Communication', icon: faEnvelope },
  { label: 'Campagnes', icon: faClapperboard },
  { label: 'Équipe', icon: faPeopleGroup },
  { label: 'Logs', icon: faFileLines },
  { label: 'Imports', icon: faFileImport },
  { label: 'Fournisseurs', icon: faTruck },
  { label: 'Plan comptable', icon: faBook },
  { label: 'Requêtes', icon: faDatabase },
];

export function DesignSystemPage() {
  return (
    <div className="flex-1 overflow-auto px-6 py-6 space-y-6 bg-[#F8FAFA] dark:bg-[#0B0D0D]">
      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#456B6C] mb-2">Design System</p>
        <h1 className="text-3xl font-semibold text-[#1F3137] dark:text-[#E8F0EE]">InvestHub Foundation</h1>
        <p className="mt-2 text-sm text-[#4F6166] dark:text-[#9DB2AE] max-w-4xl">
          Base visuelle unifiée avec une palette premium, des guidelines d&apos;usage, et un mapping d&apos;icônes métier pour garder une expérience produit cohérente sur toute la maquette.
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
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">Guidelines de composition</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A] p-4">
            <p className="font-semibold text-[#1F3137] dark:text-[#E8F0EE]">Hiérarchie claire</p>
            <p className="mt-2 text-[#4F6166] dark:text-[#9DB2AE]">H1 32px, H2 20px, body 14-16px, et usage systématique des espacements 8 / 16 / 24 / 32.</p>
          </div>
          <div className="rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A] p-4">
            <p className="font-semibold text-[#1F3137] dark:text-[#E8F0EE]">Lisibilité des états</p>
            <p className="mt-2 text-[#4F6166] dark:text-[#9DB2AE]">Contraste minimum AA, hover discret, focus visible, et feedback success / warning / error explicites.</p>
          </div>
          <div className="rounded-xl border border-[#D7E0DD] dark:border-[#1F2D2A] p-4">
            <p className="font-semibold text-[#1F3137] dark:text-[#E8F0EE]">Composants cohérents</p>
            <p className="mt-2 text-[#4F6166] dark:text-[#9DB2AE]">Cards radius 12-16px, tables denses mais respirantes, et usage d&apos;icônes métier constant.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white dark:bg-[#101615] p-6">
        <h2 className="text-lg font-semibold text-[#1F3137] dark:text-[#E8F0EE] mb-4">Icônes métier (FontAwesome)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {métierIcons.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-[#D7E0DD] dark:border-[#1F2D2A] px-3 py-2.5 flex items-center gap-2 bg-[#FCFDFC] dark:bg-[#101716]"
            >
              <FontAwesomeIcon icon={item.icon} className="text-[#3F7358]" />
              <span className="text-xs text-[#2A4148] dark:text-[#D7E6E2]">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
