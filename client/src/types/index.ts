/* ============================================================
   ATSense — Shared Frontend Types
   ============================================================ */

// --- Upload / Resume ---

export interface UploadedResume {
  documentId: string;
  filename: string;
  fileType: 'pdf' | 'docx' | 'unknown';
  fileSize: number;
  mimeType: string;
  pageCount?: number;
  chunksCreated: number;
  sections: string[];
  uploadedAt: Date;
}

export type ResumeUploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; resume: UploadedResume }
  | { status: 'error'; message: string };

// --- Job Description ---

export type JDInputMode = 'paste' | 'upload';

export interface JobDescriptionState {
  mode: JDInputMode;
  text: string;
  filename?: string;
  fileSize?: number;
  isProcessing: boolean;
  error?: string;
}

// --- Analysis ---

export type AnalysisStatus = 'idle' | 'starting' | 'processing' | 'completed' | 'error';

export type MatchLevel =
  | 'Exceptional Match'
  | 'Strong Match'
  | 'Good Match'
  | 'Moderate Match'
  | 'Weak Match'
  | 'Low Match';

export type EvidenceStatus = 'strong_match' | 'moderate_match' | 'weak_match' | 'not_found';

export interface CategoryScores {
  requiredSkills: number;
  experience: number;
  responsibilities: number;
  technicalKeywords: number;
  projects: number;
  education: number;
  atsReadability: number;
}

export interface EvidenceItem {
  requirement: string;
  matchScore: number;
  status: EvidenceStatus;
  resumeEvidence: string[];
  sourceSection: string;
  similarity: number;
}

export interface ATSReadabilityDetails {
  score: number;
  hasContactInfo: boolean;
  hasClearSections: boolean;
  hasConsistentFormatting: boolean;
  hasVisibleSkills: boolean;
  issues: string[];
  explanation: string;
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  suggested: string[];
}

export interface RAGInsights {
  totalChunksIndexed: number;
  chunksRetrieved: number;
  topSimilarity: number;
  averageSimilarity: number;
  embeddingModel: string;
  vectorDatabase: string;
  topK: number;
}

export interface RAGEvidenceChunk {
  text: string;
  section: string;
  similarity: number;
}

export interface RAGEvidenceEntry {
  requirement: string;
  requirementType: string;
  topSimilarity: number;
  averageSimilarity: number;
  chunks: RAGEvidenceChunk[];
}

export interface ScoreBreakdown {
  score: number;
  matchLevel: MatchLevel;
  color: string;
  description: string;
}

export interface CategoryPercentages {
  requiredSkills: number;
  experience: number;
  responsibilities: number;
  technicalKeywords: number;
  projects: number;
  education: number;
  atsReadability: number;
}

export interface AnalysisResult {
  overallScore: number;
  matchLevel: MatchLevel;
  summary: string;
  categoryScores: CategoryScores;
  categoryPercentages: CategoryPercentages;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  evidence: EvidenceItem[];
  atsReadabilityDetails?: ATSReadabilityDetails;
  keywordAnalysis?: KeywordAnalysis;
  ragInsights?: RAGInsights;
  _ragEvidence?: RAGEvidenceEntry[];
  scoreBreakdown: ScoreBreakdown;
}

// --- API Responses ---

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface ResumeUploadResponse {
  success: boolean;
  documentId: string;
  message: string;
  metadata: {
    filename: string;
    fileType: string;
    fileSize: number;
    mimeType: string;
    pageCount?: number;
    chunksCreated: number;
    sections: string[];
  };
}

export interface StartAnalysisResponse {
  success: boolean;
  analysisId: string;
  message: string;
}

export interface AnalysisStatusResponse {
  success: boolean;
  status: 'processing' | 'completed' | 'error';
  message?: string;
  error?: string;
  result?: AnalysisResult;
}

// --- UI State ---

export type PipelineStepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface PipelineStep {
  id: string;
  label: string;
  description?: string;
  status: PipelineStepStatus;
}

// --- Misc ---

export interface CategoryConfig {
  key: keyof CategoryScores;
  label: string;
  maxScore: number;
  icon: string;
  description: string;
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  { key: 'requiredSkills',    label: 'Required Skills',      maxScore: 30, icon: 'bi-check2-circle',   description: 'Core skills explicitly required for this role' },
  { key: 'experience',        label: 'Experience',           maxScore: 20, icon: 'bi-briefcase',       description: 'Relevant work history and years of experience' },
  { key: 'responsibilities',  label: 'Responsibilities',     maxScore: 15, icon: 'bi-list-task',       description: 'Alignment with key job duties' },
  { key: 'technicalKeywords', label: 'Technical Keywords',   maxScore: 15, icon: 'bi-code-slash',      description: 'Presence of important technical terminology' },
  { key: 'projects',          label: 'Projects',             maxScore: 10, icon: 'bi-folder2-open',    description: 'Relevant projects and portfolio work' },
  { key: 'education',         label: 'Education',            maxScore: 5,  icon: 'bi-mortarboard',     description: 'Academic qualifications and certifications' },
  { key: 'atsReadability',    label: 'ATS Readability',      maxScore: 5,  icon: 'bi-eye',             description: 'How well the resume is formatted for ATS parsing' },
];

export const MATCH_LEVEL_CONFIG: Record<MatchLevel, { color: string; bgColor: string; borderColor: string; icon: string }> = {
  'Exceptional Match': { color: '#00ff88', bgColor: 'rgba(0,255,136,0.1)',    borderColor: 'rgba(0,255,136,0.3)',    icon: 'bi-stars' },
  'Strong Match':      { color: '#4ade80', bgColor: 'rgba(74,222,128,0.1)',   borderColor: 'rgba(74,222,128,0.3)',   icon: 'bi-trophy' },
  'Good Match':        { color: '#86efac', bgColor: 'rgba(134,239,172,0.1)',  borderColor: 'rgba(134,239,172,0.3)',  icon: 'bi-hand-thumbs-up' },
  'Moderate Match':    { color: '#fbbf24', bgColor: 'rgba(251,191,36,0.1)',   borderColor: 'rgba(251,191,36,0.3)',   icon: 'bi-dash-circle' },
  'Weak Match':        { color: '#f97316', bgColor: 'rgba(249,115,22,0.1)',   borderColor: 'rgba(249,115,22,0.3)',   icon: 'bi-exclamation-triangle' },
  'Low Match':         { color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)',    borderColor: 'rgba(239,68,68,0.3)',    icon: 'bi-x-circle' },
};

export const EVIDENCE_STATUS_CONFIG: Record<EvidenceStatus, { label: string; color: string; badgeClass: string }> = {
  strong_match:   { label: 'Strong Match',   color: '#4ade80', badgeClass: 'at-badge-success' },
  moderate_match: { label: 'Moderate Match', color: '#fbbf24', badgeClass: 'at-badge-warning' },
  weak_match:     { label: 'Weak Match',     color: '#f97316', badgeClass: 'at-badge-warning' },
  not_found:      { label: 'Not Found',      color: '#ef4444', badgeClass: 'at-badge-danger' },
};
