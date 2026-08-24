const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_REST_URL = 'https://api.github.com';

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'DevRecap',
  };
}

const CONTRIBUTIONS_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!, $prevFrom: DateTime!, $prevTo: DateTime!) {
    user(login: $login) {
      name
      avatarUrl
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 10) {
          repository { name stargazerCount primaryLanguage { name } }
          contributions { totalCount }
        }
      }
      previousYear: contributionsCollection(from: $prevFrom, to: $prevTo) {
        contributionCalendar {
          totalContributions
        }
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
        nodes {
          name
          stargazerCount
          primaryLanguage { name }
        }
      }
    }
  }
`;

export async function fetchContributions(username: string, year: number) {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;
  const prevFrom = `${year - 1}-01-01T00:00:00Z`;
  const prevTo = `${year - 1}-12-31T23:59:59Z`;

  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: githubHeaders(),
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login: username, from, to, prevFrom, prevTo },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL request failed: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: any) => e.message).join('; '));
  }
  if (!json.data.user) {
    throw new Error('User not found');
  }

  return json.data.user;
}

function longestStreak(days: { date: string; contributionCount: number }[]) {
  let longest = 0;
  let current = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

function busiestMonth(days: { date: string; contributionCount: number }[]) {
  const totals = new Map<string, number>();
  for (const day of days) {
    const month = day.date.slice(0, 7);
    totals.set(month, (totals.get(month) ?? 0) + day.contributionCount);
  }
  let best = { month: '', total: -1 };
  for (const [month, total] of totals) {
    if (total > best.total) best = { month, total };
  }
  return best.month;
}

export function buildRecap(user: any, year: number) {
  const calendar = user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((w: any) => w.contributionDays);

  const languageCounts = new Map<string, number>();
  for (const repo of user.repositories.nodes) {
    const lang = repo.primaryLanguage?.name;
    if (lang) languageCounts.set(lang, (languageCounts.get(lang) ?? 0) + 1);
  }
  const topLanguage = [...languageCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const mostStarredRepo = [...user.repositories.nodes].sort(
    (a: any, b: any) => b.stargazerCount - a.stargazerCount,
  )[0] ?? null;

  const mostActiveRepo = [...user.contributionsCollection.commitContributionsByRepository].sort(
    (a: any, b: any) => b.contributions.totalCount - a.contributions.totalCount,
  )[0] ?? null;

  const previousYearContributions: number | null =
    user.previousYear?.contributionCalendar?.totalContributions ?? null;

  return {
    username: user.name,
    avatarUrl: user.avatarUrl,
    year,
    totalContributions: calendar.totalContributions,
    previousYearContributions,
    longestStreak: longestStreak(days),
    busiestMonth: busiestMonth(days),
    topLanguage,
    mostStarredRepo: mostStarredRepo
      ? { name: mostStarredRepo.name, stars: mostStarredRepo.stargazerCount }
      : null,
    mostActiveRepo: mostActiveRepo
      ? { name: mostActiveRepo.repository.name, commits: mostActiveRepo.contributions.totalCount }
      : null,
    heatmap: days,
  };
}
