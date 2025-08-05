export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type USState = 'CALIFORNIA' | 'WASHINGTON' | 'NEW_YORK' | 'WASHINGTON_DC' | 'VIRGINIA';

export type PrenupStatus = 'DRAFT' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'PENDING_SIGNATURES' | 'EXECUTED' | 'CANCELLED';

export interface Prenup {
  id: string;
  title: string;
  state: USState;
  status: PrenupStatus;
  createdBy: string;
  partnerId?: string;
  progress: {
    currentStep: number;
    completedSteps: number[];
    totalSteps: number;
  };
  content: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  creator: User;
  partner?: User;
}

export interface StateRequirement {
  name: string;
  description: string;
  required: boolean;
  waitingPeriod?: number;
}

export interface StateCompliance {
  state: USState;
  displayName: string;
  totalSteps: number;
  requirements: StateRequirement[];
  disclosureRequirements: string[];
  notarizationRequired: boolean;
  witnessRequired: boolean;
  specialRules: string[];
}

export type AssetType = 'REAL_ESTATE' | 'VEHICLE' | 'BANK_ACCOUNT' | 'INVESTMENT' | 'BUSINESS' | 'PERSONAL_PROPERTY' | 'OTHER';
export type DebtType = 'MORTGAGE' | 'STUDENT_LOAN' | 'CREDIT_CARD' | 'AUTO_LOAN' | 'BUSINESS_LOAN' | 'PERSONAL_LOAN' | 'OTHER';
export type OwnershipType = 'INDIVIDUAL' | 'JOINT' | 'SHARED';

export interface Asset {
  type: AssetType;
  description: string;
  value: number;
  ownership: OwnershipType;
  notes?: string;
}

export interface Debt {
  type: DebtType;
  description: string;
  amount: number;
  monthlyPayment?: number;
  creditor: string;
  notes?: string;
}

export interface Income {
  salary: number;
  bonus: number;
  investments: number;
  business: number;
  rental: number;
  other: number;
  otherDescription?: string;
}

export interface FinancialDisclosure {
  id: string;
  prenupId: string;
  userId: string;
  assets: Asset[];
  debts: Debt[];
  income: Income;
  netWorth: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export type DocumentType = 'PRENUP_DRAFT' | 'PRENUP_FINAL' | 'FINANCIAL_STATEMENT' | 'SUPPORTING_DOCUMENT';

export interface Document {
  id: string;
  prenupId: string;
  type: DocumentType;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export type SignatureStatus = 'PENDING' | 'SIGNED' | 'DECLINED' | 'EXPIRED';

export interface Signature {
  id: string;
  prenupId: string;
  userId: string;
  docusignId?: string;
  status: SignatureStatus;
  signedAt?: string;
  ipAddress?: string;
  createdAt: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}