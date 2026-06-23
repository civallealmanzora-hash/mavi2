export type Language = 'es' | 'en';

export type DriverCategory = 'C' | 'CE' | 'D' | 'DE' | 'OTHER';

export interface AuditResult {
  score: number; // 0-100
  viable: 'high' | 'medium' | 'low';
  timeline: string;
  roadmap: string[];
  requirementsMatched: string[];
  requirementsPending: string[];
  legalRoute: string;
  notes: string;
}

export interface ConsultingRequest {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  message: string;
  candidateCountry?: string;
  candidateLicense?: DriverCategory;
  calculatedScore?: number;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: string;
}

export interface CountryInfo {
  code: string;
  nameEs: string;
  nameEn: string;
  treatyStatus: 'direct' | 'exam_required' | 'no_treaty';
  canjeEs: string;
  canjeEn: string;
  averageTimeline: string;
  successRate: string;
}
