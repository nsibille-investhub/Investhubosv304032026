import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, X, Users, Handshake, TrendingUp, Search, HelpCircle, Lightbulb, Image as ImageIcon, Home, Filter, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from '../ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ImageUpload } from '../ui/image-upload';

interface ClassificationRule {
  id: string;
  onboardingId: string;
  onboardingName: string;
  sectionId: string;
  sectionName: string;
  questionId: string;
  questionName: string;
  answerId?: string; // Pour investisseurs seulement
  answerName?: string; // Pour investisseurs seulement
}

interface Segment {
  id: string;
  nom: string;
  icone?: string;
  pageAccueil?: string; // Investisseurs seulement
  exclureAgregation: boolean; // Investisseurs seulement
  classificationAutomatique: boolean;
  regles: ClassificationRule[];
  nombreObjets: number;
  type: 'investisseurs' | 'partenaires' | 'participations';
}

// Mock data
const mockOnboardings = [
  { id: '1', name: 'Onboarding Personne Physique' },
  { id: '2', name: 'Onboarding Personne Morale' },
  { id: '3', name: 'Onboarding Partenaire CGP' },
  { id: '4', name: 'Onboarding Participation Startup' },
];

const mockSections = [
  { id: '1', name: 'Identité', onboardingId: '1' },
  { id: '2', name: 'Profil Investisseur', onboardingId: '1' },
  { id: '3', name: 'Documents', onboardingId: '1' },
  { id: '4', name: 'Type de structure', onboardingId: '2' },
  { id: '5', name: 'Qualification', onboardingId: '3' },
  { id: '6', name: 'Secteur d\'activité', onboardingId: '4' },
];

const mockQuestions = [
  { id: '1', name: 'Pays de résidence', sectionId: '1' },
  { id: '2', name: 'Type d\'investisseur', sectionId: '2' },
  { id: '3', name: 'Montant investi annuel', sectionId: '2' },
  { id: '4', name: 'Forme juridique', sectionId: '4' },
  { id: '5', name: 'Statut professionnel', sectionId: '5' },
  { id: '6', name: 'Industrie', sectionId: '6' },
];

const mockAnswers = [
  { id: '1', name: 'France', questionId: '1' },
  { id: '2', name: 'États-Unis', questionId: '1' },
  { id: '3', name: 'Investisseur qualifié', questionId: '2' },
  { id: '4', name: 'Investisseur particulier', questionId: '2' },
  { id: '5', name: '< 50k€', questionId: '3' },
  { id: '6', name: '> 50k€', questionId: '3' },
];

const mockSegments: Segment[] = [
  {
    id: '1',
    nom: 'Client Éligible PACA',
    icone: '🏖️',
    pageAccueil: '/home/paca',
    exclureAgregation: false,
    classificationAutomatique: true,
    regles: [
      {
        id: 'r1',
        onboardingId: '1',
        onboardingName: 'Onboarding Personne Physique',
        sectionId: '1',
        sectionName: 'Identité',
        questionId: '1',
        questionName: 'Pays de résidence',
        answerId: '1',
        answerName: 'France',
      },
    ],
    nombreObjets: 234,
    type: 'investisseurs',
  },
  {
    id: '2',
    nom: 'US Person',
    icone: '🇺🇸',
    exclureAgregation: false,
    classificationAutomatique: true,
    regles: [
      {
        id: 'r2',
        onboardingId: '1',
        onboardingName: 'Onboarding Personne Physique',
        sectionId: '1',
        sectionName: 'Identité',
        questionId: '1',
        questionName: 'Pays de résidence',
        answerId: '2',
        answerName: 'États-Unis',
      },
    ],
    nombreObjets: 45,
    type: 'investisseurs',
  },
  {
    id: '3',
    nom: 'CGP Partenaires immobiliers',
    icone: '🏠',
    classificationAutomatique: true,
    exclureAgregation: false,
    regles: [
      {
        id: 'r3',
        onboardingId: '3',
        onboardingName: 'Onboarding Partenaire CGP',
        sectionId: '5',
        sectionName: 'Qualification',
        questionId: '5',
        questionName: 'Statut professionnel',
      },
    ],
    nombreObjets: 18,
    type: 'partenaires',
  },
  {
    id: '4',
    nom: 'Startups Tech',
    icone: '💻',
    classificationAutomatique: true,
    exclureAgregation: false,
    regles: [
      {
        id: 'r4',
        onboardingId: '4',
        onboardingName: 'Onboarding Participation Startup',
        sectionId: '6',
        sectionName: 'Secteur d\'activité',
        questionId: '6',
        questionName: 'Industrie',
      },
    ],
    nombreObjets: 12,
    type: 'participations',
  },
  {
    id: '5',
    nom: 'Investisseur qualifié',
    icone: '⭐',
    pageAccueil: '/home/qualified',
    exclureAgregation: true,
    classificationAutomatique: true,
    regles: [
      {
        id: 'r5',
        onboardingId: '1',
        onboardingName: 'Onboarding Personne Physique',
        sectionId: '2',
        sectionName: 'Profil Investisseur',
        questionId: '2',
        questionName: 'Type d\'investisseur',
        answerId: '3',
        answerName: 'Investisseur qualifié',
      },
    ],
    nombreObjets: 67,
    type: 'investisseurs',
  },
  {
    id: '6',
    nom: 'VIP Client',
    icone: '👑',
    exclureAgregation: false,
    classificationAutomatique: false,
    regles: [],
    nombreObjets: 8,
    type: 'investisseurs',
  },
];

