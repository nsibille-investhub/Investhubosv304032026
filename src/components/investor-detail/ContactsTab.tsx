import { useMemo, useState } from 'react';
import { Bell, Building2, ExternalLink, Globe, KeyRound, Monitor, Pencil, PenTool, Plus, ShieldCheck, Star, Users } from 'lucide-react';
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
import { ListingCard, ListingNameCell, ListingStackCell, ListingStackRow } from '../ui/listing';
import { TableRowActions } from '../ui/row-actions';
import {
  ACCESS_DIMENSION_ICON,
  ACCESS_DIMENSIONS,
  ACCESS_ROLES,
  ALL,
  ContactEditSheet,
  KYC_RELATIONS,
  NONE,
  hasAnyChannel,
  some,
  type AccessDimension,
  type AccessRight,
  type ContactDraft,
  type KycLink,
  type NamedOption,
  type SignatureLevel,
  type StructureOption,
} from './ContactEditSheet';
import type { ScopeValue } from '../ui/side-panel';

type Contact = ContactDraft;
type Row = Contact & { id: number; contactId: string };
type SortKey = 'name' | 'email' | 'phone' | 'language';

const K = 'investors.detail.contactsTab';

interface ContactsTabProps {
  investor: Investor;
}

// Mock data pour les fonds
const mockFunds: NamedOption[] = [
  { id: 'fund-1', name: 'IH1' },
  { id: 'fund-2', name: 'FEE2' },
  { id: 'fund-3', name: 'Fonds I' },
];

/**
 * Données de démo, dérivées de façon stable de la position du contact :
 * liens KYC-AML surveillés, périmètre de signature, canaux et droits d'accès.
 */
