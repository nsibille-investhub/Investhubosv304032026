import React, { useState } from 'react';
import { GripVertical, Plus, Edit2, Trash2, X, AlertTriangle, Upload, AlertCircle, Globe, UsersRound, Handshake, TrendingUp, Bell, Search, Home, HelpCircle, Lightbulb } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ModernMultiSelect } from '../ui/modern-multiselect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DatePicker } from '../ui/date-picker';
import { Switch } from '../ui/switch';
import { ImageUpload } from '../ui/image-upload';
import { DataPagination } from '../ui/data-pagination';
import { FilterBar } from '../FilterBar';
import { DateRangeFilter } from '../DateRangeFilter';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

interface News {
  id: string;
  date: string;
  titre: string;
  titreTranslations: {
    fr: string;
    en: string;
    es: string;
  };
  allFunds: boolean;
  fondUnique?: string; // Nouveau: fonds unique sélectionné
  audienceInvestisseurs: boolean;
  audiencePartenaires: boolean;
  audienceParticipations: boolean;
  segmentInvestisseurs: string[];
  segmentPartenaires: string[];
  segmentParticipations: string[];
  afficherAccueil: boolean;
  envoyerEmail: boolean;
  notifier: boolean;
  image?: string;
  extrait: string;
  extraitTranslations: {
    fr: string;
    en: string;
    es: string;
  };
  contenu: string;
  contenuTranslations: {
    fr: string;
    en: string;
    es: string;
  };
  rank: number;
}

