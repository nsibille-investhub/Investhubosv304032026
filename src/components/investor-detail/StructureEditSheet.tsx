import { Building2, ShieldCheck } from 'lucide-react';
import type { LegalStructure } from '../../utils/investorGenerator';
import { useTranslation } from '../../utils/languageContext';
import { Sheet, SheetContent } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SIDE_PANEL_WIDE_STYLE, SidePanelCard, SidePanelFooter, SidePanelHeader, SidePanelSection } from '../ui/side-panel';

export const STRUCTURE_TYPES: LegalStructure['type'][] = ['SCI', 'SARL', 'SAS', 'SA', 'Trust', 'Foundation', 'Holding'];
export const STRUCTURE_KYC_STATUSES: NonNullable<LegalStructure['kycStatus']>[] = ['Validé', 'En cours', 'À revoir', 'Non commencé'];

const K = 'investors.detail.structuresList';

interface StructureEditSheetProps {
  open: boolean;
  isNew: boolean;
  structure: LegalStructure | null;
  onChange: (structure: LegalStructure) => void;
  onClose: () => void;
  onSave: () => void;
}

export function StructureEditSheet({ open, isNew, structure, onChange, onClose, onSave }: StructureEditSheetProps) {
  const { t } = useTranslation();
  if (!structure) return null;

  const update = <F extends keyof LegalStructure>(field: F, value: LegalStructure[F]) =>
    onChange({ ...structure, [field]: value });

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader
          title={isNew ? t(`${K}.sheet.addTitle`) : t(`${K}.sheet.editTitle`)}
          description={isNew ? t(`${K}.sheet.addDesc`) : t(`${K}.sheet.editDesc`)}
        />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection icon={Building2} title={t(`${K}.sheet.general`)}>
            <SidePanelCard>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="structureName">
                    {t(`${K}.sheet.name`)}
                    <span className="text-red-600 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="structureName"
                    className="h-11"
                    value={structure.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="structureType">{t(`${K}.sheet.type`)}</Label>
                  <Select value={structure.type} onValueChange={(value) => update('type', value as LegalStructure['type'])}>
                    <SelectTrigger id="structureType" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRUCTURE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participationId">{t(`${K}.sheet.participationId`)}</Label>
                  <Input
                    id="participationId"
                    className="h-11"
                    value={structure.participationId ?? ''}
                    onChange={(e) => update('participationId', e.target.value || undefined)}
                  />
                </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalRepresentative">{t(`${K}.sheet.representative`)}</Label>
                  <Input
                    id="legalRepresentative"
                    className="h-11"
                    value={structure.legalRepresentative ?? ''}
                    onChange={(e) => update('legalRepresentative', e.target.value || undefined)}
                  />
                </div>
              </div>
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={ShieldCheck} title={t(`${K}.sheet.compliance`)} description={t(`${K}.sheet.complianceDesc`)}>
            <SidePanelCard>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kycStatus">{t(`${K}.sheet.kycStatus`)}</Label>
                  <Select
                    value={structure.kycStatus ?? 'Non commencé'}
                    onValueChange={(value) => update('kycStatus', value as LegalStructure['kycStatus'])}
                  >
                    <SelectTrigger id="kycStatus" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRUCTURE_KYC_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`investors.detail.kycStatus.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskScore">{t(`${K}.sheet.riskScore`)}</Label>
                  <Input id="riskScore" className="h-11" value={structure.riskScore !== undefined ? `${structure.riskScore}/100` : '—'} disabled />
                  <p className="text-xs text-slate-500">{t(`${K}.sheet.riskScoreHint`)}</p>
                </div>
              </div>
            </SidePanelCard>
          </SidePanelSection>
        </div>

        <SidePanelFooter>
          <Button variant="outline" onClick={onClose}>
            {t('investors.detail.contactsTab.cancel')}
          </Button>
          <Button onClick={onSave} disabled={!structure.name.trim()}>
            {t('investors.detail.contactsTab.save')}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