function withMockRights(
  contact: Contact,
  index: number,
  structures: StructureOption[],
  subscriptions: NamedOption[],
): Contact {
  const structureAt = (offset: number) => structures[(index + offset) % structures.length];
  const hasStructures = structures.length > 0;

  const kycMonitored = contact.kycMonitored ?? (contact.isPrimary || index % 2 === 0);
  const kycLinks: KycLink[] =
    contact.kycLinks ??
    (!kycMonitored
      ? []
      : contact.isPrimary || !hasStructures
        ? [
            { id: `kyc-${index}-1`, relation: 'ubo', structures: ALL },
            ...(hasStructures ? [{ id: `kyc-${index}-2`, relation: 'legalRepresentative' as const, structures: some([structures[0].id]) }] : []),
          ]
        : [{ id: `kyc-${index}-1`, relation: KYC_RELATIONS[(index + 2) % KYC_RELATIONS.length], structures: some([structureAt(0).id]) }]);

  const signatoryGlobal = contact.signatoryGlobal ?? (contact.isPrimarySignatory || structures.length < 2);
  const signatoryStructureIds =
    contact.signatoryStructureIds ?? (signatoryGlobal || !hasStructures ? [] : [structureAt(1).id]);

  const communicationsEnabled = contact.communicationsEnabled ?? (contact.isPrimary || index % 3 !== 2);
  const withChannel = hasAnyChannel({ ...contact, communicationsEnabled });
  const accessRights: AccessRight[] =
    contact.accessRights ??
    (!withChannel
      ? []
      : contact.isPrimary
        ? [{ id: `right-${index}-1`, funds: ALL, structures: ALL, roles: ALL, subscriptions: ALL }]
        : [
            {
              id: `right-${index}-1`,
              funds: some([mockFunds[index % mockFunds.length].id]),
              structures: hasStructures ? some([structureAt(0).id]) : NONE,
              roles: some([ACCESS_ROLES[(index + 1) % ACCESS_ROLES.length]]),
              subscriptions: ALL,
            },
            ...(index % 2 === 1
              ? [{ id: `right-${index}-2`, funds: ALL, structures: NONE, roles: some(['accountant']), subscriptions: subscriptions.length > 0 ? some([subscriptions[0].id]) : NONE }]
              : []),
          ]);

  return { ...contact, kycMonitored, kycLinks, signatoryGlobal, signatoryStructureIds, communicationsEnabled, accessRights };
}

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
  const initialStructures: StructureOption[] = investor.structures.map((structure) => ({
    id: structure.id,
    name: structure.name,
    type: structure.type,
  }));
  const initialSubscriptions: NamedOption[] = [
    { id: 'sub-1', name: `12071 - IH1 - ${investor.name}` },
    { id: 'sub-2', name: `12384 - FEE2 - ${investor.name}` },
  ];
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
  ], investor.signatories || [])
    // Le contact principal a toujours accès au portail.
    .map((contact) => (contact.isPrimary ? { ...contact, hasPortalAccess: true, accessLevel: contact.accessLevel ?? 'Admin' } : contact))
    .map((contact, index) => withMockRights(contact, index, initialStructures, initialSubscriptions)));
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});

  const [structures] = useState(initialStructures);
  const [subscriptions] = useState(initialSubscriptions);
  const structureName = (id: string) => structures.find((structure) => structure.id === id)?.name ?? id;
  const optionName: Record<AccessDimension, (id: string) => string> = {
    funds: (id) => mockFunds.find((fund) => fund.id === id)?.name ?? id,
    structures: structureName,
    roles: (id) => t(`${K}.accessRoles.${id}`),
    subscriptions: (id) => subscriptions.find((sub) => sub.id === id)?.name ?? id,
  };
  /** « Tous les fonds », « Aucun fonds » ou la liste des éléments retenus. */
  const scopeLabels = (dimension: AccessDimension | 'kycStructures', value: ScopeValue): string[] =>
    value.mode === 'some'
      ? value.ids.map(optionName[dimension === 'kycStructures' ? 'structures' : dimension])
      : [t(`${K}.scope.${dimension}.${value.mode}`)];

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
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
      kycMonitored: false,
      kycLinks: [],
      communicationsEnabled: true,
      accessRights: [],
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
      id: 'kyc',
      label: t(`${K}.columns.kyc`),
      type: 'multiselect',
      isPrimary: true,
      options: [
        ...KYC_RELATIONS.map((relation) => ({ value: relation, label: t(`${K}.kycRelations.${relation}`) })),
        { value: 'unmonitored', label: t(`${K}.kyc.unmonitored`) },
      ],
    },
    {
      id: 'signatory',
      label: t(`${K}.columns.signatory`),
      type: 'select',
      isPrimary: true,
      options: [
        { value: 'yes', label: t(`${K}.filters.signatoryYes`) },
        { value: 'no', label: t(`${K}.filters.signatoryNo`) },
      ],
    },
    {
      id: 'access',
      label: t(`${K}.columns.access`),
      type: 'multiselect',
      isPrimary: true,
      options: [
        { value: 'portal', label: t(`${K}.access.portal`) },
        { value: 'communications', label: t(`${K}.access.communications`) },
        { value: 'none', label: t(`${K}.noAccess`) },
      ],
    },
  ];

  const rows: Row[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    const kycFilter = (filters.kyc as string[] | undefined) ?? [];
    const accessFilter = (filters.access as string[] | undefined) ?? [];
    const filtered = contacts.filter((contact) => {
      if (term && ![fullName(contact), contact.email, contact.phone, contact.function].some((v) => v?.toLowerCase().includes(term))) return false;
      if (kycFilter.length > 0) {
        const relations = contact.kycMonitored ? (contact.kycLinks ?? []).map((link) => link.relation as string) : [];
        if (!kycFilter.some((value) => (value === 'unmonitored' ? !contact.kycMonitored : relations.includes(value)))) return false;
      }
      if (filters.signatory === 'yes' && !contact.isSignatory) return false;
      if (filters.signatory === 'no' && contact.isSignatory) return false;
      if (accessFilter.length > 0) {
        const channels = [
          ...(contact.isPrimary || contact.hasPortalAccess ? ['portal'] : []),
          ...(contact.communicationsEnabled ? ['communications'] : []),
        ];
        if (!accessFilter.some((value) => (value === 'none' ? channels.length === 0 : channels.includes(value)))) return false;
      }
      return true;
    });
    const list: Row[] = filtered.map((contact, index) => ({ ...contact, id: index + 1, contactId: contact.id }));
    if (!sortConfig) return list;
    const valueOf = (row: Row) =>
      (sortConfig.key as SortKey) === 'name' ? fullName(row) : (sortConfig.key as SortKey) === 'language' ? row.language ?? '' : row[sortConfig.key as 'email' | 'phone'] ?? '';
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
          adornment={row.isPrimary ? <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" aria-label={t(`${K}.primaryBadge`)} /> : undefined}
        />
      ),
    },
    { key: 'email', label: t(`${K}.columns.email`), sortable: true, render: (row) => <span className="text-sm text-gray-700">{row.email}</span> },
    { key: 'phone', label: t(`${K}.columns.phone`), sortable: true, render: (row) => <span className="text-sm text-gray-700 tabular-nums whitespace-nowrap">{row.phone}</span> },
    {
      key: 'language',
      label: t(`${K}.columns.language`),
      sortable: true,
      render: (row) =>
        row.language ? (
          <span className="inline-flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
            <LanguageFlag language={row.language} size="sm" />
            {row.language}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      key: 'kyc',
      label: t(`${K}.columns.kyc`),
      render: (row) => {
        if (!row.kycMonitored) return <StatusBadge variant="neutral" label={t(`${K}.kyc.unmonitored`)} />;
        const links = row.kycLinks ?? [];
        return (
          <ListingStackCell
            icon={ShieldCheck}
            items={links.map(
              (link) => `${t(`${K}.kycRelations.${link.relation}`)} · ${scopeLabels('kycStructures', link.structures).join(', ')}`,
            )}
            title={t(`${K}.kycCard.title`, { name: fullName(row) })}
            subtitle={t(`${K}.kycCard.subtitle`)}
          >
            <div className="space-y-2">
              {links.map((link) => (
                <ListingStackRow key={link.id} icon={ShieldCheck} label={t(`${K}.kycRelations.${link.relation}`)}>
                  {scopeLabels('kycStructures', link.structures).map((label) => (
                    <Tag key={label} icon={Building2} label={label} />
                  ))}
                </ListingStackRow>
              ))}
            </div>
          </ListingStackCell>
        );
      },
    },
    {
      key: 'signatory',
      label: t(`${K}.columns.signatory`),
      render: (row) => {
        if (!row.isSignatory) return <span className="text-gray-400 text-sm">—</span>;
        const global = row.signatoryGlobal !== false;
        const level = t(`investors.detail.signatureLevel.${row.signatureLevel ?? 'Individual'}`);
        return (
          <ListingStackCell
            icon={PenTool}
            items={global ? [t(`${K}.signatoryAllStructures`)] : (row.signatoryStructureIds ?? []).map(structureName)}
            title={t(`${K}.signatoryCard.title`, { name: fullName(row) })}
            subtitle={
              row.isPrimarySignatory
                ? `${t('investors.detail.signatories.primarySignatory')} · ${level}`
                : t(`${K}.signatoryCard.subtitle`, { level })
            }
          >
            <div className="space-y-2">
              {global ? (
                <ListingStackRow icon={Globe} label={t(`${K}.signatoryAllStructures`)}>
                  <Tag label={level} />
                </ListingStackRow>
              ) : (
                (row.signatoryStructureIds ?? []).map((id) => (
                  <ListingStackRow key={id} icon={Building2} label={structureName(id)}>
                    <Tag label={level} />
                  </ListingStackRow>
                ))
              )}
            </div>
          </ListingStackCell>
        );
      },
    },
    {
      key: 'access',
      label: t(`${K}.columns.access`),
      render: (row) => {
        const portal = row.isPrimary || row.hasPortalAccess;
        if (!hasAnyChannel(row)) return <StatusBadge variant="neutral" label={t(`${K}.noAccess`)} />;
        const rights = row.accessRights ?? [];
        const rightSummary = (right: AccessRight) =>
          `${scopeLabels('roles', right.roles).join(', ')} · ${scopeLabels('funds', right.funds).join(', ')}`;
        const channels = [
          ...(portal ? [t(`${K}.access.portal`)] : []),
          ...(row.communicationsEnabled ? [t(`${K}.access.communications`)] : []),
        ];
        return (
          <ListingStackCell
            icon={KeyRound}
            items={rights.length > 0 ? rights.map(rightSummary) : [channels.join(' · ')]}
            title={t(`${K}.accessCard.title`, { name: fullName(row) })}
            subtitle={t(`${K}.accessCard.subtitle`)}
            cardClassName="w-[440px]"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {portal && <Tag icon={Monitor} label={t(`${K}.access.portal`)} />}
                {row.communicationsEnabled && <Tag icon={Bell} label={t(`${K}.access.communications`)} />}
              </div>
              {rights.length === 0 ? (
                <p className="text-sm text-gray-500">{t(`${K}.access.noRight`)}</p>
              ) : (
                rights.map((right, index) => (
                  <div key={right.id} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t(`${K}.access.rightTitle`, { index: index + 1 })}
                    </p>
                    {ACCESS_DIMENSIONS.map((dimension) => (
                      <ListingStackRow key={dimension} icon={ACCESS_DIMENSION_ICON[dimension]} label={t(`${K}.dimensions.${dimension}`)}>
                        {scopeLabels(dimension, right[dimension]).map((label) => (
                          <Tag key={label} label={label} />
                        ))}
                      </ListingStackRow>
                    ))}
                  </div>
                ))
              )}
            </div>
          </ListingStackCell>
        );
      },
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
        subscriptions={subscriptions}
      />
    </>
  );
}
