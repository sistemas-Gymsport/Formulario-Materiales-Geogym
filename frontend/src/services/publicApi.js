import { api } from './http.js';

export const publicApi = {
  config: () => api.get('/public/config'),
  availability: () => api.get('/public/form-availability'),
  submit: (body, idempotencyKey) => api.post('/public/requests', body, { headers: { 'Idempotency-Key': idempotencyKey } })
};
