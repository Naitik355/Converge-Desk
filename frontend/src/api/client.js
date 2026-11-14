/**
 * API client with session cookie support and CSRF token handling.
 */

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
export const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

export async function request(endpoint, options = {}) {
  const { params, headers = {}, ...customConfig } = options;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${cleanEndpoint}`.replace(/\/api\/api\//g, '/api/');

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const csrfToken = getCookie('csrftoken');
  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((customConfig.method || 'GET').toUpperCase())) {
    defaultHeaders['X-CSRFToken'] = csrfToken;
  }

  const config = {
    method: 'GET',
    credentials: 'include', // Crucial for Django session authentication
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    // If redirected to login page by Django @login_required (e.g. 302 redirected to html)
    if (response.redirected && response.url.includes('/accounts/login/')) {
      throw new ApiError('Authentication required. Please log in.', 401);
    }

    // Try parsing JSON
    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      const trimmed = text.trim();
      // If we received an HTML page while expecting JSON (e.g. 404, Django debug, or SPA fallback index.html)
      if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<head')) {
        throw new ApiError(`Expected JSON response but received HTML (${response.status})`, response.ok ? 401 : response.status);
      }
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text ? { message: text } : null;
      }
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.error ||
        responseData?.detail ||
        responseData?.message ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0
    );
  }
}
