import { useState, useCallback } from 'react';
import { balanceTeams, teamAvg } from '../utils/teamBalancer';

const TEAM_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

function formatTeamsText(teams) {
  return teams
    .map(t => {
      const playerList = t.players
        .slice()
        .sort((a, b) => b.score - a.score)
        .map(p => `  • ${p.name} (${p.score})`)
        .join('\n');
      return `${t.name} — avg ${teamAvg(t)}\n${playerList}`;
    })
    .join('\n\n');
}

function CopyButton({ teams }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(formatTeamsText(teams)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button className={`btn btn-outline ${copied ? 'btn-copied' : ''}`} onClick={handleCopy}>
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  );
}

function TeamCard({ team, color }) {
  return (
    <div className="team-card" style={{ '--team-color': color }}>
      <div className="team-header">
        <span className="team-dot" style={{ background: color }} />
        <h3>{team.name}</h3>
        <div className="team-stats">
          <span title="Total score">⚡ {team.total}</span>
          <span title="Average score">∅ {teamAvg(team)}</span>
          <span title="Players">👤 {team.players.length}</span>
        </div>
      </div>
      <ul className="team-players">
        {team.players
          .slice()
          .sort((a, b) => b.score - a.score)
          .map(p => (
            <li key={p.id} className="team-player">
              <span className="tp-name">{p.name}</span>
              <span className="tp-score">{p.score}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default function TeamsTab({ players }) {
  const [selected, setSelected] = useState(() => new Set(players.map(p => p.id)));
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState(null);

  const togglePlayer = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  function selectAll() { setSelected(new Set(players.map(p => p.id))); }
  function clearAll() { setSelected(new Set()); }

  function generate() {
    const active = players.filter(p => selected.has(p.id));
    setTeams(balanceTeams(active, numTeams));
  }

  const activePlayers = players.filter(p => selected.has(p.id));
  const maxTeams = Math.max(2, activePlayers.length);

  if (players.length === 0) {
    return (
      <div className="tab-content">
        <div className="card empty-state">
          <div className="empty-icon">👥</div>
          <p>Add some players in the Players tab first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="setup-card card">
        <div className="setup-top">
          <div className="teams-count-control">
            <label>Number of teams</label>
            <div className="number-control">
              <button className="btn btn-icon" onClick={() => setNumTeams(t => Math.max(2, t - 1))}>−</button>
              <span className="num-display">{numTeams}</span>
              <button className="btn btn-icon" onClick={() => setNumTeams(t => Math.min(maxTeams, t + 1))}>+</button>
            </div>
          </div>
          <button className="btn btn-primary btn-generate" onClick={generate} disabled={activePlayers.length < numTeams}>
            ⚽ Generate Teams
          </button>
        </div>

        <div className="player-select-header">
          <span className="select-label">Select players <strong>({activePlayers.length}/{players.length})</strong></span>
          <div className="select-actions">
            <button className="btn btn-sm" onClick={selectAll}>All</button>
            <button className="btn btn-sm" onClick={clearAll}>None</button>
          </div>
        </div>
        <div className="player-chips">
          {players
            .slice()
            .sort((a, b) => b.score - a.score)
            .map(p => (
              <button
                key={p.id}
                className={`chip ${selected.has(p.id) ? 'chip-active' : ''}`}
                onClick={() => togglePlayer(p.id)}
              >
                {p.name}
                <span className="chip-score">{p.score}</span>
              </button>
            ))}
        </div>
        {activePlayers.length < numTeams && (
          <p className="warning">Select at least {numTeams} players to form {numTeams} teams.</p>
        )}
      </div>

      {teams && (
        <div className="results-section">
          <div className="results-header">
            <h2>Teams</h2>
            <div className="results-actions">
              <CopyButton teams={teams} />
              <button className="btn btn-outline" onClick={generate}>🔀 Reshuffle</button>
            </div>
          </div>
          <div className="teams-grid">
            {teams.map((team, i) => (
              <TeamCard key={team.id} team={team} color={TEAM_COLORS[i % TEAM_COLORS.length]} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
