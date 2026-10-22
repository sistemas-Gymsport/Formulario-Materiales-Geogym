import { api, request } from './http.js';

const crud = (base) => ({
  list: (params) => api.get(base, params),
  create: (body) => api.post(base, body),
  update: (id, body) => api.patch(`${base}/${id}`, body),
  move: (id, direction) => api.post(`${base}/${id}/move`, { direction })
});

export const authApi = {
  login: (body) => api.post('/admin/auth/login', body),
  me: () => api.get('/admin/auth/me'),
  logout: () => api.post('/admin/auth/logout'),
  changePassword: (body) => api.post('/admin/auth/password', body)
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  requests: (params) => api.get('/admin/requests', params),
  request: (id) => api.get(`/admin/requests/${id}`),
  materials: { ...crud('/admin/materials'), custom: () => api.get('/admin/materials/custom') },
  categories: crud('/admin/categories'),
  branches: crud('/admin/branches'),
  schedule: {
    get: () => api.get('/admin/schedule'),
    save: (body) => api.put('/admin/schedule', body),
    addException: (body) => api.post('/admin/schedule/exceptions', body),
    removeException: (id) => api.delete(`/admin/schedule/exceptions/${id}`)
  },
  reports: {
    monthly: (year, month) => api.get('/admin/reports/monthly', { year, month }),
    closes: () => api.get('/admin/reports/closes'),
    close: (year, month) => api.post('/admin/reports/closes', { year, month }),
    pdf: (year, month, signal) => request('/admin/reports/monthly/pdf', { params: { year, month }, raw: true, signal })
  },
  integrations: {
    get: () => api.get('/admin/integrations'),
    save: (body) => api.put('/admin/integrations', body),
    rotate: () => api.post('/admin/integrations/credential'),
    test: () => api.post('/admin/integrations/test'),
    retry: () => api.post('/admin/integrations/retry')
  },
  admins: {
    list: () => api.get('/admin/admins'),
    create: (body) => api.post('/admin/admins', body),
    setActive: (id, isActive) => api.patch(`/admin/admins/${id}`, { isActive })
  }
};
