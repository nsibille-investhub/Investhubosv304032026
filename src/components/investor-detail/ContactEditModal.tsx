import { useMemo } from 'react';
import {
  X,
  UserCog,
  UserPlus,
  User,
  Globe,
  Star,
  Heart,
  Shield,
  Lock,
  Building2,
  Bell,
  Banknote,
  FileSignature,
  FileType,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import {
  BigModal,
  BigModalContent,
  BigModalTitle,
  BigModalDescription,
} from '../ui/big-modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { useTranslation } from '../../utils/languageContext';
import type { DocumentCategory } from '../../utils/documentMockData';

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

interface ContactEditModalProps {
  open: boolean;
  isNew: boolean;
  contact: ContactDraft | null;
  onChange: (contact: ContactDraft) => void;
  onClose: () => void;
  onSave: () => void;
  structures: StructureOption[];
  funds: NamedOption[];
  subscriptions: NamedOption[];
  teams: NamedOption[];
}

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

function SectionHeader({
  icon: Icon,
  label,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-xs uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground/80">{description}</p>
      )}
    </div>
  );
}

function RestrictionToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex w-full items-start justify-between gap-3 rounded-md border border-input bg-white px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <div className="flex-1">
        <div className="text-foreground font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

export function ContactEditModal({
  open,
  isNew,
  contact,
  onChange,
  onClose,
  onSave,
  structures,
  funds,
  subscriptions,
  teams,
}: ContactEditModalProps) {
  const { t } = useTranslation();

  const update = <K extends keyof ContactDraft>(field: K, value: ContactDraft[K]) => {
    if (!contact) return;
    onChange({ ...contact, [field]: value });
  };

  const toggleArrayItem = <K extends keyof ContactDraft>(
    field: K,
    item: string,
    checked: boolean,
  ) => {
    if (!contact) return;
    const current = (contact[field] as unknown as string[] | undefined) || [];
    const next = checked
      ? Array.from(new Set([...current, item]))
      : current.filter((id) => id !== item);
    update(field, next as unknown as ContactDraft[K]);
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

  return (
    <BigModal open={open} onOpenChange={(o) => !o && onClose()}>
      <BigModalContent className="p-0 gap-0">
        <BigModalTitle className="sr-only">
          {isNew
            ? t('investors.detail.contactsTab.dialogAddTitle')
            : t('investors.detail.contactsTab.dialogEditTitle')}
        </BigModalTitle>
        <BigModalDescription className="sr-only">
          {isNew
            ? t('investors.detail.contactsTab.dialogAddDesc')
            : t('investors.detail.contactsTab.dialogEditDesc')}
        </BigModalDescription>

        <div className="flex flex-col h-full overflow-hidden rounded-3xl">
          {/* Header */}
          <div className="px-8 py-4 bg-card border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  {isNew ? (
                    <UserPlus className="w-5 h-5" />
                  ) : (
                    <UserCog className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {isNew
                      ? t('investors.detail.contactsTab.dialogAddTitle')
                      : t('investors.detail.contactsTab.dialogEditTitle')}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isNew
                      ? t('investors.detail.contactsTab.dialogAddDesc')
                      : t('investors.detail.contactsTab.dialogEditDesc')}
                  </p>
                </div>
              </div>

              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="hover:bg-muted rounded-full h-8 w-8"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
            {/* General */}
            <section className="space-y-3">
              <SectionHeader
                icon={User}
                label={t('investors.detail.contactsTab.generalSection')}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">
                    {t('investors.detail.contactsTab.firstName')}
                  </Label>
                  <Input
                    id="firstName"
                    value={contact.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    placeholder={t('investors.detail.contactsTab.firstName')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">
                    {t('investors.detail.contactsTab.lastName')}
                  </Label>
                  <Input
                    id="lastName"
                    value={contact.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    placeholder={t('investors.detail.contactsTab.lastName')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">
                    {t('investors.detail.contactsTab.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    {t('investors.detail.contactsTab.phone')}
                  </Label>
                  <Input
                    id="phone"
                    value={contact.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="function">
                    {t('investors.detail.contactsTab.function')}
                  </Label>
                  <Input
                    id="function"
                    value={contact.function}
                    onChange={(e) => update('function', e.target.value)}
                    placeholder={t(
                      'investors.detail.contactsTab.functionPlaceholder',
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="language"
                    className="flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('investors.detail.contactsTab.language')}
                  </Label>
                  <Select
                    value={contact.language}
                    onValueChange={(value) => update('language', value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue
                        placeholder={t(
                          'investors.detail.contactsTab.languagePlaceholder',
                        )}
                      />
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
            </section>

            {/* Preferences */}
            <section className="space-y-3">
              <SectionHeader
                icon={Star}
                label={t('investors.detail.contactsTab.preferencesSection')}
              />
              <div className="grid grid-cols-2 gap-3">
                <RestrictionToggle
                  id="isPrimary"
                  label={t('investors.detail.contactsTab.primaryContact')}
                  description={t('investors.detail.contactsTab.primaryHint')}
                  checked={contact.isPrimary}
                  onCheckedChange={(v) =>
                    !contact.isPrimary && update('isPrimary', v)
                  }
                />
                <RestrictionToggle
                  id="isPreferredContact"
                  label={t('investors.detail.contactsTab.preferredContact')}
                  description={t('investors.detail.contactsTab.preferredHint')}
                  checked={!!contact.isPreferredContact}
                  onCheckedChange={(v) => update('isPreferredContact', v)}
                />
              </div>
            </section>

            {/* Portal access */}
            <section className="space-y-3">
              <SectionHeader
                icon={Shield}
                label={t('investors.detail.contactsTab.portalAccessSection')}
              />
              <RestrictionToggle
                id="hasPortalAccess"
                label={t('investors.detail.contactsTab.enablePortalAccess')}
                description={t(
                  'investors.detail.contactsTab.enablePortalAccessHint',
                )}
                checked={contact.hasPortalAccess}
                onCheckedChange={(v) => update('hasPortalAccess', v)}
              />
              {contact.hasPortalAccess && (
                <div className="grid grid-cols-2 gap-4 pl-1">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="accessLevel"
                      className="flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                      {t('investors.detail.contactsTab.accessLevel')}
                    </Label>
                    <Select
                      value={contact.accessLevel}
                      onValueChange={(value) => update('accessLevel', value)}
                    >
                      <SelectTrigger id="accessLevel">
                        <SelectValue
                          placeholder={t(
                            'investors.detail.contactsTab.selectAccessLevel',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Full Access">Full Access</SelectItem>
                        <SelectItem value="Read Only">Read Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      {t('investors.detail.contactsTab.password')}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.success(
                            t(
                              'investors.detail.contactsTab.resetPasswordSent',
                            ),
                          )
                        }
                      >
                        {t('investors.detail.contactsTab.reset')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Linked structures */}
            <section className="space-y-3">
              <SectionHeader
                icon={Building2}
                label={t('investors.detail.contactsTab.linkedStructures')}
              />
              <div className="grid grid-cols-2 gap-2">
                {structures.map((structure) => (
                  <label
                    key={structure.id}
                    htmlFor={`structure-${structure.id}`}
                    className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <Checkbox
                      id={`structure-${structure.id}`}
                      checked={contact.linkedStructures?.includes(structure.id)}
                      onCheckedChange={(checked) =>
                        toggleArrayItem(
                          'linkedStructures',
                          structure.id,
                          !!checked,
                        )
                      }
                      disabled={contact.isPrimary}
                    />
                    <span className="text-sm flex items-center gap-2 flex-1">
                      {structure.name}
                      <Badge variant="outline" className="text-xs">
                        {structure.type}
                      </Badge>
                    </span>
                  </label>
                ))}
              </div>
              {contact.isPrimary && (
                <p className="text-xs text-muted-foreground">
                  {t('investors.detail.contactsTab.primaryAttachAll')}
                </p>
              )}
            </section>

            {/* Notifications */}
            <section className="space-y-3">
              <SectionHeader
                icon={Bell}
                label={t('investors.detail.contactsTab.notifications')}
              />
              <div className="grid grid-cols-2 gap-2">
                {teams.map((team) => (
                  <label
                    key={team.id}
                    htmlFor={`team-${team.id}`}
                    className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <Checkbox
                      id={`team-${team.id}`}
                      checked={contact.notificationTeams?.includes(team.id)}
                      onCheckedChange={(checked) =>
                        toggleArrayItem(
                          'notificationTeams',
                          team.id,
                          !!checked,
                        )
                      }
                    />
                    <span className="text-sm">{team.name}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Access management */}
            <section className="space-y-3">
              <SectionHeader
                icon={Shield}
                label={t('investors.detail.contactsTab.accessSection')}
                description={t('investors.detail.contactsTab.accessSectionHint')}
              />

              {/* Recap */}
              <div
                className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
                  fullAccess
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    fullAccess ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                />
                <div>
                  <div
                    className={`text-sm font-medium ${
                      fullAccess ? 'text-emerald-900' : 'text-amber-900'
                    }`}
                  >
                    {fullAccess
                      ? t('investors.detail.contactsTab.accessRecapTitleAll')
                      : t(
                          'investors.detail.contactsTab.accessRecapTitleRestricted',
                        )}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      fullAccess ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {accessSummary}
                  </div>
                </div>
              </div>

              {/* Funds restriction */}
              <div className="space-y-2">
                <RestrictionToggle
                  id="fundsAccessRestricted"
                  label={t('investors.detail.contactsTab.restrictFundsLabel')}
                  description={t(
                    'investors.detail.contactsTab.restrictFundsHint',
                  )}
                  checked={!!contact.fundsAccessRestricted}
                  onCheckedChange={(v) => update('fundsAccessRestricted', v)}
                />
                {contact.fundsAccessRestricted && (
                  <div className="grid grid-cols-2 gap-2 pl-1">
                    {funds.map((fund) => (
                      <label
                        key={fund.id}
                        htmlFor={`fund-${fund.id}`}
                        className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Checkbox
                          id={`fund-${fund.id}`}
                          checked={contact.authorizedFunds?.includes(fund.id)}
                          onCheckedChange={(checked) =>
                            toggleArrayItem(
                              'authorizedFunds',
                              fund.id,
                              !!checked,
                            )
                          }
                        />
                        <span className="text-sm flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-muted-foreground" />
                          {fund.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscriptions restriction */}
              <div className="space-y-2">
                <RestrictionToggle
                  id="subscriptionsAccessRestricted"
                  label={t(
                    'investors.detail.contactsTab.restrictSubscriptionsLabel',
                  )}
                  description={t(
                    'investors.detail.contactsTab.restrictSubscriptionsHint',
                  )}
                  checked={!!contact.subscriptionsAccessRestricted}
                  onCheckedChange={(v) =>
                    update('subscriptionsAccessRestricted', v)
                  }
                />
                {contact.subscriptionsAccessRestricted && (
                  <div className="grid grid-cols-1 gap-2 pl-1">
                    {subscriptions.map((sub) => (
                      <label
                        key={sub.id}
                        htmlFor={`sub-${sub.id}`}
                        className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Checkbox
                          id={`sub-${sub.id}`}
                          checked={contact.authorizedSubscriptions?.includes(
                            sub.id,
                          )}
                          onCheckedChange={(checked) =>
                            toggleArrayItem(
                              'authorizedSubscriptions',
                              sub.id,
                              !!checked,
                            )
                          }
                        />
                        <span className="text-sm flex items-center gap-1.5">
                          <FileSignature className="w-3.5 h-3.5 text-muted-foreground" />
                          {sub.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Document types restriction */}
              <div className="space-y-2">
                <RestrictionToggle
                  id="documentTypesAccessRestricted"
                  label={t(
                    'investors.detail.contactsTab.restrictDocumentTypesLabel',
                  )}
                  description={t(
                    'investors.detail.contactsTab.restrictDocumentTypesHint',
                  )}
                  checked={!!contact.documentTypesAccessRestricted}
                  onCheckedChange={(v) =>
                    update('documentTypesAccessRestricted', v)
                  }
                />
                {contact.documentTypesAccessRestricted && (
                  <div className="grid grid-cols-2 gap-2 pl-1">
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <label
                        key={cat}
                        htmlFor={`doctype-${cat}`}
                        className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Checkbox
                          id={`doctype-${cat}`}
                          checked={contact.authorizedDocumentTypes?.includes(
                            cat,
                          )}
                          onCheckedChange={(checked) => {
                            const current =
                              contact.authorizedDocumentTypes || [];
                            const next = checked
                              ? Array.from(new Set([...current, cat]))
                              : current.filter((c) => c !== cat);
                            update('authorizedDocumentTypes', next);
                          }}
                        />
                        <span className="text-sm flex items-center gap-1.5">
                          <FileType className="w-3.5 h-3.5 text-muted-foreground" />
                          {t(`ged.addModal.documentCategory.${cat}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-8 py-4 bg-muted">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                size="sm"
                className="h-9"
              >
                <X className="w-4 h-4 mr-1" />
                {t('investors.detail.contactsTab.cancel')}
              </Button>
              <Button
                onClick={onSave}
                size="sm"
                className="bg-primary text-primary-foreground min-w-[160px] h-9"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('investors.detail.contactsTab.save')}
              </Button>
            </div>
          </div>
        </div>
      </BigModalContent>
    </BigModal>
  );
}
