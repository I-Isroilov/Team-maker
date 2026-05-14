export function balanceTeams(players, numTeams) {
  if (!players.length || numTeams < 1) return [];

  // Shuffle first so same-score players appear in random order,
  // then stable-sort by score so the greedy pass stays balanced.
  const sorted = [...players]
    .sort(() => Math.random() - 0.5)
    .sort((a, b) => b.score - a.score);

  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
    players: [],
    total: 0,
  }));

  for (const player of sorted) {
    // When multiple teams share the lowest total, pick one at random.
    const minTotal = Math.min(...teams.map(t => t.total));
    const candidates = teams.filter(t => t.total === minTotal);
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    target.players.push(player);
    target.total += player.score;
  }

  return teams;
}

export function teamAvg(team) {
  if (!team.players.length) return 0;
  return (team.total / team.players.length).toFixed(1);
}
