import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, AlertTriangle, Users, Mail, Globe, Search, HelpCircle, Lightbulb, ArrowRight, FolderOpen } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { CountBadge } from '../ui/count-badge';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion, AnimatePresence } from 'motion/react';

interface MailGroup {
  id: string;
  nom: string;
  translations: {
    fr: string;
    en: string;
    es: string;
  };
  notificationsCount: number;
  rank: number;
}

const mockMailGroups: MailGroup[] = [
  { 
    id: '1', 
    nom: 'Autre',
    translations: { fr: 'Autre', en: 'Other', es: 'Otro' },
    notificationsCount: 3, 
    rank: 0 
  },
  { 
    id: '2', 
    nom: 'Invitation aux réunions LP',
    translations: { fr: 'Invitation aux réunions LP', en: 'LP Meeting Invitations', es: 'Invitaciones a reuniones LP' },
    notificationsCount: 1, 
    rank: 1 
  },
  { 
    id: '3', 
    nom: 'LPs',
    translations: { fr: 'LPs', en: 'LPs', es: 'LPs' },
    notificationsCount: 0, 
    rank: 2 
  },
  { 
    id: '4', 
    nom: 'Notices - Appels et Distributions',
    translations: { fr: 'Notices - Appels et Distributions', en: 'Notices - Calls and Distributions', es: 'Avisos - Llamadas y Distribuciones' },
    notificationsCount: 5, 
    rank: 3 
  },
  { 
    id: '5', 
    nom: 'Notices EN - Appels et Distributions',
    translations: { fr: 'Notices EN - Appels et Distributions', en: 'Notices EN - Calls and Distributions', es: 'Avisos EN - Llamadas y Distribuciones' },
    notificationsCount: 1, 
    rank: 4 
  },
  { 
    id: '6', 
    nom: 'Onboarding',
    translations: { fr: 'Onboarding', en: 'Onboarding', es: 'Incorporación' },
    notificationsCount: 1, 
    rank: 5 
  },
  { 
    id: '7', 
    nom: 'Reporting (Via communication)',
    translations: { fr: 'Reporting (Via communication)', en: 'Reporting (Via communication)', es: 'Reportes (Vía comunicación)' },
    notificationsCount: 1, 
    rank: 6 
  },
  { 
    id: '8', 
    nom: 'Reportings et AIC',
    translations: { fr: 'Reportings et AIC', en: 'Reporting and AIC', es: 'Reportes y AIC' },
    notificationsCount: 1, 
    rank: 7 
  },
];

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

// Composant HelpCard pour les aides contextuelles sur chaque champ
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

interface MailGroupPanelProps {
  mailGroup?: MailGroup;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mailGroup: Omit<MailGroup, 'id' | 'rank' | 'notificationsCount'>) => void;
  helpMode: boolean;
}

