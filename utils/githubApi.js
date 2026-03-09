// utils/githubApi.js
import { getCache, setCache } from "./cache.js";

export async function ghFetch(url, rateInfoEl) {

  const res = await fetch(`/api/github?url=${encodeURIComponent(url)}`);

  // Rate limit info
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");

  if (rateInfoEl && remaining !== null) {
    const resetTime = reset
      ? new Date(Number(reset) * 1000).toLocaleTimeString()
      : "";

    rateInfoEl.textContent =
      `Rate remaining: ${remaining}${resetTime ? ` • resets at ${resetTime}` : ""}`;
  }

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  // Detect response type
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
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