// InfoBanner Component
interface InfoBannerProps {
  title: string;
  description: string;
  helpUrl: string;
}

function InfoBanner({ title, description, helpUrl }: InfoBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
      <div className="flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm text-blue-900 dark:text-blue-100 mb-1">{title}</h4>
              <AlertDescription className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {description}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 h-7 px-2"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Réduire
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mr-1" />
                  Documentation complète
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4 text-xs text-blue-700 dark:text-blue-300">
                  <div>
                    <h5 className="font-semibold mb-2">🎯 Objectif de la fonctionnalité</h5>
                    <p className="leading-relaxed">
                      La segmentation permet de :
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Structurer les données par typologie (Clients US, CGP, Industry sector…)</li>
                      <li>Cibler la communication, les documents, et les éléments du portail</li>
                      <li>Automatiser l'affectation via onboarding</li>
                      <li>Compléter ou corriger manuellement depuis le profil d'un objet</li>
                      <li>Restreindre l'accès à certains modules ou portails</li>
                      <li>Gérer des documents et conventions selon les segments</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">📋 Configuration d'un segment</h5>
                    <ul className="space-y-1">
                      <li><strong>Nom :</strong> Libellé du segment</li>
                      <li><strong>Icône / Logo :</strong> Personnalisation visuelle pour le portail</li>
                      <li><strong>Page d'accueil :</strong> Page dédiée visible dans le portail (investisseurs uniquement)</li>
                      <li><strong>Exclure de l'agrégation :</strong> Retire de certains tableaux consolidés (investisseurs uniquement)</li>
                      <li><strong>Classification automatique :</strong> Active les règles d'attribution basées sur l'onboarding</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">🤖 Classification automatique</h5>
                    <p className="leading-relaxed mb-2">
                      Une règle associe : <strong>Onboarding → Section → Question → Réponse</strong> (investisseurs uniquement)
                    </p>
                    <p className="leading-relaxed">
                      Une catégorie est attribuée automatiquement si au moins une règle correspond.
                      Plusieurs règles peuvent coexister - elles sont composées avec des "OU".
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">🔄 Attribution automatique & manuelle</h5>
                    <p className="leading-relaxed mb-2">
                      <strong>Automatique :</strong> Déclenchée lors de l'onboarding, l'invitation, la création rapide, ou via les settings globaux.
                    </p>
                    <p className="leading-relaxed">
                      <strong>Manuelle :</strong> Chaque objet peut être assigné à un ou plusieurs segments depuis son profil.
                      Les segments manuels ne sont jamais supprimés automatiquement.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">⚙️ Settings impactant la segmentation</h5>
                    <ul className="space-y-1">
                      <li><strong>Auto segment for onboarding investor :</strong> Segment auto lors de l'invitation par le partenaire référent</li>
                      <li><strong>Auto segment for invited investor :</strong> Segment auto lors de l'invitation sur l'espace</li>
                      <li><strong>Excluded segments for invite friend :</strong> Segments exclus de la fonction "Envoyer à un ami"</li>
                      <li><strong>Auto segment for self-registered partners :</strong> Segment auto pour les partenaires auto-inscrits</li>
                      <li><strong>Fast partner creation default segments :</strong> Segments appliqués lors de la création rapide</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">🔗 Fonctions liées exploitant la segmentation</h5>
                    <p className="leading-relaxed mb-2">
                      Les segments sont utilisés dans plus de 20 modules de la plateforme :
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Accès & Portails :</strong> Restriction d'accès selon segment</li>
                      <li><strong>Documents :</strong> Catégories, disclaimers, distribution par segment</li>
                      <li><strong>Communication :</strong> Emails ciblés, gabarits, campagnes</li>
                      <li><strong>KYC & Campagnes :</strong> Campagnes investisseurs, reporting, contenu</li>
                      <li><strong>Navigation :</strong> Menu du portail ajusté selon segment</li>
                      <li><strong>Onboardings :</strong> Règles, sections, documents selon segment</li>
                      <li><strong>Partenaires :</strong> Conventions, documents par segment</li>
                      <li><strong>Fonds & Parts :</strong> Restriction de visibilité selon segment</li>
                      <li><strong>Actualités, Événements & Sondages :</strong> Ciblage portail</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                    <a
                      href={helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Consulter la documentation complète
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Alert>
  );
}

