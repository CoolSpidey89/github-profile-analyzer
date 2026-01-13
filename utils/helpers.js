// utils/helpers.js
export const fmt = new Intl.NumberFormat();

export function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function compactStr(s, max = 120) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function getURLUser() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

export function setURLUser(username) {
  const params = new URLSearchParams(window.location.search);
  params.set("user", username);
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
}
