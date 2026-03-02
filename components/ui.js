/**
 * BlockByte Academy - Reusable UI Components
 * Stack: Vanilla JS Template Literals
 */

// 1. QuestCard
// States: 'locked', 'available', 'completed'
export function QuestCard({ id, title, description, status, xpReward }) {
  let buttonHTML = '';
  let borderStyle = 'border: 4px solid var(--color-text);';
  let badgeHTML = '';

  if (status === 'locked') {
    buttonHTML = `<button class="btn" disabled style="background: #9E9E9E; border-color: #757575;">🔒 Locked</button>`;
    borderStyle = 'border: 4px dashed #9E9E9E; background: #F5F5F5;';
  } else if (status === 'completed') {
    buttonHTML = `<button class="btn" disabled style="background: var(--color-primary); border-color: var(--color-primary-dark);">⭐ Mastered!</button>`;
    badgeHTML = `<div style="position:absolute; top:-10px; right:-10px; background:#FFC107; padding:5px 10px; border-radius:12px; border:2px solid #5D4037; font-weight:bold; transform:rotate(10deg);">Done!</div>`;
  } else {
    // Available
    buttonHTML = `<a href="#/lesson/${id}" class="btn" style="text-decoration:none; display:inline-block;">⛏️ Start Mining (+${xpReward} XP)</a>`;
  }

  return `
    <div class="card quest-card" style="position:relative; ${borderStyle} max-width: 300px; display: flex; flex-direction: column; justify-content: space-between;">
      ${badgeHTML}
      <div>
        <h3 style="margin-top:0; color: var(--color-text); font-family: var(--font-heading);">${title}</h3>
        <p style="font-size: 0.95rem;">${description}</p>
      </div>
      <div style="margin-top: 16px;">
        ${buttonHTML}
      </div>
    </div>
  `;
}

// 2. BadgeTile
// Used in the inventory. A chunky little square for digital loot.
export function BadgeTile({ name, icon, isEarned, tooltip }) {
  const bg = isEarned ? '#FFF' : '#E0E0E0';
  const filter = isEarned ? 'none' : 'grayscale(100%) opacity(50%)';
  const border = isEarned ? 'var(--color-secondary)' : '#9E9E9E';

  return `
    <div title="${tooltip}" style="
      width: 80px; 
      height: 80px; 
      background: ${bg}; 
      border: 4px solid ${border}; 
      border-radius: 16px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 2rem;
      box-shadow: 0px 4px 0px ${isEarned ? '#1976D2' : '#BDBDBD'};
      cursor: help;
      transition: transform 0.2s;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <span style="filter: ${filter};">${icon}</span>
    </div>
  `;
}

// 3. HintDrawer
// A kid-friendly expanding panel that gives clues without giving the answer.
export function HintDrawer({ hintText }) {
  return `
    <details style="
      background: #FFF9C4; 
      border: 3px solid #FBC02D; 
      border-radius: var(--radius-chunky); 
      padding: 12px; 
      margin: 16px 0;
      cursor: pointer;
    ">
      <summary style="font-family: var(--font-heading); font-size: 1.1rem; color: #F57F17;">
        💡 Need a clue? Click me!
      </summary>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 2px dashed #FBC02D; color: var(--color-text);">
        ${hintText}
      </div>
    </details>
  `;
}

// 4. ProgressRing (Blocky variant for theme)
// Instead of a smooth circle, we use a chunky segmented bar to fit the Minecraft/Roblox vibe.
export function ProgressBar({ current, max, label }) {
  const percentage = Math.min((current / max) * 100, 100);
  let barColor = 'var(--color-primary)';
  if (percentage < 34) barColor = '#F44336'; // Redstone
  else if (percentage < 67) barColor = '#FFC107'; // Gold
  
  return `
    <div style="width: 100%; margin: 10px 0;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; font-size: 0.9rem;">
        <span>${label}</span>
        <span>${current} / ${max}</span>
      </div>
      <div style="background: #E0E0E0; border: 3px solid var(--color-text); border-radius: 8px; height: 24px; overflow: hidden; box-shadow: inset 0px 3px 0px rgba(0,0,0,0.2);">
        <div style="width: ${percentage}%; background: ${barColor}; height: 100%; border-right: 3px solid var(--color-text); transition: width 0.3s ease-in-out;"></div>
      </div>
    </div>
  `;
}

// 5. AchievementToast
// We inject this into the DOM when a user does something good.
export function showAchievementToast(message, xpGained) {
  // Create the toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed; 
      bottom: 20px; 
      right: 20px; 
      display: flex; 
      flex-direction: column; 
      gap: 10px; 
      z-index: 9999;
    `;
    document.body.appendChild(toastContainer);
  }

  // Create the specific toast
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="
      background: var(--color-card); 
      border: 4px solid var(--color-text); 
      border-radius: var(--radius-chunky); 
      padding: 16px; 
      box-shadow: var(--shadow-chunky);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="font-size: 2rem;">🎉</div>
      <div>
        <h4 style="margin: 0; font-family: var(--font-heading); color: var(--color-text);">${message}</h4>
        <p style="margin: 4px 0 0 0; color: var(--color-primary-dark); font-weight: bold;">+${xpGained} XP</p>
      </div>
    </div>
  `;

  // Add a quick animation style if not already added
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  toastContainer.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
