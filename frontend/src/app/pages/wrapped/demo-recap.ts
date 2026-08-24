import { Recap, HeatmapDay } from '../../core/models/recap.model';

function generateHeatmap(year: number): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const month = d.getMonth();
    const bias = month === 8 || month === 9 ? 0.55 : 0.22;
    const roll = rand();
    const count = roll < 1 - bias ? 0 : Math.floor(rand() * 12);
    days.push({ date: d.toISOString().slice(0, 10), contributionCount: count });
  }
  return days;
}

export const DEMO_RECAP: Recap = {
  username: 'octocat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  year: new Date().getFullYear(),
  totalContributions: 1842,
  previousYearContributions: 1560,
  longestStreak: 37,
  busiestMonth: `${new Date().getFullYear()}-09`,
  topLanguage: 'TypeScript',
  mostStarredRepo: { name: 'wrapped-cli', stars: 214 },
  mostActiveRepo: { name: 'devrecap', commits: 486 },
  heatmap: generateHeatmap(new Date().getFullYear()),
};
