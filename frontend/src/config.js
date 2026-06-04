const API_URL = process.env.REACT_APP_API_URL || 'https://gsec.onrender.com';
export const BASE_URL = API_URL;
export const API_BASE = `${API_URL}/api`;
export const SOCKET_URL = API_URL;

export function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_URL}/uploads/${url}`;
}
