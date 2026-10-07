// useLogsData.js
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export function useLogsData() {
  const { token, API_BASE } = useAuth();
  const [logs, setLogs] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [goals, setGoals] = useState(null); // starts null until loaded
  const [loading, setLoading] = useState(true);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadLogs = () => {
    fetch(`${API_BASE}/logs`, { headers: authHeaders })
      .then(res => res.json())
      .then(setLogs)
      .catch(err => console.error('Failed to load logs:', err));
  };

  const loadWeekly = () => {
    fetch(`${API_BASE}/logs/weekly`, { headers: authHeaders })
      .then(res => res.json())
      .then(setWeekly)
      .catch(err => console.error('Failed to load weekly data:', err));
  };

  const loadGoals = () => {
    fetch(`${API_BASE}/goals`, { headers: authHeaders })
      .then(res => res.json())
      .then(setGoals)
      .catch(err => console.error('Failed to load goals:', err));
  };

  const updateGoals = async (newGoals) => {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(newGoals),
    });
    if (!res.ok) throw new Error('Failed to update goals');
    const data = await res.json();
    setGoals(data);
    return data;
  };

  const refreshAll = () => {
    loadLogs();
    loadWeekly();
    loadGoals();
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/logs`, { headers: authHeaders }).then(r => r.json()).then(setLogs),
      fetch(`${API_BASE}/logs/weekly`, { headers: authHeaders }).then(r => r.json()).then(setWeekly),
      fetch(`${API_BASE}/goals`, { headers: authHeaders }).then(r => r.json()).then(setGoals),
    ])
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, [token]);

  return { logs, weekly, goals, loading, refreshAll, updateGoals };
}