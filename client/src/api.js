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
  logEvent: (payload) => request('/api/events', { method: 'POST', body: payload }),
  badges: (studentId) => request(`/api/badges/${studentId}`),
  awardBadge: (payload) => request('/api/badges', { method: 'POST', body: payload }),
  teacherStudents: () => request('/api/teacher/students'),
  teacherReport: () => request('/api/teacher/report'),
  teacherReportCsvUrl: `${BASE}/api/teacher/report?format=csv`,
};

export { BASE, getToken };
