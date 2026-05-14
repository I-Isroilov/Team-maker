export function balanceTeams(players, numTeams) {
  if (!players.length || numTeams < 1) return [];

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
    players: [],
    total: 0,
  }));

  // Greedy: assign each player to the team with the lowest total
  for (const player of sorted) {
    const target = teams.reduce((min, t) => (t.total < min.total ? t : min), teams[0]);
    target.players.push(player);
    target.total += player.score;
  }

  return teams;
}

export function teamAvg(team) {
  if (!team.players.length) return 0;
  return (team.total / team.players.length).toFixed(1);
}
