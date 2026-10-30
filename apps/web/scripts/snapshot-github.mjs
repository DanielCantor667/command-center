// Writes the public GitHub profile the workshop PC shows (specs/workshop-realism.md, R.1b). Runs before every build;
// without network or over the rate limit it keeps the last snapshot, so a GitHub outage never breaks a deploy.
import { writeFile } from 'node:fs/promises';

const LOGIN = 'DanielCantor667';
const OUTPUT = new URL('../data/github-snapshot.json', import.meta.url);
const api = async path => {
  const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
  return response.json();
};

/** The profile calendar: the public page's HTML, there is no token-free API for it. */
async function contributions() {
  const response = await fetch(`https://github.com/users/${LOGIN}/contributions`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
  if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
  const html = await response.text();
  const days = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g)].map(match => ({ date: match[1], level: Number(match[2]) })).sort((a, b) => a.date.localeCompare(b.date));
  if (!days.length) throw new Error('empty contribution calendar');
  const total = [...html.matchAll(/>(\d+) contributions? on /g)].reduce((sum, match) => sum + Number(match[1]), 0);
  return { total, start: days[0].date, levels: days.map(day => day.level) };
}

try {
  const [user, repos, calendar] = await Promise.all([api(`/users/${LOGIN}`), api(`/users/${LOGIN}/repos?per_page=100&sort=pushed`), contributions()]);
  const snapshot = {
    login: LOGIN,
    generatedAt: new Date().toISOString().slice(0, 10),
    profile: { name: user.name?.trim() ?? LOGIN, bio: user.bio, avatarUrl: user.avatar_url, location: user.location?.trim() ?? null, followers: user.followers, following: user.following },
    contributions: calendar,
    repos: repos.filter(repo => !repo.fork && repo.name !== LOGIN).map(repo => ({
      name: repo.name, description: repo.description, language: repo.language, url: repo.html_url, pushedAt: repo.pushed_at.slice(0, 10), stars: repo.stargazers_count,
    })),
  };
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`GitHub snapshot: ${snapshot.repos.length} repos, ${calendar.total} contributions`);
} catch (error) {
  console.warn(`GitHub snapshot skipped: ${error.message}`);
}
