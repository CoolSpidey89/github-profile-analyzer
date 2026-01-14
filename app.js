// app.js (MODULAR VERSION)

// -----------------------------
// Imports
// -----------------------------
import { getURLUser, setURLUser } from "./utils/helpers.js";
import { fetchUser, fetchRepos, fetchRepoLanguages } from "./utils/githubApi.js";
import { renderProfile } from "./components/profileCard.js";
import { getFilteredRepos, renderRepos } from "./components/repoList.js";
import { renderLangChart } from "./components/charts.js";

// -----------------------------
// Elements
// -----------------------------
const html = document.documentElement;

const usernameInput = document.getElementById("usernameInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const themeToggle = document.getElementById("themeToggle");

const statusEl = document.getElementById("status");
const profileWrap = document.getElementById("profileWrap");
const reposWrap = document.getElementById("reposWrap");
const repoMeta = document.getElementById("repoMeta");
const rateInfo = document.getElementById("rateInfo");

const repoSearch = document.getElementById("repoSearch");
const sortSelect = document.getElementById("sortSelect");
const topSelect = document.getElementById("topSelect");

const repoModalOverlay = document.getElementById("repoModalOverlay");
const modalCloseBtn = document.getElementById("modalCloseBtn");

const modalRepoName = document.getElementById("modalRepoName");
const modalRepoDesc = document.getElementById("modalRepoDesc");
const modalLang = document.getElementById("modalLang");
const modalStars = document.getElementById("modalStars");
const modalForks = document.getElementById("modalForks");
const modalIssues = document.getElementById("modalIssues");
const modalWatchers = document.getElementById("modalWatchers");
const modalUpdated = document.getElementById("modalUpdated");

const modalOpenBtn = document.getElementById("modalOpenBtn");
const modalCopyCloneBtn = document.getElementById("modalCopyCloneBtn");

const heatmapWrap = document.getElementById("heatmapWrap");



const langCanvas = document.getElementById("langChart");
let langChart = null;

// Store repos in memory for filtering/sorting without refetch
let CURRENT_REPOS = [];
let CURRENT_USER = null;

// -----------------------------
// Helpers
// -----------------------------
function setStatus(type, text) {
  statusEl.innerHTML = text ? `<div class="${type}">${text}</div>` : "";
}

// -----------------------------
// Analytics
// -----------------------------
function computeInsights(repos) {
  const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
  const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0);

  const mostStarred = repos.reduce((best, r) => {
    if (!best) return r;
    return r.stargazers_count > best.stargazers_count ? r : best;
  }, null);

  const mostForked = repos.reduce((best, r) => {
    if (!best) return r;
    return r.forks_count > best.forks_count ? r : best;
  }, null);

  return { totalStars, totalForks, mostStarred, mostForked };
}

async function computeLanguageTotals(username, repos) {
  // Take top repos by stars for language calculation (avoids rate limit)
  const top = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5); // ✅ reduced to 5 (rate limit safe)

  const totals = {};

  for (const repo of top) {
    const langs = await fetchRepoLanguages(username, repo.name, rateInfo);
    for (const lang in langs) {
      totals[lang] = (totals[lang] || 0) + langs[lang];
    }
  }

  return totals;
}

// -----------------------------
// Repo Handling
// -----------------------------
function updateRepoUI() {
  const query = repoSearch.value.trim();
  const sortBy = sortSelect.value;
  const topN = Number(topSelect.value);

  const repos = getFilteredRepos(CURRENT_REPOS, query, sortBy, topN);
  renderRepos(reposWrap, repoMeta, repos, CURRENT_REPOS.length, openRepoModal);
}

// -----------------------------
// Main Flow
// -----------------------------
async function analyze(username) {
  if (!username) return;

  setStatus("loading", "Loading profile…");
  profileWrap.innerHTML = "";
  reposWrap.innerHTML = "";
  repoMeta.textContent = "";
  rateInfo.textContent = "";

  try {
    setURLUser(username);

    const [user, repos] = await Promise.all([
      fetchUser(username, rateInfo),
      fetchRepos(username, rateInfo),
    ]);

    CURRENT_USER = user;
    CURRENT_REPOS = Array.isArray(repos) ? repos : [];

    const insights = computeInsights(CURRENT_REPOS);
    renderProfile(profileWrap, user, insights);

    updateRepoUI();

    setStatus("loading", "Calculating language stats…");
    const langTotals = await computeLanguageTotals(username, CURRENT_REPOS);

    langChart = renderLangChart(langChart, langCanvas, langTotals);

    setStatus("ok", `Loaded @${user.login} successfully ✅`);
  } catch (err) {
    setStatus("err", `❌ ${err.message}`);
  }
  loadHeatmap(username);

}

// -----------------------------
// Theme
// -----------------------------
function loadTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    html.setAttribute("data-theme", saved);
  }
}

function toggleTheme() {
  const current = html.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

// -----------------------------
// Events
// -----------------------------
analyzeBtn.addEventListener("click", () => analyze(usernameInput.value.trim()));

usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") analyze(usernameInput.value.trim());
});

repoSearch.addEventListener("input", updateRepoUI);
sortSelect.addEventListener("change", updateRepoUI);
topSelect.addEventListener("change", updateRepoUI);

themeToggle.addEventListener("click", toggleTheme);

// -----------------------------
// Boot
// -----------------------------
loadTheme();

const urlUser = getURLUser();
if (urlUser) {
  usernameInput.value = urlUser;
  analyze(urlUser);
} else {
  // ✅ remove default auto-call to save rate limit
  // usernameInput.value = "torvalds";
  // analyze("torvalds");
}

function openRepoModal(repo) {
  modalRepoName.textContent = repo.name;
  modalRepoDesc.textContent = repo.description || "No description.";

  modalLang.textContent = repo.language ? `🧠 ${repo.language}` : "🧠 N/A";
  modalStars.textContent = `⭐ Stars: ${repo.stargazers_count}`;
  modalForks.textContent = `🍴 Forks: ${repo.forks_count}`;
  modalIssues.textContent = `🐞 Issues: ${repo.open_issues_count}`;
  modalWatchers.textContent = `👀 Watchers: ${repo.watchers_count}`;
  modalUpdated.textContent = `🕒 Updated: ${new Date(repo.updated_at).toLocaleDateString()}`;

  modalOpenBtn.href = repo.html_url;

  modalCopyCloneBtn.onclick = async () => {
    await navigator.clipboard.writeText(repo.clone_url);
    modalCopyCloneBtn.textContent = "Copied ✅";
    setTimeout(() => (modalCopyCloneBtn.textContent = "Copy Clone URL"), 1200);
  };

  repoModalOverlay.classList.remove("hidden");
}

function closeRepoModal() {
  repoModalOverlay.classList.add("hidden");
}

modalCloseBtn.addEventListener("click", closeRepoModal);
repoModalOverlay.addEventListener("click", (e) => {
  if (e.target === repoModalOverlay) closeRepoModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeRepoModal();
});

async function loadHeatmap(username) {
  heatmapWrap.textContent = "Loading…";

  try {
    const res = await fetch(`https://github.com/users/${username}/contributions`);
    const svg = await res.text();

    // Wrap SVG
    heatmapWrap.innerHTML = svg;

    // Optional: remove huge footer text inside svg
    const txt = heatmapWrap.querySelector("text");
    if (txt) txt.remove();
  } catch {
    heatmapWrap.textContent = "Failed to load heatmap.";
  }
}
