import { useMemo } from 'react';
import {
  Banknote,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  FileSignature,
  FileType,
  Globe,
  Lock,
  PenTool,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ModernMultiSelect } from '../ui/modern-multiselect';
import {
  SIDE_PANEL_BADGE_STYLE,
  SIDE_PANEL_WIDE_STYLE,
  SidePanelCard,
  SidePanelFooter,
  SidePanelSection,
  SidePanelSwitchRow,
} from '../ui/side-panel';
import { toast } from 'sonner';
import { useTranslation } from '../../utils/languageContext';
import type { DocumentCategory } from '../../utils/documentMockData';

const K = 'investors.detail.contactsTab';

const LANGUAGES = ['Français', 'English', 'Español', 'Deutsch', 'Italiano', 'Português'];

export type SignatureLevel = 'Individual' | 'Joint' | 'Collective';

export const SIGNATURE_LEVELS: SignatureLevel[] = ['Individual', 'Joint', 'Collective'];

/** Rôle d'un contact dans une structure ; un contact peut en cumuler plusieurs. */
export type ContactRole = 'ubo' | 'legalRepresentative' | 'director' | 'accountant' | 'proxy' | 'shareholder';

export const CONTACT_ROLES: ContactRole[] = ['ubo', 'legalRepresentative', 'director', 'accountant', 'proxy', 'shareholder'];

export interface StructureRoles {
  structureId: string;
  roles: ContactRole[];
}

/** Rôle d'accès portail sur un objet : fonds, structure ou souscription. */
export type AccessRole = 'readOnly' | 'full' | 'admin';

export const ACCESS_ROLES: AccessRole[] = ['readOnly', 'full', 'admin'];

export type AccessScopeType = 'fund' | 'structure' | 'subscription';

export const ACCESS_SCOPE_TYPES: AccessScopeType[] = ['fund', 'structure', 'subscription'];

export const ACCESS_SCOPE_ICON: Record<AccessScopeType, LucideIcon> = {
  fund: Banknote,
  structure: Building2,
  subscription: FileSignature,
};

export interface AccessRight {
  scopeType: AccessScopeType;
  scopeId: string;
  role: AccessRole;
}

export type NotificationCategory =
  | 'capitalCalls'
  | 'distributions'
  | 'reporting'
  | 'subscriptionUpdates'
  | 'marketing';

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'capitalCalls',
  'distributions',
  'reporting',
  'subscriptionUpdates',
  'marketing',
];

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'capitalCall',
  'distribution',
  'quarterlyReport',
  'annualReport',
  'subscription',
  'kyc',
  'legal',
  'tax',
  'marketing',
  'other',
];

export interface ContactDraft {
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
  notificationsAllEnabled?: boolean;
  notificationCategories?: NotificationCategory[];
  notificationTeams?: string[];
  /** Rôles par structure (UBO, représentant légal...). */
  structureRoles?: StructureRoles[];
  /** Matrice des droits d'accès : objet × rôle. */
  accessRights?: AccessRight[];
  documentTypesAccessRestricted?: boolean;
  authorizedDocumentTypes?: DocumentCategory[];
  isSignatory?: boolean;
  isPrimarySignatory?: boolean;
  signatureLevel?: SignatureLevel;
  /** Signataire pour toutes les structures ; sinon pour signatoryStructureIds. */
  signatoryGlobal?: boolean;
  signatoryStructureIds?: string[];
}

export interface StructureOption {
  id: string;
  name: string;
  type: string;
}

export interface NamedOption {
  id: string;
  name: string;
}

export interface AccessScopeOption {
  scopeType: AccessScopeType;
  id: string;
  name: string;
}

/** Objets sur lesquels un contact peut recevoir un accès, dans l'ordre fonds, structures, souscriptions. */
export const buildAccessScopes = (
  funds: NamedOption[],
  structures: StructureOption[],
  subscriptions: NamedOption[],
): AccessScopeOption[] => [
  ...funds.map((fund) => ({ scopeType: 'fund' as const, id: fund.id, name: fund.name })),
  ...structures.map((structure) => ({ scopeType: 'structure' as const, id: structure.id, name: structure.name })),
  ...subscriptions.map((sub) => ({ scopeType: 'subscription' as const, id: sub.id, name: sub.name })),
];

