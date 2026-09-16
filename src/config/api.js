/**
 * API Configuration helper
 *
 * In production (e.g. Vercel), VITE_API_URL points to the backend server (e.g. Render).
 * In local development, if VITE_API_URL is empty, requests use relative paths ('/api/...')
 * which are proxied to localhost:3001 via vite.config.js.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Returns the full API URL for a given endpoint path.
 * @param {string} path e.g. '/api/chat' or 'api/upload'
 * @returns {string} full or relative URL
 */
export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
