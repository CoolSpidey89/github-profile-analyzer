// components/profileCard.js
import { fmt, formatDate, compactStr } from "../utils/helpers.js";

export function renderProfile(profileWrap, user, insights) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="profileCard">
      <img class="avatar" src="${user.avatar_url}" alt="avatar" />
      <div class="profileInfo">
        <h2>${user.name || user.login}</h2>
        <div class="muted">@${user.login}</div>
        <div class="bio">${user.bio ? compactStr(user.bio, 220) : ""}</div>

        <div class="badges">
          <span class="badge">📍 ${user.location || "N/A"}</span>
          <span class="badge">🗓 Joined ${formatDate(user.created_at)}</span>
          <span class="badge">🔗 <a href="${user.html_url}" target="_blank">Open Profile</a></span>
        </div>

        <div class="statsRow">
          <div class="stat">
            <div class="k">Followers</div>
            <div class="v">${fmt.format(user.followers)}</div>
          </div>
          <div class="stat">
            <div class="k">Following</div>
            <div class="v">${fmt.format(user.following)}</div>
          </div>
          <div class="stat">
            <div class="k">Public Repos</div>
            <div class="v">${fmt.format(user.public_repos)}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const insightsCard = document.createElement("div");
  insightsCard.className = "card";
  insightsCard.innerHTML = `
    <div class="cardHead">
      <h2>Insights</h2>
      <p class="muted">From public repos</p>
    </div>

    <div class="statsRow">
      <div class="stat">
        <div class="k">⭐ Total Stars</div>
        <div class="v">${fmt.format(insights.totalStars)}</div>
      </div>
      <div class="stat">
        <div class="k">🍴 Total Forks</div>
        <div class="v">${fmt.format(insights.totalForks)}</div>
      </div>
      <div class="stat">
        <div class="k">🏆 Most Starred</div>
        <div class="v" style="font-size:14px;">${insights.mostStarred?.name || "—"}</div>
      </div>
    </div>

    <div style="margin-top:12px;" class="muted">
      Most Forked: <b>${insights.mostForked?.name || "—"}</b>
    </div>
  `;

  profileWrap.innerHTML = "";
  profileWrap.appendChild(card);
  profileWrap.appendChild(insightsCard);
}