interface ContactEditSheetProps {
  open: boolean;
  isNew: boolean;
  contact: ContactDraft | null;
  onChange: (contact: ContactDraft) => void;
  onClose: () => void;
  onSave: () => void;
  structures: StructureOption[];
  funds: NamedOption[];
  subscriptions: NamedOption[];
}

const NO_ACCESS = 'none';

export function ContactEditSheet({
  open,
  isNew,
  contact,
  onChange,
  onClose,
  onSave,
  structures,
  funds,
  subscriptions,
}: ContactEditSheetProps) {
  const { t } = useTranslation();

  const scopes = useMemo(() => buildAccessScopes(funds, structures, subscriptions), [funds, structures, subscriptions]);

  const update = <F extends keyof ContactDraft>(field: F, value: ContactDraft[F]) => {
    if (!contact) return;
    onChange({ ...contact, [field]: value });
  };

  if (!contact) return null;

  const hasPortal = contact.isPrimary || contact.hasPortalAccess;
  const allNotifications = contact.notificationsAllEnabled !== false;
  const rights = contact.accessRights ?? [];
  const roleOf = (scope: AccessScopeOption) =>
    rights.find((right) => right.scopeType === scope.scopeType && right.scopeId === scope.id)?.role;

  const setAccess = (scope: AccessScopeOption, value: string) => {
    const others = rights.filter((right) => !(right.scopeType === scope.scopeType && right.scopeId === scope.id));
    update(
      'accessRights',
      value === NO_ACCESS ? others : [...others, { scopeType: scope.scopeType, scopeId: scope.id, role: value as AccessRole }],
    );
  };

  const rolesFor = (structureId: string) =>
    contact.structureRoles?.find((entry) => entry.structureId === structureId)?.roles ?? [];

  const setRoles = (structureId: string, roles: ContactRole[]) => {
    const others = (contact.structureRoles ?? []).filter((entry) => entry.structureId !== structureId);
    update('structureRoles', roles.length > 0 ? [...others, { structureId, roles }] : others);
  };

  const fullAccess = scopes.every((scope) => roleOf(scope)) && !contact.documentTypesAccessRestricted;
  const accessSummary = ACCESS_SCOPE_TYPES.map((type) => {
    const ofType = scopes.filter((scope) => scope.scopeType === type);
    return t(`${K}.accessRecap.${type}`, { count: ofType.filter((scope) => roleOf(scope)).length, total: ofType.length });
  })
    .concat(
      contact.documentTypesAccessRestricted
        ? t(`${K}.accessRecapDocsRestricted`, {
            count: contact.authorizedDocumentTypes?.length || 0,
            total: DOCUMENT_CATEGORIES.length,
          })
        : t(`${K}.accessRecapDocsAll`),
    )
    .join(' · ');

  const multiSelectProps = {
    placeholder: t(`${K}.pickPlaceholder`),
    searchPlaceholder: t(`${K}.multiSearchPlaceholder`),
    maxDisplay: 4,
    showIconInBadge: true,
    badgeStyle: SIDE_PANEL_BADGE_STYLE,
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b bg-white">
          <div>
            <SheetTitle className="text-[26px] leading-8">
              {isNew ? t(`${K}.dialogAddTitle`) : t(`${K}.dialogEditTitle`)}
            </SheetTitle>
            <SheetDescription className="mt-1 text-[15px]">
              {isNew ? t(`${K}.dialogAddDesc`) : t(`${K}.dialogEditDesc`)}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection icon={User} title={t(`${K}.generalSection`)}>
            <SidePanelCard>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t(`${K}.firstName`)}</Label>
                  <Input
                    id="firstName"
                    className="h-11"
                    value={contact.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    placeholder={t(`${K}.firstName`)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t(`${K}.lastName`)}</Label>
                  <Input
                    id="lastName"
                    className="h-11"
                    value={contact.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    placeholder={t(`${K}.lastName`)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t(`${K}.email`)}</Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-11"
                    value={contact.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t(`${K}.phone`)}</Label>
                  <Input
                    id="phone"
                    className="h-11"
                    value={contact.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="function">{t(`${K}.function`)}</Label>
                  <Input
                    id="function"
                    className="h-11"
                    value={contact.function}
                    onChange={(e) => update('function', e.target.value)}
                    placeholder={t(`${K}.functionPlaceholder`)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">{t(`${K}.language`)}</Label>
                  <Select value={contact.language} onValueChange={(value) => update('language', value)}>
                    <SelectTrigger id="language" className="h-11">
                      <SelectValue placeholder={t(`${K}.languagePlaceholder`)} />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={Briefcase} title={t(`${K}.rolesSection`)} description={t(`${K}.rolesSectionHint`)}>
            <SidePanelCard className="space-y-4">
              {structures.length === 0 ? (
                <p className="text-sm text-slate-500">{t(`${K}.noStructure`)}</p>
              ) : (
                structures.map((structure) => (
                  <div key={structure.id} className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      {structure.name}
                    </Label>
                    <ModernMultiSelect
                      {...multiSelectProps}
                      options={CONTACT_ROLES.map((role) => ({ value: role, label: t(`${K}.contactRoles.${role}`), icon: Briefcase }))}
                      value={rolesFor(structure.id)}
                      onChange={(value) => setRoles(structure.id, value as ContactRole[])}
                    />
                  </div>
                ))
              )}
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={PenTool} title={t(`${K}.signatureSection`)} description={t(`${K}.signatureSectionHint`)}>
            <SidePanelCard className="space-y-4">
              <SidePanelSwitchRow
                id="isSignatory"
                label={t(`${K}.isSignatory`)}
                checked={!!contact.isSignatory}
                onCheckedChange={(value) =>
                  onChange({
                    ...contact,
                    isSignatory: value,
                    signatureLevel: value ? contact.signatureLevel ?? 'Individual' : contact.signatureLevel,
                    signatoryGlobal: value ? contact.signatoryGlobal ?? true : contact.signatoryGlobal,
                    isPrimarySignatory: value ? contact.isPrimarySignatory : false,
                  })
                }
              />
              {contact.isSignatory && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signatureLevel">{t(`${K}.signatureLevel`)}</Label>
                    <Select
                      value={contact.signatureLevel}
                      onValueChange={(value) => update('signatureLevel', value as SignatureLevel)}
                    >
                      <SelectTrigger id="signatureLevel" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIGNATURE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {t(`investors.detail.signatureLevel.${level}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <SidePanelSwitchRow
                    id="signatoryGlobal"
                    label={t(`${K}.signatoryGlobal`)}
                    description={t(`${K}.signatoryGlobalHint`)}
                    checked={contact.signatoryGlobal !== false}
                    onCheckedChange={(value) => update('signatoryGlobal', value)}
                  />
                  {contact.signatoryGlobal === false && (
                    <div className="space-y-2">
                      <Label>{t(`${K}.signatoryStructures`)}</Label>
                      <ModernMultiSelect
                        {...multiSelectProps}
                        options={structures.map((structure) => ({ value: structure.id, label: structure.name, icon: Building2 }))}
                        value={contact.signatoryStructureIds || []}
                        onChange={(value) => update('signatoryStructureIds', value)}
                      />
                    </div>
                  )}
                  <SidePanelSwitchRow
                    id="isPrimarySignatory"
                    label={t('investors.detail.signatories.primarySignatory')}
                    checked={!!contact.isPrimarySignatory}
                    onCheckedChange={(value) => update('isPrimarySignatory', value)}
                  />
                </>
              )}
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={Bell} title={t(`${K}.notifications`)} description={t(`${K}.notificationsHint`)}>
            <SidePanelCard className="space-y-4">
              <SidePanelSwitchRow
                id="notificationsAll"
                label={t(`${K}.notificationsAllLabel`)}
                description={t(`${K}.notificationsAllHint`)}
                checked={allNotifications}
                onCheckedChange={(value) => update('notificationsAllEnabled', value)}
              />
              {!allNotifications && (
                <div className="space-y-2">
                  <Label>{t(`${K}.notificationCategories`)}</Label>
                  <ModernMultiSelect
                    {...multiSelectProps}
                    options={NOTIFICATION_CATEGORIES.map((category) => ({
                      value: category,
                      label: t(`${K}.notificationCategory.${category}.label`),
                      icon: Bell,
                    }))}
                    value={contact.notificationCategories || []}
                    onChange={(value) => update('notificationCategories', value as NotificationCategory[])}
                  />
                </div>
              )}
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={Shield} title={t(`${K}.portalAccessSection`)} description={t(`${K}.portalAccessHint`)}>
            <SidePanelCard className="space-y-4">
              <SidePanelSwitchRow
                id="hasPortalAccess"
                label={t(`${K}.enablePortalAccess`)}
                description={contact.isPrimary ? t(`${K}.primaryPortalAccess`) : t(`${K}.enablePortalAccessHint`)}
                checked={hasPortal}
                disabled={contact.isPrimary}
                onCheckedChange={(value) => update('hasPortalAccess', value)}
              />
              {hasPortal && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    {t(`${K}.password`)}
                  </Label>
                  <div className="flex gap-2">
                    <Input type="password" placeholder="••••••••" disabled className="h-11 flex-1" />
                    <Button variant="outline" className="h-11" onClick={() => toast.success(t(`${K}.resetPasswordSent`))}>
                      {t(`${K}.reset`)}
                    </Button>
                  </div>
                </div>
              )}
            </SidePanelCard>
          </SidePanelSection>

          {hasPortal && (
            <SidePanelSection icon={Globe} title={t(`${K}.accessSection`)} description={t(`${K}.accessMatrixHint`)}>
              {fullAccess ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> {t(`${K}.accessRecapTitleAll`)}
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">{accessSummary}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800 flex items-center gap-2">
                    <Lock className="h-4 w-4" /> {t(`${K}.accessRecapTitleRestricted`)}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">{accessSummary}</p>
                </div>
              )}

              <SidePanelCard flush className="divide-y divide-gray-200">
                {ACCESS_SCOPE_TYPES.map((type) => {
                  const ofType = scopes.filter((scope) => scope.scopeType === type);
                  if (ofType.length === 0) return null;
                  const Icon = ACCESS_SCOPE_ICON[type];
                  return (
                    <div key={type} className="p-4 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t(`${K}.scopeTypes.${type}`)}</p>
                      {ofType.map((scope) => (
                        <div key={scope.id} className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2 text-sm text-slate-800">
                            <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{scope.name}</span>
                          </span>
                          <Select value={roleOf(scope) ?? NO_ACCESS} onValueChange={(value) => setAccess(scope, value)}>
                            <SelectTrigger className="h-9 w-44 shrink-0" aria-label={t(`${K}.accessRoleFor`, { name: scope.name })}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NO_ACCESS}>{t(`${K}.accessRoles.none`)}</SelectItem>
                              {ACCESS_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {t(`${K}.accessRoles.${role}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </SidePanelCard>

              <SidePanelCard className="space-y-2">
                <SidePanelSwitchRow
                  id="documentTypesAccessRestricted"
                  label={t(`${K}.restrictDocumentTypesLabel`)}
                  description={t(`${K}.restrictDocumentTypesHint`)}
                  checked={!!contact.documentTypesAccessRestricted}
                  onCheckedChange={(value) => update('documentTypesAccessRestricted', value)}
                />
                {contact.documentTypesAccessRestricted && (
                  <ModernMultiSelect
                    {...multiSelectProps}
                    options={DOCUMENT_CATEGORIES.map((category) => ({
                      value: category,
                      label: t(`ged.addModal.documentCategory.${category}`),
                      icon: FileType,
                    }))}
                    value={contact.authorizedDocumentTypes || []}
                    onChange={(value) => update('authorizedDocumentTypes', value as DocumentCategory[])}
                  />
                )}
              </SidePanelCard>
            </SidePanelSection>
          )}
        </div>

        <SidePanelFooter>
          <Button variant="outline" onClick={onClose}>
            {t(`${K}.cancel`)}
          </Button>
          <Button onClick={onSave}>{t(`${K}.save`)}</Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
