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
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { LanguageFlag } from '../LanguageFlag';
import { useTranslation } from '../../utils/languageContext';
import { ContactEditSheet, type ContactDraft, type StructureOption } from './ContactEditSheet';

type Contact = ContactDraft;

interface ContactsTabProps {
  investor: any;
}

// Mock data pour les structures
const mockStructures: StructureOption[] = [
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

/** L'utilisateur principal figure déjà parmi les contacts quand l'un d'eux porte son email. */
export const hasPrincipalUserContact = (investor: { email: string; contacts?: { email: string }[] }) =>
  (investor.contacts ?? []).some(contact => contact.email === investor.email);

export function ContactsTab({ investor }: ContactsTabProps) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>(() => [
    ...(hasPrincipalUserContact(investor) ? [] : [{
      id: `principal-${investor.id}`,
      firstName: investor.firstName ?? investor.name,
      lastName: investor.lastName ?? '',
      function: t('investors.detail.contactsTab.principalUser'),
      email: investor.email,
      phone: investor.phone,
      isPrimary: false,
      hasPortalAccess: investor.portalActive,
      language: investor.language,
    }]),
    ...(investor.contacts || []),
  ]);
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
      notificationsAllEnabled: true,
      notificationCategories: [],
      linkedStructures: [],
      fundsAccessRestricted: false,
      authorizedFunds: [],
      subscriptionsAccessRestricted: false,
      authorizedSubscriptions: [],
      documentTypesAccessRestricted: false,
      authorizedDocumentTypes: [],
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
                        {`${contact.firstName} ${contact.lastName}`
                          .split(' ')
                          .filter(Boolean)
                          .map(part => part[0])
                          .join('')
                          .substring(0, 2)}
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

      <ContactEditSheet
        open={isDialogOpen}
        isNew={
          !!selectedContact &&
          selectedContact.id.startsWith('contact-') &&
          !contacts.find(c => c.id === selectedContact.id)
        }
        contact={selectedContact}
        onChange={setSelectedContact}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedContact(null);
        }}
        onSave={handleSaveContact}
        structures={mockStructures}
        funds={mockFunds}
        subscriptions={mockSubscriptions}
      />
    </div>
  );
}
