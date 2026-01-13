// utils/githubApi.js
import { getCache, setCache } from "./cache.js";

export async function ghFetch(url, rateInfoEl) {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");

  if (rateInfoEl && remaining !== null) {
    const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : "";
    rateInfoEl.textContent = `Rate remaining: ${remaining}${resetTime ? ` • resets at ${resetTime}` : ""}`;
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      if (err?.message) msg = err.message;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

export async function fetchUser(username, rateInfoEl) {
  const cached = getCache("user", username);
  if (cached) return cached;

  const data = await ghFetch(`https://api.github.com/users/${username}`, rateInfoEl);
  setCache("user", username, data);
  return data;
}

export async function fetchRepos(username, rateInfoEl) {
  const cached = getCache("repos", username);
  if (cached) return cached;

  const data = await ghFetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    rateInfoEl
  );
  setCache("repos", username, data);
  return data;
}

export async function fetchRepoLanguages(username, repoName, rateInfoEl) {
  return ghFetch(`https://api.github.com/repos/${username}/${repoName}/languages`, rateInfoEl);
}
