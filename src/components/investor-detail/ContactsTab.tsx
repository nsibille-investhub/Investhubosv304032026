import { useMemo, useState } from 'react';
import { ExternalLink, Pencil, PenTool, Plus, Star, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Investor } from '../../utils/investorGenerator';
import { useTranslation } from '../../utils/languageContext';
import { DataTable, type ColumnConfig } from '../DataTable';
import { LanguageFlag } from '../LanguageFlag';
import { StatusBadge } from '../StatusBadge';
import { EmptyState } from '../EmptyState';
import { FilterBar, type FilterConfig } from '../FilterBar';
import { Tag } from '../Tag';
import { Button } from '../ui/button';
import { ListingCard, ListingNameCell } from '../ui/listing';
import { TableRowActions } from '../ui/row-actions';
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
  ], investor.signatories || []).map((contact) =>
    // Le contact principal a toujours accès au portail.
    contact.isPrimary ? { ...contact, hasPortalAccess: true, accessLevel: contact.accessLevel ?? 'Admin' } : contact,
  ));
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});

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

  const filterConfigs: FilterConfig[] = [
    {
      id: 'role',
      label: t(`${K}.filters.role`),
      type: 'select',
      isPrimary: true,
      options: [
        { value: 'primary', label: t(`${K}.primaryBadge`) },
        { value: 'signatory', label: t(`${K}.filters.signatory`) },
      ],
    },
    {
      id: 'portal',
      label: t(`${K}.columns.portal`),
      type: 'select',
      isPrimary: true,
      options: [
        { value: 'with', label: t(`${K}.portalAccessBadge`) },
        { value: 'without', label: t(`${K}.noAccess`) },
      ],
    },
  ];

  const rows: Row[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = contacts.filter((contact) => {
      if (term && ![fullName(contact), contact.email, contact.phone, contact.function].some((v) => v?.toLowerCase().includes(term))) return false;
      if (filters.role === 'primary' && !contact.isPrimary) return false;
      if (filters.role === 'signatory' && !contact.isSignatory) return false;
      if (filters.portal === 'with' && !contact.hasPortalAccess) return false;
      if (filters.portal === 'without' && contact.hasPortalAccess) return false;
      return true;
    });
    const list: Row[] = filtered.map((contact, index) => ({ ...contact, id: index + 1, contactId: contact.id }));
    if (!sortConfig) return list;
    const valueOf = (row: Row) => (sortConfig.key as SortKey) === 'name' ? fullName(row) : row[sortConfig.key as 'email' | 'phone'] ?? '';
    return [...list].sort((a, b) => {
      const result = valueOf(a).localeCompare(valueOf(b), lang);
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [contacts, sortConfig, lang, search, filters]);

  const toContact = (row: Row): Contact => contacts.find((contact) => contact.id === row.contactId) ?? contacts[0];

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'name',
      label: t(`${K}.columns.name`),
      sortable: true,
      render: (row, term) => (
        <ListingNameCell
          name={fullName(row)}
          searchTerm={term}
          secondary={row.function}
          adornment={row.language ? <LanguageFlag language={row.language} size="sm" showTooltip /> : undefined}
        />
      ),
    },
    { key: 'email', label: t(`${K}.columns.email`), sortable: true, render: (row) => <span className="text-sm text-gray-700">{row.email}</span> },
    { key: 'phone', label: t(`${K}.columns.phone`), sortable: true, render: (row) => <span className="text-sm text-gray-700 tabular-nums">{row.phone}</span> },
    {
      key: 'roles',
      label: t(`${K}.columns.roles`),
      render: (row) =>
        row.isPrimary || row.isSignatory ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            {row.isPrimary && <Tag icon={Star} label={t(`${K}.primaryBadge`)} />}
            {row.isSignatory && (
              <Tag
                icon={PenTool}
                label={
                  row.isPrimarySignatory
                    ? t('investors.detail.signatories.primarySignatory')
                    : t(`${K}.signatoryBadge`, { level: t(`investors.detail.signatureLevel.${row.signatureLevel}`) })
                }
              />
            )}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
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
      label: '',
      align: 'right',
      render: (row) => (
        <TableRowActions
          actions={[
            { label: t(`${K}.edit`), icon: Pencil, onClick: () => handleEditContact(toContact(row)) },
            {
              label: t(`${K}.openPortalAs`, { name: row.firstName }),
              icon: ExternalLink,
              onClick: () => openPortal(toContact(row)),
              disabledReason: row.hasPortalAccess ? undefined : t(`${K}.investorPortalNoAccess`),
            },
          ]}
        />
      ),
    },
  ];

  const hasFilters = Object.values(filters).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));

  return (
    <>
      <ListingCard
        toolbar={
          <div className="flex items-start justify-between gap-3">
            <FilterBar
              className="flex-1"
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={t(`${K}.searchPlaceholder`)}
              filters={filterConfigs}
              activeFilters={filters}
              onFilterChange={(id, value) =>
                setFilters((prev) => {
                  const next = { ...prev };
                  if (value === null || (Array.isArray(value) && value.length === 0)) delete next[id];
                  else next[id] = value;
                  return next;
                })
              }
              onClearAll={() => setFilters({})}
            />
            <Button onClick={handleAddContact} className="shrink-0">
              <Plus className="w-4 h-4" />
              {t(`${K}.addContact`)}
            </Button>
          </div>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            hasFilters={hasFilters}
            hasSearch={Boolean(search.trim())}
            entityName={t(`${K}.entity`)}
            onReset={() => {
              setSearch('');
              setFilters({});
            }}
          />
        ) : (
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
            searchTerm={search}
          />
        )}
      </ListingCard>

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
