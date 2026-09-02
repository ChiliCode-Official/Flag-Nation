import { firebaseConfig, adminEmails } from "./firebase-config.js";
import { predefinedTeams } from "./teams.js";

const $ = (id) => document.getElementById(id);
const state = { db: null, auth: null, user: null, teams: [], games: [], unsubscribe: [] };
const message = (id, text, error = false) => { const el = $(id); el.textContent = text; el.style.color = error ? "#ff8c61" : ""; };
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;" })[char]);

function localDate(value) {
  if (!value) return "Sin fecha";
  const date = value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function toInputDate(value) {
  if (!value) return "";
  const date = value.toDate ? value.toDate() : new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function showDashboard() {
  $("auth-view").classList.add("hidden");
  $("dashboard-view").classList.remove("hidden");
  $("admin-name").textContent = state.user.displayName || state.user.email;
}

function showAuth(text = "") {
  $("dashboard-view").classList.add("hidden");
  $("auth-view").classList.remove("hidden");
  message("auth-message", text);
}

function teamName(id) {
  return state.teams.find(team => team.id === id)?.name || "Equipo no disponible";
}

function populateTeamSelects() {
  const options = ['<option value="">Selecciona un equipo</option>', ...state.teams.filter(team => team.active).map(team => `<option value="${escapeHtml(team.id)}">${escapeHtml(team.name)}</option>`)].join("");
  $("home-team").innerHTML = options;
  $("away-team").innerHTML = options;
}

function renderTeams() {
  $("teams-list").innerHTML = state.teams.map(team => `
    <article class="card team-card">
      <img class="team-logo" src="${escapeHtml(team.logoUrl || "../assets/images/flagnation-logo.png")}" alt="">
      <div><h3>${escapeHtml(team.name)}</h3><p>${escapeHtml(team.shortName)} · ${team.active ? "Activo" : "Inactivo"}</p></div>
      <div class="card-actions"><button class="icon-button" data-edit-team="${escapeHtml(team.id)}" type="button">Editar</button></div>
    </article>`).join("") || "<p class=\"hint\">Aún no hay equipos. Carga los predefinidos o crea uno.</p>";
  document.querySelectorAll("[data-edit-team]").forEach(button => button.addEventListener("click", () => openTeam(button.dataset.editTeam)));
}

function renderGames() {
  $("games-list").innerHTML = state.games.map(game => `
    <article class="card game-card">
      <div><p class="status">${escapeHtml(game.status || "scheduled")} · ${game.published ? "Publicado" : "Oculto"}</p><h3>${escapeHtml(teamName(game.homeTeamId))} ${game.homeScore ?? "-"} · ${game.awayScore ?? "-"} ${escapeHtml(teamName(game.awayTeamId))}</h3><p>${localDate(game.scheduledAt)}${game.venue ? ` · ${escapeHtml(game.venue)}` : ""}</p></div>
      <div class="card-actions"><button class="icon-button" data-edit-game="${escapeHtml(game.id)}" type="button">Editar</button><button class="icon-button" data-delete-game="${escapeHtml(game.id)}" type="button">Borrar</button></div>
    </article>`).join("") || "<p class=\"hint\">No hay partidos registrados.</p>";
  document.querySelectorAll("[data-edit-game]").forEach(button => button.addEventListener("click", () => openGame(button.dataset.editGame)));
  document.querySelectorAll("[data-delete-game]").forEach(button => button.addEventListener("click", () => removeGame(button.dataset.deleteGame)));
}

function openGame(id = "") {
  const game = state.games.find(item => item.id === id);
  $("game-form").reset();
  populateTeamSelects();
  $("game-id").value = game?.id || "";
  $("game-date").value = toInputDate(game?.scheduledAt);
  $("game-season").value = game?.season || "2026";
  $("home-team").value = game?.homeTeamId || "";
  $("away-team").value = game?.awayTeamId || "";
  $("game-status").value = game?.status || "scheduled";
  $("game-venue").value = game?.venue || "";
  $("home-score").value = game?.homeScore ?? "";
  $("away-score").value = game?.awayScore ?? "";
  $("game-published").checked = game?.published ?? true;
  $("game-form-wrap").classList.remove("hidden");
  $("game-date").focus();
}

function openTeam(id = "") {
  const team = state.teams.find(item => item.id === id);
  $("team-form").reset();
  $("team-id").value = team?.id || "";
  $("team-name").value = team?.name || "";
  $("team-short-name").value = team?.shortName || "";
  $("team-logo").value = team?.logoUrl || "";
  $("team-active").checked = team?.active ?? true;
  $("team-form-wrap").classList.remove("hidden");
  $("team-name").focus();
}

async function saveGame(event) {
  event.preventDefault();
  const homeTeamId = $("home-team").value;
  const awayTeamId = $("away-team").value;
  if (homeTeamId === awayTeamId) return message("games-message", "El equipo local y visitante deben ser distintos.", true);
  const date = new Date($("game-date").value);
  if (Number.isNaN(date.getTime())) return message("games-message", "La fecha no es válida.", true);
  const { doc, setDoc, serverTimestamp, Timestamp } = state.firebase;
  const id = $("game-id").value || crypto.randomUUID();
  const score = (field) => $(field).value === "" ? null : Number($(field).value);
  const payload = { season: $("game-season").value.trim(), scheduledAt: Timestamp.fromDate(date), homeTeamId, awayTeamId, status: $("game-status").value, venue: $("game-venue").value.trim(), homeScore: score("home-score"), awayScore: score("away-score"), published: $("game-published").checked, updatedAt: serverTimestamp(), updatedBy: state.user.uid };
  try { await setDoc(doc(state.db, "games", id), payload, { merge: true }); $("game-form-wrap").classList.add("hidden"); message("games-message", "Partido guardado."); } catch (error) { message("games-message", error.message, true); }
}

async function removeGame(id) {
  if (!window.confirm("¿Eliminar este partido? Esta acción no se puede deshacer.")) return;
  try { await state.firebase.deleteDoc(state.firebase.doc(state.db, "games", id)); message("games-message", "Partido eliminado."); } catch (error) { message("games-message", error.message, true); }
}

async function saveTeam(event) {
  event.preventDefault();
  const { doc, setDoc, serverTimestamp } = state.firebase;
  const id = $("team-id").value || $("team-name").value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!id) return message("teams-message", "Escribe un nombre válido.", true);
  const payload = { name: $("team-name").value.trim(), shortName: $("team-short-name").value.trim().toUpperCase(), logoUrl: $("team-logo").value.trim(), active: $("team-active").checked, updatedAt: serverTimestamp(), updatedBy: state.user.uid };
  try { await setDoc(doc(state.db, "teams", id), payload, { merge: true }); $("team-form-wrap").classList.add("hidden"); message("teams-message", "Equipo guardado."); } catch (error) { message("teams-message", error.message, true); }
}

async function seedTeams() {
  const { doc, getDoc, setDoc, serverTimestamp } = state.firebase;
  try { for (const team of predefinedTeams) { const ref = doc(state.db, "teams", team.id); if (!(await getDoc(ref)).exists()) await setDoc(ref, { ...team, updatedAt: serverTimestamp(), updatedBy: state.user.uid }); } message("teams-message", "Equipos predefinidos cargados."); } catch (error) { message("teams-message", error.message, true); }
}

function subscribeData() {
  const { collection, onSnapshot, orderBy, query } = state.firebase;
  state.unsubscribe.forEach(stop => stop());
  state.unsubscribe = [
    onSnapshot(query(collection(state.db, "teams"), orderBy("name")), snapshot => { state.teams = snapshot.docs.map(item => ({ id: item.id, ...item.data() })); populateTeamSelects(); renderTeams(); renderGames(); }),
    onSnapshot(query(collection(state.db, "games"), orderBy("scheduledAt", "desc")), snapshot => { state.games = snapshot.docs.map(item => ({ id: item.id, ...item.data() })); renderGames(); })
  ];
}

async function start() {
  if (!firebaseConfig) { $("sign-in").disabled = true; showAuth("Falta configurar Firebase. Agrega el objeto de configuración en admin/firebase-config.js."); return; }
  const [appModule, authModule, storeModule] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
  ]);
  const app = appModule.initializeApp(firebaseConfig);
  state.auth = authModule.getAuth(app); state.db = storeModule.getFirestore(app); state.firebase = { ...authModule, ...storeModule };
  $("sign-in").addEventListener("click", async () => { try { await authModule.signInWithPopup(state.auth, new authModule.GoogleAuthProvider()); } catch (error) { message("auth-message", error.message, true); } });
  $("sign-out").addEventListener("click", () => authModule.signOut(state.auth));
  authModule.onAuthStateChanged(state.auth, async user => {
    state.user = user;
    if (!user) return showAuth();
    if (adminEmails.length && !adminEmails.includes(user.email)) { await authModule.signOut(state.auth); return showAuth("Tu correo no está autorizado."); }
    try { const role = await storeModule.getDoc(storeModule.doc(state.db, "admins", user.uid)); if (!role.exists()) { await authModule.signOut(state.auth); return showAuth("Tu cuenta aún no tiene rol de administrador."); } showDashboard(); subscribeData(); } catch { await authModule.signOut(state.auth); showAuth("No fue posible validar tu rol de administrador."); }
  });
}

$("new-game").addEventListener("click", () => openGame()); $("cancel-game").addEventListener("click", () => $("game-form-wrap").classList.add("hidden")); $("game-form").addEventListener("submit", saveGame);
$("new-team").addEventListener("click", () => openTeam()); $("cancel-team").addEventListener("click", () => $("team-form-wrap").classList.add("hidden")); $("team-form").addEventListener("submit", saveTeam); $("seed-teams").addEventListener("click", seedTeams);
document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => { document.querySelectorAll(".tab").forEach(item => item.classList.toggle("is-active", item === tab)); $("games-panel").classList.toggle("hidden", tab.dataset.panel !== "games"); $("teams-panel").classList.toggle("hidden", tab.dataset.panel !== "teams"); }));
start().catch(error => showAuth(`No se pudo cargar Firebase: ${error.message}`));
