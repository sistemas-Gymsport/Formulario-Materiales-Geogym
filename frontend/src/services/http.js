let csrfToken = null;
let unauthorizedHandler = null;

export const setCsrfToken = (token) => {
  csrfToken = token;
};

export const onUnauthorized = (handler) => {
  unauthorizedHandler = handler;
};

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const toQuery = (params) => {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const request = async (path, { method = 'GET', body, params, headers = {}, raw = false, signal } = {}) => {
  const finalHeaders = { Accept: raw ? 'application/pdf' : 'application/json', ...headers };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) finalHeaders['X-CSRF-Token'] = csrfToken;
  let response;
  try {
    response = await fetch(`/api${path}${toQuery(params)}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
      signal
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'NETWORK', 'No fue posible conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }
  if (response.status === 401 && unauthorizedHandler && !path.startsWith('/admin/auth/login')) unauthorizedHandler();
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(response.status, payload?.error?.code ?? 'HTTP_ERROR', payload?.error?.message ?? 'Ocurrió un error inesperado', payload?.error?.details);
  }
  if (raw) return response;
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  get: (path, params, options) => request(path, { params, ...options }),
  post: (path, body, options) => request(path, { method: 'POST', body, ...options }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' })
};
