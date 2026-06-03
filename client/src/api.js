// Tiny fetch wrapper that attaches the JWT and base URL.
const BASE = import.meta.env.VITE_API_URL || '';

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
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  dashboard: (studentId) => request(`/api/students/${studentId}/dashboard`),
  lessons: (difficulty) =>
    request(`/api/lessons${difficulty ? `?difficulty=${difficulty}` : ''}`),
  lesson: (id) => request(`/api/lessons/${id}`),
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
