import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { ChevronDown, Sparkles } from 'lucide-react';

interface FolderOption {
  id: string;
  label: string;
}

interface DocumentVersion {
  language: 'fr' | 'en';
  name: string;
  fileName: string;
}

interface ValidationTeam {
  id: string;
  name: string;
  validators: string[];
}

interface InvestorProfile {
  id: string;
  name: string;
  segment: string;
  fund: string;
  contacts: number;
  subscriptions: string[];
  structures: Array<{
    id: string;
    name: string;
    subscriptions: string[];
  }>;
}

interface DocumentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderOptions: FolderOption[];
  defaultFolderId: string;
}

const SEGMENTS = ['Institutionnels', 'Family Office', 'Retail', 'Corporate'];
const FUNDS = ['all', 'PERE 1', 'PERE 2', 'Growth Tech'];
const SHARE_CLASSES_BY_FUND: Record<string, string[]> = {
  'PERE 1': ['A', 'I'],
  'PERE 2': ['I', 'P'],
  'Growth Tech': ['Seed', 'Growth'],
};
const MAIL_TEMPLATES = ['Nouveau document', 'Rapport trimestriel', 'Appel de fonds'];
const REMINDER_DELAYS = ['3 jours', '7 jours', '14 jours'];

const TEAMS: ValidationTeam[] = [
  { id: 'front', name: 'Front Office', validators: ['N. Sibille', 'L. Martin'] },
  { id: 'middle', name: 'Middle Office', validators: ['S. Roussel', 'M. Dupont'] },
  { id: 'compliance', name: 'Compliance', validators: ['P. Mercier', 'C. Bernard'] },
];

const INVESTORS: InvestorProfile[] = [
  {
    id: 'i1',
    name: 'Jean Dupont',
    segment: 'Institutionnels',
    fund: 'PERE 1',
    contacts: 2,
    subscriptions: ['SUB-001', 'SUB-001-B'],
    structures: [
      { id: 'st-1', name: 'Holding Dupont', subscriptions: ['SUB-001'] },
      { id: 'st-2', name: 'SPV Dupont', subscriptions: ['SUB-001-B'] },
    ],
  },
  {
    id: 'i2',
    name: 'Marie Martin',
    segment: 'Family Office',
    fund: 'PERE 1',
    contacts: 3,
    subscriptions: ['SUB-002'],
    structures: [{ id: 'st-3', name: 'SCI Martin', subscriptions: ['SUB-002'] }],
  },
  {
    id: 'i3',
    name: 'Thomas Petit',
    segment: 'Retail',
    fund: 'Growth Tech',
    contacts: 1,
    subscriptions: ['SUB-003', 'SUB-003-C'],
    structures: [{ id: 'st-4', name: 'Patrimoine Petit', subscriptions: ['SUB-003-C'] }],
  },
  {
    id: 'i4',
    name: 'Sophie Bernard',
    segment: 'Corporate',
    fund: 'PERE 2',
    contacts: 2,
    subscriptions: ['SUB-004'],
    structures: [{ id: 'st-5', name: 'SAS Bernard Invest', subscriptions: ['SUB-004'] }],
  },
];

const defaultVersions: DocumentVersion[] = [
  { language: 'fr', name: '', fileName: '' },
  { language: 'en', name: '', fileName: '' },
];

