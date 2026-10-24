export type RuleCategory = 'terminology' | 'tone' | 'disclaimer' | 'factual' | 'formatting';
export type SeverityLevel = 'low' | 'medium' | 'high';
export type EvidenceStatus = 'supported' | 'contradicted' | 'unverified' | 'needs_human_review';
export type SubmissionStatus = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'review_failed';
export type ReviewStatus = 'queued' | 'running' | 'completed' | 'completed_with_warnings' | 'failed';
export type DecisionType = 'approved' | 'changes_requested' | 'overridden';
export type UserRole = 'creator' | 'brand_manager' | 'reviewer' | 'admin';

export interface UserProfile {
  id: string;
  workspace_id?: string;
  email: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  avatar: string;
}

export interface Product {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  category: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface BrandRule {
  id: string;
  workspace_id: string;
  product_id?: string | null;
  name: string;
  category: string;
  description: string;
  pattern?: string | null;
  preferred_replacement?: string | null;
  severity: SeverityLevel;
  channel_scope: string;
  enabled: boolean;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovedFact {
  id: string;
  workspace_id: string;
  product_id?: string | null;
  statement: string;
  source_title: string;
  source_reference: string;
  source_url?: string | null;
  owner: string;
  approval_status: string;
  valid_from?: string | null;
  valid_until?: string | null;
  created_by: string;
  created_at: string;
}

export interface ContentVersion {
  id: string;
  submission_id: string;
  version_number: number;
  content_text: string;
  content_hash: string;
  created_by: string;
  created_at: string;
}

export interface Finding {
  id: string;
  review_id: string;
  category: string;
  severity: SeverityLevel;
  confidence: number;
  excerpt: string;
  start_offset?: number | null;
  end_offset?: number | null;
  explanation: string;
  evidence_status: EvidenceStatus;
  rule_id?: string | null;
  fact_id?: string | null;
  suggested_correction?: string | null;
  resolution_status: string;
  resolution_rationale?: string | null;
  resolved_by?: string | null;
  source_origin: 'rule_engine' | 'llm';
  created_at: string;
  rule?: BrandRule | null;
  fact?: ApprovedFact | null;
}

export interface Review {
  id: string;
  submission_id: string;
  content_version_id: string;
  status: ReviewStatus;
  engine_version: string;
  started_at: string;
  completed_at?: string | null;
  error_code?: string | null;
  warning_summary?: string | null;
  findings: Finding[];
}

export interface Submission {
  id: string;
  workspace_id: string;
  product_id?: string | null;
  title: string;
  channel: string;
  created_by: string;
  status: SubmissionStatus;
  current_version_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionDetail extends Submission {
  versions: ContentVersion[];
  current_version?: ContentVersion | null;
  latest_review?: Review | null;
}

export interface AuditEvent {
  id: string;
  workspace_id: string;
  actor_id: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  metadata_json?: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  changes_requested_submissions: number;
  total_rules: number;
  total_facts: number;
  total_findings: number;
  findings_by_severity: Record<string, number>;
  findings_by_category: Record<string, number>;
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  recent_submissions: Submission[];
  recent_audit_events: AuditEvent[];
}

export interface HealthResponse {
  status: string;
  app_env: string;
  database: string;
  ai_provider: string;
  engine_version: string;
}

export interface AgentStatus {
  status: string;
  mode: string;
  llm_provider: string;
  model: string;
  latency_ms: number;
  active_sentinel: boolean;
  autonomous_remediation: boolean;
  supported_warning_tiers: string[];
  capabilities: string[];
}

export interface WarningItem {
  id: string;
  category: string;
  severity: string;
  title: string;
  explanation: string;
  recommended_action: string;
  matched_term?: string;
}

export interface AgentScanResponse {
  status: string;
  execution_ms: number;
  warnings: WarningItem[];
  remediated_text: string;
  diff_summary: string[];
  compliance_score: number;
  summary: string;
}

export interface ProposedRuleItem {
  name: string;
  category: string;
  description: string;
  pattern: string;
  preferred_replacement?: string | null;
  severity: string;
  explanation: string;
}

export interface ProposedFactItem {
  statement: string;
  source_title: string;
  source_reference: string;
  owner: string;
}

export interface PolicyProposalResponse {
  summary: string;
  rules: ProposedRuleItem[];
  facts: ProposedFactItem[];
}

export interface ParsedFileResponse {
  filename: string;
  file_type: string;
  extracted_text: string;
  char_count: number;
  word_count: number;
  file_size_bytes: number;
  sha256: string;
  pages_or_sheets?: number | null;
  ocr_applied: boolean;
  notes?: string | null;
}

export interface UploadAndScanResponse {
  submission_id: string;
  version_id: string;
  version_number: number;
  review_id: string;
  title: string;
  channel: string;
  file_type: string;
  extracted_text: string;
  word_count: number;
  review_status: string;
  findings_count: number;
  warnings_summary?: string | null;
  findings: Finding[];
}
