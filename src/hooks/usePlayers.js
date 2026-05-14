import { useState, useEffect } from 'react';

const STORAGE_KEY = 'football-players';

export function usePlayers() {
  const [players, setPlayers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }, [players]);

  function addPlayer(name, score) {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setPlayers(prev => [
      ...prev,
      { id: Date.now(), name: trimmed, score: Number(score) },
    ]);
    return true;
  }

  function updatePlayer(id, name, score) {
    setPlayers(prev =>
      prev.map(p => (p.id === id ? { ...p, name: name.trim(), score: Number(score) } : p))
    );
  }

  function deletePlayer(id) {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  return { players, addPlayer, updatePlayer, deletePlayer };
}
