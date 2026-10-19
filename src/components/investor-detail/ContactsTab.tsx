import { useMemo, useState } from 'react';
import { ExternalLink, MoreHorizontal, Pencil, PenTool, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Investor } from '../../utils/investorGenerator';
import { useTranslation } from '../../utils/languageContext';
import { DataTable, type ColumnConfig } from '../DataTable';
import { LanguageFlag } from '../LanguageFlag';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { WIDGET_TITLE_CLASS } from '../ui/utils';
import { ContactEditSheet, type ContactDraft, type SignatureLevel } from './ContactEditSheet';

type Contact = ContactDraft;
type Row = Contact & { id: number; contactId: string };
type SortKey = 'name' | 'email' | 'phone';

const K = 'investors.detail.contactsTab';

interface ContactsTabProps {
  investor: Investor;
}

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

const fullName = (contact: Contact) => `${contact.firstName} ${contact.lastName}`.trim();

/** L'utilisateur principal figure déjà parmi les contacts quand l'un d'eux porte son email. */
export const hasPrincipalUserContact = (investor: { email: string; contacts?: { email: string }[] }) =>
  (investor.contacts ?? []).some(contact => contact.email === investor.email);

interface SignatoryLike {
  id: string;
  firstName: string;
  lastName: string;
  function: string;
  email: string;
  phone: string;
  signatureLevel: string;
  isPrimary: boolean;
}

const toSignatureLevel = (level: string): SignatureLevel =>
  level === 'Joint' ? 'Joint' : level === 'Individual' ? 'Individual' : 'Collective';

/** Les signataires sont des contacts : on les rattache par email, les autres sont ajoutés à la liste. */
function mergeSignatories(contacts: Contact[], signatories: SignatoryLike[]): Contact[] {
  const merged = contacts.map((contact) => {
    const signatory = signatories.find((item) => item.email === contact.email);
    return signatory
      ? {
          ...contact,
          isSignatory: true,
          isPrimarySignatory: signatory.isPrimary,
          signatureLevel: toSignatureLevel(signatory.signatureLevel),
        }
      : contact;
  });
  const orphans = signatories
    .filter((signatory) => !contacts.some((contact) => contact.email === signatory.email))
    .map((signatory) => ({
      id: signatory.id,
      firstName: signatory.firstName,
      lastName: signatory.lastName,
      function: signatory.function,
      email: signatory.email,
      phone: signatory.phone,
      isPrimary: false,
      hasPortalAccess: false,
      isSignatory: true,
      isPrimarySignatory: signatory.isPrimary,
      signatureLevel: toSignatureLevel(signatory.signatureLevel),
    }));
  return [...merged, ...orphans];
}

/** Nombre de lignes de l'onglet Contacts : utilisateur principal, contacts et signataires sans contact. */
export const countContactRows = (investor: {
  email: string;
  contacts?: { email: string }[];
  signatories?: { email: string }[];
}) => {
  const contacts = investor.contacts ?? [];
  const orphans = (investor.signatories ?? []).filter(
    (signatory) => !contacts.some((contact) => contact.email === signatory.email),
  ).length;
  return contacts.length + orphans + (hasPrincipalUserContact(investor) ? 0 : 1);
};

