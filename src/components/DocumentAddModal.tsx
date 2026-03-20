import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

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
  shareClass: string;
  structure: string;
  contacts: number;
  subscriptions: string[];
}

interface DocumentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderOptions: FolderOption[];
  defaultFolderId: string;
}

const SEGMENTS = ['Institutionnels', 'Family Office', 'Retail', 'Corporate'];
const FUNDS = ['PERE 1', 'PERE 2', 'Growth Tech'];
const SHARE_CLASSES = ['A', 'I', 'P'];
const MAIL_TEMPLATES = ['Nouveau document', 'Rapport trimestriel', 'Appel de fonds'];
const REMINDER_DELAYS = ['3 jours', '7 jours', '14 jours'];

const TEAMS: ValidationTeam[] = [
  { id: 'front', name: 'Front Office', validators: ['N. Sibille', 'L. Martin'] },
  { id: 'middle', name: 'Middle Office', validators: ['S. Roussel', 'M. Dupont'] },
  { id: 'compliance', name: 'Compliance', validators: ['P. Mercier', 'C. Bernard'] },
];

const INVESTORS: InvestorProfile[] = [
  { id: 'i1', name: 'Jean Dupont', segment: 'Institutionnels', fund: 'PERE 1', shareClass: 'I', structure: 'Holding', contacts: 2, subscriptions: ['SUB-001'] },
  { id: 'i2', name: 'Marie Martin', segment: 'Family Office', fund: 'PERE 1', shareClass: 'A', structure: 'SCI', contacts: 3, subscriptions: ['SUB-002'] },
  { id: 'i3', name: 'Thomas Petit', segment: 'Retail', fund: 'Growth Tech', shareClass: 'P', structure: 'PP', contacts: 1, subscriptions: ['SUB-003'] },
  { id: 'i4', name: 'Sophie Bernard', segment: 'Corporate', fund: 'PERE 2', shareClass: 'I', structure: 'SAS', contacts: 2, subscriptions: ['SUB-004'] },
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
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [fundMode, setFundMode] = useState<'all' | 'single'>('all');
  const [selectedFund, setSelectedFund] = useState('PERE 1');
  const [selectedShareClass, setSelectedShareClass] = useState<string>('');
  const [selectedInvestor, setSelectedInvestor] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<string>('');
  const [selectedStructure, setSelectedStructure] = useState<string>('');
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

  const audience = useMemo(() => {
    if (audienceMode === 'general') {
      let candidates = INVESTORS;
      if (selectedSegments.length > 0) {
        candidates = candidates.filter((inv) => selectedSegments.includes(inv.segment));
      }
      if (fundMode === 'single') {
        candidates = candidates.filter((inv) => inv.fund === selectedFund);
        if (selectedShareClass) {
          candidates = candidates.filter((inv) => inv.shareClass === selectedShareClass);
        }
      }
      const contacts = candidates.reduce((sum, inv) => sum + inv.contacts, 0);
      return { investors: candidates.length, contacts };
    }

    const investor = INVESTORS.find((inv) => inv.id === selectedInvestor);
    if (!investor) {
      return { investors: 0, contacts: 0 };
    }
    if (selectedSubscription && !investor.subscriptions.includes(selectedSubscription)) {
      return { investors: 0, contacts: 0 };
    }
    if (selectedStructure && investor.structure !== selectedStructure) {
      return { investors: 0, contacts: 0 };
    }
    return { investors: 1, contacts: investor.contacts };
  }, [
    audienceMode,
    selectedSegments,
    fundMode,
    selectedFund,
    selectedShareClass,
    selectedInvestor,
    selectedSubscription,
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
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un document</DialogTitle>
          <DialogDescription>
            Créez des versions FR/EN, configurez l'audience et le workflow de validation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Versions documentaires</h3>
            {versions.map((version) => (
              <div key={version.language} className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded-lg p-3">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Input value={version.language.toUpperCase()} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Nom du document ({version.language.toUpperCase()})</Label>
                  <Input
                    value={version.name}
                    onChange={(event) => updateVersion(version.language, { name: event.target.value })}
                    placeholder={`Nom ${version.language.toUpperCase()}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ajouter un document</Label>
                  <Input
                    type="file"
                    onChange={(event) => {
                      const fileName = event.target.files?.[0]?.name || '';
                      updateVersion(version.language, { fileName });
                    }}
                  />
                  {version.fileName && <p className="text-xs text-gray-500 truncate">{version.fileName}</p>}
                </div>
              </div>
            ))}
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
            <div className="flex gap-2">
              <Button variant={audienceMode === 'general' ? 'default' : 'outline'} onClick={() => setAudienceMode('general')}>Document général</Button>
              <Button variant={audienceMode === 'nominative' ? 'default' : 'outline'} onClick={() => setAudienceMode('nominative')}>Document nominatif</Button>
            </div>

            {audienceMode === 'general' ? (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                  <Label>Segments investisseurs</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SEGMENTS.map((segment) => (
                      <label key={segment} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedSegments.includes(segment)}
                          onCheckedChange={() => toggleArrayValue(selectedSegments, segment, setSelectedSegments)}
                        />
                        {segment}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Fonds</Label>
                    <Select value={fundMode} onValueChange={(value: 'all' | 'single') => setFundMode(value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les fonds</SelectItem>
                        <SelectItem value="single">Un fonds spécifique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fonds ciblé</Label>
                    <Select value={selectedFund} onValueChange={setSelectedFund} disabled={fundMode === 'all'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{FUNDS.map((fund) => <SelectItem key={fund} value={fund}>{fund}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Part du fonds (optionnelle)</Label>
                    <Select value={selectedShareClass || 'none'} onValueChange={(value) => setSelectedShareClass(value === 'none' ? '' : value)} disabled={fundMode === 'all'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Toutes les parts</SelectItem>
                        {SHARE_CLASSES.map((shareClass) => <SelectItem key={shareClass} value={shareClass}>{shareClass}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Investisseur (unique)</Label>
                    <Select value={selectedInvestor || 'none'} onValueChange={(value) => setSelectedInvestor(value === 'none' ? '' : value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sélectionner</SelectItem>
                        {INVESTORS.map((investor) => <SelectItem key={investor.id} value={investor.id}>{investor.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Souscription (optionnelle)</Label>
                    <Input value={selectedSubscription} onChange={(event) => setSelectedSubscription(event.target.value)} placeholder="ex: SUB-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Structure investisseur</Label>
                    <Input value={selectedStructure} onChange={(event) => setSelectedStructure(event.target.value)} placeholder="Holding / SCI / ..." />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              Audience estimée en temps réel: <span className="font-semibold">{audience.investors}</span> investisseur(s) •{' '}
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
