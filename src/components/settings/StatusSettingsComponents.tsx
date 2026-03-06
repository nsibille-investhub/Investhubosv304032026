import React, { useState, useRef } from 'react';
import { GripVertical, Edit2, Trash2, X, Globe, Check, ChevronsUpDown, AlertTriangle, Users, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';
import { BaseStatus, availableIcons, availableColors } from '../../utils/statusSettings';

// Draggable Row Component
interface DraggableStatusRowProps {
  status: BaseStatus;
  index: number;
  moveStatus: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (status: BaseStatus) => void;
  onDelete: (id: string) => void;
  countIcon?: React.ComponentType<{ className?: string }>;
  countLabel?: string;
}

export const DraggableStatusRow: React.FC<DraggableStatusRowProps> = ({ 
  status, 
  index, 
  moveStatus, 
  onEdit, 
  onDelete,
  countIcon: CountIcon = Users,
  countLabel
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'status',
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

      moveStatus(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'status',
    item: () => {
      return { id: status.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const IconComponent = availableIcons.find(i => i.name === status.icon)?.component || User;

  return (
    <tr
      ref={ref}
      data-handler-id={handlerId}
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <td className="p-3">
        <div className="flex items-center gap-2 cursor-move">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </td>
      <td className="p-3">
        <Badge variant="outline" className={`${status.color} border flex items-center gap-1.5 w-fit`}>
          <IconComponent className="w-3.5 h-3.5" />
          {status.name}
        </Badge>
      </td>
      <td className="p-3">
        {status.count !== undefined && (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1.5 w-fit text-xs">
            <CountIcon className="w-3 h-3" />
            {status.count}
          </Badge>
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(status)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(status.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Status Edit Panel Component
interface StatusPanelProps {
  status?: BaseStatus;
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: Omit<BaseStatus, 'id' | 'rank'>) => void;
  title: string;
  subtitle: string;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ 
  status, 
  isOpen, 
  onClose, 
  onSave,
  title,
  subtitle 
}) => {
  const [translations, setTranslations] = useState(status?.translations || { fr: '', en: '', es: '' });
  const [color, setColor] = useState(status?.color || availableColors[0].value);
  const [icon, setIcon] = useState(status?.icon || 'User');
  const [activeLanguage, setActiveLanguage] = useState<'fr' | 'en' | 'es'>('fr');
  const [iconOpen, setIconOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  React.useEffect(() => {
    if (status) {
      setTranslations(status.translations);
      setColor(status.color);
      setIcon(status.icon);
    } else {
      setTranslations({ fr: '', en: '', es: '' });
      setColor(availableColors[0].value);
      setIcon('User');
    }
  }, [status, isOpen]);

  const handleSave = () => {
    if (!translations.fr.trim()) return;
    
    onSave({
      name: translations.fr,
      translations,
      color,
      icon,
      count: status?.count || 0
    });
    onClose();
  };

  const IconComponent = availableIcons.find(i => i.name === icon)?.component || User;

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
                  {title}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {subtitle}
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

          {/* Preview Section - Sticky at top */}
          <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
            <Label className="text-xs text-gray-600 mb-1.5 block">Aperçu</Label>
            <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <Badge variant="outline" className={`${color} border flex items-center gap-2 w-fit px-3 py-1.5`}>
                <IconComponent className="w-4 h-4" />
                <span>{translations[activeLanguage] || 'Nom du statut'}</span>
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Translations Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  <Label className="text-xs text-gray-900">Libellé du statut</Label>
                </div>
                
                <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as 'fr' | 'en' | 'es')} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-3 h-8">
                    <TabsTrigger value="fr" className="text-xs py-1">
                      🇫🇷 FR
                    </TabsTrigger>
                    <TabsTrigger value="en" className="text-xs py-1">
                      🇬🇧 EN
                    </TabsTrigger>
                    <TabsTrigger value="es" className="text-xs py-1">
                      🇪🇸 ES
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="fr" className="mt-0">
                    <Input
                      value={translations.fr}
                      onChange={(e) => setTranslations({ ...translations, fr: e.target.value })}
                      placeholder="Ex: Prospect, En relation..."
                      className="h-9 text-sm"
                    />
                  </TabsContent>
                  
                  <TabsContent value="en" className="mt-0">
                    <Input
                      value={translations.en}
                      onChange={(e) => setTranslations({ ...translations, en: e.target.value })}
                      placeholder="Ex: Prospect, In Relation..."
                      className="h-9 text-sm"
                    />
                  </TabsContent>
                  
                  <TabsContent value="es" className="mt-0">
                    <Input
                      value={translations.es}
                      onChange={(e) => setTranslations({ ...translations, es: e.target.value })}
                      placeholder="Ex: Prospecto, En relación..."
                      className="h-9 text-sm"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Icon Selector */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">Icône</Label>
                <Popover open={iconOpen} onOpenChange={setIconOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={iconOpen}
                      className="w-full justify-between h-9 bg-white text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {React.createElement(availableIcons.find(i => i.name === icon)?.component || User, {
                          className: 'w-3.5 h-3.5 text-gray-600'
                        })}
                        <span className="text-sm">
                          {availableIcons.find(i => i.name === icon)?.label || 'Sélectionner une icône'}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[360px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher une icône..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>Aucune icône trouvée.</CommandEmpty>
                        <CommandGroup>
                          {availableIcons.map((iconOption) => {
                            const Icon = iconOption.component;
                            return (
                              <CommandItem
                                key={iconOption.name}
                                value={iconOption.label}
                                onSelect={() => {
                                  setIcon(iconOption.name);
                                  setIconOpen(false);
                                }}
                                className="text-sm"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3.5 w-3.5",
                                    icon === iconOption.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <Icon className="mr-2 h-3.5 w-3.5 text-gray-600" />
                                <span>{iconOption.label}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Color Selector */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">Couleur</Label>
                <Popover open={colorOpen} onOpenChange={setColorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={colorOpen}
                      className="w-full justify-between h-9 bg-white text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full ${availableColors.find(c => c.value === color)?.preview || 'bg-gray-500'}`} />
                        <span className="text-sm">
                          {availableColors.find(c => c.value === color)?.name || 'Sélectionner une couleur'}
                        </span>
                        <span className="text-xs text-gray-400">
                          · {availableColors.find(c => c.value === color)?.description}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[360px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher une couleur..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>Aucune couleur trouvée.</CommandEmpty>
                        <CommandGroup>
                          {availableColors.map((colorOption) => (
                            <CommandItem
                              key={colorOption.value}
                              value={`${colorOption.name} ${colorOption.description}`}
                              onSelect={() => {
                                setColor(colorOption.value);
                                setColorOpen(false);
                              }}
                              className="text-sm"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3.5 w-3.5",
                                  color === colorOption.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className={`mr-2 h-3.5 w-3.5 rounded-full ${colorOption.preview}`} />
                              <div className="flex flex-col">
                                <span className="text-sm">{colorOption.name}</span>
                                <span className="text-xs text-gray-500">{colorOption.description}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-9 text-sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!translations.fr.trim()}
                  className="flex-1 h-9 text-sm"
                  style={{
                    background: translations.fr.trim() 
                      ? 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)'
                      : undefined,
                    color: translations.fr.trim() ? 'white' : undefined
                  }}
                >
                  {status ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Delete Status Dialog Component
interface DeleteStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deletingStatus?: BaseStatus;
  replacementStatusId: string;
  setReplacementStatusId: (id: string) => void;
  availableStatuses: BaseStatus[];
  itemType: string; // "investisseur", "deal", etc.
  itemTypePlural: string; // "investisseurs", "deals", etc.
}

export const DeleteStatusDialog: React.FC<DeleteStatusDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  deletingStatus,
  replacementStatusId,
  setReplacementStatusId,
  availableStatuses,
  itemType,
  itemTypePlural
}) => {
  const [replacementStatusOpen, setReplacementStatusOpen] = useState(false);

  const DeletingIconComponent = deletingStatus 
    ? availableIcons.find(i => i.name === deletingStatus.icon)?.component || User
    : User;

  const selectedReplacementStatus = availableStatuses.find(s => s.id === replacementStatusId);
  const ReplacementIconComponent = selectedReplacementStatus
    ? availableIcons.find(i => i.name === selectedReplacementStatus.icon)?.component || User
    : User;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
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
                Supprimer le statut ?
              </AlertDialogTitle>
            </div>
          </div>
          <div className="text-left space-y-5 text-sm text-muted-foreground">
            {deletingStatus && (
              <>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`${deletingStatus.color} border flex items-center gap-1.5 w-fit`}>
                      <DeletingIconComponent className="w-3.5 h-3.5" />
                      {deletingStatus.name}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    {deletingStatus.count || 0} {deletingStatus.count && deletingStatus.count > 1 ? itemTypePlural : itemType} actuellement assigné{deletingStatus.count && deletingStatus.count > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Replacement Status Selector */}
                <div>
                  <Label className="text-sm text-gray-900 mb-2 block">
                    Statut de remplacement <span className="text-red-600">*</span>
                  </Label>
                  <div className="text-xs text-gray-600 mb-3">
                    {deletingStatus.count && deletingStatus.count > 1 
                      ? `Les ${deletingStatus.count} ${itemTypePlural} seront automatiquement migrés vers ce statut`
                      : `Le ${itemType} sera automatiquement migré vers ce statut`}
                  </div>
                  <Popover open={replacementStatusOpen} onOpenChange={setReplacementStatusOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={replacementStatusOpen}
                        className={cn(
                          "w-full justify-between h-10 bg-white",
                          !replacementStatusId && "text-gray-400"
                        )}
                      >
                        {selectedReplacementStatus ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${selectedReplacementStatus.color} border flex items-center gap-1.5 w-fit`}>
                              <ReplacementIconComponent className="w-3.5 h-3.5" />
                              {selectedReplacementStatus.name}
                            </Badge>
                          </div>
                        ) : (
                          <span>Sélectionner un statut de remplacement</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher un statut..." />
                        <CommandList>
                          <CommandEmpty>Aucun statut trouvé.</CommandEmpty>
                          <CommandGroup>
                            {availableStatuses.map((status) => {
                              const IconComp = availableIcons.find(i => i.name === status.icon)?.component || User;
                              return (
                                <CommandItem
                                  key={status.id}
                                  value={status.name}
                                  onSelect={() => {
                                    setReplacementStatusId(status.id);
                                    setReplacementStatusOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      replacementStatusId === status.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <Badge variant="outline" className={`${status.color} border flex items-center gap-1.5 w-fit`}>
                                    <IconComp className="w-3.5 h-3.5" />
                                    {status.name}
                                  </Badge>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Warning Details */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Cette action est <strong>irréversible</strong>. La suppression entraînera :
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1.5 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Migration automatique des {itemTypePlural} vers le nouveau statut</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Conservation de l'historique avec trace de la migration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Impact sur les filtres et rapports existants</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!replacementStatusId}
            className={cn(
              "bg-red-600 hover:bg-red-700 text-white",
              !replacementStatusId && "opacity-50 cursor-not-allowed"
            )}
          >
            Supprimer et migrer
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
