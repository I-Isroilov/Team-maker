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

function TeamCard({ team, color, isDragOver, selected, onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd, onTap }) {
  return (
    <div
      className={`team-card ${isDragOver ? 'drag-over' : ''} ${selected?.fromTeamId !== team.id && selected ? 'drop-target' : ''}`}
      style={{ '--team-color': color }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => selected && selected.fromTeamId !== team.id && onTap(team.id)}
    >
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
          .map(p => {
            const isSelected = selected?.playerId === p.id;
            return (
              <li
                key={p.id}
                className={`team-player draggable ${isSelected ? 'is-selected' : ''}`}
                draggable
                onDragStart={e => onDragStart(e, p.id, team.id)}
                onDragEnd={onDragEnd}
                onClick={e => { e.stopPropagation(); onTap(team.id, p.id); }}
              >
                <span className="drag-handle">⠿</span>
                <span className="tp-name">{p.name}</span>
                <span className="tp-score">{p.score}</span>
              </li>
            );
          })}
      </ul>
      {selected && selected.fromTeamId !== team.id && (
        <div className="drop-hint">Drop here</div>
      )}
    </div>
  );
}

function movePlayer(teams, playerId, fromTeamId, toTeamId) {
  const next = teams.map(t => ({ ...t, players: [...t.players] }));
  const from = next.find(t => t.id === fromTeamId);
  const to = next.find(t => t.id === toTeamId);
  const idx = from.players.findIndex(p => p.id === playerId);
  const [player] = from.players.splice(idx, 1);
  to.players.push(player);
  from.total = from.players.reduce((s, p) => s + p.score, 0);
  to.total = to.players.reduce((s, p) => s + p.score, 0);
  return next;
}

export default function TeamsTab({ players }) {
  const [selected, setSelected] = useState(() => new Set(players.map(p => p.id)));
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [tapped, setTapped] = useState(null);
  const [dragOver, setDragOver] = useState(null);

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
    setDragging(null);
    setTapped(null);
  }

  function handleDragStart(e, playerId, fromTeamId) {
    e.dataTransfer.effectAllowed = 'move';
    setDragging({ playerId, fromTeamId });
    setTapped(null);
  }

  function handleDragEnd() {
    setDragging(null);
    setDragOver(null);
  }

  function handleDragOver(e, teamId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(teamId);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(null);
    }
  }

  function handleDrop(e, toTeamId) {
    e.preventDefault();
    if (dragging && dragging.fromTeamId !== toTeamId) {
      setTeams(prev => movePlayer(prev, dragging.playerId, dragging.fromTeamId, toTeamId));
    }
    setDragging(null);
    setDragOver(null);
  }

  function handleTap(teamId, playerId) {
    if (playerId !== undefined) {
      if (tapped?.playerId === playerId) {
        setTapped(null);
      } else {
        setTapped({ playerId, fromTeamId: teamId });
      }
    } else if (tapped) {
      if (tapped.fromTeamId !== teamId) {
        setTeams(prev => movePlayer(prev, tapped.playerId, tapped.fromTeamId, teamId));
      }
      setTapped(null);
    }
  }

  const activePlayers = players.filter(p => selected.has(p.id));
  const maxTeams = Math.max(2, activePlayers.length);
  const activeSelection = dragging || tapped;

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
          <p className="drag-hint">
            {tapped ? '👆 Tap another team to move the player' : 'Drag players between teams — or tap a player then tap a team'}
          </p>
          <div className="teams-grid">
            {teams.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                color={TEAM_COLORS[i % TEAM_COLORS.length]}
                isDragOver={dragOver === team.id}
                selected={activeSelection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, team.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, team.id)}
                onTap={handleTap}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
