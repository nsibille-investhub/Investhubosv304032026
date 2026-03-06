import React, { useState, useRef } from 'react';
import { 
  Plus, Trash2, GripVertical, Edit2, X, AlertTriangle, Users, ChevronsUpDown, Check,
  UserCircle2, UsersRound, Settings, Target, TrendingUp, Briefcase, Wrench, 
  BarChart3, Star, Rocket, Building2, Shield, Code, Palette, Headphones, Globe
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CountBadge } from '../ui/count-badge';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

interface Team {
  id: string;
  nom: string;
  icone: string;
  membresCount: number;
  rank: number;
}

const mockTeams: Team[] = [
  { id: '1', nom: 'Front', icone: 'UserCircle2', membresCount: 6, rank: 0 },
  { id: '2', nom: 'Ops', icone: 'Settings', membresCount: 2, rank: 1 },
  { id: '3', nom: 'Back Office', icone: 'BarChart3', membresCount: 0, rank: 2 },
];

// Icônes disponibles avec leurs composants
const iconComponents = {
  UserCircle2,
  UsersRound,
  Settings,
  Target,
  TrendingUp,
  Briefcase,
  Wrench,
  BarChart3,
  Star,
  Rocket,
  Building2,
  Shield,
  Code,
  Palette,
  Headphones,
  Globe,
};

const iconOptions = [
  { value: 'UserCircle2', label: 'Utilisateur' },
  { value: 'UsersRound', label: 'Groupe' },
  { value: 'Settings', label: 'Paramètres' },
  { value: 'Target', label: 'Cible' },
  { value: 'BarChart3', label: 'Analytics' },
  { value: 'Briefcase', label: 'Business' },
  { value: 'Wrench', label: 'Outils' },
  { value: 'TrendingUp', label: 'Croissance' },
  { value: 'Star', label: 'Excellence' },
  { value: 'Rocket', label: 'Innovation' },
  { value: 'Building2', label: 'Organisation' },
  { value: 'Shield', label: 'Sécurité' },
  { value: 'Code', label: 'Développement' },
  { value: 'Palette', label: 'Design' },
  { value: 'Headphones', label: 'Support' },
  { value: 'Globe', label: 'Global' },
];

