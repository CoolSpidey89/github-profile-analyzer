
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function cacheKey(kind, username) {
  return `gh_${kind}_${username.toLowerCase()}`;
}

export function getCache(kind, username) {
  const key = cacheKey(kind, username);
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.time > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function setCache(kind, username, data) {
  const key = cacheKey(kind, username);
  localStorage.setItem(key, JSON.stringify({ time: Date.now(), data }));
}
