import React, { useState, useRef } from 'react';
import { GripVertical, Plus, Edit2, Trash2, Calendar, X, AlertTriangle, Check, ChevronsUpDown, Lock, Globe, UsersRound, Handshake, Search, Filter, CalendarDays } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
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

interface Event {
  id: string;
  nom: string;
  nomTranslations: {
    fr: string;
    en: string;
    es: string;
  };
  topic: string;
  topicTranslations: {
    fr: string;
    en: string;
    es: string;
  };
  dateDebut: string;
  dateFin: string;
  allFunds: boolean;
  restrictionsFonds: string[];
  audienceInvestisseurs: boolean;
  audiencePartenaires: boolean;
  segmentInvestisseurs: string[];
  segmentPartenaires: string[];
  rank: number;
}

const mockEvents: Event[] = [
  {
    id: '1',
    nom: 'Réunion Investisseurs - Capital Croissance',
    nomTranslations: {
      fr: 'Réunion Investisseurs - Capital Croissance',
      en: 'Investors Meeting - Capital Growth',
      es: 'Reunión de Inversores - Capital Crecimiento'
    },
    topic: 'Présentation des résultats Q4',
    topicTranslations: {
      fr: 'Présentation des résultats Q4',
      en: 'Q4 Results Presentation',
      es: 'Presentación de resultados Q4'
    },
    dateDebut: '30/06/2026',
    dateFin: '30/06/2026',
    allFunds: false,
    restrictionsFonds: ['CARIN Capital I', 'CARIN Capital II', 'Edelweiss Croissance I'],
    audienceInvestisseurs: true,
    audiencePartenaires: false,
    segmentInvestisseurs: ['Segment Premium', 'Segment Gold'],
    segmentPartenaires: [],
    rank: 0
  },
  {
    id: '2',
    nom: 'Réunion Investisseurs - Catlyn 1 et II',
    nomTranslations: {
      fr: 'Réunion Investisseurs - Catlyn 1 et II',
      en: 'Investors Meeting - Catlyn 1 and II',
      es: 'Reunión de Inversores - Catlyn 1 y II'
    },
    topic: 'Stratégie 2027',
    topicTranslations: {
      fr: 'Stratégie 2027',
      en: '2027 Strategy',
      es: 'Estrategia 2027'
    },
    dateDebut: '30/11/2026',
    dateFin: '30/11/2026',
    allFunds: false,
    restrictionsFonds: ['CARIN Capital I', 'CARIN Capital II'],
    audienceInvestisseurs: true,
    audiencePartenaires: false,
    segmentInvestisseurs: [],
    segmentPartenaires: [],
    rank: 1
  },
  {
    id: '3',
    nom: 'Réunion Partenaires - Stratégie 2026',
    nomTranslations: {
      fr: 'Réunion Partenaires - Stratégie 2026',
      en: 'Partners Meeting - 2026 Strategy',
      es: 'Reunión de Socios - Estrategia 2026'
    },
    topic: 'Perspectives marché',
    topicTranslations: {
      fr: 'Perspectives marché',
      en: 'Market Outlook',
      es: 'Perspectivas del mercado'
    },
    dateDebut: '05/11/2025',
    dateFin: '05/11/2025',
    allFunds: false,
    restrictionsFonds: ['Edelweiss Croissance I'],
    audienceInvestisseurs: false,
    audiencePartenaires: true,
    segmentInvestisseurs: [],
    segmentPartenaires: ['Partenaires Privilégiés'],
    rank: 2
  }
];

const availableFonds = [
  'CARIN Capital I', 'CARIN Capital II', 'CARIN Capital III', 
  'Collaboration I', 'Edelweiss Croissance I', 'Edelweiss Solutions',
  'Edelweiss Solutions II', 'GAIA Energy Impact Fund II', 'K2 Capital I',
  'K2 Capital II', 'K2 Capital III', 'K2 Capital IV', 'K2 Capital VI',
  'K2 Opus Fund', 'K2 Opus Fund II', 'Mission', 'Tamiel Regenerative'
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
  'Distributeurs',
  'Conseillers',
  'Banques privées'
];

