import "server-only";

export function getApiBaseUrl(): URL | null {
  const value = process.env.API_BASE_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return null;
    url.pathname = `${url.pathname.replace(/\/$/, "")}/`;
    return url;
  } catch {
    return null;
  }
}
