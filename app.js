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

  initRepoScrollReveal();
}

// -----------------------------
// Main Flow
// -----------------------------
function showSkeleton() {
  // Profile skeleton
  profileWrap.innerHTML = `
    <div class="card">
      <div class="skeleton skelBig"></div>
      <div class="skeleton skelLine" style="width:70%"></div>
      <div class="skeleton skelLine" style="width:55%"></div>
      <div class="skeleton skelLine" style="width:40%"></div>
    </div>

    <div class="card">
      <div class="skeleton skelMed"></div>
      <div class="skeleton skelLine" style="width:90%"></div>
      <div class="skeleton skelLine" style="width:70%"></div>
    </div>
  `;

  // Repo skeleton
  reposWrap.innerHTML = `
    <div class="repoItem"><div class="skeleton skelLine" style="width:65%"></div></div>
    <div class="repoItem"><div class="skeleton skelLine" style="width:80%"></div></div>
    <div class="repoItem"><div class="skeleton skelLine" style="width:60%"></div></div>
    <div class="repoItem"><div class="skeleton skelLine" style="width:75%"></div></div>
  `;

  repoMeta.textContent = "Loading repositories...";
}
function triggerShineOnProfile() {
  // Shine only on profileWrap section after data loads
  profileWrap.classList.add("shineOnce");

  // remove class so it can be triggered again on next search
  setTimeout(() => {
    profileWrap.classList.remove("shineOnce");
  }, 1200);
}

async function analyze(username) {
  if (!username) return;

  setStatus("loading", "Loading profile…");
  showSkeleton();

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
    triggerShineOnProfile();


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

export async function loadHeatmap(username) {
  const wrap = document.getElementById("heatmapWrap");

  try {
    const res = await fetch(`/api/github?url=https://github.com/users/${username}/contributions`);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const svg = doc.querySelector("svg");

    if (svg) {
      wrap.innerHTML = "";
      wrap.appendChild(svg);
    } else {
      wrap.textContent = "No contribution data available.";
    }

  } catch (err) {
    wrap.textContent = "Failed to load heatmap.";
  }
}

function initRepoScrollReveal() {
  const target = reposWrap; // container of repos

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // ✅ reveal each repo one by one
        const items = target.querySelectorAll(".repoItem");
        items.forEach((item) => {
          const i = Number(item.dataset.index || 0);
          item.style.animationDelay = `${Math.min(i * 70, 700)}ms`;
          item.classList.add("reveal");
        });

        observer.disconnect(); // reveal only once
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(target);
}

const spotlight = document.getElementById("spotlight");
window.addEventListener("mousemove", (e) => {
  spotlight.style.left = e.clientX + "px";
  spotlight.style.top = e.clientY + "px";
});

function enableTilt() {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateY = ((x / rect.width) - 0.5) * 10;
      const rotateX = ((y / rect.height) - 0.5) * -10;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}
enableTilt();

const typing = document.getElementById("typing");
const text = "GitHub Analyzer";
let i = 0;

function typeLoop() {
  typing.textContent = text.slice(0, i);

  // typing forward
  if (i < text.length) {
    i++;
    setTimeout(typeLoop, 110); // typing speed
  } else {
    // pause AFTER completing full text
    setTimeout(() => {
      i = 0;
      typing.textContent = "";
      setTimeout(typeLoop, 400); // pause before retyping
    }, 1500); // pause when full text is displayed
  }
}

typeLoop();

function magneticButtons() {
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}
magneticButtons();

const progressBar = document.getElementById("progressBar");
window.addEventListener("scroll", () => {
  const scroll = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${(scroll / height) * 100}%`;
});



