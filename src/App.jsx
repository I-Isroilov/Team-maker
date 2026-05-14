import { useState } from 'react';
import { usePlayers } from './hooks/usePlayers';
import PlayersTab from './components/PlayersTab';
import TeamsTab from './components/TeamsTab';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('players');
  const { players, addPlayer, updatePlayer, deletePlayer } = usePlayers();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚽</span>
            <div>
              <h1>Team Maker</h1>
              <p>Weekly Football</p>
            </div>
          </div>
          <nav className="tabs">
            <button
              className={`tab-btn ${tab === 'players' ? 'active' : ''}`}
              onClick={() => setTab('players')}
            >
              Players
              {players.length > 0 && <span className="tab-badge">{players.length}</span>}
            </button>
            <button
              className={`tab-btn ${tab === 'teams' ? 'active' : ''}`}
              onClick={() => setTab('teams')}
            >
              Make Teams
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {tab === 'players' ? (
          <PlayersTab
            players={players}
            onAdd={addPlayer}
            onUpdate={updatePlayer}
            onDelete={deletePlayer}
          />
        ) : (
          <TeamsTab players={players} />
        )}
      </main>
    </div>
  );
}
