/**
 * Normalizes an API URL to guarantee it points to the '/api/v1' version prefix
 * without duplicate slashes.
 */
export function normalizeApiUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'https://gymon-server.onrender.com/api/v1';
  }

  const clean = rawUrl.trim().replace(/\/+$/, '');
  if (!clean) {
    return 'https://gymon-server.onrender.com/api/v1';
  }

  // If URL already ends with /api/v1, return as is
  if (clean.endsWith('/api/v1')) {
    return clean;
  }

  // If URL ends with /api, append /v1
  if (clean.endsWith('/api')) {
    return `${clean}/v1`;
  }

  // Otherwise, append /api/v1
  return `${clean}/api/v1`;
}

// Compute client API Base URL based on environment (local Vite dev server vs Vercel production build)
const rawEnvUrl = import.meta.env.DEV
  ? (import.meta.env.VITE_DEV_BASE_URL || 'http://localhost:5000/api/v1')
  : (import.meta.env.VITE_PROD_BASE_URL || 'https://gymon-server.onrender.com/api/v1');

export const API_BASE_URL = normalizeApiUrl(rawEnvUrl);

