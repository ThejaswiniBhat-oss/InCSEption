export type Role = 'individual' | 'ngo' | 'government_officer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Schemes ─────────────────────────────────────────────────────────────────

export type SchemeStatus = 'active' | 'closed' | 'upcoming';
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'blocked';

export interface Scheme {
  id: string;
  title: string;
  ministry: string;
  category: string;
  description: string;
  simplifiedDescription: string;
  eligibleRoles: Role[];
  benefits: string[];
  criteria: string[];
  clauses: string[];
  whoCanApply: string;
  deadline: string;
  status: SchemeStatus;
  tags: string[];
  amount?: string;
}

export interface MyScheme {
  id: string;
  schemeId: string;
  schemeTitle: string;
  status: ApplicationStatus;
  submittedAt?: string;
  updatedAt: string;
  justificationPoints?: string[];
}

// ─── Application ──────────────────────────────────────────────────────────────

export interface RequirementItem {
  id: string;
  label: string;
  required: boolean;
}

export interface ApplicationFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'file';
  required: boolean;
  options?: string[];
  accept?: string;
}

export interface ApplicationRequirements {
  schemeId: string;
  checklist: RequirementItem[];
  formFields: ApplicationFormField[];
}

export interface ApplicationSubmission {
  schemeId: string;
  formData: Record<string, string | File>;
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export interface VerifyOutcome {
  applicationId: string;
  status: ApplicationStatus;
  score?: number;
  justificationPoints: string[];
  flags?: string[];
  linkedApplicant?: string;
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  lastRun?: string;
  detail?: string;
  logs?: string[];
}
