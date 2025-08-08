import { BaseEntity, EntityType } from '../services/dynamodb';

// User Types and Interfaces
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User extends BaseEntity {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// Prenup Types and Interfaces
export enum USState {
  CALIFORNIA = 'CALIFORNIA',
  WASHINGTON = 'WASHINGTON',
  NEW_YORK = 'NEW_YORK',
  WASHINGTON_DC = 'WASHINGTON_DC',
  VIRGINIA = 'VIRGINIA'
}

export enum PrenupStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  PENDING_SIGNATURES = 'PENDING_SIGNATURES',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED'
}

export interface Prenup extends BaseEntity {
  title: string;
  state: USState;
  status: PrenupStatus;
  createdBy: string;
  partnerId?: string;
  progress: Record<string, any>;
  content: Record<string, any>;
  // Computed fields for easy querying
  createdByEmail?: string;
  partnerEmail?: string;
}

// Financial Disclosure Types
export interface FinancialDisclosure extends BaseEntity {
  prenupId: string;
  userId: string;
  assets: Asset[];
  debts: Debt[];
  income: Income;
  netWorth: number;
  userEmail?: string; // Denormalized for easy querying
}

export interface Asset {
  type: 'REAL_ESTATE' | 'VEHICLE' | 'BANK_ACCOUNT' | 'INVESTMENT' | 'BUSINESS' | 'PERSONAL_PROPERTY' | 'OTHER';
  description: string;
  value: number;
  ownership: 'INDIVIDUAL' | 'JOINT' | 'SHARED';
  notes?: string;
}

export interface Debt {
  type: 'MORTGAGE' | 'STUDENT_LOAN' | 'CREDIT_CARD' | 'AUTO_LOAN' | 'BUSINESS_LOAN' | 'PERSONAL_LOAN' | 'OTHER';
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

// Document Types
export enum DocumentType {
  PRENUP_DRAFT = 'PRENUP_DRAFT',
  PRENUP_FINAL = 'PRENUP_FINAL',
  FINANCIAL_STATEMENT = 'FINANCIAL_STATEMENT',
  SUPPORTING_DOCUMENT = 'SUPPORTING_DOCUMENT'
}

export interface Document extends BaseEntity {
  prenupId: string;
  type: DocumentType;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy?: string; // User ID who uploaded
}

// Signature Types
export enum SignatureStatus {
  PENDING = 'PENDING',
  SIGNED = 'SIGNED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export interface Signature extends BaseEntity {
  prenupId: string;
  userId: string;
  docusignId?: string;
  status: SignatureStatus;
  signedAt?: string;
  ipAddress?: string;
  userEmail?: string; // Denormalized
}

// Partner Invitation Types
export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export interface PartnerInvitation extends BaseEntity {
  email: string;
  prenupId: string;
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  invitedByEmail?: string; // Denormalized
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Helper function to create entity IDs
export const generateEntityId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
};

// Helper function to create new entities with proper structure
export const createUserEntity = (userData: Omit<User, keyof BaseEntity>): Omit<User, 'createdAt' | 'updatedAt' | 'version'> => ({
  ...userData,
  id: generateEntityId(),
  entityType: EntityType.USER
});

export const createPrenupEntity = (prenupData: Omit<Prenup, keyof BaseEntity>): Omit<Prenup, 'createdAt' | 'updatedAt' | 'version'> => ({
  ...prenupData,
  id: generateEntityId(),
  entityType: EntityType.PRENUP
});

export const createFinancialDisclosureEntity = (disclosureData: Omit<FinancialDisclosure, keyof BaseEntity>): Omit<FinancialDisclosure, 'createdAt' | 'updatedAt' | 'version'> => ({
  ...disclosureData,
  id: generateEntityId(),
  entityType: EntityType.FINANCIAL_DISCLOSURE
});

export const createDocumentEntity = (documentData: Omit<Document, keyof BaseEntity>): Omit<Document, 'createdAt' | 'updatedAt' | 'version'> => ({
  ...documentData,
  id: generateEntityId(),
  entityType: EntityType.DOCUMENT
});

export const createSignatureEntity = (signatureData: Omit<Signature, keyof BaseEntity>): Omit<Signature, 'createdAt' | 'updatedAt' | 'version'> => ({
  ...signatureData,
  id: generateEntityId(),
  entityType: EntityType.SIGNATURE
});

export const createPartnerInvitationEntity = (invitationData: Omit<PartnerInvitation, keyof BaseEntity>): Omit<PartnerInvitation, 'createdAt' | 'updatedAt' | 'version'> => ({
  ...invitationData,
  id: generateEntityId(),
  entityType: EntityType.PARTNER_INVITATION
});