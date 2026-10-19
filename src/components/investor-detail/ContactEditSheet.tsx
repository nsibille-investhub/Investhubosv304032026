import { useMemo } from 'react';
import {
  Banknote,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  FileSignature,
  Globe,
  Lock,
  PenTool,
  Plus,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ModernMultiSelect } from '../ui/modern-multiselect';
import { RowActionButton } from '../ui/row-actions';
import {
  SIDE_PANEL_BADGE_STYLE,
  SIDE_PANEL_WIDE_STYLE,
  SidePanelCard,
  SidePanelFooter,
  SidePanelScopeField,
  SidePanelSection,
  SidePanelSwitchRow,
  type ScopeMode,
  type ScopeValue,
} from '../ui/side-panel';
import { toast } from 'sonner';
import { useTranslation } from '../../utils/languageContext';

const K = 'investors.detail.contactsTab';

const LANGUAGES = ['Français', 'English', 'Español', 'Deutsch', 'Italiano', 'Português'];

export type SignatureLevel = 'Individual' | 'Joint' | 'Collective';

export const SIGNATURE_LEVELS: SignatureLevel[] = ['Individual', 'Joint', 'Collective'];

/** Lien surveillé au titre du dossier KYC-AML entre le contact et une ou plusieurs structures. */
export type KycRelation =
  | 'ubo'
  | 'legalRepresentative'
  | 'director'
  | 'controllingShareholder'
  | 'controllingPerson'
  | 'trustee'
  | 'settlor'
  | 'trustBeneficiary';

export const KYC_RELATIONS: KycRelation[] = [
  'ubo',
  'legalRepresentative',
  'director',
  'controllingShareholder',
  'controllingPerson',
  'trustee',
  'settlor',
  'trustBeneficiary',
];

export interface KycLink {
  id: string;
  relation: KycRelation;
  /** Toutes les structures ou une sélection (au moins une). */
  structures: ScopeValue;
}

/** Qualité au titre de laquelle le contact accède aux objets. */
export type AccessRole = 'investor' | 'accountant' | 'proxy' | 'advisor' | 'legalRepresentative' | 'assistant';

export const ACCESS_ROLES: AccessRole[] = ['investor', 'accountant', 'proxy', 'advisor', 'legalRepresentative', 'assistant'];

export type AccessDimension = 'funds' | 'structures' | 'roles' | 'subscriptions';

export const ACCESS_DIMENSIONS: AccessDimension[] = ['funds', 'structures', 'roles', 'subscriptions'];

export const ACCESS_DIMENSION_ICON = {
  funds: Banknote,
  structures: Building2,
  roles: Briefcase,
  subscriptions: FileSignature,
} as const;

/** Droit d'accès : fonds × structures × rôles × souscriptions, chaque dimension à tous, une sélection ou aucun. */
export type AccessRight = { id: string } & Record<AccessDimension, ScopeValue>;

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
  /** Le contact reçoit les communications (au moins une catégorie). */
  communicationsEnabled?: boolean;
  notificationsAllEnabled?: boolean;
  notificationCategories?: NotificationCategory[];
  notificationTeams?: string[];
  /** Contact surveillé : rattaché au dossier KYC-AML par un ou plusieurs liens. */
  kycMonitored?: boolean;
  kycLinks?: KycLink[];
  /** Droits d'accès au portail et aux communications. */
  accessRights?: AccessRight[];
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

export const ALL: ScopeValue = { mode: 'all', ids: [] };
export const NONE: ScopeValue = { mode: 'none', ids: [] };
export const some = (ids: string[]): ScopeValue => ({ mode: 'some', ids });

/** Le contact a accès s'il a au moins l'un des deux canaux : portail ou communications. */
export const hasAnyChannel = (contact: ContactDraft) =>
  contact.isPrimary || contact.hasPortalAccess || Boolean(contact.communicationsEnabled);