const mockNews: News[] = [
  {
    id: '1',
    date: '05/08/2024',
    titre: 'Ternel Regenerative',
    titreTranslations: {
      fr: 'Ternel Regenerative',
      en: 'Ternel Regenerative',
      es: 'Ternel Regenerative'
    },
    allFunds: false,
    fondUnique: 'Ternel Regenerative',
    audienceInvestisseurs: true,
    audiencePartenaires: true,
    audienceParticipations: true,
    segmentInvestisseurs: [],
    segmentPartenaires: [],
    segmentParticipations: [],
    afficherAccueil: true,
    envoyerEmail: false,
    extrait: 'Stratégie d\'investissement early stage dans le impact sur la biodiversité...',
    extraitTranslations: {
      fr: 'Stratégie d\'investissement early stage dans le impact sur la biodiversité...',
      en: 'Early stage investment strategy focused on biodiversity impact...',
      es: 'Estrategia de inversión early stage enfocada en el impacto de la biodiversidad...'
    },
    contenu: `Thèse d'investissement : Start-ups et PME dans le secteur des ENR en Afrique (85%) et dans les pays en développement

Spécificité : L'impact social et environnemental au cœur de la stratégie

SFDR : Article 9

Taille cible : 80 M€

Premier closing finalisé Q2 2025

Plus d'informations : site web`,
    contenuTranslations: {
      fr: `Thèse d'investissement : Start-ups et PME dans le secteur des ENR en Afrique (85%) et dans les pays en développement

Spécificité : L'impact social et environnemental au cœur de la stratégie

SFDR : Article 9

Taille cible : 80 M€

Premier closing finalisé Q2 2025

Plus d'informations : site web`,
      en: `Investment thesis: Start-ups and SMEs in the renewable energy sector in Africa (85%) and in developing countries

Specificity: Social and environmental impact at the heart of the strategy

SFDR: Article 9

Target size: €80M

First closing completed Q2 2025

More information: website`,
      es: `Tesis de inversión: Start-ups y PYMEs en el sector de energías renovables en África (85%) y en países en desarrollo

Especificidad: El impacto social y ambiental en el corazón de la estrategia

SFDR: Artículo 9

Tamaño objetivo: 80 M€

Primer cierre finalizado T2 2025

Más información: sitio web`
    },
    rank: 0
  },
  {
    id: '2',
    date: '01/06/2024',
    titre: 'Gaia Impact Fund II',
    titreTranslations: { fr: 'Gaia Impact Fund II', en: 'Gaia Impact Fund II', es: 'Gaia Impact Fund II' },
    allFunds: false,
    fondUnique: 'GAIA Energy Impact Fund II',
    audienceInvestisseurs: true,
    audiencePartenaires: false,
    audienceParticipations: false,
    segmentInvestisseurs: [],
    segmentPartenaires: [],
    segmentParticipations: [],
    afficherAccueil: false,
    envoyerEmail: true,
    notifier: false,
    extrait: 'Nouveau fonds dédié à la transition énergétique...',
    extraitTranslations: { 
      fr: 'Nouveau fonds dédié à la transition énergétique...', 
      en: 'New fund dedicated to energy transition...', 
      es: 'Nuevo fondo dedicado a la transición energética...' 
    },
    contenu: 'Détails du fonds Gaia Impact Fund II...',
    contenuTranslations: { 
      fr: 'Détails du fonds Gaia Impact Fund II...', 
      en: 'Details of Gaia Impact Fund II...', 
      es: 'Detalles del fondo Gaia Impact Fund II...' 
    },
    rank: 1
  },
  {
    id: '3',
    date: '16/12/2023',
    titre: 'Blauwe Capital II',
    titreTranslations: { fr: 'Blauwe Capital II', en: 'Blauwe Capital II', es: 'Blauwe Capital II' },
    allFunds: false,
    fondUnique: 'K2 Capital IV',
    audienceInvestisseurs: true,
    audiencePartenaires: true,
    audienceParticipations: false,
    segmentInvestisseurs: [],
    segmentPartenaires: [],
    segmentParticipations: [],
    afficherAccueil: true,
    envoyerEmail: false,
    notifier: false,
    extrait: 'Lancement du nouveau fonds...',
    extraitTranslations: { fr: 'Lancement du nouveau fonds...', en: 'Launch of the new fund...', es: 'Lanzamiento del nuevo fondo...' },
    contenu: 'Présentation du fonds Blauwe Capital II...',
    contenuTranslations: { fr: 'Présentation du fonds Blauwe Capital II...', en: 'Presentation of Blauwe Capital II fund...', es: 'Presentación del fondo Blauwe Capital II...' },
    rank: 2
  },
  {
    id: '4',
    date: '12/05/2024',
    titre: 'Nouveaux horizons pour les fonds K2',
    titreTranslations: { fr: 'Nouveaux horizons pour les fonds K2', en: 'New horizons for K2 funds', es: 'Nuevos horizontes para los fondos K2' },
    allFunds: false,
    fondUnique: 'K2 Capital I',
    audienceInvestisseurs: true,
    audiencePartenaires: true,
    audienceParticipations: false,
    segmentInvestisseurs: ['Segment Premium'],
    segmentPartenaires: [],
    segmentParticipations: [],
    afficherAccueil: true,
    envoyerEmail: true,
    notifier: true,
    extrait: 'Actualités et performances de notre gamme K2...',
    extraitTranslations: { fr: 'Actualités et performances de notre gamme K2...', en: 'News and performance of our K2 range...', es: 'Noticias y rendimiento de nuestra gama K2...' },
    contenu: 'Présentation des dernières performances et actualités de notre gamme K2 Capital...',
    contenuTranslations: { fr: 'Présentation des dernières performances et actualités de notre gamme K2 Capital...', en: 'Presentation of the latest performance and news of our K2 Capital range...', es: 'Presentación de los últimos rendimientos y noticias de nuestra gama K2 Capital...' },
    rank: 3
  },
  {
    id: '5',
    date: '28/03/2024',
    titre: 'Assemblée Générale Annuelle 2024',
    titreTranslations: { fr: 'Assemblée Générale Annuelle 2024', en: 'Annual General Meeting 2024', es: 'Asamblea General Anual 2024' },
    allFunds: true,
    restrictionsFonds: [],
    audienceInvestisseurs: true,
    audiencePartenaires: true,
    audienceParticipations: true,
    segmentInvestisseurs: [],
    segmentPartenaires: [],
    segmentParticipations: [],
    afficherAccueil: true,
    envoyerEmail: true,
    notifier: true,
    extrait: 'Invitation à l\'assemblée générale annuelle de tous nos fonds...',
    extraitTranslations: { fr: 'Invitation à l\'assemblée générale annuelle de tous nos fonds...', en: 'Invitation to the annual general meeting of all our funds...', es: 'Invitación a la asamblea general anual de todos nuestros fondos...' },
    contenu: 'Nous avons le plaisir de vous inviter à notre assemblée générale annuelle qui se tiendra le 15 avril 2024...',
    contenuTranslations: { fr: 'Nous avons le plaisir de vous inviter à notre assemblée générale annuelle qui se tiendra le 15 avril 2024...', en: 'We are pleased to invite you to our annual general meeting which will be held on April 15, 2024...', es: 'Tenemos el placer de invitarle a nuestra asamblea general anual que se celebrará el 15 de abril de 2024...' },
    rank: 4
  },
  {
    id: '6',
    date: '15/02/2024',
    titre: 'CARIN Capital - Expansion européenne',
    titreTranslations: { fr: 'CARIN Capital - Expansion européenne', en: 'CARIN Capital - European Expansion', es: 'CARIN Capital - Expansión europea' },
    allFunds: false,
    fondUnique: 'CARIN Capital I',
    audienceInvestisseurs: true,
    audiencePartenaires: false,
    audienceParticipations: false,
    segmentInvestisseurs: [],
    segmentPartenaires: [],
    segmentParticipations: [],
    afficherAccueil: false,
    envoyerEmail: true,
    notifier: false,
    extrait: 'Stratégie d\'expansion de CARIN Capital en Europe...',
    extraitTranslations: { fr: 'Stratégie d\'expansion de CARIN Capital en Europe...', en: 'CARIN Capital expansion strategy in Europe...', es: 'Estrategia de expansión de CARIN Capital en Europa...' },
    contenu: 'Nos fonds CARIN Capital poursuivent leur expansion en Europe avec de nouvelles opportunités...',
    contenuTranslations: { fr: 'Nos fonds CARIN Capital poursuivent leur expansion en Europe avec de nouvelles opportunités...', en: 'Our CARIN Capital funds continue their expansion in Europe with new opportunities...', es: 'Nuestros fondos CARIN Capital continúan su expansión en Europa con nuevas oportunidades...' },
    rank: 5
  }
];

