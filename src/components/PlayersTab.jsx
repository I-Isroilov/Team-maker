import { useState } from 'react';

const SCORE_LABELS = {
  1: 'Beginner', 2: 'Beginner', 3: 'Amateur', 4: 'Amateur',
  5: 'Average', 6: 'Average', 7: 'Good', 8: 'Good',
  9: 'Excellent', 10: 'Pro',
};

function ScoreBadge({ score }) {
  const level = score <= 2 ? 'low' : score <= 4 ? 'mid-low' : score <= 6 ? 'mid' : score <= 8 ? 'high' : 'top';
  return (
    <span className={`score-badge score-${level}`}>
      {score} <span className="score-label">{SCORE_LABELS[score]}</span>
    </span>
  );
}

function PlayerRow({ player, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [score, setScore] = useState(player.score);

  function save() {
    if (!name.trim()) return;
    onUpdate(player.id, name, score);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="player-row editing">
        <input
          className="edit-name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
        />
        <div className="score-slider-wrap">
          <input
            type="range" min="1" max="10" value={score}
            onChange={e => setScore(Number(e.target.value))}
            className="score-slider"
          />
          <span className="score-value">{score}</span>
        </div>
        <div className="row-actions">
          <button className="btn btn-save" onClick={save}>Save</button>
          <button className="btn btn-cancel" onClick={() => { setName(player.name); setScore(player.score); setEditing(false); }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-row">
      <span className="player-name">{player.name}</span>
      <ScoreBadge score={player.score} />
      <div className="row-actions">
        <button className="btn btn-icon" onClick={() => setEditing(true)} title="Edit">✏️</button>
        <button className="btn btn-icon btn-danger" onClick={() => onDelete(player.id)} title="Delete">🗑️</button>
      </div>
    </div>
  );
}

export default function PlayersTab({ players, onAdd, onUpdate, onDelete }) {
  const [name, setName] = useState('');
  const [score, setScore] = useState(5);

  function handleAdd() {
    if (onAdd(name, score)) setName('');
  }

  return (
    <div className="tab-content">
      <div className="add-player-card card">
        <h3>Add Player</h3>
        <div className="add-form">
          <input
            className="input"
            placeholder="Player name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="score-field">
            <label>Skill <strong>{score}</strong>/10</label>
            <input
              type="range" min="1" max="10" value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="score-slider"
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>Add Player</button>
        </div>
      </div>

      <div className="players-list card">
        <div className="card-header">
          <h3>Players <span className="count-badge">{players.length}</span></h3>
          {players.length > 0 && (
            <span className="avg-stat">
              Avg skill: <strong>{(players.reduce((s, p) => s + p.score, 0) / players.length).toFixed(1)}</strong>
            </span>
          )}
        </div>

        {players.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚽</div>
            <p>No players yet. Add your first player above!</p>
          </div>
        ) : (
          <div className="player-rows">
            {players
              .slice()
              .sort((a, b) => b.score - a.score)
              .map(p => (
                <PlayerRow key={p.id} player={p} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