const newId = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

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

  const dimensionOptions = useMemo(
    () => ({
      funds: funds.map((fund) => ({ value: fund.id, label: fund.name, icon: Banknote })),
      structures: structures.map((structure) => ({ value: structure.id, label: structure.name, icon: Building2 })),
      roles: ACCESS_ROLES.map((role) => ({ value: role, label: t(`${K}.accessRoles.${role}`), icon: Briefcase })),
      subscriptions: subscriptions.map((sub) => ({ value: sub.id, label: sub.name, icon: FileSignature })),
    }),
    [funds, structures, subscriptions, t],
  );

  const update = <F extends keyof ContactDraft>(field: F, value: ContactDraft[F]) => {
    if (!contact) return;
    onChange({ ...contact, [field]: value });
  };

  if (!contact) return null;

  const hasPortal = contact.isPrimary || contact.hasPortalAccess;
  const hasChannel = hasAnyChannel(contact);
  const allNotifications = contact.notificationsAllEnabled !== false;
  const links = contact.kycLinks ?? [];
  const rights = contact.accessRights ?? [];

  const modeLabels = (dimension: AccessDimension | 'kycStructures'): Record<ScopeMode, string> => ({
    all: t(`${K}.scope.${dimension}.all`),
    some: t(`${K}.scope.selection`),
    none: t(`${K}.scope.${dimension}.none`),
  });

  const updateLink = (id: string, patch: Partial<KycLink>) =>
    update('kycLinks', links.map((link) => (link.id === id ? { ...link, ...patch } : link)));
  const updateRight = (id: string, patch: Partial<AccessRight>) =>
    update('accessRights', rights.map((right) => (right.id === id ? { ...right, ...patch } : right)));

  const fullAccess = rights.some((right) => ACCESS_DIMENSIONS.every((dimension) => right[dimension].mode === 'all'));

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

          <SidePanelSection icon={ShieldCheck} title={t(`${K}.kyc.section`)} description={t(`${K}.kyc.sectionHint`)}>
            <SidePanelCard>
              <SidePanelSwitchRow
                id="kycMonitored"
                label={t(`${K}.kyc.monitor`)}
                description={t(`${K}.kyc.monitorHint`)}
                checked={!!contact.kycMonitored}
                onCheckedChange={(value) =>
                  onChange({
                    ...contact,
                    kycMonitored: value,
                    kycLinks: value && links.length === 0 ? [{ id: newId(), relation: 'ubo', structures: ALL }] : links,
                  })
                }
              />
            </SidePanelCard>
            {contact.kycMonitored && (
              <>
                {links.map((link, index) => (
                  <SidePanelCard key={link.id} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{t(`${K}.kyc.linkTitle`, { index: index + 1 })}</p>
                      <RowActionButton
                        icon={Trash2}
                        intent="danger"
                        tooltip={t(`${K}.kyc.removeLink`)}
                        disabledReason={links.length === 1 ? t(`${K}.kyc.lastLink`) : undefined}
                        onClick={() => update('kycLinks', links.filter((item) => item.id !== link.id))}
                      />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`relation-${link.id}`}>{t(`${K}.kyc.relation`)}</Label>
                        <Select value={link.relation} onValueChange={(value) => updateLink(link.id, { relation: value as KycRelation })}>
                          <SelectTrigger id={`relation-${link.id}`} className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {KYC_RELATIONS.map((relation) => (
                              <SelectItem key={relation} value={relation}>
                                {t(`${K}.kycRelations.${relation}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <SidePanelScopeField
                        id={`structures-${link.id}`}
                        label={t(`${K}.dimensions.structures`)}
                        value={link.structures}
                        onChange={(value) => updateLink(link.id, { structures: value })}
                        options={dimensionOptions.structures}
                        modeLabels={modeLabels('kycStructures')}
                        allowNone={false}
                        placeholder={multiSelectProps.placeholder}
                        searchPlaceholder={multiSelectProps.searchPlaceholder}
                      />
                    </div>
                  </SidePanelCard>
                ))}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => update('kycLinks', [...links, { id: newId(), relation: 'ubo', structures: ALL }])}
                >
                  <Plus className="w-4 h-4" />
                  {t(`${K}.kyc.addLink`)}
                </Button>
              </>
            )}
          </SidePanelSection>

          <SidePanelSection icon={Globe} title={t(`${K}.access.section`)} description={t(`${K}.access.sectionHint`)}>
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

            <SidePanelCard className="space-y-4">
              <SidePanelSwitchRow
                id="communicationsEnabled"
                label={t(`${K}.access.communications`)}
                description={t(`${K}.access.communicationsHint`)}
                checked={!!contact.communicationsEnabled}
                onCheckedChange={(value) => update('communicationsEnabled', value)}
              />
              {contact.communicationsEnabled && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
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
                </div>
              )}
            </SidePanelCard>

            {!hasChannel ? (
              <p className="text-sm text-slate-600">{t(`${K}.access.noChannel`)}</p>
            ) : (
              <>
                {fullAccess ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> {t(`${K}.accessRecapTitleAll`)}
                    </p>
                    <p className="text-sm text-emerald-700 mt-1">{t(`${K}.access.recapAll`)}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="font-semibold text-amber-800 flex items-center gap-2">
                      <Lock className="h-4 w-4" /> {t(`${K}.accessRecapTitleRestricted`)}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">{t(`${K}.access.recapRestricted`, { count: rights.length })}</p>
                  </div>
                )}

                {rights.map((right, index) => (
                  <SidePanelCard key={right.id} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{t(`${K}.access.rightTitle`, { index: index + 1 })}</p>
                      <RowActionButton
                        icon={Trash2}
                        intent="danger"
                        tooltip={t(`${K}.access.removeRight`)}
                        onClick={() => update('accessRights', rights.filter((item) => item.id !== right.id))}
                      />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {ACCESS_DIMENSIONS.map((dimension) => (
                        <SidePanelScopeField
                          key={dimension}
                          id={`${dimension}-${right.id}`}
                          label={t(`${K}.dimensions.${dimension}`)}
                          value={right[dimension]}
                          onChange={(value) => updateRight(right.id, { [dimension]: value })}
                          options={dimensionOptions[dimension]}
                          modeLabels={modeLabels(dimension)}
                          placeholder={multiSelectProps.placeholder}
                          searchPlaceholder={multiSelectProps.searchPlaceholder}
                        />
                      ))}
                    </div>
                  </SidePanelCard>
                ))}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    update('accessRights', [...rights, { id: newId(), funds: ALL, structures: ALL, roles: ALL, subscriptions: ALL }])
                  }
                >
                  <Plus className="w-4 h-4" />
                  {t(`${K}.access.addRight`)}
                </Button>

              </>
            )}
          </SidePanelSection>
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
