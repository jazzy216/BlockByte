export function renderDashboard(root) {
  root.innerHTML = `
    <h2>Your Quests</h2>
    <div style="display: flex; gap: 20px;">
      <div class="card">
        <h3>1. Inside the Machine</h3>
        <p>Learn what makes a computer tick!</p>
        <a href="#/lesson/1" class="btn" style="text-decoration:none;">Play Lesson</a>
      </div>
      <div class="card">
        <h3>2. Hacker Terminal</h3>
        <p>Type commands like a pro.</p>
        <a href="#/terminal" class="btn" style="text-decoration:none;">Practice Bash</a>
      </div>
    </div>
  `;
}