interface DraggableRowProps {
  event: Event;
  index: number;
  moveEvent: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  event,
  index,
  moveEvent,
  onEdit,
  onDelete,
  isPanelOpen
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'event',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveEvent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'event',
    item: () => {
      return { id: event.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      data-handler-id={handlerId}
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <td className="p-4">
        <span className="text-sm text-gray-900">{event.nom}</span>
      </td>
      <td className="p-4">
        {/* Dates élégantes avec range */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-md w-fit">
          <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs text-blue-700">
            {event.dateDebut === event.dateFin || !event.dateFin ? (
              event.dateDebut
            ) : (
              <span className="flex items-center gap-1.5">
                <span>{event.dateDebut}</span>
                <span className="text-blue-400">→</span>
                <span>{event.dateFin}</span>
              </span>
            )}
          </span>
        </div>
      </td>
      <td className="p-4">
        {/* Fonds uniquement */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {event.allFunds ? (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
              Tous les fonds
            </Badge>
          ) : (
            <>
              {event.restrictionsFonds.slice(0, 2).map((fond, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  style={{ backgroundColor: '#DCFDBC', color: '#0F323D' }}
                  className="text-xs"
                >
                  {fond}
                </Badge>
              ))}
              {event.restrictionsFonds.length > 2 && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                  +{event.restrictionsFonds.length - 2}
                </Badge>
              )}
            </>
          )}
        </div>
      </td>
      <td className="p-4">
        {/* Audiences sans compteurs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {event.audienceInvestisseurs && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
              <UsersRound className="w-3 h-3" />
              Investisseurs
            </Badge>
          )}
          {event.audiencePartenaires && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
              <Handshake className="w-3 h-3" />
              Partenaires
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(event)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
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
  event: Event | null;
  onSave: (event: Partial<Event>) => void;
}

const Panel: React.FC<PanelProps> = ({ isOpen, onClose, event, onSave }) => {
  const [activeLanguage, setActiveLanguage] = useState<'fr' | 'en' | 'es'>('fr');
  const [nomTranslations, setNomTranslations] = useState(event?.nomTranslations || { fr: '', en: '', es: '' });
  const [topicTranslations, setTopicTranslations] = useState(event?.topicTranslations || { fr: '', en: '', es: '' });
  const [dateDebut, setDateDebut] = useState(event?.dateDebut || '');
  const [dateFin, setDateFin] = useState(event?.dateFin || '');
  const [allFunds, setAllFunds] = useState(event?.allFunds ?? true);
  const [restrictionsFonds, setRestrictionsFonds] = useState<string[]>(event?.restrictionsFonds || []);
  const [audienceInvestisseurs, setAudienceInvestisseurs] = useState(event?.audienceInvestisseurs ?? true);
  const [audiencePartenaires, setAudiencePartenaires] = useState(event?.audiencePartenaires ?? false);
  const [segmentInvestisseurs, setSegmentInvestisseurs] = useState<string[]>(event?.segmentInvestisseurs || []);
  const [segmentPartenaires, setSegmentPartenaires] = useState<string[]>(event?.segmentPartenaires || []);
  const [fondsOpen, setFondsOpen] = useState(false);
  const [segmentInvestisseursOpen, setSegmentInvestisseursOpen] = useState(false);
  const [segmentPartenairesOpen, setSegmentPartenairesOpen] = useState(false);
  const [fondsSearch, setFondsSearch] = useState('');

  React.useEffect(() => {
    if (event) {
      setNomTranslations(event.nomTranslations);
      setTopicTranslations(event.topicTranslations);
      setDateDebut(event.dateDebut);
      setDateFin(event.dateFin);
      setAllFunds(event.allFunds ?? true);
      setRestrictionsFonds(event.restrictionsFonds);
      setAudienceInvestisseurs(event.audienceInvestisseurs ?? true);
      setAudiencePartenaires(event.audiencePartenaires ?? false);
      setSegmentInvestisseurs(event.segmentInvestisseurs || []);
      setSegmentPartenaires(event.segmentPartenaires || []);
    } else {
      setNomTranslations({ fr: '', en: '', es: '' });
      setTopicTranslations({ fr: '', en: '', es: '' });
      setDateDebut('');
      setDateFin('');
      setAllFunds(true);
      setRestrictionsFonds([]);
      setAudienceInvestisseurs(true);
      setAudiencePartenaires(false);
      setSegmentInvestisseurs([]);
      setSegmentPartenaires([]);
    }
    setFondsSearch('');
    setActiveLanguage('fr');
  }, [event, isOpen]);

  const handleSave = () => {
    if (!nomTranslations.fr.trim() || !dateDebut.trim()) return;
    if (!audienceInvestisseurs && !audiencePartenaires) return;

    onSave({
      id: event?.id,
      nom: nomTranslations.fr,
      nomTranslations,
      topic: topicTranslations.fr,
      topicTranslations,
      dateDebut,
      dateFin,
      allFunds,
      restrictionsFonds: allFunds ? [] : restrictionsFonds,
      audienceInvestisseurs,
      audiencePartenaires,
      segmentInvestisseurs: audienceInvestisseurs ? segmentInvestisseurs : [],
      segmentPartenaires: audiencePartenaires ? segmentPartenaires : [],
    });
  };

  const toggleFonds = (fond: string) => {
    if (allFunds) {
      setAllFunds(false);
      setRestrictionsFonds([fond]);
    } else {
      setRestrictionsFonds(prev =>
        prev.includes(fond)
          ? prev.filter(f => f !== fond)
          : [...prev, fond]
      );
    }
  };

  const handleAllFundsToggle = (checked: boolean) => {
    setAllFunds(checked);
    if (checked) {
      setRestrictionsFonds([]);
    }
  };

  const removeFonds = (fond: string) => {
    setRestrictionsFonds(prev => prev.filter(f => f !== fond));
  };

  const toggleSegmentInvestisseur = (segment: string) => {
    setSegmentInvestisseurs(prev =>
      prev.includes(segment)
        ? prev.filter(s => s !== segment)
        : [...prev, segment]
    );
  };

  const removeSegmentInvestisseur = (segment: string) => {
    setSegmentInvestisseurs(prev => prev.filter(s => s !== segment));
  };

  const toggleSegmentPartenaire = (segment: string) => {
    setSegmentPartenaires(prev =>
      prev.includes(segment)
        ? prev.filter(s => s !== segment)
        : [...prev, segment]
    );
  };

  const removeSegmentPartenaire = (segment: string) => {
    setSegmentPartenaires(prev => prev.filter(s => s !== segment));
  };

  const filteredFonds = availableFonds.filter(fond =>
    fond.toLowerCase().includes(fondsSearch.toLowerCase())
  );

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
              <h2 className="text-sm text-gray-900">
                {event ? 'Éditer l\'événement' : 'Nouvel événement'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Traductions - Nom et Topic */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as 'fr' | 'en' | 'es')} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-3 h-8 bg-white">
                    <TabsTrigger value="fr" className="text-xs py-1 relative">
                      🇫🇷 FR
                      {(!nomTranslations.fr.trim() || !topicTranslations.fr.trim()) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="en" className="text-xs py-1 relative">
                      🇬🇧 EN
                      {(!nomTranslations.en.trim() || !topicTranslations.en.trim()) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="es" className="text-xs py-1 relative">
                      🇪🇸 ES
                      {(!nomTranslations.es.trim() || !topicTranslations.es.trim()) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Français */}
                  <TabsContent value="fr" className="mt-0 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <Label className="text-xs text-gray-900">
                            Nom<span className="text-red-500 ml-1">*</span>
                          </Label>
                        </div>
                        <span className="text-xs text-gray-500">Toutes les langues obligatoires</span>
                      </div>
                      <Input
                        value={nomTranslations.fr}
                        onChange={(e) => setNomTranslations({ ...nomTranslations, fr: e.target.value })}
                        placeholder="Nom de l'événement"
                        className="h-9 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">Topic</Label>
                      <Textarea
                        value={topicTranslations.fr}
                        onChange={(e) => setTopicTranslations({ ...topicTranslations, fr: e.target.value })}
                        placeholder="Sujet de l'événement"
                        className="text-sm min-h-[80px] bg-white"
                      />
                    </div>
                  </TabsContent>

                  {/* English */}
                  <TabsContent value="en" className="mt-0 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <Label className="text-xs text-gray-900">
                            Name<span className="text-red-500 ml-1">*</span>
                          </Label>
                        </div>
                        <span className="text-xs text-gray-500">All languages required</span>
                      </div>
                      <Input
                        value={nomTranslations.en}
                        onChange={(e) => setNomTranslations({ ...nomTranslations, en: e.target.value })}
                        placeholder="Event name"
                        className="h-9 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">Topic</Label>
                      <Textarea
                        value={topicTranslations.en}
                        onChange={(e) => setTopicTranslations({ ...topicTranslations, en: e.target.value })}
                        placeholder="Event topic"
                        className="text-sm min-h-[80px] bg-white"
                      />
                    </div>
                  </TabsContent>

                  {/* Español */}
                  <TabsContent value="es" className="mt-0 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <Label className="text-xs text-gray-900">
                            Nombre<span className="text-red-500 ml-1">*</span>
                          </Label>
                        </div>
                        <span className="text-xs text-gray-500">Todos los idiomas obligatorios</span>
                      </div>
                      <Input
                        value={nomTranslations.es}
                        onChange={(e) => setNomTranslations({ ...nomTranslations, es: e.target.value })}
                        placeholder="Nombre del evento"
                        className="h-9 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-900 mb-2 block">Tema</Label>
                      <Textarea
                        value={topicTranslations.es}
                        onChange={(e) => setTopicTranslations({ ...topicTranslations, es: e.target.value })}
                        placeholder="Tema del evento"
                        className="text-sm min-h-[80px] bg-white"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Date début <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">Date fin</Label>
                  <Input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Restrictions fonds */}
              <div>
                <Label className="text-xs text-gray-700 mb-2.5 block">Restrictions fonds</Label>
                
                {/* Option "Tous les fonds" avec Switch */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2.5">
                  <Label htmlFor="allFunds" className="text-sm cursor-pointer">
                    Tous les fonds
                  </Label>
                  <Switch 
                    id="allFunds" 
                    checked={allFunds}
                    onCheckedChange={handleAllFundsToggle}
                  />
                </div>

                {/* Sélection de fonds spécifiques */}
                {!allFunds && (
                  <>
                    <Popover open={fondsOpen} onOpenChange={setFondsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={fondsOpen}
                          className="w-full justify-between h-9 text-sm"
                        >
                          {restrictionsFonds.length > 0
                            ? `${restrictionsFonds.length} fond${restrictionsFonds.length > 1 ? 's' : ''} sélectionné${restrictionsFonds.length > 1 ? 's' : ''}`
                            : "Sélectionner des fonds..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[360px] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Rechercher un fond..." 
                            value={fondsSearch}
                            onValueChange={setFondsSearch}
                          />
                          <CommandList>
                            <CommandEmpty>Aucun fond trouvé.</CommandEmpty>
                            <CommandGroup>
                              {filteredFonds.map((fond) => (
                                <CommandItem
                                  key={fond}
                                  value={fond}
                                  onSelect={() => toggleFonds(fond)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      restrictionsFonds.includes(fond) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {fond}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {restrictionsFonds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {restrictionsFonds.map((fond) => (
                          <Badge
                            key={fond}
                            variant="outline"
                            style={{ backgroundColor: '#DCFDBC', color: '#0F323D' }}
                            className="text-xs flex items-center gap-1"
                          >
                            {fond}
                            <button
                              onClick={() => removeFonds(fond)}
                              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Audience avec Switches */}
              <div>
                <Label className="text-xs text-gray-700 mb-2.5 block">
                  Audience <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  {/* Investisseurs */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <UsersRound className="w-4 h-4 text-gray-500" />
                      <Label htmlFor="audienceInvestisseurs" className="text-sm cursor-pointer">
                        Investisseurs
                      </Label>
                    </div>
                    <Switch 
                      id="audienceInvestisseurs" 
                      checked={audienceInvestisseurs}
                      onCheckedChange={(checked) => setAudienceInvestisseurs(checked as boolean)}
                    />
                  </div>

                  {/* Partenaires */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Handshake className="w-4 h-4 text-gray-500" />
                      <Label htmlFor="audiencePartenaires" className="text-sm cursor-pointer">
                        Partenaires
                      </Label>
                    </div>
                    <Switch 
                      id="audiencePartenaires" 
                      checked={audiencePartenaires}
                      onCheckedChange={(checked) => setAudiencePartenaires(checked as boolean)}
                    />
                  </div>
                </div>
                {!audienceInvestisseurs && !audiencePartenaires && (
                  <p className="text-xs text-red-500 mt-1.5">
                    Sélectionnez au moins une audience
                  </p>
                )}
              </div>

              {/* Segments Investisseurs */}
              {audienceInvestisseurs && (
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">Segments investisseurs</Label>
                  <Popover open={segmentInvestisseursOpen} onOpenChange={setSegmentInvestisseursOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={segmentInvestisseursOpen}
                        className="w-full justify-between h-9 text-sm"
                      >
                        {segmentInvestisseurs.length > 0
                          ? `${segmentInvestisseurs.length} segment${segmentInvestisseurs.length > 1 ? 's' : ''} sélectionné${segmentInvestisseurs.length > 1 ? 's' : ''}`
                          : "Tous les investisseurs"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher un segment..." />
                        <CommandList>
                          <CommandEmpty>Aucun segment trouvé.</CommandEmpty>
                          <CommandGroup>
                            {segmentsInvestisseurs.map((segment) => (
                              <CommandItem
                                key={segment}
                                value={segment}
                                onSelect={() => toggleSegmentInvestisseur(segment)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    segmentInvestisseurs.includes(segment) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {segment}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {segmentInvestisseurs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {segmentInvestisseurs.map((segment) => (
                        <Badge
                          key={segment}
                          variant="outline"
                          style={{ backgroundColor: '#DCFDBC', color: '#0F323D' }}
                          className="text-xs flex items-center gap-1"
                        >
                          {segment}
                          <button
                            onClick={() => removeSegmentInvestisseur(segment)}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Segments Partenaires */}
              {audiencePartenaires && (
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">Segments partenaires</Label>
                  <Popover open={segmentPartenairesOpen} onOpenChange={setSegmentPartenairesOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={segmentPartenairesOpen}
                        className="w-full justify-between h-9 text-sm"
                      >
                        {segmentPartenaires.length > 0
                          ? `${segmentPartenaires.length} segment${segmentPartenaires.length > 1 ? 's' : ''} sélectionné${segmentPartenaires.length > 1 ? 's' : ''}`
                          : "Tous les partenaires"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher un segment..." />
                        <CommandList>
                          <CommandEmpty>Aucun segment trouvé.</CommandEmpty>
                          <CommandGroup>
                            {segmentsPartenaires.map((segment) => (
                              <CommandItem
                                key={segment}
                                value={segment}
                                onSelect={() => toggleSegmentPartenaire(segment)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    segmentPartenaires.includes(segment) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {segment}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {segmentPartenaires.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {segmentPartenaires.map((segment) => (
                        <Badge
                          key={segment}
                          variant="outline"
                          style={{ backgroundColor: '#DCFDBC', color: '#0F323D' }}
                          className="text-xs flex items-center gap-1"
                        >
                          {segment}
                          <button
                            onClick={() => removeSegmentPartenaire(segment)}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                  disabled={!nomTranslations.fr.trim() || !dateDebut.trim() || (!audienceInvestisseurs && !audiencePartenaires)}
                  className="flex-1 h-9 text-sm"
                  style={{
                    background: nomTranslations.fr.trim() && dateDebut.trim() && (audienceInvestisseurs || audiencePartenaires)
                      ? 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)'
                      : undefined,
                    color: nomTranslations.fr.trim() && dateDebut.trim() && (audienceInvestisseurs || audiencePartenaires) ? 'white' : undefined
                  }}
                >
                  {event ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function EventsSettingsContent() {
  const [events, setEvents] = useState(mockEvents);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAudience, setFilterAudience] = useState<'all' | 'investisseurs' | 'partenaires'>('all');
  const [filterFunds, setFilterFunds] = useState<'all' | 'tous' | 'restreints'>('all');

  const moveEvent = (dragIndex: number, hoverIndex: number) => {
    const dragEvent = events[dragIndex];
    const newEvents = [...events];
    newEvents.splice(dragIndex, 1);
    newEvents.splice(hoverIndex, 0, dragEvent);
    
    setEvents(newEvents.map((e, index) => ({
      ...e,
      rank: index
    })));
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    setIsPanelOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsPanelOpen(true);
  };

  const handleDelete = (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setDeletingEvent(event);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingEvent) {
      setEvents(events.filter(e => e.id !== deletingEvent.id));
      setIsDeleteDialogOpen(false);
      setDeletingEvent(null);
    }
  };

  const handleSave = (eventData: Partial<Event>) => {
    if (editingEvent) {
      setEvents(events.map(e => 
        e.id === editingEvent.id 
          ? { ...e, ...eventData }
          : e
      ));
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        nom: eventData.nom || '',
        nomTranslations: eventData.nomTranslations || { fr: '', en: '', es: '' },
        topic: eventData.topic || '',
        topicTranslations: eventData.topicTranslations || { fr: '', en: '', es: '' },
        dateDebut: eventData.dateDebut || '',
        dateFin: eventData.dateFin || '',
        allFunds: eventData.allFunds ?? true,
        restrictionsFonds: eventData.restrictionsFonds || [],
        audienceInvestisseurs: eventData.audienceInvestisseurs ?? true,
        audiencePartenaires: eventData.audiencePartenaires ?? false,
        segmentInvestisseurs: eventData.segmentInvestisseurs || [],
        segmentPartenaires: eventData.segmentPartenaires || [],
        rank: events.length
      };
      setEvents([...events, newEvent]);
    }
    setIsPanelOpen(false);
    setEditingEvent(null);
  };

  // Filtrer les événements
  const filteredEvents = events.filter(event => {
    // Recherche
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        event.nom.toLowerCase().includes(searchLower) ||
        event.topic.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filtre audience
    if (filterAudience === 'investisseurs' && !event.audienceInvestisseurs) return false;
    if (filterAudience === 'partenaires' && !event.audiencePartenaires) return false;

    // Filtre fonds
    if (filterFunds === 'tous' && !event.allFunds) return false;
    if (filterFunds === 'restreints' && event.allFunds) return false;

    return true;
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isPanelOpen ? "mr-[420px]" : ""
        )}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl text-gray-900">Événements</h1>
                <p className="text-sm text-gray-500 mt-1">{events.length} événements configurés</p>
              </div>
              <Button
                onClick={handleNewEvent}
                className="h-9 text-sm gap-2"
                style={{
                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                  color: 'white'
                }}
              >
                <Plus className="w-4 h-4" />
                Nouvel événement
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Barre de recherche et filtres */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  {/* Recherche */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher un événement..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9 bg-white"
                    />
                  </div>

                  {/* Filtre Audience */}
                  <Select value={filterAudience} onValueChange={(value: any) => setFilterAudience(value)}>
                    <SelectTrigger className="w-[180px] h-9 bg-white">
                      <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-gray-500" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes audiences</SelectItem>
                      <SelectItem value="investisseurs">Investisseurs</SelectItem>
                      <SelectItem value="partenaires">Partenaires</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Filtre Fonds */}
                  <Select value={filterFunds} onValueChange={(value: any) => setFilterFunds(value)}>
                    <SelectTrigger className="w-[180px] h-9 bg-white">
                      <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-gray-500" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous fonds</SelectItem>
                      <SelectItem value="tous">Tous les fonds</SelectItem>
                      <SelectItem value="restreints">Fonds restreints</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Résultats */}
                {(searchQuery || filterAudience !== 'all' || filterFunds !== 'all') && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      {filteredEvents.length} résultat{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterAudience('all');
                        setFilterFunds('all');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>

              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Nom</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Fonds</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Audience</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        {searchQuery || filterAudience !== 'all' || filterFunds !== 'all' ? (
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 text-gray-300" />
                            <p className="text-sm">Aucun événement ne correspond à vos critères</p>
                          </div>
                        ) : (
                          <p className="text-sm">Aucun événement configuré. Cliquez sur "Nouvel événement" pour commencer.</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event, index) => (
                      <DraggableRow
                        key={event.id}
                        event={event}
                        index={index}
                        moveEvent={moveEvent}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isPanelOpen={isPanelOpen}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className={cn(
          "fixed right-0 top-0 h-full transition-all duration-300",
          isPanelOpen ? "w-[420px]" : "w-0"
        )}>
          <Panel
            isOpen={isPanelOpen}
            onClose={() => {
              setIsPanelOpen(false);
              setEditingEvent(null);
            }}
            event={editingEvent}
            onSave={handleSave}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Êtes-vous sr de vouloir supprimer l'événement "{deletingEvent?.nom}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              style={{
                background: '#EF4444',
                color: 'white'
              }}
            >
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndProvider>
  );
}

export default function EventsSettings() {
  return <EventsSettingsContent />;
}