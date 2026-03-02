const APP_KEY = "blockbyte.v1";
const appEl = document.getElementById("app");
const toastsEl = document.getElementById("toasts");

function todayISO() {
  // local date (no timezone conversion)
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const defaultState = {
  nickname: "",
  ageMode: "8-11", // "8-11" | "12-16"
  xp: 0,
  level: 1,
  streak: { count: 0, lastDay: "" },
  badges: {},
  lessons: {} // key: "track:lessonId" -> { status, checkpoints }
};

export const state = loadState();

export function saveState() {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
  updateHud();
}

function loadState() {
  try {
    const raw = localStorage.getItem(APP_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

export function toast(title, msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<div class="toast__title">${escapeHtml(title)}</div>
                  <div class="toast__msg">${escapeHtml(msg)}</div>`;
  toastsEl.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

export function awardXP(amount, reason = "") {
  const beforeLevel = state.level;
  state.xp += Math.max(0, amount);

  // Simple level curve: nextLevelXP = level * 120
  while (state.xp >= state.level * 120) {
    state.level += 1;
  }

  bumpStreak();

  saveState();

  if (state.level > beforeLevel) {
    toast("Level Up!", `You reached Level ${state.level}${reason ? ` • ${reason}` : ""}`);
  } else if (amount > 0) {
    toast("+XP", `+${amount} XP${reason ? ` • ${reason}` : ""}`);
  }
}

export function earnBadge(badgeId, name) {
  if (state.badges[badgeId]) return;
  state.badges[badgeId] = { earnedAt: todayISO(), name };
  saveState();
  toast("Badge Unlocked!", name);
}

function bumpStreak() {
  const t = todayISO();
  if (state.streak.lastDay === t) return;

  // gentle streak: increment if yesterday or empty; otherwise reset to 1 with friendly copy elsewhere
  const last = state.streak.lastDay;
  state.streak.lastDay = t;

  if (!last) {
    state.streak.count = 1;
    return;
  }

  const lastDate = new Date(last + "T00:00:00");
  const nowDate = new Date(t + "T00:00:00");
  const diffDays = Math.round((nowDate - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) state.streak.count += 1;
  else state.streak.count = 1;
}

function updateHud() {
  document.getElementById("hudLevel").textContent = `Lv ${state.level}`;
  document.getElementById("hudXp").textContent = `${state.xp} XP`;
  document.getElementById("ageChip").textContent =
    state.ageMode === "8-11" ? "Explorer 8–11" : "Builder 12–16";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

/* Router */
function parseRoute() {
  const hash = location.hash || "#/";
  const path = hash.replace(/^#/, "");
  const parts = path.split("/").filter(Boolean);
  return { path, parts };
}

function render() {
  const { parts } = parseRoute();

  // Home
  if (parts.length === 0) {
    appEl.innerHTML = homeScreen();
    appEl.focus();
    updateHud();
    return;
  }

  // /dashboard
  if (parts[0] === "dashboard") {
    renderDashboard(appEl, { state, awardXP, earnBadge, toast, navigate });
    appEl.focus();
    updateHud();
    return;
  }

  // /lesson/:track/:lessonId
  if (parts[0] === "lesson" && parts.length >= 3) {
    renderLesson(appEl, {
      state, awardXP, earnBadge, toast, navigate,
      track: parts[1], lessonId: parts[2]
    });
    appEl.focus();
    updateHud();
    return;
  }

  // /playground/terminal
  if (parts[0] === "playground" && parts[1] === "terminal") {
    renderTerminal(appEl, { state, awardXP, earnBadge, toast });
    appEl.focus();
    updateHud();
    return;
  }

  // /playground/python (placeholder)
  if (parts[0] === "playground" && parts[1] === "python") {
    appEl.innerHTML = pythonPlaceholder();
    appEl.focus();
    updateHud();
    return;
  }

  // /parents
  if (parts[0] === "parents") {
    appEl.innerHTML = parentsScreen();
    appEl.focus();
    updateHud();
    return;
  }

  // /settings
  if (parts[0] === "settings") {
    appEl.innerHTML = settingsScreen();
    appEl.focus();
    updateHud();
    return;
  }

  appEl.innerHTML = notFoundScreen();
  appEl.focus();
  updateHud();
}

export function navigate(path) {
  location.hash = path.startsWith("#") ? path : `#${path}`;
}

/* Global actions */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === "toggleAgeMode") {
    state.ageMode = state.ageMode === "8-11" ? "12-16" : "8-11";
    saveState();
    render();
  }

  if (action === "resetAll") {
    const ok = confirm("Reset all local progress on this device? This cannot be undone.");
    if (!ok) return;
    Object.assign(state, structuredClone(defaultState));
    saveState();
    toast("Reset complete", "Local progress cleared.");
    navigate("/"); // go home
  }

  if (action === "start") navigate("/dashboard");
});

window.addEventListener("hashchange", render);
render();
updateHud();

/* Screens (inline minimal) */
function homeScreen() {
  const modeTitle = state.ageMode === "8-11" ? "Explorer Mode (8–11)" : "Builder Mode (12–16)";
  const modeBlurb = state.ageMode === "8-11"
    ? "Short quests. Big icons. Extra hints."
    : "More detail. Real vocabulary. Still fun.";

  return `
    <section class="grid grid--2">
      <div class="card">
        <h1 class="card__title">Learn IT + Python + Bash like a game.</h1>
        <p class="card__muted">Quests, badges, and level-ups — with local-only progress and kid-safe design.</p>
        <div class="stack">
          <div class="pill">${modeTitle} • ${modeBlurb}</div>
          <div class="row">
            <button class="btn btn--primary" data-action="start" type="button">Start Your First Quest</button>
            <a class="btn btn--ghost" href="#/settings">Settings</a>
          </div>
        </div>
        <hr class="sep" />
        <div class="card__muted">
          <strong>Privacy:</strong> no accounts, no chat, no public profiles. Optional nickname is stored only on this device.
        </div>
      </div>

      <div class="card">
        <h2 class="card__title">Pick a track</h2>
        <div class="grid grid--3">
          ${trackTile("IT Basics", "Build computer superpowers.", "/dashboard")}
          ${trackTile("Python", "Make programs and mini-games.", "/playground/python")}
          ${trackTile("Bash", "Terminal ninja skills.", "/playground/terminal")}
        </div>
        <p class="card__muted" style="margin-top:12px">
          Tip: Use <kbd class="k">Tab</kbd> and <kbd class="k">Enter</kbd> — everything works with keyboard too.
        </p>
      </div>
    </section>
  `;
}

function trackTile(title, desc, link) {
  return `
    <a class="card card--flat" href="#${link}" style="text-decoration:none">
      <div class="pill">${escapeHtml(title)}</div>
      <div style="margin-top:10px; font-weight:900">${escapeHtml(desc)}</div>
      <div class="card__muted" style="margin-top:6px">Open →</div>
    </a>
  `;
}

function pythonPlaceholder() {
  const copy = state.ageMode === "8-11"
    ? "This is a mock playground for now. You’ll still earn XP with challenges."
    : "This is a simulated runner (no real execution yet). Perfect for practicing patterns.";

  return `
    <section class="grid grid--2">
      <div class="card">
        <h1 class="card__title">Python Playground</h1>
        <p class="card__muted">${copy}</p>
        <div class="stack">
          <div class="pill">Output is labeled: Simulated</div>
          <a class="btn btn--primary" href="#/dashboard">Back to Dashboard</a>
        </div>
      </div>
      <div class="card">
        <h2 class="card__title">Challenge</h2>
        <p class="card__muted">Make the program print: <strong>Hello, BlockByte!</strong></p>
        <div class="terminal" aria-label="Mock editor">
          <div class="terminal__log">print("Hello, BlockByte!")</div>
        </div>
        <button class="btn btn--primary" style="margin-top:12px" type="button"
          onclick="window.__blockbyteAward?.()">Run (Simulated)</button>
      </div>
    </section>
    <script>
      window.__blockbyteAward = () => {
        // lightweight bridge
        alert("Simulated Output:\\nHello, BlockByte!");
        location.hash = "#/dashboard";
      };
    </script>
  `;
}

function parentsScreen() {
  const totalLessons = Object.keys(state.lessons).length;
  const completed = Object.values(state.lessons).filter(l => l.status === "completed").length;
  const pct = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
  const streakLine = state.streak.count ? `${state.streak.count} day(s) learned` : "No streak yet (and that’s okay).";

  return `
    <section class="grid grid--2">
      <div class="card">
        <h1 class="card__title">Parent/Teacher View</h1>
        <p class="card__muted">Local-only summary for this device.</p>
        <div class="stack">
          <div class="pill">Overall completion: ${pct}%</div>
          <div class="pill">Level: ${state.level} • XP: ${state.xp}</div>
          <div class="pill">Streak: ${escapeHtml(streakLine)}</div>
        </div>
        <hr class="sep" />
        <button class="btn btn--secondary" type="button" onclick="window.print()">Print Report</button>
      </div>

      <div class="card">
        <h2 class="card__title">Recommended next</h2>
        <ul class="card__muted">
          <li>IT: “Ports & Cables”</li>
          <li>Bash: “pwd, ls, cd”</li>
          <li>Python: “Print & Variables”</li>
        </ul>
        <p class="card__muted">Tip: small sessions (5–10 minutes) beat long cramming.</p>
      </div>
    </section>
  `;
}

function settingsScreen() {
  return `
    <section class="grid grid--2">
      <div class="card">
        <h1 class="card__title">Settings</h1>
        <label class="card__muted" for="nick">Nickname (optional, stored only on this device)</label>
        <input class="input" id="nick" maxlength="16" placeholder="e.g., ByteNinja" value="${state.nickname || ""}" />
        <div class="row" style="margin-top:12px">
          <button class="btn btn--primary" type="button" onclick="window.__saveNick()">Save</button>
          <a class="btn btn--ghost" href="#/">Back</a>
        </div>
        <p class="card__muted" style="margin-top:10px">No emails, no logins, no cloud sync.</p>
      </div>
      <div class="card">
        <h2 class="card__title">Age mode</h2>
        <p class="card__muted">Explorer explains more with examples. Builder uses more real terms.</p>
        <button class="btn btn--secondary" data-action="toggleAgeMode" type="button">Switch Age Mode</button>
      </div>
    </section>

    <script>
      window.__saveNick = () => {
        const v = document.getElementById("nick").value.trim();
        // save via localStorage key directly (simple no-import bridge)
        const raw = localStorage.getItem("${APP_KEY}");
        const obj = raw ? JSON.parse(raw) : {};
        obj.nickname = v;
        localStorage.setItem("${APP_KEY}", JSON.stringify(obj));
        alert("Saved locally.");
        location.hash = "#/dashboard";
      };
    </script>
  `;
}

function notFoundScreen() {
  return `
    <div class="card">
      <h1 class="card__title">Lost in the overworld</h1>
      <p class="card__muted">That page doesn’t exist. Try the dashboard.</p>
      <a class="btn btn--primary" href="#/dashboard">Go to Dashboard</a>
    </div>
  `;
}
// --- Inline screens (no imports needed) ---
function renderDashboard(mount, api) {
  mount.innerHTML = `
    <section class="grid grid--2">
      <div class="card">
        <h1 class="card__title">Dashboard</h1>
        <p class="card__muted">Pick a quest to start earning XP.</p>
        <div class="row" style="flex-wrap:wrap; justify-content:flex-start; gap:10px">
          <a class="btn btn--secondary" href="#/lesson/it/it_parts_1">IT Quest</a>
          <a class="btn btn--secondary" href="#/lesson/bash/sh_nav_1">Bash Quest</a>
          <a class="btn btn--secondary" href="#/lesson/py/py_vars_1">Python Quest</a>
        </div>
      </div>
      <div class="card">
        <h2 class="card__title">Your stats</h2>
        <div class="pill">Level: ${api.state.level}</div>
        <div class="pill" style="margin-top:10px">XP: ${api.state.xp}</div>
      </div>
    </section>
  `;
}

function renderLesson(mount, api) {
  const { track, lessonId, state } = api;
  const age = state.ageMode;

  const title =
    track === "it" ? "Meet the Computer Crew" :
    track === "bash" ? "Terminal Ninja Moves" :
    "Print & Variables";

  mount.innerHTML = `
    <section class="card">
      <div class="row">
        <div class="pill">${track.toUpperCase()}</div>
        <div class="pill">${age === "8-11" ? "Explorer" : "Builder"} Mode</div>
      </div>
      <h1 class="card__title" style="margin-top:10px">${title} (${lessonId})</h1>
      <p class="card__muted">This is a minimal inline lesson. If you see this, routing works.</p>

      <hr class="sep" />
      <button class="btn btn--primary" type="button" id="finishBtn">Finish Quest (+30 XP)</button>
      <a class="btn btn--ghost" href="#/dashboard" style="margin-left:10px">Back</a>
    </section>
  `;

  mount.querySelector("#finishBtn").addEventListener("click", () => {
    api.awardXP(30, "Quest complete");
    api.navigate("/dashboard");
  });
}

function renderTerminal(mount, api) {
  mount.innerHTML = `
    <section class="grid grid--2">
      <div class="card">
        <h1 class="card__title">Terminal Trainer</h1>
        <p class="card__muted">Type <span style="font-family:var(--mono)">pwd</span> to earn XP (simulated).</p>
      </div>
      <div class="card">
        <div class="terminal">
          <div class="terminal__log" id="tlog">Simulated terminal ready.</div>
          <div class="terminal__row">
            <span class="terminal__prompt">$</span>
            <input class="terminal__input" id="tinput" placeholder="Try: pwd" />
            <button class="btn btn--primary" id="tsend" type="button">Send</button>
          </div>
        </div>
      </div>
    </section>
  `;

  const log = mount.querySelector("#tlog");
  const input = mount.querySelector("#tinput");
  mount.querySelector("#tsend").addEventListener("click", () => run());
  input.addEventListener("keydown", (e) => e.key === "Enter" && run());

  function run() {
    const cmd = (input.value || "").trim();
    log.textContent += `\n$ ${cmd}`;
    if (cmd === "pwd") {
      log.textContent += `\n/home/player (simulated)`;
      api.awardXP(10, "Terminal mission");
    } else {
      log.textContent += `\nCommand not accepted in trainer mode.`;
    }
    input.value = "";
  }
}