// Composant pour afficher une règle
interface RuleDisplayProps {
  rule: ClassificationRule;
  onDelete: () => void;
  showAnswer: boolean;
}

function RuleDisplay({ rule, onDelete, showAnswer }: RuleDisplayProps) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="text-xs">
              {rule.onboardingName}
            </Badge>
            <span className="text-gray-400 dark:text-gray-600">→</span>
            <span className="text-gray-700 dark:text-gray-300">{rule.sectionName}</span>
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            <strong>Question :</strong> {rule.questionName}
          </div>
          {showAnswer && rule.answerName && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Réponse :</strong> {rule.answerName}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Composant principal
export default function SegmentsSettings() {
  const [activeTab, setActiveTab] = useState<'investisseurs' | 'partenaires' | 'participations'>('investisseurs');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState<Segment | null>(null);

  // Form state
  const [nom, setNom] = useState('');
  const [icone, setIcone] = useState<string | undefined>(undefined);
  const [pageAccueil, setPageAccueil] = useState('');
  const [exclureAgregation, setExclureAgregation] = useState(false);
  const [classificationAutomatique, setClassificationAutomatique] = useState(false);
  const [regles, setRegles] = useState<ClassificationRule[]>([]);

  // New rule form state
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const filteredSegments = useMemo(() => {
    return mockSegments
      .filter((s) => s.type === activeTab)
      .filter((s) => s.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeTab, searchTerm]);

  const availableSections = useMemo(() => {
    if (!selectedOnboarding) return [];
    return mockSections.filter((s) => s.onboardingId === selectedOnboarding);
  }, [selectedOnboarding]);

  const availableQuestions = useMemo(() => {
    if (!selectedSection) return [];
    return mockQuestions.filter((q) => q.sectionId === selectedSection);
  }, [selectedSection]);

  const availableAnswers = useMemo(() => {
    if (!selectedQuestion) return [];
    return mockAnswers.filter((a) => a.questionId === selectedQuestion);
  }, [selectedQuestion]);

  const handleCreate = () => {
    setEditingSegment(null);
    setNom('');
    setIcone(undefined);
    setPageAccueil('');
    setExclureAgregation(false);
    setClassificationAutomatique(false);
    setRegles([]);
    setIsPanelOpen(true);
  };

  const handleEdit = (segment: Segment) => {
    setEditingSegment(segment);
    setNom(segment.nom);
    setIcone(segment.icone);
    setPageAccueil(segment.pageAccueil || '');
    setExclureAgregation(segment.exclureAgregation);
    setClassificationAutomatique(segment.classificationAutomatique);
    setRegles(segment.regles);
    setIsPanelOpen(true);
  };

  const handleDelete = (segment: Segment) => {
    setSegmentToDelete(segment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log('Suppression du segment:', segmentToDelete);
    setDeleteDialogOpen(false);
    setSegmentToDelete(null);
  };

  const handleSave = () => {
    console.log('Sauvegarde du segment:', {
      nom,
      icone,
      pageAccueil,
      exclureAgregation,
      classificationAutomatique,
      regles,
      type: activeTab,
    });
    setIsPanelOpen(false);
  };

  const handleAddRule = () => {
    if (!selectedOnboarding || !selectedSection || !selectedQuestion) return;
    if (activeTab === 'investisseurs' && !selectedAnswer) return;

    const onboarding = mockOnboardings.find((o) => o.id === selectedOnboarding);
    const section = mockSections.find((s) => s.id === selectedSection);
    const question = mockQuestions.find((q) => q.id === selectedQuestion);
    const answer = mockAnswers.find((a) => a.id === selectedAnswer);

    const newRule: ClassificationRule = {
      id: `rule_${Date.now()}`,
      onboardingId: selectedOnboarding,
      onboardingName: onboarding?.name || '',
      sectionId: selectedSection,
      sectionName: section?.name || '',
      questionId: selectedQuestion,
      questionName: question?.name || '',
      ...(activeTab === 'investisseurs' && answer
        ? { answerId: answer.id, answerName: answer.name }
        : {}),
    };

    setRegles([...regles, newRule]);
    setIsAddingRule(false);
    setSelectedOnboarding('');
    setSelectedSection('');
    setSelectedQuestion('');
    setSelectedAnswer('');
  };

  const handleDeleteRule = (ruleId: string) => {
    setRegles(regles.filter((r) => r.id !== ruleId));
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'investisseurs':
        return Users;
      case 'partenaires':
        return Handshake;
      case 'participations':
        return TrendingUp;
      default:
        return Users;
    }
  };

  const TabIcon = getTabIcon(activeTab);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
              }}
            >
              <TabIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-gray-900 dark:text-gray-100">Segments</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestion des catégories pour investisseurs, partenaires et participations
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            style={{
              background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
              color: 'white',
            }}
            className="h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un segment
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <InfoBanner
            title="Gestion des Segments & Classification Automatique"
            description="La fonctionnalité Segments (Catégories) permet de structurer les investisseurs, partenaires et participations en groupes homogènes. Elle est essentielle pour la personnalisation du portail, la communication ciblée, les documents, les onboarding, et la gestion commerciale."
            helpUrl="https://help.investhub.com/segments"
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="investisseurs" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Investisseurs
              </TabsTrigger>
              <TabsTrigger value="partenaires" className="flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Partenaires
              </TabsTrigger>
              <TabsTrigger value="participations" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Participations
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {/* Search Bar */}
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un segment..."
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400">Icône</th>
                      <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400">Nom</th>
                      <th className="text-center p-3 text-xs text-gray-500 dark:text-gray-400">Objets associés</th>
                      <th className="text-center p-3 text-xs text-gray-500 dark:text-gray-400">Classification auto</th>
                      <th className="text-right p-3 text-xs text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSegments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'Aucun résultat trouvé' : 'Aucun segment'}
                        </td>
                      </tr>
                    ) : (
                      filteredSegments.map((segment) => (
                        <tr
                          key={segment.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          <td className="p-3">
                            <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-lg">
                              {segment.icone || '📁'}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm dark:text-gray-100">{segment.nom}</span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-xs">
                              {segment.nombreObjets}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            {segment.classificationAutomatique ? (
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: '#DCFDBC',
                                  color: '#000',
                                  border: '1px solid #DCFDBC',
                                }}
                              >
                                Activée
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                Manuelle
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(segment)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Modifier</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(segment)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Supprimer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-[600px] bg-white dark:bg-gray-950 shadow-2xl z-50 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                      }}
                    >
                      <TabIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg text-gray-900 dark:text-gray-100">
                        {editingSegment ? 'Modifier le segment' : 'Créer un segment'}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPanelOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Panel Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                  {/* Nom */}
                  <div>
                    <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                      Nom du segment *
                    </Label>
                    <Input
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Ex: Clients US, CGP Partenaires..."
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* Icône */}
                  <div>
                    <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                      Icône / Logo
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-xl">
                        {icone || '📁'}
                      </div>
                      <Input
                        value={icone || ''}
                        onChange={(e) => setIcone(e.target.value)}
                        placeholder="Emoji ou URL d'image"
                        className="h-9 text-sm flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      Utilisez un emoji (🏠, 🇺🇸, 💻...) ou une URL d'image
                    </p>
                  </div>

                  {/* Page d'accueil - Investisseurs uniquement */}
                  {activeTab === 'investisseurs' && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm text-gray-700 dark:text-gray-300">Page d'accueil</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <HelpCircle className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Page dédiée visible dans le portail investisseur pour ce segment
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        value={pageAccueil}
                        onChange={(e) => setPageAccueil(e.target.value)}
                        placeholder="/home/custom-page"
                        className="h-9 text-sm"
                      />
                    </div>
                  )}

                  {/* Exclure de l'agrégation - Investisseurs uniquement */}
                  {activeTab === 'investisseurs' && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-700 dark:text-gray-300">
                          Exclure de l'agrégation
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <HelpCircle className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Retire ce segment de certains tableaux consolidés et rapports
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch checked={exclureAgregation} onCheckedChange={setExclureAgregation} />
                    </div>
                  )}

                  {/* Classification automatique */}
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <Label className="text-sm text-blue-900 dark:text-blue-100">
                          Classification automatique
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                                <HelpCircle className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Active les règles d'attribution automatique basées sur les réponses aux onboarding
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        checked={classificationAutomatique}
                        onCheckedChange={setClassificationAutomatique}
                      />
                    </div>

                    {/* Règles de classification */}
                    {classificationAutomatique && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-gray-700 dark:text-gray-300">
                            Règles de classification ({regles.length})
                          </Label>
                          {!isAddingRule && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsAddingRule(true)}
                              className="h-8 text-xs"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Ajouter une règle
                            </Button>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          Les règles sont composées avec des "OU" - une seule règle qui correspond suffit pour attribuer le segment.
                        </p>

                        {/* Liste des règles */}
                        {regles.length > 0 && (
                          <div className="space-y-2">
                            {regles.map((rule) => (
                              <RuleDisplay
                                key={rule.id}
                                rule={rule}
                                onDelete={() => handleDeleteRule(rule.id)}
                                showAnswer={activeTab === 'investisseurs'}
                              />
                            ))}
                          </div>
                        )}

                        {/* Formulaire d'ajout de règle */}
                        {isAddingRule && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm text-blue-900 dark:text-blue-100">
                                Nouvelle règle
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIsAddingRule(false);
                                  setSelectedOnboarding('');
                                  setSelectedSection('');
                                  setSelectedQuestion('');
                                  setSelectedAnswer('');
                                }}
                                className="h-7 w-7 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Sélection Onboarding */}
                            <div>
                              <Label className="text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                                1. Onboarding *
                              </Label>
                              <Select value={selectedOnboarding} onValueChange={setSelectedOnboarding}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue placeholder="Choisir un onboarding" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockOnboardings.map((onb) => (
                                    <SelectItem key={onb.id} value={onb.id}>
                                      {onb.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Sélection Section */}
                            {selectedOnboarding && (
                              <div>
                                <Label className="text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                                  2. Section *
                                </Label>
                                <Select value={selectedSection} onValueChange={setSelectedSection}>
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Choisir une section" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableSections.map((sec) => (
                                      <SelectItem key={sec.id} value={sec.id}>
                                        {sec.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Sélection Question */}
                            {selectedSection && (
                              <div>
                                <Label className="text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                                  3. Question déclencheuse *
                                </Label>
                                <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Choisir une question" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableQuestions.map((q) => (
                                      <SelectItem key={q.id} value={q.id}>
                                        {q.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Sélection Réponse - Investisseurs uniquement */}
                            {activeTab === 'investisseurs' && selectedQuestion && (
                              <div>
                                <Label className="text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                                  4. Réponse déclencheuse *
                                </Label>
                                <Select value={selectedAnswer} onValueChange={setSelectedAnswer}>
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Choisir une réponse" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableAnswers.map((a) => (
                                      <SelectItem key={a.id} value={a.id}>
                                        {a.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <Button
                              onClick={handleAddRule}
                              disabled={
                                !selectedOnboarding ||
                                !selectedSection ||
                                !selectedQuestion ||
                                (activeTab === 'investisseurs' && !selectedAnswer)
                              }
                              style={{
                                background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                                color: 'white',
                              }}
                              className="w-full h-9 text-sm"
                            >
                              Ajouter la règle
                            </Button>
                          </div>
                        )}

                        {regles.length === 0 && !isAddingRule && (
                          <Alert className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription className="text-xs">
                              Aucune règle définie. Le segment devra être attribué manuellement.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Panel Footer - Sticky Buttons */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsPanelOpen(false)}
                    className="flex-1 h-10"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!nom.trim()}
                    style={{
                      background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                      color: 'white',
                    }}
                    className="flex-1 h-10"
                  >
                    {editingSegment ? 'Enregistrer' : 'Créer'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le segment "{segmentToDelete?.nom}" ?
              <br />
              <br />
              Cette action est irréversible. Les objets associés ({segmentToDelete?.nombreObjets}) ne seront plus
              liés à ce segment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              style={{
                background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                color: 'white',
              }}
            >
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
