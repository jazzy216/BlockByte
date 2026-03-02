import { State } from '../app.js';
import { QuestCard, BadgeTile, ProgressBar } from '../components/ui.js';

export function renderDashboard(root) {
  // Generate HTML strings using our components
  const module1Card = QuestCard({
    id: 1,
    title: "Inside the Machine",
    description: "Learn what makes a computer tick!",
    status: State.data.progress.module_1?.status || "available",
    xpReward: 20
  });

  const module2Card = QuestCard({
    id: 2,
    title: "Hacker Terminal",
    description: "Type commands like a pro.",
    status: State.data.progress.module_2?.status || "locked",
    xpReward: 50
  });

  const firstLoginBadge = BadgeTile({
    name: "First Login",
    icon: "👾",
    isEarned: true,
    tooltip: "You joined BlockByte Academy!"
  });

  // Inject into the DOM
  root.innerHTML = `
    <h2>Welcome back, ${State.data.player.nickname}!</h2>
    
    <div style="max-width: 400px; margin-bottom: 32px;">
      ${ProgressBar({ current: State.data.player.totalXP, max: 100, label: "Level 1 Progress" })}
    </div>

    <h3>Your Quests</h3>
    <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 32px;">
      ${module1Card}
      ${module2Card}
    </div>

    <h3>Your Loot (Badges)</h3>
    <div style="display: flex; gap: 16px;">
      ${firstLoginBadge}
    </div>
  `;
}
