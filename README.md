# GitHub Analyzer 🚀

A **premium GitHub Profile Analyzer** built using **Vanilla JavaScript + GitHub REST API**.  
It fetches user profile + repositories, computes insights, shows language breakdown, and displays a GitHub-style contributions heatmap — all inside a smooth, animated UI.

> ⚡ Built for a clean dashboard experience with micro-interactions, animations, caching & modern UI effects.

---

## ✨ Features

### 🔎 Profile & Repo Insights
- Fetch GitHub **user profile details**
- Fetch up to **100 public repositories**
- Displays:
  - Followers / Following / Public repos
  - Total Stars ⭐ and Total Forks 🍴
  - Most starred repo 🏆
  - Most forked repo

### 📊 Language Analytics
- Language distribution chart (Pie chart using **Chart.js**)
- Based on top starred repositories to reduce API calls

### 🧩 Repo Controls
- Search repo by name
- Sort repos by:
  - Stars ⭐
  - Forks 🍴
  - Recently Updated 🕒
  - Name (A–Z)

### 🔥 Contribution Heatmap
- GitHub contributions graph (last 12 months)
- Pulled from GitHub contributions endpoint and displayed directly

### ⚡ Performance & UX
- **LocalStorage caching** for user + repos (faster reloads)
- **Rate-limit indicator** displayed in UI
- Skeleton loading UI
- Advanced UI polish:
  - Card hover shine ✨
  - Scroll progress bar
  - Magnetic buttons
  - Cursor spotlight glow
  - Smooth fade transitions

### 🌙 Theme
- Dark/Light theme toggle (persisted in localStorage)

---

## 🧱 Tech Stack

- **HTML5**
- **CSS3** (animations + glassmorphism + effects)
- **JavaScript (ES Modules)**
- **GitHub REST API**
- **Chart.js**

---

