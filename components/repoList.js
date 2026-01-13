// components/repoList.js
import { fmt, compactStr, formatDate } from "../utils/helpers.js";

export function getFilteredRepos(repos, query, sortBy, topN) {
  let filtered = [...repos];

  if (query) {
    filtered = filtered.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
  }

  filtered.sort((a, b) => {
    if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
    if (sortBy === "forks") return b.forks_count - a.forks_count;
    if (sortBy === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return filtered.slice(0, topN);
}

export function renderRepos(reposWrap, repoMeta, repos, totalCount) {
  repoMeta.textContent = `${repos.length} shown • ${totalCount} fetched`;
  reposWrap.innerHTML = "";

  if (!repos.length) {
    reposWrap.innerHTML = `<div class="muted">No repositories found.</div>`;
    return;
  }

  for (const r of repos) {
    const el = document.createElement("div");
    el.className = "repoItem";
    el.innerHTML = `
      <div class="repoLeft">
        <div class="repoName">
          <a href="${r.html_url}" target="_blank">${r.name}</a>
        </div>
        <div class="repoDesc">${compactStr(r.description || "No description.", 140)}</div>
      </div>
      <div class="repoRight">
        ${r.language ? `<span class="pill">🧠 ${r.language}</span>` : ""}
        <span class="pill">⭐ ${fmt.format(r.stargazers_count)}</span>
        <span class="pill">🍴 ${fmt.format(r.forks_count)}</span>
        <span class="pill">🕒 ${formatDate(r.updated_at)}</span>
      </div>
    `;
    reposWrap.appendChild(el);
  }
}
