import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Briefcase, 
  Star, 
  Key, 
  Edit2,
  Copy,
  Check,
  Building2,
  Globe,
  Bell,
  FileText,
  Shield,
  Lock,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { LanguageFlag } from '../LanguageFlag';
import { useTranslation } from '../../utils/languageContext';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  function: string;
  isPrimary: boolean;
  hasPortalAccess: boolean;
  accessLevel?: string;
  language?: string;
  isPreferredContact?: boolean;
  notificationTeams?: string[];
  authorizedFunds?: string[];
  authorizedSubscriptions?: string[];
  linkedStructures?: string[];
}

interface Structure {
  id: string;
  name: string;
  type: string;
}

interface ContactsTabProps {
  investor: any;
}

// Mock data pour les structures
const mockStructures: Structure[] = [
  { id: 'str-1', name: 'Simon Holding SAS', type: 'SAS' },
  { id: 'str-2', name: 'Family Trust Simon', type: 'Trust' },
  { id: 'str-3', name: 'InvestHub SARL', type: 'SARL' },
];

// Mock data pour les fonds
const mockFunds = [
  { id: 'fund-1', name: 'IH1' },
  { id: 'fund-2', name: 'FEE2' },
  { id: 'fund-3', name: 'Fonds I' },
];

// Mock data pour les souscriptions
const mockSubscriptions = [
  { id: 'sub-1', name: '12071 - IH1 - Nicolas SIRIEIX' },
];

// Mock data pour les équipes de notification
const mockTeams = [
  { id: 'team-1', name: 'Équipe 1' },
  { id: 'team-2', name: 'Équipe 2' },
];