const availableFonds = [
  'CARIN Capital I', 'CARIN Capital II', 'CARIN Capital III', 
  'Collaboration I', 'Edelweiss Croissance I', 'Edelweiss Solutions',
  'Edelweiss Solutions II', 'GAIA Energy Impact Fund II', 'K2 Capital I',
  'K2 Capital II', 'K2 Capital III', 'K2 Capital IV', 'Ternel Regenerative'
];

const segmentsInvestisseurs = [
  'Segment Premium',
  'Segment Gold',
  'Segment Silver',
  'Segment Bronze',
  'Investisseurs institutionnels',
  'Family Offices'
];

const segmentsPartenaires = [
  'Partenaires Privilégiés',
  'Partenaires Stratégiques',
  'Partenaires Commerciaux'
];

const segmentsParticipations = [
  'Participation Majoritaire',
  'Participation Minoritaire',
  'Participation Stratégique'
];

// Composant HelpCard pour le mode guidage
interface HelpCardProps {
  title: string;
  description: string;
  isVisible: boolean;
}

function HelpCard({ title, description, isVisible }: HelpCardProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div className="flex gap-2">
        <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 mb-1">{title}</p>
          <p className="text-xs text-blue-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Composant InfoBanner pour la définition fonctionnelle de l'objet
interface InfoBannerProps {
  title: string;
  description: string;
  helpUrl: string;
  isVisible: boolean;
}

function InfoBanner({ title, description, helpUrl, isVisible }: InfoBannerProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-white border border-blue-300 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-900 mb-1">
            <strong>{title}</strong>
          </p>
          <p className="text-sm text-slate-700 leading-relaxed mb-2">{description}</p>
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 hover:underline transition-colors"
          >
            En savoir plus sur le centre d'aide
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// Composant pour afficher les fonds
function FundsDisplay({ allFunds, fond }: { allFunds: boolean; fond?: string }) {
  if (allFunds) {
    return <span className="text-sm text-gray-600">Tous les fonds</span>;
  }

  if (!fond) {
    return <span className="text-sm text-gray-400">Aucun fonds</span>;
  }

  return <span className="text-sm text-gray-600">{fond}</span>;
}

interface DraggableRowProps {
  news: News;
  index: number;
  moveNews: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (news: News) => void;
  onDelete: (news: News) => void;
  showDragHandle: boolean;
  isPanelOpen: boolean;
}

function DraggableRow({ news, index, moveNews, onEdit, onDelete, showDragHandle, isPanelOpen }: DraggableRowProps) {
  const ref = React.useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'NEWS_ROW',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'NEWS_ROW',
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveNews(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  preview(drop(ref));

  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-gray-100 hover:bg-gray-50 transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      <td className="p-4 text-sm text-gray-600">{news.date}</td>
      <td className="p-4">
        <span className="text-sm text-gray-900">{news.titre}</span>
      </td>
      <td className="p-4">
        {/* Fonds */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {news.allFunds ? (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
              Tous les fonds
            </Badge>
          ) : news.fondUnique ? (
            <Badge 
              variant="outline" 
              style={{ backgroundColor: '#DCFDBC', color: '#0F323D' }}
              className="text-xs"
            >
              {news.fondUnique}
            </Badge>
          ) : (
            <span className="text-xs text-gray-400">Aucun</span>
          )}
        </div>
      </td>
      <td className="p-4">
        {/* Cibles (Audiences) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {news.audienceInvestisseurs && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
              <UsersRound className="w-3 h-3" />
              Investisseurs
            </Badge>
          )}
          {news.audiencePartenaires && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
              <Handshake className="w-3 h-3" />
              Partenaires
            </Badge>
          )}
          {news.audienceParticipations && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Participations
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(news)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(news)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  news: News | null;
  onSave: (news: Partial<News>) => void;
  helpMode: boolean;
}

function Panel({ isOpen, onClose, news, onSave, helpMode }: PanelProps) {
  const [formData, setFormData] = useState<Partial<News>>(
    news || {
      date: new Date().toLocaleDateString('fr-FR'),
      titre: '',
      titreTranslations: { fr: '', en: '', es: '' },
      allFunds: true,
      fondUnique: undefined,
      audienceInvestisseurs: false,
      audiencePartenaires: false,
      audienceParticipations: false,
      segmentInvestisseurs: [],
      segmentPartenaires: [],
      segmentParticipations: [],
      afficherAccueil: false,
      envoyerEmail: false,
      notifier: false,
      extrait: '',
      extraitTranslations: { fr: '', en: '', es: '' },
      contenu: '',
      contenuTranslations: { fr: '', en: '', es: '' }
    }
  );

  const [activeLanguage, setActiveLanguage] = useState<'fr' | 'en' | 'es'>('fr');



  React.useEffect(() => {
    if (news) {
      setFormData(news);
    } else {
      setFormData({
        date: new Date().toLocaleDateString('fr-FR'),
        titre: '',
        titreTranslations: { fr: '', en: '', es: '' },
        allFunds: true,
        fondUnique: undefined,
        audienceInvestisseurs: false,
        audiencePartenaires: false,
        audienceParticipations: false,
        segmentInvestisseurs: [],
        segmentPartenaires: [],
        segmentParticipations: [],
        afficherAccueil: false,
        envoyerEmail: false,
        notifier: false,
        extrait: '',
        extraitTranslations: { fr: '', en: '', es: '' },
        contenu: '',
        contenuTranslations: { fr: '', en: '', es: '' }
      });
    }
    setActiveLanguage('fr');
  }, [news, isOpen]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleAudienceToggle = (audience: 'investisseurs' | 'partenaires' | 'participations') => {
    if (audience === 'investisseurs') {
      setFormData({ ...formData, audienceInvestisseurs: !formData.audienceInvestisseurs });
    } else if (audience === 'partenaires') {
      setFormData({ ...formData, audiencePartenaires: !formData.audiencePartenaires });
    } else {
      setFormData({ ...formData, audienceParticipations: !formData.audienceParticipations });
    }
  };

  // Vérifier si la cible est vide
  const isTargetEmpty = () => {
    // Si tous les fonds sont sélectionnés, ce n'est pas vide
    if (formData.allFunds) {
      return false;
    }
    
    // Si un fonds spécifique est sélectionné, ce n'est pas vide
    if (formData.fondUnique) {
      return false;
    }
    
    // Si au moins une audience est cochée, ce n'est pas vide
    if (formData.audienceInvestisseurs || formData.audiencePartenaires || formData.audienceParticipations) {
      return false;
    }
    
    return true;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 420 }}
          animate={{ x: 0 }}
          exit={{ x: 420 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg">
              {news ? 'Modifier l\'actualité' : 'Ajouter une actualité'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Date */}
              <div>
                <Label htmlFor="date" className="text-sm mb-2 block">Date</Label>
                <DatePicker
                  date={formData.date ? new Date(formData.date.split('/').reverse().join('-')) : undefined}
                  onDateChange={(date) => {
                    if (date) {
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      setFormData({ ...formData, date: `${day}/${month}/${year}` });
                    } else {
                      setFormData({ ...formData, date: '' });
                    }
                  }}
                  placeholder="Sélectionner une date"
                />
                <HelpCard
                  isVisible={helpMode}
                  title="Date de publication"
                  description="Sélectionnez la date à laquelle l'actualité sera visible par les utilisateurs. Cette date apparaîtra sur la liste des actualités et servira au tri chronologique."
                />
              </div>

              {/* Image */}
              <div>
                <Label htmlFor="image" className="text-sm mb-2 block">Image d'illustration</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData({ ...formData, image: value })}
                  maxSizeMB={5}
                />
                <HelpCard
                  isVisible={helpMode}
                  title="Image d'illustration"
                  description="Image principale de l'actualité qui sera affichée sur la page d'accueil et dans le détail. Format recommandé : 16:9, taille max 5 Mo. Une image de qualité améliore l'engagement des utilisateurs."
                />
              </div>

              {/* Traductions - Titre, Extrait, Contenu */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as 'fr' | 'en' | 'es')} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-3 h-8 bg-white">
                    <TabsTrigger value="fr" className="text-xs py-1 relative">
                      🇫🇷 FR
                      {(!formData.titreTranslations?.fr?.trim() || !formData.extraitTranslations?.fr?.trim() || !formData.contenuTranslations?.fr?.trim()) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="en" className="text-xs py-1 relative">
                      🇬🇧 EN
                      {(!formData.titreTranslations?.en?.trim() || !formData.extraitTranslations?.en?.trim() || !formData.contenuTranslations?.en?.trim()) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="es" className="text-xs py-1 relative">
                      🇪🇸 ES
                      {(!formData.titreTranslations?.es?.trim() || !formData.extraitTranslations?.es?.trim() || !formData.contenuTranslations?.es?.trim()) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="fr" className="mt-0 space-y-3">
                    {/* Titre FR */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <Label className="text-xs text-gray-900">
                            Titre<span className="text-red-500 ml-1">*</span>
                          </Label>
                        </div>
                        <span className="text-xs text-gray-500">Toutes les langues obligatoires</span>
                      </div>
                      <Input
                        value={formData.titreTranslations?.fr || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          titre: e.target.value,
                          titreTranslations: { ...formData.titreTranslations!, fr: e.target.value } 
                        })}
                        placeholder="Ex: Ternel Regenerative"
                        className="h-9 text-sm bg-white"
                      />
                    </div>

                    {/* Extrait FR */}
                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">
                        Extrait<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Textarea
                        value={formData.extraitTranslations?.fr || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          extrait: e.target.value,
                          extraitTranslations: { ...formData.extraitTranslations!, fr: e.target.value } 
                        })}
                        className="min-h-[80px] text-sm bg-white"
                        placeholder="Stratégie d'investissement early stage dans le impact sur la biodiversité..."
                      />
                    </div>

                    {/* Contenu FR */}
                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">
                        Contenu<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="border border-gray-200 rounded-lg bg-white">
                        <div className="border-b border-gray-200 p-2 flex gap-1 bg-gray-50">
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Gras</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Italique</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Souligné</button>
                          <div className="w-px bg-gray-300 mx-1"></div>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Liste</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Lien</button>
                        </div>
                        <Textarea
                          value={formData.contenuTranslations?.fr || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contenu: e.target.value,
                            contenuTranslations: { ...formData.contenuTranslations!, fr: e.target.value } 
                          })}
                          className="min-h-[200px] text-sm border-0 rounded-t-none"
                          placeholder="Thèse d'investissement : ..."
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="en" className="mt-0 space-y-3">
                    {/* Titre EN */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <Label className="text-xs text-gray-900">
                            Title<span className="text-red-500 ml-1">*</span>
                          </Label>
                        </div>
                        <span className="text-xs text-gray-500">All languages required</span>
                      </div>
                      <Input
                        value={formData.titreTranslations?.en || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          titreTranslations: { ...formData.titreTranslations!, en: e.target.value } 
                        })}
                        placeholder="Ex: Ternel Regenerative"
                        className="h-9 text-sm bg-white"
                      />
                    </div>

                    {/* Extrait EN */}
                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">
                        Excerpt<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Textarea
                        value={formData.extraitTranslations?.en || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          extraitTranslations: { ...formData.extraitTranslations!, en: e.target.value } 
                        })}
                        className="min-h-[80px] text-sm bg-white"
                        placeholder="Early stage investment strategy focused on biodiversity impact..."
                      />
                    </div>

                    {/* Contenu EN */}
                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">
                        Content<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="border border-gray-200 rounded-lg bg-white">
                        <div className="border-b border-gray-200 p-2 flex gap-1 bg-gray-50">
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Bold</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Italic</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Underline</button>
                          <div className="w-px bg-gray-300 mx-1"></div>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">List</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Link</button>
                        </div>
                        <Textarea
                          value={formData.contenuTranslations?.en || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contenuTranslations: { ...formData.contenuTranslations!, en: e.target.value } 
                          })}
                          className="min-h-[200px] text-sm border-0 rounded-t-none"
                          placeholder="Investment thesis: ..."
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="es" className="mt-0 space-y-3">
                    {/* Titre ES */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <Label className="text-xs text-gray-900">
                            Título<span className="text-red-500 ml-1">*</span>
                          </Label>
                        </div>
                        <span className="text-xs text-gray-500">Todos los idiomas obligatorios</span>
                      </div>
                      <Input
                        value={formData.titreTranslations?.es || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          titreTranslations: { ...formData.titreTranslations!, es: e.target.value } 
                        })}
                        placeholder="Ej: Ternel Regenerative"
                        className="h-9 text-sm bg-white"
                      />
                    </div>

                    {/* Extrait ES */}
                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">
                        Extracto<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Textarea
                        value={formData.extraitTranslations?.es || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          extraitTranslations: { ...formData.extraitTranslations!, es: e.target.value } 
                        })}
                        className="min-h-[80px] text-sm bg-white"
                        placeholder="Estrategia de inversión early stage enfocada en el impacto de la biodiversidad..."
                      />
                    </div>

                    {/* Contenu ES */}
                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">
                        Contenido<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="border border-gray-200 rounded-lg bg-white">
                        <div className="border-b border-gray-200 p-2 flex gap-1 bg-gray-50">
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Negrita</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Cursiva</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Subrayado</button>
                          <div className="w-px bg-gray-300 mx-1"></div>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Lista</button>
                          <button className="px-2 py-1 text-xs hover:bg-gray-200 rounded">Enlace</button>
                        </div>
                        <Textarea
                          value={formData.contenuTranslations?.es || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            contenuTranslations: { ...formData.contenuTranslations!, es: e.target.value } 
                          })}
                          className="min-h-[200px] text-sm border-0 rounded-t-none"
                          placeholder="Tesis de inversión: ..."
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <HelpCard
                  isVisible={helpMode}
                  title="Contenu multilingue"
                  description="Le titre, l'extrait et le contenu doivent être traduits dans les 3 langues (FR, EN, ES). Le titre apparaît dans la liste, l'extrait est un résumé court (~100 caractères), et le contenu est l'article complet avec formatage riche."
                />
              </div>

              {/* Afficher sur l'accueil */}
              <div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                        <Home className="w-4 h-4 text-blue-600" />
                      </div>
                      <Label htmlFor="afficherAccueil" className="text-sm cursor-pointer">
                        Afficher sur l'accueil
                      </Label>
                    </div>
                    <Switch
                      id="afficherAccueil"
                      checked={formData.afficherAccueil}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, afficherAccueil: checked as boolean })
                      }
                    />
                  </div>
                </div>
                <HelpCard
                  isVisible={helpMode}
                  title="Affichage sur la page d'accueil"
                  description="Active cette option pour mettre en avant l'actualité sur la page d'accueil du portail. Idéal pour les annonces importantes ou les nouveautés à promouvoir."
                />
              </div>

              {/* Bloc Audience */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <UsersRound className="w-4 h-4 text-blue-600" />
                  </div>
                  <Label className="text-sm">Audience</Label>
                </div>

                {/* Tous les fonds */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allFunds"
                    checked={formData.allFunds}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, allFunds: checked as boolean, fondUnique: undefined })
                    }
                  />
                  <Label htmlFor="allFunds" className="text-sm cursor-pointer">
                    Tous les fonds
                  </Label>
                </div>

                {/* Fonds (si pas tous les fonds) */}
                {!formData.allFunds && (
                  <div>
                    <Label htmlFor="fonds" className="text-sm mb-2 block">Fonds</Label>
                    <Select
                      value={formData.fondUnique || ''}
                      onValueChange={(value) => setFormData({ ...formData, fondUnique: value })}
                    >
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Sélectionner un fonds" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFonds.map((fond) => (
                          <SelectItem key={fond} value={fond}>
                            {fond}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Audiences */}
                <div>
                  <Label className="text-sm mb-2 block">Cibles</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      onClick={() => handleAudienceToggle('investisseurs')}
                      className="cursor-pointer transition-all"
                      style={{
                        backgroundColor: formData.audienceInvestisseurs ? '#DCFDBC' : 'transparent',
                        border: formData.audienceInvestisseurs ? '1px solid #DCFDBC' : '1px solid #e5e7eb',
                        color: '#000'
                      }}
                    >
                      Investisseurs
                      {formData.audienceInvestisseurs && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                    <Badge
                      onClick={() => handleAudienceToggle('partenaires')}
                      className="cursor-pointer transition-all"
                      style={{
                        backgroundColor: formData.audiencePartenaires ? '#DCFDBC' : 'transparent',
                        border: formData.audiencePartenaires ? '1px solid #DCFDBC' : '1px solid #e5e7eb',
                        color: '#000'
                      }}
                    >
                      Partenaires
                      {formData.audiencePartenaires && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                    <Badge
                      onClick={() => handleAudienceToggle('participations')}
                      className="cursor-pointer transition-all"
                      style={{
                        backgroundColor: formData.audienceParticipations ? '#DCFDBC' : 'transparent',
                        border: formData.audienceParticipations ? '1px solid #DCFDBC' : '1px solid #e5e7eb',
                        color: '#000'
                      }}
                    >
                      Participations
                      {formData.audienceParticipations && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  </div>
                </div>

                {/* Segment Investisseurs */}
                {formData.audienceInvestisseurs && (
                  <div>
                    <Label htmlFor="segmentInvestisseurs" className="text-sm mb-2 block">
                      Segment d'investisseurs
                    </Label>
                    <ModernMultiSelect
                      options={segmentsInvestisseurs}
                      value={formData.segmentInvestisseurs || []}
                      onChange={(value) => setFormData({ ...formData, segmentInvestisseurs: value })}
                      placeholder="Sélectionner un ou plusieurs segments"
                      searchPlaceholder="Rechercher un segment..."
                      maxDisplay={2}
                    />
                  </div>
                )}

                {/* Segment Partenaires */}
                {formData.audiencePartenaires && (
                  <div>
                    <Label htmlFor="segmentPartenaires" className="text-sm mb-2 block">
                      Segment de partenaires
                    </Label>
                    <ModernMultiSelect
                      options={segmentsPartenaires}
                      value={formData.segmentPartenaires || []}
                      onChange={(value) => setFormData({ ...formData, segmentPartenaires: value })}
                      placeholder="Sélectionner un ou plusieurs segments"
                      searchPlaceholder="Rechercher un segment..."
                      maxDisplay={2}
                    />
                  </div>
                )}

                {/* Segment Participations */}
                {formData.audienceParticipations && (
                  <div>
                    <Label htmlFor="segmentParticipations" className="text-sm mb-2 block">
                      Segment de participations
                    </Label>
                    <ModernMultiSelect
                      options={segmentsParticipations}
                      value={formData.segmentParticipations || []}
                      onChange={(value) => setFormData({ ...formData, segmentParticipations: value })}
                      placeholder="Sélectionner un ou plusieurs segments"
                      searchPlaceholder="Rechercher un segment..."
                      maxDisplay={2}
                    />
                  </div>
                )}

                {/* Toggle Notifier */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <Label htmlFor="notifier" className="text-sm cursor-pointer">
                      Notifier l'audience
                    </Label>
                  </div>
                  <Switch
                    id="notifier"
                    checked={formData.notifier || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, notifier: checked })
                    }
                  />
                </div>
              </div>
              <HelpCard
                isVisible={helpMode}
                title="Ciblage de l'audience"
                description="Définissez qui peut voir cette actualité. Vous pouvez diffuser à tous les fonds ou à un fonds spécifique, puis affiner par type d'audience (Investisseurs, Partenaires, Participations) et par segments. La notification permet d'alerter immédiatement l'audience par email ou notification in-app."
              />

              {/* Avertissement si aucune cible */}
              {isTargetEmpty() && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-800">
                    <strong>Aucune cible sélectionnée.</strong> Cette actualité ne sera visible par personne. 
                    Veuillez sélectionner au moins un fonds ou cocher une audience.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-9"
            >
              Annuler
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1">
                  <Button
                    onClick={handleSave}
                    disabled={isTargetEmpty()}
                    style={{
                      background: isTargetEmpty() 
                        ? '#e5e7eb' 
                        : 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                      color: isTargetEmpty() ? '#9ca3af' : 'white',
                      cursor: isTargetEmpty() ? 'not-allowed' : 'pointer'
                    }}
                    className="w-full h-9"
                  >
                    {news ? 'Enregistrer' : 'Créer'}
                  </Button>
                </div>
              </TooltipTrigger>
              {isTargetEmpty() && (
                <TooltipContent side="top" className="max-w-[250px]">
                  <p className="text-xs">
                    Vous devez sélectionner au moins un fonds ou une audience avant de pouvoir enregistrer
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NewsSettingsContent() {
  const [news, setNews] = useState(mockNews);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [helpMode, setHelpMode] = useState(false);
  
  // Filtres
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const moveNews = (dragIndex: number, hoverIndex: number) => {
    const dragNews = news[dragIndex];
    const newNews = [...news];
    newNews.splice(dragIndex, 1);
    newNews.splice(hoverIndex, 0, dragNews);
    
    setNews(newNews.map((n, index) => ({
      ...n,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingNews(null);
    setIsPanelOpen(true);
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setIsPanelOpen(true);
  };

  const handleSave = (newsData: Partial<News>) => {
    if (editingNews) {
      setNews(news.map(n => 
        n.id === editingNews.id 
          ? { ...n, ...newsData }
          : n
      ));
    } else {
      const newNews: News = {
        id: Date.now().toString(),
        rank: news.length,
        ...newsData as News
      };
      setNews([...news, newNews]);
    }
    setIsPanelOpen(false);
    setEditingNews(null);
  };

  const handleDelete = (newsItem: News) => {
    setDeletingNews(newsItem);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingNews) {
      setNews(news.filter(n => n.id !== deletingNews.id));
      setIsDeleteDialogOpen(false);
      setDeletingNews(null);
    }
  };

  // Filtrer les actualités selon la recherche et les filtres
  const filteredNews = news.filter(newsItem => {
    // Filtre de recherche
    const matchesSearch = newsItem.titre.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par fonds
    const matchesFund = !selectedFund || 
      newsItem.allFunds || 
      newsItem.fondUnique === selectedFund;
    
    // Filtre par audiences/cibles
    const matchesAudience = selectedAudiences.length === 0 || 
      selectedAudiences.some(audience => {
        if (audience === 'Investisseurs') return newsItem.audienceInvestisseurs;
        if (audience === 'Partenaires') return newsItem.audiencePartenaires;
        if (audience === 'Participations') return newsItem.audienceParticipations;
        return false;
      });
    
    // Filtre par date
    const newsDate = new Date(newsItem.date.split('/').reverse().join('-'));
    const matchesDateStart = !startDate || newsDate >= startDate;
    const matchesDateEnd = !endDate || newsDate <= endDate;
    
    return matchesSearch && matchesFund && matchesAudience && matchesDateStart && matchesDateEnd;
  });

  // Calculer la pagination
  const totalPages = Math.ceil(filteredNews.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 quand la recherche change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedFund(null);
    setSelectedAudiences([]);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Main Content */}
      <motion.div
        animate={{ 
          width: isPanelOpen ? 'calc(100% - 420px)' : '100%' 
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 overflow-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Actualités</h1>
              <p className="text-sm text-gray-600">
                {news.length} actualité{news.length > 1 ? 's' : ''} publiée{news.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setHelpMode(!helpMode)}
                variant={helpMode ? "default" : "outline"}
                className="h-9"
                style={helpMode ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: 'white'
                } : {}}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {helpMode ? 'Guidage activé' : 'Aide'}
              </Button>
              <Button
                onClick={handleAdd}
                style={{
                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                  color: 'white'
                }}
                className="h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une actualité
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <InfoBanner
            isVisible={helpMode}
            title="Les actualités"
            description="Les actualités permettent de communiquer des informations importantes à vos investisseurs, partenaires et participations. Chaque actualité peut être ciblée par fonds et par audience, avec la possibilité de la mettre en avant sur la page d'accueil. Les contenus sont multilingues (FR, EN, ES) pour s'adapter à tous vos utilisateurs."
            helpUrl="https://investhub.zohodesk.eu/portal/fr/kb/articles/actualit%C3%A9s"
          />

          {/* Filters Section */}
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par titre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>

              {/* Filtre Fonds */}
              <Select value={selectedFund || '__all__'} onValueChange={(value) => setSelectedFund(value === '__all__' ? null : value)}>
                <SelectTrigger 
                  className={cn(
                    'w-[200px] min-h-[42px] border-gray-200',
                    selectedFund && 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  )}
                >
                  <SelectValue placeholder="Tous les fonds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les fonds</SelectItem>
                  {availableFonds.map((fund) => (
                    <SelectItem key={fund} value={fund}>
                      {fund}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtre Cibles/Audiences */}
              <ModernMultiSelect
                value={selectedAudiences}
                onChange={setSelectedAudiences}
                options={[
                  { value: 'Investisseurs', label: 'Investisseurs', icon: UsersRound },
                  { value: 'Partenaires', label: 'Partenaires', icon: Handshake },
                  { value: 'Participations', label: 'Participations', icon: TrendingUp }
                ]}
                placeholder="Toutes les cibles"
                className="w-[200px]"
              />

              {/* Filtre Date Range */}
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                placeholder="Toutes les dates"
              />

              {/* Bouton Effacer */}
              {(selectedFund || selectedAudiences.length > 0 || startDate || endDate) && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="h-9"
                >
                  <X className="w-4 h-4 mr-2" />
                  Effacer les filtres
                </Button>
              )}
            </div>

            {/* Résumé des filtres actifs */}
            {(selectedFund || selectedAudiences.length > 0 || startDate || endDate) && (
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">
                <span className="font-medium">Filtres actifs :</span>
                {selectedFund && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Fonds: {selectedFund}
                  </Badge>
                )}
                {selectedAudiences.map((audience) => (
                  <Badge key={audience} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {audience}
                  </Badge>
                ))}
                {(startDate || endDate) && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {startDate && endDate
                      ? `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`
                      : startDate
                      ? `Depuis ${startDate.toLocaleDateString('fr-FR')}`
                      : `Jusqu'au ${endDate!.toLocaleDateString('fr-FR')}`
                    }
                  </Badge>
                )}
              </div>
            )}

            {/* Résultats */}
            <div className="text-xs text-gray-500 mt-3">
              {filteredNews.length} résultat{filteredNews.length > 1 ? 's' : ''} sur {news.length} actualité{news.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Titre</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Fonds</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Cibles</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        {searchQuery ? (
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 text-gray-300" />
                            <p className="text-sm">Aucune actualité trouvée pour "{searchQuery}"</p>
                          </div>
                        ) : (
                          <p className="text-sm">Aucune actualité configurée. Cliquez sur "Ajouter une actualité" pour commencer.</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedNews.map((newsItem, index) => (
                      <DraggableRow
                        key={newsItem.id}
                        news={newsItem}
                        index={startIndex + index}
                        moveNews={moveNews}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showDragHandle={!isPanelOpen}
                        isPanelOpen={isPanelOpen}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredNews.length > 0 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredNews.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
                showPageSizeSelector={true}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-3">
              Êtes-vous sûr de vouloir supprimer l'actualité "{deletingNews?.titre}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-9"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              style={{
                background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                color: 'white'
              }}
              className="h-9"
            >
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Side Panel */}
      <Panel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingNews(null);
        }}
        news={editingNews}
        onSave={handleSave}
        helpMode={helpMode}
      />
    </div>
  );
}

export default function NewsSettings() {
  return (
    <TooltipProvider>
      <DndProvider backend={HTML5Backend}>
        <NewsSettingsContent />
      </DndProvider>
    </TooltipProvider>
  );
}
