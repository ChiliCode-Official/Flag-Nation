import { firebaseConfig } from "../admin/firebase-config.js";

const FIREBASE_VERSION = "10.12.2";
const state = { teams: new Map(), games: [], firebase: null };

function loadModule(name) {
  return import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-${name}.js`);
}

function asDate(value) {
  if (!value) return null;
  return value.toDate ? value.toDate() : new Date(value);
}

function formatScore(value) {
  return Number.isFinite(value) ? value : "—";
}

function team(id) {
  return state.teams.get(id) || { name: "Equipo", shortName: "—", logoUrl: "" };
}

function renderGames() {
  const root = document.querySelector('[aria-label="Upcoming kraQen matches"]');
  if (!root || !state.games.length) return;
  const games = state.games.filter(game => game.published !== false).slice(0, 6);
  const cards = games.map(game => {
    const home = team(game.homeTeamId);
    const away = team(game.awayTeamId);
    return `<article class="live-game-card" data-status="${game.status || "scheduled"}">
      <div class="live-game-team"><img src="${home.logoUrl || "./assets/images/flagnation-logo.png"}" alt=""><strong>${home.shortName || home.name}</strong></div>
      <div class="live-game-score"><span>${formatScore(game.homeScore)} : ${formatScore(game.awayScore)}</span><small>${game.status === "live" ? "EN VIVO" : game.status === "final" ? "FINAL" : "PRÓXIMO"}</small></div>
      <div class="live-game-team"><img src="${away.logoUrl || "./assets/images/flagnation-logo.png"}" alt=""><strong>${away.shortName || away.name}</strong></div>
    </article>`;
  }).join("");
  let marker = root.querySelector(".live-games-list");
  if (!marker) { marker = document.createElement("div"); marker.className = "live-games-list"; root.appendChild(marker); }
  marker.innerHTML = cards;
}

function updateCountdown() {
  const next = state.games.filter(game => game.published !== false && game.status === "scheduled")
    .map(game => ({ game, date: asDate(game.scheduledAt) })).filter(item => item.date && item.date > new Date())
    .sort((a, b) => a.date - b.date)[0];
  const countdown = document.querySelector("[data-live-countdown]");
  if (!countdown || !next) return;
  const diff = Math.max(0, next.date - new Date());
  const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
  countdown.querySelectorAll("[data-unit]").forEach((element, index) => { element.textContent = String(values[index]).padStart(2, "0"); });
}

async function start() {
  if (!firebaseConfig) return;
  const root = document.querySelector('[aria-label="Upcoming kraQen matches"]');
  if (root && !root.querySelector("[data-live-countdown]")) {
    const countdown = document.createElement("div");
    countdown.className = "live-countdown";
    countdown.setAttribute("data-live-countdown", "true");
    countdown.innerHTML = '<span data-unit>00</span><b>:</b><span data-unit>00</span><b>:</b><span data-unit>00</span><b>:</b><span data-unit>00</span>';
    root.prepend(countdown);
  }
  const [{ initializeApp }, { getFirestore, collection, onSnapshot, orderBy, query }] = await Promise.all([loadModule("app"), loadModule("firestore")]);
  const db = getFirestore(initializeApp(firebaseConfig));
  onSnapshot(query(collection(db, "teams"), orderBy("name")), snapshot => {
    state.teams = new Map(snapshot.docs.map(item => [item.id, { id: item.id, ...item.data() }]));
    renderGames();
  });
  onSnapshot(query(collection(db, "games"), orderBy("scheduledAt", "asc")), snapshot => {
    state.games = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderGames();
    updateCountdown();
  });
  window.setInterval(updateCountdown, 1000);
}

document.addEventListener("DOMContentLoaded", () => { start().catch(() => {}); });
