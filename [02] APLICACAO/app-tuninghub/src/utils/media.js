const API_BASE = process.env.EXPO_PUBLIC_API_URL.replace('/api', '');

export function getUrlImagem(urlRelativa) {
  if (!urlRelativa) return null;
  return `${API_BASE}${urlRelativa}`;
}