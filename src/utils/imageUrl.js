const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE || 'https://apiminalgems.exotech.co.in';

export function getImageUrl(url, fallback = '/placeholder.jpg') {
  if (!url || typeof url !== 'string') return fallback;

  // Already absolute (http / https) or a data URI – use as‑is
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;

  // Relative path – prepend the backend base URL
  return `${IMAGE_BASE}${url}`;
}