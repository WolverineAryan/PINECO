import {
  Product,
  BrandRule,
  ApprovedFact,
  Submission,
  SubmissionDetail,
  Review,
  Finding,
  AuditEvent,
  DashboardSummary,
  HealthResponse,
  LoginResponse,
  UserProfile,
  AgentStatus,
  AgentScanResponse,
  PolicyProposalResponse,
  ParsedFileResponse,
  UploadAndScanResponse,
} from './types';

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';
const API_BASE_URL = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pineco_jwt_token');
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error && errorJson.error.message) {
        errorDetail = errorJson.error.message;
      } else if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

async function fetchFormData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error && errorJson.error.message) {
        errorDetail = errorJson.error.message;
      } else if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Authentication & JWT
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    title?: string;
    department?: string;
  }) =>
    fetchJson<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (credentials: { email?: string; role?: string; password?: string }) =>
    fetchJson<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getDemoAccounts: () => fetchJson<UserProfile[]>('/auth/demo-accounts'),

  getCurrentUser: () => fetchJson<UserProfile>('/auth/me'),

  updateCurrentUser: (data: { name?: string; title?: string; department?: string }) =>
    fetchJson<UserProfile>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCurrentUser: () =>
    fetchJson<{ status: string; message: string }>('/auth/me', {
      method: 'DELETE',
    }),

  // Health
  getHealth: () => fetchJson<HealthResponse>('/health'),

  // Products / Project Folders
  getProducts: (workspaceId?: string) =>
    fetchJson<Product[]>(`/products${workspaceId ? `?workspace_id=${workspaceId}` : ''}`),

  createProduct: (data: { name: string; description?: string; category?: string; workspace_id?: string }) =>
    fetchJson<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteProduct: (productId: string) =>
    fetchJson<void>(`/products/${productId}`, {
      method: 'DELETE',
    }),

  // Dashboard
  getDashboardSummary: (workspaceId?: string, productId?: string) => {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (productId) params.append('product_id', productId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<DashboardSummary>(`/dashboard/summary${qs}`);
  },

  resetDemoData: () => fetchJson<{ status: string; message: string }>('/demo/reset', { method: 'POST' }),

  // Rules
  getRules: (workspaceId?: string, productId?: string) => {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (productId) params.append('product_id', productId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<BrandRule[]>(`/rules${qs}`);
  },

  createRule: (
    data: {
      name: string;
      category: string;
      description: string;
      pattern?: string;
      preferred_replacement?: string;
      severity: string;
      channel_scope: string;
      enabled: boolean;
      workspace_id?: string;
      product_id?: string;
    },
    actorId = 'usr-manager-marcus'
  ) =>
    fetchJson<BrandRule>(`/rules?actor_id=${actorId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRule: (
    ruleId: string,
    data: Partial<BrandRule>,
    actorId = 'usr-manager-marcus'
  ) =>
    fetchJson<BrandRule>(`/rules/${ruleId}?actor_id=${actorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Facts
  getFacts: (workspaceId?: string, productId?: string) => {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (productId) params.append('product_id', productId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<ApprovedFact[]>(`/facts${qs}`);
  },

  createFact: (
    data: {
      statement: string;
      source_title: string;
      source_reference: string;
      source_url?: string;
      owner: string;
      approval_status: string;
      workspace_id?: string;
      product_id?: string;
    },
    actorId = 'usr-manager-marcus'
  ) =>
    fetchJson<ApprovedFact>(`/facts?actor_id=${actorId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Submissions
  getSubmissions: (workspaceId?: string, status?: string, productId?: string) => {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (status) params.append('status', status);
    if (productId) params.append('product_id', productId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Submission[]>(`/submissions${qs}`);
  },

  getSubmissionDetail: (submissionId: string) =>
    fetchJson<SubmissionDetail>(`/submissions/${submissionId}`),

  createSubmission: (
    data: { title: string; channel: string; content: string; workspace_id?: string; product_id?: string },
    actorId = 'usr-creator-sarah'
  ) =>
    fetchJson<SubmissionDetail>(`/submissions?actor_id=${actorId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createRevision: (submissionId: string, content: string, actorId = 'usr-creator-sarah') =>
    fetchJson<{ id: string; version_number: number; content_text: string }>(
      `/submissions/${submissionId}/versions?actor_id=${actorId}`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    ),

  // Reviews
  triggerReview: (submissionId: string, versionId?: string, actorId = 'usr-creator-sarah') => {
    const qs = versionId ? `?version_id=${versionId}&actor_id=${actorId}` : `?actor_id=${actorId}`;
    return fetchJson<Review>(`/submissions/${submissionId}/reviews${qs}`, {
      method: 'POST',
    });
  },

  getReview: (reviewId: string) => fetchJson<Review>(`/reviews/${reviewId}`),

  // Decisions & Overrides
  recordDecision: (
    reviewId: string,
    data: { decision: 'approved' | 'changes_requested' | 'overridden'; rationale?: string },
    reviewerId = 'usr-reviewer-elena'
  ) =>
    fetchJson<{ id: string; decision: string; rationale?: string }>(
      `/reviews/${reviewId}/decision?reviewer_id=${reviewerId}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  overrideFinding: (
    findingId: string,
    rationale: string,
    actorId = 'usr-reviewer-elena'
  ) =>
    fetchJson<Finding>(`/findings/${findingId}/override?actor_id=${actorId}`, {
      method: 'POST',
      body: JSON.stringify({ rationale }),
    }),

  // Audit
  getSubmissionAudit: (submissionId: string) =>
    fetchJson<AuditEvent[]>(`/submissions/${submissionId}/audit`),

  getWorkspaceAudit: (workspaceId?: string) =>
    fetchJson<AuditEvent[]>(`/audit${workspaceId ? `?workspace_id=${workspaceId}` : ''}`),

  // AI Autonomous Agent & Warning Engine
  getAgentStatus: () => fetchJson<AgentStatus>('/agent/status'),

  scanWithAgent: (data: {
    text: string;
    title?: string;
    channel?: string;
    product_id?: string | null;
    workspace_id?: string;
  }) =>
    fetchJson<AgentScanResponse>('/agent/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  proposePolicy: (data: {
    prompt: string;
    product_id?: string | null;
    workspace_id?: string;
  }) =>
    fetchJson<PolicyProposalResponse>('/agent/propose-policy', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Multi-Format Ingestion & OCR
  parseFile: (file: File, clientExtractedText?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (clientExtractedText) {
      formData.append('client_extracted_text', clientExtractedText);
    }
    return fetchFormData<ParsedFileResponse>('/submissions/parse-file', {
      method: 'POST',
      body: formData,
    });
  },

  uploadAndScan: (formData: FormData, actorId = 'usr-creator-sarah') => {
    return fetchFormData<UploadAndScanResponse>(`/submissions/upload-and-scan?actor_id=${actorId}`, {
      method: 'POST',
      body: formData,
    });
  },

  // Export Compliance & Audit Reports (PDF, DOCX, PPTX)
  exportSubmissionReport: async (submissionId: string, format: 'pdf' | 'docx' | 'pptx', filenamePrefix?: string) => {
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}/export?format=${format}`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to export ${format.toUpperCase()} report: ${res.statusText}`);
    }

    // Try extracting filename from Content-Disposition header
    let filename = `${filenamePrefix || 'pineco-compliance-report'}-${submissionId.slice(0, 8)}.${format}`;
    const disposition = res.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    return filename;
  },
};
