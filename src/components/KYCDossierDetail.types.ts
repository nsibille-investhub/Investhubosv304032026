export type DossierStatus =
  | 'to_review'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export type RiskLevel = 'low' | 'medium' | 'high';

export type SubjectType = 'individual' | 'entity';

export type DocumentStatus = 'verified' | 'pending' | 'expired' | 'rejected';

export type ScreeningType = 'pep' | 'sanctions' | 'adverse_media';

export type ScreeningStatus = 'clear' | 'hit' | 'pending';

export type WorkflowStepKey =
  | 'collection'
  | 'document_check'
  | 'screening'
  | 'decision';

export type AuditEventType =
  | 'document_uploaded'
  | 'document_verified'
  | 'document_rejected'
  | 'screening_run'
  | 'screening_hit'
  | 'comment_added'
  | 'status_changed'
  | 'reassigned'
  | 'reminder_sent';

export interface IdentityIndividual {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  profession: string;
}

export interface LegalRepresentative {
  name: string;
  role: string;
}

export interface IdentityEntity {
  legalName: string;
  legalForm: string;
  registrationNumber: string;
  incorporationDate: string;
  headOffice: string;
  sector: string;
  legalRepresentatives: LegalRepresentative[];
}

export interface DocumentItem {
  id: string;
  type: string;
  uploadedAt: string;
  expiresAt?: string;
  status: DocumentStatus;
  uploader: { name: string; sublabel?: string };
  fileSize?: string;
}

export interface UBO {
  id: string;
  name: string;
  ownership: number;
  controlType: 'direct' | 'indirect';
  nationality: string;
  isPep: boolean;
  kycStatus: DossierStatus;
}

export interface RiskSubscore {
  level: RiskLevel;
  score: number;
}

export interface ScreeningResult {
  type: ScreeningType;
  status: ScreeningStatus;
  hits: number;
  lastChecked: string;
}

export interface RiskScoring {
  level: RiskLevel;
  globalScore: number;
  subscores: {
    geography: RiskSubscore;
    activity: RiskSubscore;
    politicalExposure: RiskSubscore;
    sanctions: RiskSubscore;
  };
  screenings: ScreeningResult[];
}

export interface WorkflowState {
  currentStep: WorkflowStepKey;
  steps: {
    key: WorkflowStepKey;
    label: string;
    status: 'done' | 'current' | 'todo';
  }[];
  assignee?: { name: string; sublabel?: string };
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  timestamp: string;
  actorName?: string;
  actorSublabel?: string;
  actorRole?: string;
  description?: string;
}

export interface DossierComment {
  id: string;
  author: { name: string; sublabel?: string };
  timestamp: string;
  body: string;
  pinned?: boolean;
}

export interface KYCDossierDetail {
  id: string;
  reference: string;
  subjectType: SubjectType;
  displayName: string;
  status: DossierStatus;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
  identity: IdentityIndividual | IdentityEntity;
  documents: DocumentItem[];
  ubos?: UBO[];
  risk: RiskScoring;
  workflow: WorkflowState;
  auditEvents: AuditEvent[];
  comments: DossierComment[];
}
