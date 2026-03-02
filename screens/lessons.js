import { State } from '../app.js';

export function renderLesson(root) {
  root.innerHTML = `
    <div class="card">
      <h2>Variables: Storage Boxes</h2>
      <p>A variable is like a box you put data in. Let's make a box for player health!</p>
      
      <div style="background:var(--color-bg); padding:10px; margin-bottom:10px;">
        <code>Type: player_health = 100</code>
      </div>
      
      <input type="text" id="code-input" placeholder="Type your code here..." style="width:100%; padding:10px; font-family:var(--font-code); border: 3px solid var(--color-text); border-radius: 8px; margin-bottom:10px;">
      <button id="run-btn" class="btn">Run Code</button>
      <p id="feedback" style="color:var(--color-primary-dark); font-weight:bold; margin-top:10px;"></p>
    </div>
    <br>
    <a href="#/dashboard" style="color:var(--color-text);">Back to Dashboard</a>
  `;

  document.getElementById('run-btn').addEventListener('click', () => {
    const input = document.getElementById('code-input').value.trim();
    const feedback = document.getElementById('feedback');
    
    // Very basic regex validation for mock execution
    if (/^player_health\s*=\s*100$/.test(input)) {
      feedback.innerText = "Success! Box created!";
      feedback.style.color = "var(--color-primary)";
      State.addXP(20);
    } else {
      feedback.innerText = "Oops! Check your spelling. Hint: player_health = 100";
      feedback.style.color = "#F44336"; // Redstone
    }
  });
}