export function DocumentAddModal({ isOpen, onClose, folderOptions, defaultFolderId }: DocumentAddModalProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>(defaultVersions);
  const [addDate, setAddDate] = useState(new Date().toISOString().slice(0, 10));
  const [parentFolderId, setParentFolderId] = useState(defaultFolderId);
  const [audienceMode, setAudienceMode] = useState<'general' | 'nominative'>('general');
  const [selectedSegments, setSelectedSegments] = useState<string[]>(['all']);
  const [selectedFund, setSelectedFund] = useState('all');
  const [selectedShareClass, setSelectedShareClass] = useState<string>('');
  const [selectedInvestor, setSelectedInvestor] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<string>('');
  const [selectedStructureId, setSelectedStructureId] = useState<string>('');
  const [notify, setNotify] = useState(false);
  const [notifyTemplate, setNotifyTemplate] = useState(MAIL_TEMPLATES[0]);
  const [reminder, setReminder] = useState(false);
  const [reminderDelay, setReminderDelay] = useState(REMINDER_DELAYS[1]);
  const [reminderTemplate, setReminderTemplate] = useState(MAIL_TEMPLATES[0]);
  const [validationTeams, setValidationTeams] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setParentFolderId(defaultFolderId);
    setAddDate(new Date().toISOString().slice(0, 10));
  }, [defaultFolderId, isOpen]);

  const selectedInvestorProfile = useMemo(
    () => INVESTORS.find((inv) => inv.id === selectedInvestor),
    [selectedInvestor]
  );

  const structureOptions = selectedInvestorProfile?.structures || [];
  const selectedStructure = structureOptions.find((st) => st.id === selectedStructureId);
  const subscriptionOptions = useMemo(() => {
    if (!selectedInvestorProfile) return [];
    if (selectedStructure) return selectedStructure.subscriptions;
    return selectedInvestorProfile.subscriptions;
  }, [selectedInvestorProfile, selectedStructure]);

  const shareClassOptions = selectedFund !== 'all' ? SHARE_CLASSES_BY_FUND[selectedFund] || [] : [];

  const audience = useMemo(() => {
    if (audienceMode === 'general') {
      let candidates = INVESTORS;
      if (!selectedSegments.includes('all')) {
        candidates = candidates.filter((inv) => selectedSegments.includes(inv.segment));
      }
      if (selectedFund !== 'all') {
        candidates = candidates.filter((inv) => inv.fund === selectedFund);
      }
      const contacts = candidates.reduce((sum, inv) => sum + inv.contacts, 0);
      return { investors: candidates.length, contacts };
    }

    const investor = selectedInvestorProfile;
    if (!investor) {
      return { investors: 0, contacts: 0 };
    }
    if (selectedStructureId && !investor.structures.some((st) => st.id === selectedStructureId)) {
      return { investors: 0, contacts: 0 };
    }
    if (selectedSubscription) {
      const authorizedSubscriptions = selectedStructure
        ? selectedStructure.subscriptions
        : investor.subscriptions;
      if (!authorizedSubscriptions.includes(selectedSubscription)) {
        return { investors: 0, contacts: 0 };
      }
    }
    if (!selectedInvestor) {
      return { investors: 0, contacts: 0 };
    }
    return { investors: 1, contacts: investor.contacts };
  }, [
    audienceMode,
    selectedSegments,
    selectedFund,
    selectedInvestor,
    selectedInvestorProfile,
    selectedSubscription,
    selectedStructureId,
    selectedStructure,
  ]);

  const selectedValidators = useMemo(() => {
    return TEAMS.filter((team) => validationTeams.includes(team.id)).flatMap((team) =>
      team.validators.map((validator) => ({ team: team.name, validator }))
    );
  }, [validationTeams]);

  const updateVersion = (language: 'fr' | 'en', patch: Partial<DocumentVersion>) => {
    setVersions((prev) => prev.map((version) => (version.language === language ? { ...version, ...patch } : version)));
  };

  const toggleArrayValue = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const handleSubmit = () => {
    if (!versions.some((version) => version.name.trim() && version.fileName.trim())) {
      toast.error('Ajouter au moins une version FR ou EN du document.');
      return;
    }

    if (validationTeams.length === 0) {
      toast.error('Sélectionnez au moins une équipe de validation.');
      return;
    }

    const folderLabel = folderOptions.find((folder) => folder.id === parentFolderId)?.label || 'Dossier courant';
    toast.success('Document prêt à être ajouté', {
      description: `${audience.investors} investisseur(s), ${audience.contacts} contact(s) • ${folderLabel}`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader>
          <div className="px-8 pt-7">
            <DialogTitle className="text-2xl">Ajouter un document</DialogTitle>
          <DialogDescription className="mt-1.5">
            Créez des versions FR/EN, configurez l'audience et le workflow de validation.
          </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-7 px-8 pb-8">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Versions documentaires</h3>
            <div className="rounded-2xl border bg-gradient-to-b from-white to-slate-50 p-4">
              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-11">
                  <TabsTrigger value="fr">FR</TabsTrigger>
                  <TabsTrigger value="en">EN</TabsTrigger>
                </TabsList>
                {(['fr', 'en'] as const).map((language) => {
                  const version = versions.find((item) => item.language === language)!;
                  return (
                    <TabsContent key={language} value={language} className="mt-4">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom du document ({language.toUpperCase()})</Label>
                          <Input
                            value={version.name}
                            onChange={(event) => updateVersion(language, { name: event.target.value })}
                            placeholder={`Nom ${language.toUpperCase()}`}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ajouter un document</Label>
                          <Input
                            type="file"
                            className="h-11"
                            onChange={(event) => {
                              const fileName = event.target.files?.[0]?.name || '';
                              updateVersion(language, { fileName });
                            }}
                          />
                          {version.fileName && <p className="text-xs text-slate-500 truncate">{version.fileName}</p>}
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date d'ajout</Label>
              <Input type="date" value={addDate} onChange={(event) => setAddDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Dossier parent (dans l'espace courant)</Label>
              <Select value={parentFolderId} onValueChange={setParentFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un dossier" />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>{folder.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Audience du document</h3>
            <div className="flex gap-2 p-1 rounded-xl bg-slate-100 w-fit">
              <Button variant={audienceMode === 'general' ? 'default' : 'outline'} onClick={() => setAudienceMode('general')}>Document général</Button>
              <Button variant={audienceMode === 'nominative' ? 'default' : 'outline'} onClick={() => setAudienceMode('nominative')}>Document nominatif</Button>
            </div>

            {audienceMode === 'general' ? (
              <div className="space-y-4 border rounded-2xl p-5 bg-gradient-to-br from-white to-blue-50/40">
                <div className="space-y-2">
                  <Label>Segments investisseurs</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between h-11 font-normal">
                        {selectedSegments.includes('all')
                          ? 'Tous les segments'
                          : `${selectedSegments.length} segment(s) sélectionné(s)`}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[320px]">
                      <DropdownMenuCheckboxItem
                        checked={selectedSegments.includes('all')}
                        onCheckedChange={(checked) => setSelectedSegments(checked ? ['all'] : [])}
                      >
                        Tous les segments
                      </DropdownMenuCheckboxItem>
                      {SEGMENTS.map((segment) => (
                        <DropdownMenuCheckboxItem
                          key={segment}
                          checked={selectedSegments.includes(segment)}
                          onCheckedChange={(checked) => {
                            let next = selectedSegments.filter((item) => item !== 'all');
                            next = checked ? [...next, segment] : next.filter((item) => item !== segment);
                            if (next.length === 0) next = ['all'];
                            setSelectedSegments(next);
                          }}
                        >
                          {segment}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Fonds</Label>
                    <Select
                      value={selectedFund}
                      onValueChange={(value) => {
                        setSelectedFund(value);
                        setSelectedShareClass('');
                      }}
                    >
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FUNDS.map((fund) => (
                          <SelectItem key={fund} value={fund}>
                            {fund === 'all' ? 'Tous les fonds' : fund}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedFund !== 'all' && (
                    <div className="space-y-2">
                      <Label>Part du fonds</Label>
                      <Select
                        value={selectedShareClass || 'all'}
                        onValueChange={(value) => setSelectedShareClass(value === 'all' ? '' : value)}
                      >
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les parts</SelectItem>
                          {shareClassOptions.map((shareClass) => (
                            <SelectItem key={shareClass} value={shareClass}>{shareClass}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 border rounded-2xl p-5 bg-gradient-to-br from-white to-indigo-50/40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Investisseur (unique)</Label>
                    <Select
                      value={selectedInvestor || 'none'}
                      onValueChange={(value) => {
                        const nextInvestor = value === 'none' ? '' : value;
                        setSelectedInvestor(nextInvestor);
                        setSelectedStructureId('');
                        setSelectedSubscription('');
                      }}
                    >
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sélectionner</SelectItem>
                        {INVESTORS.map((investor) => <SelectItem key={investor.id} value={investor.id}>{investor.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Structure (optionnelle)</Label>
                    <Select
                      value={selectedStructureId || 'none'}
                      onValueChange={(value) => {
                        setSelectedStructureId(value === 'none' ? '' : value);
                        setSelectedSubscription('');
                      }}
                      disabled={!selectedInvestor}
                    >
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Toutes les structures</SelectItem>
                        {structureOptions.map((structure) => (
                          <SelectItem key={structure.id} value={structure.id}>{structure.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Souscription (optionnelle)</Label>
                    <Select
                      value={selectedSubscription || 'none'}
                      onValueChange={(value) => setSelectedSubscription(value === 'none' ? '' : value)}
                      disabled={!selectedInvestor}
                    >
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Toutes les souscriptions</SelectItem>
                        {subscriptionOptions.map((subscription) => (
                          <SelectItem key={subscription} value={subscription}>{subscription}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border bg-white p-3 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Audience: <span className="font-semibold">{audience.investors}</span> investisseur(s) •{' '}
              <span className="font-semibold">{audience.contacts}</span> contact(s)
            </div>
          </section>

          <Separator />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label>Notification document</Label>
                <Switch checked={notify} onCheckedChange={setNotify} />
              </div>
              <Select value={notifyTemplate} onValueChange={setNotifyTemplate} disabled={!notify}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MAIL_TEMPLATES.map((template) => <SelectItem key={template} value={template}>{template}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label>Relance auto si non consulté</Label>
                <Switch checked={reminder} onCheckedChange={setReminder} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={reminderDelay} onValueChange={setReminderDelay} disabled={!reminder}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REMINDER_DELAYS.map((delay) => <SelectItem key={delay} value={delay}>{delay}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={reminderTemplate} onValueChange={setReminderTemplate} disabled={!reminder}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MAIL_TEMPLATES.map((template) => <SelectItem key={template} value={template}>{template}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Validation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {TEAMS.map((team) => (
                <label key={team.id} className="flex items-center gap-2 text-sm border rounded-md p-2">
                  <Checkbox
                    checked={validationTeams.includes(team.id)}
                    onCheckedChange={() => toggleArrayValue(validationTeams, team.id, setValidationTeams)}
                  />
                  {team.name}
                </label>
              ))}
            </div>
            <div className="border rounded-lg p-3 text-sm space-y-1">
              <p className="font-medium">Détail des validateurs</p>
              {selectedValidators.length === 0 ? (
                <p className="text-gray-500">Aucune équipe sélectionnée.</p>
              ) : (
                selectedValidators.map((item) => <p key={`${item.team}-${item.validator}`}>• {item.validator} ({item.team})</p>)
              )}
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSubmit}>Valider</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
