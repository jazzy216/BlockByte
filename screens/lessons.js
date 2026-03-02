const LESSON_DB = {
  it: {
    it_parts_1: {
      title: "Meet the Computer Crew: CPU, RAM, Storage",
      checkpoints: [
        {
          id: "a",
          prompt: {
            "8-11": "Which part is like a work table for things happening right now?",
            "12-16": "Which component is volatile memory used for active tasks?"
          },
          options: ["CPU", "RAM", "Storage"],
          answer: "RAM",
          hint: {
            "8-11": "Think: open tabs and games need space *right now*.",
            "12-16": "RAM holds data temporarily while programs run."
          }
        },
        {
          id: "b",
          prompt: {
            "8-11": "Your computer turns off. Which one keeps your saved game file?",
            "12-16": "Which component retains data without power (non-volatile)?"
          },
          options: ["RAM", "Storage"],
          answer: "Storage",
          hint: {
            "8-11": "Backpack = keeps stuff even when you sleep.",
            "12-16": "SSD/HDD retains data when power is off."
          }
        }
      ]
    }
  },
  bash: {
    sh_nav_1: {
      title: "Terminal Ninja Moves: pwd, ls, cd",
      checkpoints: [
        {
          id: "a",
          prompt: {
            "8-11": "Type the command that tells you where you are.",
            "12-16": "Which command prints the current working directory?"
          },
          terminalGoal: "pwd",
          hint: { "8-11": "Three letters: p-w-d.", "12-16": "It stands for 'print working directory'." }
        },
        {
          id: "b",
          prompt: {
            "8-11": "Type the command that lists what's in the folder.",
            "12-16": "Which command lists directory contents?"
          },
          terminalGoal: "ls",
          hint: { "8-11": "Two letters: l-s.", "12-16": "Try 'ls' (and later: ls -la)." }
        }
      ]
    }
  },
  py: {
    py_vars_1: {
      title: "Print & Variables",
      checkpoints: [
        {
          id: "a",
          prompt: {
            "8-11": "Which line prints Hello, BlockByte! (pick one)",
            "12-16": "Which statement correctly prints the string?"
          },
          options: ['print("Hello, BlockByte!")', 'echo "Hello, BlockByte!"', 'printf Hello, BlockByte!'],
          answer: 'print("Hello, BlockByte!")',
          hint: { "8-11": "Python uses print().", "12-16": "Python prints with print(<string>)." }
        }
      ]
    }
  }
};

