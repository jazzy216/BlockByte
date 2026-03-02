const LESSONS = {
  it: [
    { id: "it_parts_1", title: "Meet the Computer Crew", xp: 30, badge: { id: "parts_rookie", name: "Parts Rookie" } },
    { id: "it_ports_1", title: "Ports & Cables", xp: 30, badge: { id: "cable_tamer", name: "Cable Tamer" } }
  ],
  bash: [
    { id: "sh_nav_1", title: "pwd, ls, cd Ninja Moves", xp: 30, badge: { id: "folder_finder", name: "Folder Finder" } }
  ],
  py: [
    { id: "py_vars_1", title: "Print & Variables", xp: 30, badge: { id: "print_wizard", name: "Print Wizard" } }
  ]
};

export function renderDashboard(mount, api) {
  const { state } = api;
  const ageLine = state.ageMode === "8-11"
    ? "Explorer Mode: short quests + extra hints."
    : "Builder Mode: more detail + real terms.";

  mount.innerHTML = `
    <section class="grid grid--2">
      <div class="card">
        <h1 class="card__title">Dashboard</h1>
        <p class="card__muted">${ageLine}</p>

        <div class="stack">
          ${xpBar(state)}
          <div class="row">
            <span class="pill">Streak: ${streakCopy(state)}</span>
            <a class="btn btn--ghost" href="#/parents">Parent/Teacher</a>
          </div>
        </div>

        <hr class="sep" />
        <div class="row">
          <span class="pill">Badges: ${Object.keys(state.badges).length}</span>
          <a class="btn btn--secondary" href="#/settings">Settings</a>
        </div>
      </div>

      <div class="card">
        <h2 class="card__title">Choose a track</h2>
        <div class="row" style="flex-wrap:wrap; justify-content:flex-start; gap:10px">
          <a class="btn btn--secondary" href="#/dashboard?track=it">IT Basics</a>
          <a class="btn btn--secondary" href="#/dashboard?track=py">Python</a>
          <a class="btn btn--secondary" href="#/dashboard?track=bash">Bash</a>
        </div>
        <p class="card__muted" style="margin-top:10px">Tip: Finish 1 quest, then take a break. Small wins stack.</p>
      </div>
    </section>

    <section class="card" style="margin-top:12px">
      <div class="row">
        <h2 class="card__title" style="margin:0">Quests</h2>
        <span class="pill">${trackName(getTrackFromQuery())} • ${progressLine(api)}</span>
      </div>
      <div class="grid grid--3" style="margin-top:12px">
        ${questGrid(api)}
      </div>
    </section>
  `;

  function getTrackFromQuery() {
    const q = new URLSearchParams((location.hash.split("?")[1] || ""));
    return q.get("track") || "it";
  }

  function questGrid(api) {
    const track = getTrackFromQuery();
    const list = LESSONS[track] || [];
    return list.map((l) => questCard(api, track, l)).join("");
  }
}

function trackName(t) {
  return ({ it:"IT Basics", py:"Python", bash:"Bash" }[t] || "Track");
}

function lessonKey(track, id) {
  return `${track}:${id}`;
}

function questCard(api, track, lesson) {
  const { state } = api;
  const k = lessonKey(track, lesson.id);
  const entry = state.lessons[k] || { status: "available", checkpoints: {} };
  const completed = entry.status === "completed";
  const cta = completed ? "Replay" : (entry.status === "in-progress" ? "Continue" : "Start Quest");

  const statusPill = completed
    ? `<span class="pill" style="border-color:rgba(34,197,94,.6)">Completed</span>`
    : `<span class="pill">+${lesson.xp} XP</span>`;

  return `
    <a class="card card--flat" href="#/lesson/${track}/${lesson.id}" style="text-decoration:none">
      <div class="row">
        <div class="pill">${escapeHtml(trackName(track))}</div>
        ${statusPill}
      </div>
      <h3 style="margin:10px 0 6px 0">${escapeHtml(lesson.title)}</h3>
      <div class="card__muted">Badge: ${escapeHtml(lesson.badge.name)}</div>
      <div style="margin-top:12px">
        <span class="btn btn--primary" style="display:inline-block; pointer-events:none">${cta}</span>
      </div>
    </a>
  `;
}

function xpBar(state) {
  const next = state.level * 120;
  const prev = (state.level - 1) * 120;
  const into = state.xp - prev;
  const span = next - prev;
  const pct = Math.max(0, Math.min(100, Math.round((into / span) * 100)));

  return `
    <div class="stack">
      <div class="row">
        <strong>Level ${state.level}</strong>
        <span class="card__muted">${into}/${span} XP to next</span>
      </div>
      <div class="xpbar" aria-label="XP progress bar">
        <div class="xpbar__fill" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

function streakCopy(state) {
  if (!state.streak.count) return "No streak yet (optional).";
  if (state.streak.count === 1) return "1 day learned";
  return `${state.streak.count} days learned`;
}

function progressLine(api) {
  const { state } = api;
  const completed = Object.values(state.lessons).filter(l => l.status === "completed").length;
  const total = Object.keys(state.lessons).length;
  return total ? `${completed}/${total} completed` : "Start your first quest!";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
