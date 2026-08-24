export interface HeatmapDay {
  date: string;
  contributionCount: number;
}

export interface Recap {
  username: string | null;
  avatarUrl: string;
  year: number;
  totalContributions: number;
  previousYearContributions: number | null;
  longestStreak: number;
  busiestMonth: string;
  topLanguage: string | null;
  mostStarredRepo: { name: string; stars: number } | null;
  mostActiveRepo: { name: string; commits: number } | null;
  heatmap: HeatmapDay[];
}
