import { renderDashboard } from './screens/dashboard.js';
import { renderLesson } from './screens/lesson.js';
import { renderTerminal } from './screens/terminal.js';

// Simple State Manager
export const State = {
  data: JSON.parse(localStorage.getItem('blockbyte_save')) || { player: { totalXP: 0 } },
  addXP(amount) {
    this.data.player.totalXP += amount;
    this.save();
    document.getElementById('xp-count').innerText = this.data.player.totalXP;
    alert(`+${amount} XP! Loot get!`); // Simplistic toast
  },
  save() {
    localStorage.setItem('blockbyte_save', JSON.stringify(this.data));
  }
};

// Router
const root = document.getElementById('app-root');

function router() {
  const hash = window.location.hash || '#/';
  document.getElementById('xp-count').innerText = State.data.player.totalXP;

  if (hash === '#/') {
    root.innerHTML = `<div class="card" style="text-align:center;">
      <h2>Welcome Player!</h2>
      <a href="#/dashboard" class="btn" style="text-decoration:none;">Start Game</a>
    </div>`;
  } else if (hash === '#/dashboard') {
    renderDashboard(root);
  } else if (hash.startsWith('#/lesson')) {
    renderLesson(root);
  } else if (hash === '#/terminal') {
    renderTerminal(root);
  } else {
    root.innerHTML = `<h2>404 - Quest not found!</h2><a href="#/dashboard">Go Back</a>`;
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