export function ContactsTab({ investor }: ContactsTabProps) {
  const { t, lang } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>(() => mergeSignatories([
    ...(hasPrincipalUserContact(investor) ? [] : [{
      id: `principal-${investor.id}`,
      firstName: investor.firstName ?? investor.name,
      lastName: investor.lastName ?? '',
      function: t(`${K}.principalUser`),
      email: investor.email,
      phone: investor.phone,
      isPrimary: false,
      hasPortalAccess: investor.portalActive,
      language: investor.language,
    }]),
    ...(investor.contacts || []),
  ], investor.signatories || []));
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const structures = useMemo(
    () => investor.structures.map((structure) => ({ id: structure.id, name: structure.name, type: structure.type })),
    [investor.structures],
  );

  const handleEditContact = (contact: Contact) => {
    // Le contact principal est rattaché à toutes les structures.
    setSelectedContact({
      ...contact,
      linkedStructures: contact.isPrimary ? structures.map((s) => s.id) : contact.linkedStructures || [],
    });
    setIsDialogOpen(true);
  };

  const handleAddContact = () => {
    setSelectedContact({
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
    });
    setIsDialogOpen(true);
  };

  const handleSaveContact = () => {
    if (!selectedContact) return;
    const isNew = !contacts.find((c) => c.id === selectedContact.id);
    if (isNew) {
      setContacts([...contacts, selectedContact]);
      toast.success(t(`${K}.contactAdded`));
    } else {
      setContacts(contacts.map((c) => (c.id === selectedContact.id ? selectedContact : c)));
      toast.success(t(`${K}.contactUpdated`));
    }
    setIsDialogOpen(false);
    setSelectedContact(null);
  };

  const openPortal = (contact: Contact) => {
    toast.success(t(`${K}.openPortalToast`, { name: fullName(contact) }));
    window.open(`/portal?impersonate=${contact.id}`, '_blank');
  };

  const rows: Row[] = useMemo(() => {
    const list: Row[] = contacts.map((contact, index) => ({ ...contact, id: index + 1, contactId: contact.id }));
    if (!sortConfig) return list;
    const valueOf = (row: Row) => (sortConfig.key as SortKey) === 'name' ? fullName(row) : row[sortConfig.key as 'email' | 'phone'] ?? '';
    return [...list].sort((a, b) => {
      const result = valueOf(a).localeCompare(valueOf(b), lang);
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [contacts, sortConfig, lang]);

  const toContact = (row: Row): Contact => contacts.find((contact) => contact.id === row.contactId) ?? contacts[0];

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'name',
      label: t(`${K}.columns.name`),
      sortable: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="inline-flex items-center gap-2 font-medium text-foreground">
            {fullName(row)}
            {row.language && <LanguageFlag language={row.language} size="sm" showTooltip />}
          </span>
          {row.function && <span className="text-xs text-muted-foreground">{row.function}</span>}
        </span>
      ),
    },
    { key: 'email', label: t(`${K}.columns.email`), sortable: true, render: (row) => row.email },
    { key: 'phone', label: t(`${K}.columns.phone`), sortable: true, render: (row) => <span className="tabular-nums">{row.phone}</span> },
    {
      key: 'roles',
      label: t(`${K}.columns.roles`),
      render: (row) => (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {row.isPrimary && <StatusBadge icon={Star} variant="info" label={t(`${K}.primaryBadge`)} />}
          {row.isSignatory && (
            <StatusBadge
              icon={PenTool}
              variant="neutral"
              label={
                row.isPrimarySignatory
                  ? t('investors.detail.signatories.primarySignatory')
                  : t(`${K}.signatoryBadge`, { level: t(`investors.detail.signatureLevel.${row.signatureLevel}`) })
              }
            />
          )}
        </span>
      ),
    },
    {
      key: 'portal',
      label: t(`${K}.columns.portal`),
      render: (row) =>
        row.hasPortalAccess ? (
          <StatusBadge
            variant="success"
            label={row.accessLevel ? t(`${K}.portalAccessLevel`, { level: row.accessLevel }) : t(`${K}.portalAccessBadge`)}
          />
        ) : (
          <StatusBadge variant="neutral" label={t(`${K}.noAccess`)} />
        ),
    },
    {
      key: 'actions',
      label: t(`${K}.columns.actions`),
      align: 'right',
      render: (row) => (
        <span onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t(`${K}.actionsFor`, { name: fullName(row) })}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditContact(toContact(row))}>
                <Pencil className="w-4 h-4" />
                {t(`${K}.edit`)}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!row.hasPortalAccess} onClick={() => openPortal(toContact(row))}>
                <ExternalLink className="w-4 h-4" />
                <span className="flex flex-col">
                  <span>{t(`${K}.openPortalAs`, { name: row.firstName })}</span>
                  {!row.hasPortalAccess && (
                    <span className="text-xs text-muted-foreground">{t(`${K}.investorPortalNoAccess`)}</span>
                  )}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      ),
    },
  ];

  return (
    <>
      <Card className="gap-0 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 className={WIDGET_TITLE_CLASS}>{t(`${K}.contactsTitle`, { count: contacts.length })}</h3>
          <Button size="sm" onClick={handleAddContact}>
            <Plus className="w-4 h-4" />
            {t(`${K}.addContact`)}
          </Button>
        </div>
        <DataTable
          data={rows}
          columns={columns}
          hoveredRow={hoveredRow}
          setHoveredRow={setHoveredRow}
          onRowClick={(row) => handleEditContact(toContact(row))}
          sortConfig={sortConfig}
          onSort={(key) =>
            setSortConfig((prev) =>
              prev?.key === key ? (prev.direction === 'asc' ? { key, direction: 'desc' } : null) : { key, direction: 'asc' },
            )
          }
          compactMode
          hideSelection
          density="compact"
        />
      </Card>

      <ContactEditSheet
        open={isDialogOpen}
        isNew={!!selectedContact && !contacts.find((c) => c.id === selectedContact.id)}
        contact={selectedContact}
        onChange={setSelectedContact}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedContact(null);
        }}
        onSave={handleSaveContact}
        structures={structures}
        funds={mockFunds}
        subscriptions={mockSubscriptions}
      />
    </>
  );
}
