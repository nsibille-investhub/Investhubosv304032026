import { useMemo } from 'react';
import {
  Banknote,
  Bell,
  Building2,
  CheckCircle2,
  FileSignature,
  FileType,
  Globe,
  KeyRound,
  Lock,
  Shield,
  User,
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

const LANGUAGES = ['Français', 'English', 'Español', 'Deutsch', 'Italiano', 'Português'];
const ACCESS_LEVELS = ['Admin', 'Full Access', 'Read Only'];

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
  linkedStructures?: string[];
  fundsAccessRestricted?: boolean;
  authorizedFunds?: string[];
  subscriptionsAccessRestricted?: boolean;
  authorizedSubscriptions?: string[];
  documentTypesAccessRestricted?: boolean;
  authorizedDocumentTypes?: DocumentCategory[];
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
  const K = 'investors.detail.contactsTab';

  const update = <F extends keyof ContactDraft>(field: F, value: ContactDraft[F]) => {
    if (!contact) return;
    onChange({ ...contact, [field]: value });
  };

  const accessSummary = useMemo(() => {
    if (!contact) return '';
    const fundsRestricted = !!contact.fundsAccessRestricted;
    const subsRestricted = !!contact.subscriptionsAccessRestricted;
    const docsRestricted = !!contact.documentTypesAccessRestricted;

    if (!fundsRestricted && !subsRestricted && !docsRestricted) {
      return t('investors.detail.contactsTab.accessRecapAll');
    }

    const parts: string[] = [];
    parts.push(
      fundsRestricted
        ? t('investors.detail.contactsTab.accessRecapFundsRestricted', {
            count: contact.authorizedFunds?.length || 0,
            total: funds.length,
          })
        : t('investors.detail.contactsTab.accessRecapFundsAll'),
    );
    parts.push(
      subsRestricted
        ? t('investors.detail.contactsTab.accessRecapSubsRestricted', {
            count: contact.authorizedSubscriptions?.length || 0,
            total: subscriptions.length,
          })
        : t('investors.detail.contactsTab.accessRecapSubsAll'),
    );
    parts.push(
      docsRestricted
        ? t('investors.detail.contactsTab.accessRecapDocsRestricted', {
            count: contact.authorizedDocumentTypes?.length || 0,
            total: DOCUMENT_CATEGORIES.length,
          })
        : t('investors.detail.contactsTab.accessRecapDocsAll'),
    );
    return parts.join(' · ');
  }, [contact, funds.length, subscriptions.length, t]);

  if (!contact) return null;

  const fullAccess =
    !contact.fundsAccessRestricted &&
    !contact.subscriptionsAccessRestricted &&
    !contact.documentTypesAccessRestricted;
  const allNotifications = contact.notificationsAllEnabled !== false;

  const multiSelectProps = {
    placeholder: t(`${K}.pickPlaceholder`),
    searchPlaceholder: t(`${K}.searchPlaceholder`),
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
                description={t(`${K}.enablePortalAccessHint`)}
                checked={contact.hasPortalAccess}
                onCheckedChange={(value) => update('hasPortalAccess', value)}
              />
              {contact.hasPortalAccess && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessLevel" className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                      {t(`${K}.accessLevel`)}
                    </Label>
                    <Select value={contact.accessLevel} onValueChange={(value) => update('accessLevel', value)}>
                      <SelectTrigger id="accessLevel" className="h-11">
                        <SelectValue placeholder={t(`${K}.selectAccessLevel`)} />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCESS_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      {t(`${K}.password`)}
                    </Label>
                    <div className="flex gap-2">
                      <Input type="password" placeholder="••••••••" disabled className="h-11 flex-1" />
                      <Button
                        variant="outline"
                        className="h-11"
                        onClick={() => toast.success(t(`${K}.resetPasswordSent`))}
                      >
                        {t(`${K}.reset`)}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </SidePanelCard>
          </SidePanelSection>

          {contact.hasPortalAccess && (
            <SidePanelSection icon={Globe} title={t(`${K}.accessSection`)} description={t(`${K}.accessSectionHint`)}>
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

              <SidePanelCard className="space-y-5">
                <div className="space-y-2">
                  <Label>{t(`${K}.linkedStructures`)}</Label>
                  <ModernMultiSelect
                    {...multiSelectProps}
                    options={structures.map((structure) => ({
                      value: structure.id,
                      label: `${structure.name} (${structure.type})`,
                      icon: Building2,
                    }))}
                    value={contact.linkedStructures || []}
                    onChange={(value) => update('linkedStructures', value)}
                    disabled={contact.isPrimary}
                  />
                  {contact.isPrimary && <p className="text-xs text-slate-500">{t(`${K}.primaryAttachAll`)}</p>}
                </div>

                <div className="space-y-2">
                  <SidePanelSwitchRow
                    id="fundsAccessRestricted"
                    label={t(`${K}.restrictFundsLabel`)}
                    description={t(`${K}.restrictFundsHint`)}
                    checked={!!contact.fundsAccessRestricted}
                    onCheckedChange={(value) => update('fundsAccessRestricted', value)}
                  />
                  {contact.fundsAccessRestricted && (
                    <ModernMultiSelect
                      {...multiSelectProps}
                      options={funds.map((fund) => ({ value: fund.id, label: fund.name, icon: Banknote }))}
                      value={contact.authorizedFunds || []}
                      onChange={(value) => update('authorizedFunds', value)}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <SidePanelSwitchRow
                    id="subscriptionsAccessRestricted"
                    label={t(`${K}.restrictSubscriptionsLabel`)}
                    description={t(`${K}.restrictSubscriptionsHint`)}
                    checked={!!contact.subscriptionsAccessRestricted}
                    onCheckedChange={(value) => update('subscriptionsAccessRestricted', value)}
                  />
                  {contact.subscriptionsAccessRestricted && (
                    <ModernMultiSelect
                      {...multiSelectProps}
                      options={subscriptions.map((sub) => ({ value: sub.id, label: sub.name, icon: FileSignature }))}
                      value={contact.authorizedSubscriptions || []}
                      onChange={(value) => update('authorizedSubscriptions', value)}
                    />
                  )}
                </div>

                <div className="space-y-2">
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
                </div>
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
