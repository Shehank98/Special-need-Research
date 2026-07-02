// Tiny fetch wrapper that attaches the JWT and base URL.
//
// BASE is empty for a single-service deploy (client + API on the same origin),
// so calls use relative paths like "/api/...". A separate API host can be set
// via VITE_API_URL at build time.
function resolveBase() {
  let configured = import.meta.env.VITE_API_URL || '';
  if (configured && typeof window !== 'undefined') {
    try {
      const u = new URL(configured);
      const apiIsLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
      const pageIsLocal =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      // Safety: a localhost API URL baked into a build that's served from a real
      // domain is a misconfiguration — fall back to same-origin relative paths.
      if (apiIsLocal && !pageIsLocal) configured = '';
    } catch {
      configured = '';
    }
  }
  return configured;
}

const BASE = resolveBase();

function getToken() {
  return localStorage.getItem('token');
}

// The current study session (set at login), used to stamp events for research.
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('session') || 'null');
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // CSV download endpoint returns text, not JSON.
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const api = {
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  dashboard: (studentId) => request(`/api/students/${studentId}/dashboard`),
  lessons: (difficulty) =>
    request(`/api/lessons${difficulty ? `?difficulty=${difficulty}` : ''}`),
  lesson: (id) => request(`/api/lessons/${id}`),
  createLesson: (payload) => request('/api/lessons', { method: 'POST', body: payload }),
  updateLesson: (id, payload) => request(`/api/lessons/${id}`, { method: 'PUT', body: payload }),
  deleteLesson: (id) => request(`/api/lessons/${id}`, { method: 'DELETE' }),
  saveProgress: (payload) => request('/api/progress', { method: 'POST', body: payload }),
  progress: (studentId) => request(`/api/progress/${studentId}`),
  // Silent engagement logging — auto-stamps the current session_id + week_number.
  logEvent: (payload) => {
    const s = getSession();
    const enriched = {
      session_id: s?.id ?? null,
      week_number: s?.week_number ?? null,
      ...payload,
    };
    return request('/api/events', { method: 'POST', body: enriched });
  },
  endSession: (sessionId) => request(`/api/sessions/${sessionId}/end`, { method: 'POST' }),
  // Per-question response-time logging — auto-stamps the current session_id + week_number.
  logResponse: (payload) => {
    const s = getSession();
    const enriched = {
      session_id: s?.id ?? null,
      week_number: s?.week_number ?? null,
      ...payload,
    };
    return request('/api/responses', { method: 'POST', body: enriched });
  },
  responseSummary: (studentId) => request(`/api/responses/${studentId}/summary`),
  logTracing: (payload) => {
    const s = getSession();
    return request('/api/tracing', { method: 'POST', body: { session_id: s?.id ?? null, ...payload } });
  },
  guideLevel: (studentId) => request(`/api/tracing/${studentId}/guide-level`),
  mathResult: (payload) => {
    const s = getSession();
    return request('/api/math/result', {
      method: 'POST',
      body: { session_id: s?.id ?? null, week_number: s?.week_number ?? null, ...payload },
    });
  },
  mathProgress: () => request('/api/math/progress'),
  badges: (studentId) => request(`/api/badges/${studentId}`),
  awardBadge: (payload) => request('/api/badges', { method: 'POST', body: payload }),
  teacherStudents: () => request('/api/teacher/students'),
  teacherStudent: (id) => request(`/api/teacher/student/${id}`),
  teacherMatrix: () => request('/api/teacher/matrix'),
  teacherRate: (payload) => request('/api/teacher/rating', { method: 'POST', body: payload }),
  // Assign/move a student to a research group ("path"): 'intervention' | 'control' | null.
  teacherSetGroup: (payload) => request('/api/teacher/group', { method: 'POST', body: payload }),
  teacherReport: () => request('/api/teacher/report'),
  teacherReportCsvUrl: `${BASE}/api/teacher/report?format=csv`,
  // Guardian progress tracking (read-only, by the child's login code).
  guardianSummary: (code) => request(`/api/guardian/${encodeURIComponent(code)}`, { auth: false }),
};

export { BASE, getToken };