interface DraggableRowProps {
  team: Team;
  index: number;
  moveTeam: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (team: Team) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  team,
  index,
  moveTeam,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'team',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveTeam(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'team',
    item: () => {
      return { id: team.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isPanelOpen,
  });

  const opacity = isDragging ? 0.4 : 1;
  preview(drop(ref));

  return (
    <tr
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="border-b border-gray-200 hover:bg-gray-50"
    >
      {!isPanelOpen && (
        <td className="p-3 w-8">
          <div ref={drag} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </td>
      )}
      <td className="p-3">
        <span className="text-sm text-gray-900">{team.nom}</span>
      </td>
      {!isPanelOpen && (
        <td className="p-3">
          {React.createElement(iconComponents[team.icone as keyof typeof iconComponents], {
            className: "w-5 h-5 text-gray-700"
          })}
        </td>
      )}
      <td className="p-3">
        <CountBadge count={team.membresCount} icon={Users} variant="purple" />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(team)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(team.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSave: (team: Partial<Team>) => void;
}

const Panel: React.FC<PanelProps> = ({ isOpen, onClose, team, onSave }) => {
  const [nom, setNom] = useState(team?.nom || '');
  const [icone, setIcone] = useState(team?.icone || 'UserCircle2');
  const [iconeOpen, setIconeOpen] = useState(false);

  React.useEffect(() => {
    if (team) {
      setNom(team.nom);
      setIcone(team.icone);
    } else {
      setNom('');
      setIcone('UserCircle2');
    }
  }, [team]);

  const handleSave = () => {
    onSave({
      id: team?.id,
      nom,
      icone,
    });
  };

  const selectedIcon = iconOptions.find(i => i.value === icone);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm text-gray-900">
                  {team ? 'Modifier une équipe' : 'Créer une équipe'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {team ? 'Modifiez les informations de l\'équipe' : 'Ajoutez une nouvelle équipe'}
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
          <div className="overflow-y-auto">
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Nom<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Front"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Icone<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Popover open={iconeOpen} onOpenChange={setIconeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={iconeOpen}
                        className="w-full justify-between h-9 bg-white text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {React.createElement(iconComponents[icone as keyof typeof iconComponents], {
                            className: "w-4 h-4 text-gray-700"
                          })}
                          <span className="text-sm">{selectedIcon?.label || 'Sélectionner une icône'}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher une icône..." />
                        <CommandList>
                          <CommandEmpty>Aucune icône trouvée.</CommandEmpty>
                          <CommandGroup>
                            {iconOptions.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                  setIcone(option.value);
                                  setIconeOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    icone === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {React.createElement(iconComponents[option.value as keyof typeof iconComponents], {
                                  className: "w-4 h-4 mr-2 text-gray-700"
                                })}
                                <span className="text-sm">{option.label}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Information Section - Read Only */}
                {team && (
                  <div className="pt-2 border-t border-gray-200">
                    <Label className="text-xs text-gray-600 mb-2.5 block">Informations</Label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Membres</span>
                        <CountBadge count={team.membresCount} icon={Users} variant="purple" />
                      </div>
                    </div>
                  </div>
                )}

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
                    disabled={!nom.trim()}
                  >
                    {team ? 'Enregistrer' : 'Créer'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function TeamsSettingsContent() {
  const [teams, setTeams] = useState(mockTeams);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [replacementTeamId, setReplacementTeamId] = useState('');

  const moveTeam = (dragIndex: number, hoverIndex: number) => {
    const dragTeam = teams[dragIndex];
    const newTeams = [...teams];
    newTeams.splice(dragIndex, 1);
    newTeams.splice(hoverIndex, 0, dragTeam);
    const rerankedTeams = newTeams.map((team, index) => ({
      ...team,
      rank: index,
    }));
    setTeams(rerankedTeams);
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setIsPanelOpen(true);
  };

  const handleCreate = () => {
    setSelectedTeam(null);
    setIsPanelOpen(true);
  };

  const handleSave = (teamData: Partial<Team>) => {
    if (selectedTeam) {
      setTeams(teams.map(t =>
        t.id === selectedTeam.id
          ? { ...t, ...teamData }
          : t
      ));
    } else {
      const newTeam: Team = {
        id: Date.now().toString(),
        nom: teamData.nom || '',
        icone: teamData.icone || 'UserCircle2',
        membresCount: 0,
        rank: teams.length,
      };
      setTeams([...teams, newTeam]);
    }
    setIsPanelOpen(false);
    setSelectedTeam(null);
  };

  const handleDelete = (id: string) => {
    const team = teams.find(t => t.id === id);
    if (team) {
      setTeamToDelete(team);
      setReplacementTeamId('');
    }
  };

  const confirmDelete = () => {
    if (teamToDelete) {
      // If team has members and a replacement was selected, migrate members
      if (teamToDelete.membresCount > 0 && replacementTeamId) {
        const updatedTeams = teams.map(t => 
          t.id === replacementTeamId 
            ? { ...t, membresCount: t.membresCount + teamToDelete.membresCount }
            : t
        ).filter(t => t.id !== teamToDelete.id);
        setTeams(updatedTeams);
      } else {
        // If no members, just delete
        setTeams(teams.filter(t => t.id !== teamToDelete.id));
      }
      setTeamToDelete(null);
      setReplacementTeamId('');
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!teamToDelete} onOpenChange={(open) => {
        if (!open) {
          setTeamToDelete(null);
          setReplacementTeamId('');
        }
      }}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left mb-1">
                  Supprimer l'équipe ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-5">
              {teamToDelete && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      {React.createElement(iconComponents[teamToDelete.icone as keyof typeof iconComponents], {
                        className: "w-5 h-5 text-gray-700"
                      })}
                      <span className="text-sm">{teamToDelete.nom}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {teamToDelete.membresCount} membre{teamToDelete.membresCount > 1 ? 's' : ''} actuellement assigné{teamToDelete.membresCount > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Replacement Team Selector - Only if team has members */}
                  {teamToDelete.membresCount > 0 && (
                    <div>
                      <Label className="text-sm text-gray-900 mb-2 block">
                        Équipe de remplacement <span className="text-red-600">*</span>
                      </Label>
                      <p className="text-xs text-gray-600 mb-3">
                        {teamToDelete.membresCount > 1 
                          ? `Les ${teamToDelete.membresCount} membres seront automatiquement migrés vers cette équipe`
                          : `Le membre sera automatiquement migré vers cette équipe`}
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between h-10 bg-white",
                              !replacementTeamId && "text-gray-400"
                            )}
                          >
                            {replacementTeamId ? (
                              <div className="flex items-center gap-2">
                                {React.createElement(iconComponents[teams.find(t => t.id === replacementTeamId)?.icone as keyof typeof iconComponents], {
                                  className: "w-4 h-4 text-gray-700"
                                })}
                                <span className="text-sm">{teams.find(t => t.id === replacementTeamId)?.nom}</span>
                              </div>
                            ) : (
                              <span>Sélectionner une équipe de remplacement</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher une équipe..." />
                            <CommandList>
                              <CommandEmpty>Aucune équipe trouvée.</CommandEmpty>
                              <CommandGroup>
                                {teams.filter(t => t.id !== teamToDelete.id).map((team) => (
                                  <CommandItem
                                    key={team.id}
                                    value={team.nom}
                                    onSelect={() => {
                                      setReplacementTeamId(team.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        replacementTeamId === team.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {React.createElement(iconComponents[team.icone as keyof typeof iconComponents], {
                                      className: "w-4 h-4 mr-2 text-gray-700"
                                    })}
                                    <span className="text-sm">{team.nom}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Warning Details */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. La suppression entraînera :
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1.5 ml-4">
                      {teamToDelete.membresCount > 0 && (
                        <>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>Migration automatique des membres vers la nouvelle équipe</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>Conservation de l'historique avec trace de la migration</span>
                          </li>
                        </>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Impact sur les filtres et rapports existants</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setTeamToDelete(null);
                setReplacementTeamId('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={teamToDelete?.membresCount > 0 && !replacementTeamId}
              className={cn(
                "bg-red-600 hover:bg-red-700 text-white",
                teamToDelete?.membresCount > 0 && !replacementTeamId && "opacity-50 cursor-not-allowed"
              )}
            >
              {teamToDelete?.membresCount > 0 ? 'Supprimer et migrer' : 'Supprimer'}
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
              <h1 className="text-2xl mb-2">Équipes</h1>
              <p className="text-sm text-gray-600">Gérez les équipes et leurs membres</p>
            </div>
            <Button
              onClick={handleCreate}
              style={{
                background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                color: 'white'
              }}
              className="h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une équipe
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12"></th>}
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    {!isPanelOpen && (
                      <th className="text-left p-3 text-sm text-gray-600">Icone</th>
                    )}
                    <th className="text-left p-3 text-sm text-gray-600">Membres</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <DraggableRow
                      key={team.id}
                      team={team}
                      index={index}
                      moveTeam={moveTeam}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isPanelOpen={isPanelOpen}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Panel */}
      <Panel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        onSave={handleSave}
      />
    </div>
  );
}

export function TeamsSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <TeamsSettingsContent />
    </DndProvider>
  );
}