export function ContactsTab({ investor }: ContactsTabProps) {
  const { t, lang } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>(investor.contacts || []);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(t('investors.detail.toast.copied'));
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error(t('investors.detail.toast.copyError'));
    }
  };

  const handleEditContact = (contact: Contact) => {
    // Si c'est le contact principal, il doit être rattaché à toutes les structures
    const contactWithStructures = {
      ...contact,
      linkedStructures: contact.isPrimary 
        ? mockStructures.map(s => s.id)
        : contact.linkedStructures || []
    };
    setSelectedContact(contactWithStructures);
    setIsDialogOpen(true);
  };

  const handleAddContact = () => {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      function: '',
      isPrimary: false,
      hasPortalAccess: false,
      language: 'Français',
      isPreferredContact: false,
      notificationTeams: [],
      authorizedFunds: [],
      authorizedSubscriptions: [],
      linkedStructures: [],
    };
    setSelectedContact(newContact);
    setIsDialogOpen(true);
  };

  const handleSaveContact = () => {
    if (!selectedContact) return;

    const isNew = !contacts.find(c => c.id === selectedContact.id);
    
    if (isNew) {
      setContacts([...contacts, selectedContact]);
      toast.success(t('investors.detail.contactsTab.contactAdded'));
    } else {
      setContacts(contacts.map(c => c.id === selectedContact.id ? selectedContact : c));
      toast.success(t('investors.detail.contactsTab.contactUpdated'));
    }
    
    setIsDialogOpen(false);
    setSelectedContact(null);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="p-1 hover:bg-gray-100 rounded transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Espace investisseur principal - Accès portail */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            {t('investors.detail.contactsTab.portalTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">{t('investors.detail.contactsTab.accessStatus')}</label>
            <Badge
              variant="outline"
              className={`border w-full justify-center ${
                investor.portalActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-50 text-gray-500 border-gray-300'
              }`}
            >
              {investor.portalActive ? t('investors.detail.contactsTab.active') : t('investors.detail.contactsTab.inactive')}
            </Badge>
          </div>

          {investor.lastLogin && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('investors.detail.contactsTab.lastLogin')}</label>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-900">
                  {new Date(investor.lastLogin).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 mb-2 block">{t('investors.detail.contactsTab.portalV2')}</label>
            <Badge
              variant="outline"
              className={`border w-full justify-center ${
                investor.portalV2Enabled
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-gray-50 text-gray-500 border-gray-300'
              }`}
            >
              {investor.portalV2Enabled ? t('investors.detail.contactsTab.v2Enabled') : t('investors.detail.contactsTab.v2Disabled')}
            </Badge>
          </div>
        </div>

        {investor.portalActive && (
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => toast.success(t('investors.detail.contactsTab.resetPasswordSent'))}
            >
              <Key className="w-4 h-4" />
              {t('investors.detail.contactsTab.resetPassword')}
            </Button>
          </div>
        )}
      </div>

      {/* Liste des contacts */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {t('investors.detail.contactsTab.contactsTitle', { count: contacts.length })}
            </h2>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleAddContact}
            >
              <Plus className="w-4 h-4" />
              {t('investors.detail.contactsTab.addContact')}
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {contacts.map((contact, idx) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleEditContact(contact)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.language && (
                          <LanguageFlag language={contact.language} size="sm" showTooltip />
                        )}
                        {contact.isPrimary && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs px-2">
                            <Star className="w-3 h-3 mr-1 fill-blue-700" />
                            {t('investors.detail.contactsTab.primaryBadge')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {contact.function}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-13 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{contact.email}</span>
                      <CopyButton text={contact.email} field={`contact-${contact.id}-email`} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{contact.phone}</span>
                      <CopyButton text={contact.phone} field={`contact-${contact.id}-phone`} />
                    </div>

                    {/* Lien vers le portail investisseur - TOUJOURS affiché */}
                    <div className="pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (contact.hasPortalAccess) {
                            toast.success(t('investors.detail.contactsTab.openPortalToast', { name: `${contact.firstName} ${contact.lastName}` }));
                            window.open(`/portal?impersonate=${contact.id}`, '_blank');
                          } else {
                            toast.info(t('investors.detail.contactsTab.noPortalAccess', { name: `${contact.firstName} ${contact.lastName}` }));
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          contact.hasPortalAccess 
                            ? 'text-purple-600 hover:text-purple-700 hover:underline' 
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {contact.hasPortalAccess
                          ? t('investors.detail.contactsTab.openPortalAs', { name: contact.firstName })
                          : t('investors.detail.contactsTab.investorPortalNoAccess')
                        }
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center gap-2">
                  {contact.hasPortalAccess ? (
                    <>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Key className="w-3 h-3 mr-1" />
                        {t('investors.detail.contactsTab.portalAccessBadge')}
                      </Badge>
                      <Badge variant="outline" className="border-gray-300">
                        {contact.accessLevel}
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="border-gray-300 text-gray-500">
                      {t('investors.detail.contactsTab.noAccess')}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2 h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditContact(contact);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {t('investors.detail.contactsTab.edit')}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dialog d'édition de contact */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContact?.id.startsWith('contact-') && !contacts.find(c => c.id === selectedContact.id)
                ? t('investors.detail.contactsTab.dialogAddTitle')
                : t('investors.detail.contactsTab.dialogEditTitle')}
            </DialogTitle>
            <DialogDescription>
              {selectedContact?.id.startsWith('contact-') && !contacts.find(c => c.id === selectedContact.id)
                ? t('investors.detail.contactsTab.dialogAddDesc')
                : t('investors.detail.contactsTab.dialogEditDesc')}
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">{t('investors.detail.contactsTab.generalSection')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('investors.detail.contactsTab.firstName')}</Label>
                    <Input
                      id="firstName"
                      value={selectedContact.firstName}
                      onChange={(e) => setSelectedContact({ ...selectedContact, firstName: e.target.value })}
                      placeholder={t('investors.detail.contactsTab.firstName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('investors.detail.contactsTab.lastName')}</Label>
                    <Input
                      id="lastName"
                      value={selectedContact.lastName}
                      onChange={(e) => setSelectedContact({ ...selectedContact, lastName: e.target.value })}
                      placeholder={t('investors.detail.contactsTab.lastName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('investors.detail.contactsTab.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={selectedContact.email}
                      onChange={(e) => setSelectedContact({ ...selectedContact, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('investors.detail.contactsTab.phone')}</Label>
                    <Input
                      id="phone"
                      value={selectedContact.phone}
                      onChange={(e) => setSelectedContact({ ...selectedContact, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="function">{t('investors.detail.contactsTab.function')}</Label>
                    <Input
                      id="function"
                      value={selectedContact.function}
                      onChange={(e) => setSelectedContact({ ...selectedContact, function: e.target.value })}
                      placeholder={t('investors.detail.contactsTab.functionPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{t('investors.detail.contactsTab.language')}</Label>
                    <Select
                      value={selectedContact.language}
                      onValueChange={(value) => setSelectedContact({ ...selectedContact, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('investors.detail.contactsTab.languagePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Français">Français</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Español">Español</SelectItem>
                        <SelectItem value="Deutsch">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900">{t('investors.detail.contactsTab.preferencesSection')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isPrimary"
                      checked={selectedContact.isPrimary}
                      onCheckedChange={(checked) =>
                        setSelectedContact({ ...selectedContact, isPrimary: checked as boolean })
                      }
                      disabled={selectedContact.isPrimary}
                    />
                    <Label htmlFor="isPrimary" className="cursor-pointer">
                      {t('investors.detail.contactsTab.primaryContact')}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isPreferredContact"
                      checked={selectedContact.isPreferredContact}
                      onCheckedChange={(checked) =>
                        setSelectedContact({ ...selectedContact, isPreferredContact: checked as boolean })
                      }
                    />
                    <Label htmlFor="isPreferredContact" className="cursor-pointer">
                      {t('investors.detail.contactsTab.preferredContact')}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('investors.detail.contactsTab.portalAccessSection')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hasPortalAccess"
                      checked={selectedContact.hasPortalAccess}
                      onCheckedChange={(checked) => 
                        setSelectedContact({ ...selectedContact, hasPortalAccess: checked as boolean })
                      }
                    />
                    <Label htmlFor="hasPortalAccess" className="cursor-pointer">
                      {t('investors.detail.contactsTab.enablePortalAccess')}
                    </Label>
                  </div>
                  {selectedContact.hasPortalAccess && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="accessLevel">{t('investors.detail.contactsTab.accessLevel')}</Label>
                      <Select
                        value={selectedContact.accessLevel}
                        onValueChange={(value) => setSelectedContact({ ...selectedContact, accessLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('investors.detail.contactsTab.selectAccessLevel')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Full Access">Full Access</SelectItem>
                          <SelectItem value="Read Only">Read Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="space-y-2 mt-3">
                        <Label>
                          <Lock className="w-3.5 h-3.5 inline mr-1" />
                          {t('investors.detail.contactsTab.password')}
                        </Label>
                        <div className="flex gap-2">
                          <Input type="password" placeholder="••••••••" disabled className="flex-1" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success(t('investors.detail.contactsTab.resetPasswordSent'))}
                          >
                            {t('investors.detail.contactsTab.reset')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {t('investors.detail.contactsTab.linkedStructures')}
                </h3>
                <div className="space-y-2">
                  {mockStructures.map((structure) => (
                    <div key={structure.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`structure-${structure.id}`}
                        checked={selectedContact.linkedStructures?.includes(structure.id)}
                        onCheckedChange={(checked) => {
                          const current = selectedContact.linkedStructures || [];
                          const updated = checked
                            ? [...current, structure.id]
                            : current.filter(id => id !== structure.id);
                          setSelectedContact({ ...selectedContact, linkedStructures: updated });
                        }}
                        disabled={selectedContact.isPrimary}
                      />
                      <Label htmlFor={`structure-${structure.id}`} className="cursor-pointer flex items-center gap-2">
                        {structure.name}
                        <Badge variant="outline" className="text-xs">
                          {structure.type}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                  {selectedContact.isPrimary && (
                    <p className="text-xs text-gray-500 mt-2">
                      {t('investors.detail.contactsTab.primaryAttachAll')}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {t('investors.detail.contactsTab.notifications')}
                </h3>
                <div className="space-y-2">
                  {mockTeams.map((team) => (
                    <div key={team.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`team-${team.id}`}
                        checked={selectedContact.notificationTeams?.includes(team.id)}
                        onCheckedChange={(checked) => {
                          const current = selectedContact.notificationTeams || [];
                          const updated = checked
                            ? [...current, team.id]
                            : current.filter(id => id !== team.id);
                          setSelectedContact({ ...selectedContact, notificationTeams: updated });
                        }}
                      />
                      <Label htmlFor={`team-${team.id}`} className="cursor-pointer">
                        {team.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('investors.detail.contactsTab.authorizedFunds')}
                </h3>
                <div className="space-y-2">
                  {mockFunds.map((fund) => (
                    <div key={fund.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`fund-${fund.id}`}
                        checked={selectedContact.authorizedFunds?.includes(fund.id)}
                        onCheckedChange={(checked) => {
                          const current = selectedContact.authorizedFunds || [];
                          const updated = checked
                            ? [...current, fund.id]
                            : current.filter(id => id !== fund.id);
                          setSelectedContact({ ...selectedContact, authorizedFunds: updated });
                        }}
                      />
                      <Label htmlFor={`fund-${fund.id}`} className="cursor-pointer">
                        {fund.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('investors.detail.contactsTab.authorizedSubscriptions')}
                </h3>
                <div className="space-y-2">
                  {mockSubscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`sub-${sub.id}`}
                        checked={selectedContact.authorizedSubscriptions?.includes(sub.id)}
                        onCheckedChange={(checked) => {
                          const current = selectedContact.authorizedSubscriptions || [];
                          const updated = checked
                            ? [...current, sub.id]
                            : current.filter(id => id !== sub.id);
                          setSelectedContact({ ...selectedContact, authorizedSubscriptions: updated });
                        }}
                      />
                      <Label htmlFor={`sub-${sub.id}`} className="cursor-pointer">
                        {sub.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedContact(null);
                  }}
                >
                  {t('investors.detail.contactsTab.cancel')}
                </Button>
                <Button
                  onClick={handleSaveContact}
                  style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  className="text-white"
                >
                  {t('investors.detail.contactsTab.save')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}