const MailGroupPanel: React.FC<MailGroupPanelProps> = ({ mailGroup, isOpen, onClose, onSave, helpMode }) => {
  const [nom, setNom] = useState(mailGroup?.nom || '');

  React.useEffect(() => {
    if (mailGroup) {
      setNom(mailGroup.nom);
    } else {
      setNom('');
    }
  }, [mailGroup, isOpen]);

  const handleSave = () => {
    // Vérifier que le champ est rempli
    if (!nom.trim()) return;
    
    onSave({
      nom: nom.trim(),
      translations: { fr: nom.trim(), en: nom.trim(), es: nom.trim() }, // Garder la même valeur pour compatibilité
    });
    onClose();
  };

  // Vérifier si le champ est rempli
  const isFormValid = nom.trim().length > 0;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-900">
                  {mailGroup ? 'Modifier un groupe' : 'Ajouter un groupe'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration du groupe de mails
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            <div className="p-4 space-y-4">
              {/* Nom du groupe Section */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-900">
                  Nom du groupe<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Onboarding"
                  className="h-9 text-sm"
                />
              </div>
              
              <HelpCard
                isVisible={helpMode}
                title="Nom du groupe"
                description="Identifie la catégorie fonctionnelle (ex. : 'Onboarding', 'Facturation', 'Appels de fonds')."
              />

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-9 text-sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  style={{
                    background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                    color: 'white'
                  }}
                  className="flex-1 h-9 text-sm"
                  disabled={!isFormValid}
                >
                  {mailGroup ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function MailGroupsSettingsContent() {
  const [mailGroups, setMailGroups] = useState(mockMailGroups);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingMailGroup, setEditingMailGroup] = useState<MailGroup | undefined>();
  const [deletingMailGroup, setDeletingMailGroup] = useState<MailGroup | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [migrationTargetId, setMigrationTargetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [helpMode, setHelpMode] = useState(false);

  const handleAdd = () => {
    setEditingMailGroup(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (mailGroup: MailGroup) => {
    setEditingMailGroup(mailGroup);
    setIsPanelOpen(true);
  };

  const handleSave = (mailGroupData: Omit<MailGroup, 'id' | 'rank' | 'notificationsCount'>) => {
    if (editingMailGroup) {
      setMailGroups(mailGroups.map(mailGroup => 
        mailGroup.id === editingMailGroup.id 
          ? { ...mailGroup, ...mailGroupData }
          : mailGroup
      ));
    } else {
      const newMailGroup: MailGroup = {
        id: Date.now().toString(),
        ...mailGroupData,
        notificationsCount: 0,
        rank: mailGroups.length
      };
      setMailGroups([...mailGroups, newMailGroup]);
    }
    setIsPanelOpen(false);
    setEditingMailGroup(undefined);
  };

  const handleDelete = (id: string) => {
    const mailGroup = mailGroups.find(g => g.id === id);
    if (mailGroup) {
      setDeletingMailGroup(mailGroup);
      setMigrationTargetId('');
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingMailGroup) {
      // Si une migration est sélectionnée, mettre à jour le count du groupe cible
      if (migrationTargetId) {
        setMailGroups(mailGroups.filter(g => g.id !== deletingMailGroup.id).map((mailGroup, index) => {
          if (mailGroup.id === migrationTargetId) {
            return {
              ...mailGroup,
              notificationsCount: mailGroup.notificationsCount + deletingMailGroup.notificationsCount,
              rank: index
            };
          }
          return {
            ...mailGroup,
            rank: index
          };
        }));
      } else {
        // Suppression sans migration
        setMailGroups(mailGroups.filter(g => g.id !== deletingMailGroup.id).map((mailGroup, index) => ({
          ...mailGroup,
          rank: index
        })));
      }
      setIsDeleteDialogOpen(false);
      setDeletingMailGroup(undefined);
      setMigrationTargetId('');
    }
  };

  // Filtrer les groupes de mails selon la recherche
  const filteredMailGroups = mailGroups.filter(mailGroup =>
    mailGroup.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if the mail group to delete has references (notifications)
  const hasReferences = deletingMailGroup 
    ? deletingMailGroup.notificationsCount > 0
    : false;

  // Get available substitute mail groups (excluding the one being deleted)
  const availableSubstitutes = deletingMailGroup
    ? mailGroups.filter(g => g.id !== deletingMailGroup.id)
    : [];

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingMailGroup(undefined);
          setMigrationTargetId('');
        }
      }}>
        <AlertDialogContent className={hasReferences ? "max-w-2xl max-h-[90vh] overflow-y-auto" : "max-w-md"}>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left mb-1">
                  Supprimer le groupe de mails ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-left space-y-4">
                {deletingMailGroup && (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">{deletingMailGroup.nom}</span>
                        <CountBadge count={deletingMailGroup.notificationsCount} icon={Mail} variant="purple" />
                      </div>
                    </div>
                    
                    {hasReferences ? (
                      <>
                        {/* Warning for mail group with notifications */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-amber-900 mb-1">
                                <strong>Attention : notifications associées</strong>
                              </p>
                              <p className="text-sm text-amber-800 leading-relaxed">
                                Ce groupe contient <strong>{deletingMailGroup.notificationsCount} notification{deletingMailGroup.notificationsCount > 1 ? 's' : ''}</strong>. 
                                Vous pouvez choisir de les migrer vers un autre groupe.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Substitute selector - Optional */}
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">
                            Groupe de substitution (optionnel)
                          </Label>
                          <p className="text-xs text-gray-600 mb-2">
                            Si vous sélectionnez un groupe, toutes les notifications seront automatiquement migrées. Sinon, elles seront supprimées avec le groupe.
                          </p>
                          <Select value={migrationTargetId} onValueChange={setMigrationTargetId}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Ne pas migrer (supprimer les notifications)" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSubstitutes.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  Aucun autre groupe disponible pour la migration.
                                </div>
                              ) : (
                                availableSubstitutes.map((g) => (
                                  <SelectItem key={g.id} value={g.id}>
                                    {g.nom}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {migrationTargetId ? (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <strong>Action :</strong> Les <strong>{deletingMailGroup.notificationsCount} notification{deletingMailGroup.notificationsCount > 1 ? 's' : ''}</strong> de 
                              "{deletingMailGroup.nom}" seront automatiquement transférées vers "{availableSubstitutes.find(g => g.id === migrationTargetId)?.nom}".
                            </p>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <>
                        {/* Simple deletion for unreferenced mail group */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-green-900 mb-1">
                                <strong>Suppression</strong>
                              </p>
                              <p className="text-sm text-green-800">
                                Ce groupe ne contient aucune notification. Vous pouvez le supprimer en toute sécurité.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer ce groupe ?
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingMailGroup(undefined);
                setMigrationTargetId('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {hasReferences && migrationTargetId ? 'Supprimer et migrer' : 'Supprimer définitivement'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <motion.div 
        animate={{ 
          width: isPanelOpen ? 'calc(100% - 420px)' : '100%' 
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 overflow-auto"
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Groupes de mails</h1>
              <p className="text-sm text-gray-600">Gérer les groupes de mails</p>
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
                Ajouter un groupe
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <InfoBanner
            isVisible={helpMode}
            title="Groupes de mails"
            description="La page Groupes de mails permet aux administrateurs de centraliser, organiser et suivre les différents gabarits (templates) de mails utilisés dans la plateforme InvestHub, en les regroupant par finalité métier (ex. : Onboarding, Appels de fonds, Reporting...). Chaque groupe regroupe un ensemble de gabarits de mails associés à un périmètre fonctionnel ou à un usage spécifique. Le nombre affiché représente le nombre de gabarits externes actifs dans le groupe (les mails internes ne sont pas comptabilisés)."
            helpUrl="https://investhub.zohodesk.eu/portal/fr/kb/articles/groupes-de-mails"
          />

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    <th className="text-left p-3 text-sm text-gray-600">Nombre de notifications liées</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMailGroups.length > 0 ? (
                    filteredMailGroups.map((mailGroup) => (
                      <tr
                        key={mailGroup.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3">
                          <span className="text-sm">{mailGroup.nom}</span>
                        </td>
                        <td className="p-3">
                          <CountBadge count={mailGroup.notificationsCount} icon={Mail} variant="purple" />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(mailGroup)}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mailGroup.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-gray-300" />
                          <p className="text-sm">Aucun groupe trouvé pour "{searchQuery}"</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Panel */}
      <MailGroupPanel
        mailGroup={editingMailGroup}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingMailGroup(undefined);
        }}
        onSave={handleSave}
        helpMode={helpMode}
      />
    </div>
  );
}

export function MailGroupsSettings() {
  return <MailGroupsSettingsContent />;
}