export function renderLesson(mount, api) {
  const { track, lessonId, state } = api;
  const age = state.ageMode;
  const lesson = LESSON_DB?.[track]?.[lessonId];

  if (!lesson) {
    mount.innerHTML = `
      <div class="card">
        <h1 class="card__title">Quest not found</h1>
        <p class="card__muted">That lesson ID doesn’t exist yet.</p>
        <a class="btn btn--primary" href="#/dashboard">Back</a>
      </div>
    `;
    return;
  }

  const k = `${track}:${lessonId}`;
  const entry = state.lessons[k] || { status: "available", checkpoints: {} };
  if (!state.lessons[k]) {
    state.lessons[k] = entry;
  }
  entry.status = entry.status === "completed" ? "completed" : "in-progress";
  api.toast("Quest loaded", "Your progress saves on this device.");

  mount.innerHTML = `
    <section class="card">
      <div class="row">
        <div class="pill">${trackLabel(track)}</div>
        <div class="pill">${age === "8-11" ? "Explorer" : "Builder"} Mode</div>
      </div>

      <h1 class="card__title" style="margin-top:10px">${escapeHtml(lesson.title)}</h1>
      <p class="card__muted">${introCopy(track, age)}</p>

      <hr class="sep" />

      <div class="stack">
        ${lesson.checkpoints.map((cp, idx) => renderCheckpoint(api, track, lessonId, cp, idx + 1, lesson.checkpoints.length)).join("")}
      </div>

      <hr class="sep" />
      <div class="row" style="flex-wrap:wrap; justify-content:flex-start">
        <button class="btn btn--secondary" type="button" data-action="hint" data-track="${track}" data-lesson="${lessonId}">
          Hint Drawer
        </button>
        <button class="btn btn--primary" type="button" data-action="finishLesson" data-track="${track}" data-lesson="${lessonId}">
          Finish Quest
        </button>
        <a class="btn btn--ghost" href="#/dashboard">Back to Dashboard</a>
      </div>

      <div id="hintDrawer" class="card" style="margin-top:12px; display:none">
        <div class="row">
          <strong>Hint Drawer</strong>
          <button class="btn btn--ghost" type="button" data-action="closeHint">Close</button>
        </div>
        <p class="card__muted" id="hintText">Pick a checkpoint and hit “Show Hint”.</p>
      </div>
    </section>
  `;

  // Delegated events for this screen
  mount.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "checkChoice") {
      const cpId = btn.dataset.cp;
      const val = btn.dataset.val;
      const cp = lesson.checkpoints.find(x => x.id === cpId);
      const ok = val === cp.answer;
      setCheckpointResult(api, track, lessonId, cpId, ok, cp);
    }

    if (action === "checkTerminal") {
      const cpId = btn.dataset.cp;
      const cp = lesson.checkpoints.find(x => x.id === cpId);
      const input = mount.querySelector(`#term_${cpId}`).value.trim();
      const ok = normalizeCmd(input) === normalizeCmd(cp.terminalGoal);
      setTerminalResult(api, track, lessonId, cpId, ok, cp, input);
    }

    if (action === "hintFor") {
      const cpId = btn.dataset.cp;
      const cp = lesson.checkpoints.find(x => x.id === cpId);
      openHint(mount, cp.hint?.[age] || "Try the smallest step first.");
    }

    if (action === "hint") {
      openHint(mount, "Pick a checkpoint’s hint button for a targeted nudge.");
    }

    if (action === "closeHint") {
      const drawer = mount.querySelector("#hintDrawer");
      drawer.style.display = "none";
    }

    if (action === "finishLesson") {
      const doneCount = Object.values(entry.checkpoints).filter(Boolean).length;
      const needed = lesson.checkpoints.length;

      if (doneCount < needed) {
        api.toast("Not yet!", "Finish all checkpoints first. Use hints if you need a nudge.");
        return;
      }

      entry.status = "completed";
      api.awardXP(30, "Quest complete");
      // Simple badge mapping: if present in dashboard definition, we award by convention
      const badgeMap = {
        "it:it_parts_1": { id: "parts_rookie", name: "Parts Rookie" },
        "bash:sh_nav_1": { id: "folder_finder", name: "Folder Finder" },
        "py:py_vars_1": { id: "print_wizard", name: "Print Wizard" }
      };
      const b = badgeMap[`${track}:${lessonId}`];
      if (b) api.earnBadge(b.id, b.name);

      api.toast("Nice work!", "Quest saved. Pick another one from the dashboard.");
      api.navigate("/dashboard");
    }
  }, { once: true });
}

function renderCheckpoint(api, track, lessonId, cp, step, total) {
  const { state } = api;
  const age = state.ageMode;
  const k = `${track}:${lessonId}`;
  const entry = state.lessons[k] || { checkpoints: {} };
  const done = !!entry.checkpoints[cp.id];

  const header = `
    <div class="row">
      <strong>Checkpoint ${step}/${total}</strong>
      <span class="pill" style="${done ? "border-color:rgba(34,197,94,.6)" : ""}">${done ? "Done" : "+10 XP"}</span>
    </div>
    <p class="card__muted">${escapeHtml(cp.prompt?.[age] || "")}</p>
  `;

  // Choice checkpoint
  if (cp.options) {
    return `
      <div class="card">
        ${header}
        <div class="row" style="flex-wrap:wrap; justify-content:flex-start; gap:10px">
          ${cp.options.map(opt => `
            <button class="btn btn--secondary" type="button"
              data-action="checkChoice" data-cp="${cp.id}" data-val="${escapeAttr(opt)}">
              ${escapeHtml(opt)}
            </button>
          `).join("")}
          <button class="btn btn--ghost" type="button" data-action="hintFor" data-cp="${cp.id}">Show Hint</button>
        </div>
        <div class="card__muted" id="res_${cp.id}" style="margin-top:10px"></div>
      </div>
    `;
  }

  // Terminal checkpoint (simple)
  if (cp.terminalGoal) {
    const placeholder = state.ageMode === "8-11" ? "Type a command… (try: pwd)" : "Enter command (exact match for this quest)…";
    return `
      <div class="card">
        ${header}
        <div class="terminal" aria-label="Terminal checkpoint (simulated)">
          <div class="terminal__log" id="log_${cp.id}">$ (simulated terminal)</div>
          <div class="terminal__row">
            <span class="terminal__prompt">$</span>
            <input class="terminal__input" id="term_${cp.id}" placeholder="${escapeAttr(placeholder)}" />
            <button class="btn btn--primary" type="button" data-action="checkTerminal" data-cp="${cp.id}">Check</button>
          </div>
        </div>
        <div class="row" style="margin-top:10px; justify-content:flex-start; gap:10px; flex-wrap:wrap">
          <button class="btn btn--ghost" type="button" data-action="hintFor" data-cp="${cp.id}">Show Hint</button>
          <span class="pill">Goal: <span style="font-family:var(--mono)">${escapeHtml(cp.terminalGoal)}</span></span>
        </div>
        <div class="card__muted" id="res_${cp.id}" style="margin-top:10px"></div>
      </div>
    `;
  }

  return `<div class="card">${header}<p class="card__muted">Checkpoint type not implemented yet.</p></div>`;
}

function setCheckpointResult(api, track, lessonId, cpId, ok, cp) {
  const k = `${track}:${lessonId}`;
  const entry = api.state.lessons[k];

  const resEl = document.getElementById(`res_${cpId}`);
  if (!resEl) return;

  if (ok) {
    if (!entry.checkpoints[cpId]) {
      entry.checkpoints[cpId] = true;
      api.awardXP(10, "Checkpoint");
      api.saveState?.(); // in case passed; safe if undefined
    }
    resEl.textContent = api.state.ageMode === "8-11"
      ? "✅ Yep! You got it."
      : "✅ Correct. Nice reasoning.";
  } else {
    resEl.textContent = api.state.ageMode === "8-11"
      ? "❌ Try again. Use a hint if you want!"
      : "❌ Not quite. Check the concept and try again.";
  }
}

function setTerminalResult(api, track, lessonId, cpId, ok, cp, input) {
  const k = `${track}:${lessonId}`;
  const entry = api.state.lessons[k];

  const resEl = document.getElementById(`res_${cpId}`);
  const logEl = document.getElementById(`log_${cpId}`);

  if (logEl) {
    logEl.textContent = `$ ${input}\n${ok ? simulatedOutput(cp.terminalGoal) : "Command not accepted for this quest. Try again."}`;
  }

  if (!resEl) return;

  if (ok) {
    if (!entry.checkpoints[cpId]) {
      entry.checkpoints[cpId] = true;
      api.awardXP(10, "Checkpoint");
    }
    resEl.textContent = api.state.ageMode === "8-11"
      ? "✅ Ninja move unlocked!"
      : "✅ Correct command.";
  } else {
    resEl.textContent = api.state.ageMode === "8-11"
      ? "❌ Close! Try the exact command on the goal card."
      : "❌ Incorrect. Match the goal exactly for this trainer.";
  }
}

function simulatedOutput(goal) {
  if (goal === "pwd") return "/home/player (simulated)";
  if (goal === "ls") return "quests  treasure  notes.txt (simulated)";
  return "(simulated)";
}

function openHint(mount, text) {
  const drawer = mount.querySelector("#hintDrawer");
  const hint = mount.querySelector("#hintText");
  drawer.style.display = "block";
  hint.textContent = text;
}

function introCopy(track, age) {
  const map = {
    it: {
      "8-11": "Short mission: learn what CPU, RAM, and Storage do with quick mini-checkpoints.",
      "12-16": "Short mission: learn core hardware roles with correct terms (volatile vs non-volatile)."
    },
    bash: {
      "8-11": "Short mission: type a few magic commands in a safe pretend terminal.",
      "12-16": "Short mission: practice navigation commands used constantly in real shells."
    },
    py: {
      "8-11": "Short mission: pick the right Python line to print a message.",
      "12-16": "Short mission: practice basic syntax and predict output."
    }
  };
  return map?.[track]?.[age] || "Quick mission: learn by doing.";
}

function trackLabel(track) {
  return ({ it:"IT Basics", bash:"Bash", py:"Python" }[track] || "Track");
}

function normalizeCmd(s) {
  return String(s).trim().replace(/\s+/g, " ");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
