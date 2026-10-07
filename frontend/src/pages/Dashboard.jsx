// pages/Dashboard.jsx

import { useLogsData } from '../useLogsData';
import { shapeWeeklyData } from '../utils';
import { useState } from 'react';
import { useAuth } from '../AuthContext';
import ActivityCards from '../components/ActivityCards';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '../ToastContext';
import { FaWalking, FaTint, FaBed } from 'react-icons/fa';

function Dashboard() {
  const { logs, weekly, goals, loading, refreshAll} = useLogsData();
  const {token, API_BASE, user} = useAuth();
  const showToast = useToast();
  const [activeMetric, setActiveMetric] = useState('walk');
  

  
  // Quick Log form state
  const [type, setType] = useState('walk');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

   // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const metricConfig = {
    walk: { label: 'Steps', color: '#fff', gradientId: 'walkFill' },
    water: { label: 'Water (ml)', color: '#7CFFD1', gradientId: 'waterFill' },
    sleep: { label: 'Sleep (hrs)', color: '#2b1f3d', gradientId: 'sleepFill' },
  };


  const handleLog = async (e) => {
    e.preventDefault();
    setError('');
    if (!value || Number(value) <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // backend rejects the request without this
        },
        body: JSON.stringify({ type, value: Number(value) }),
      });
      if (!res.ok) throw new Error('Failed to log');
      const typeLabels = { walk: 'steps', water: 'ml of water', sleep: 'hours of sleep' };
      showToast(`${Number(value).toLocaleString()} ${typeLabels[type]} logged`);
      setValue('');
      refreshAll(); // re-fetch so stat cards and chart update immediately
    } catch (err) {
      console.error(err);
      showToast('Something went wrong logging that.', 'error');
    }
  };

  if (loading || !goals) return <p className="empty-note">Loading...</p>;

  const chartData = shapeWeeklyData(weekly);

  // Today's totals per type, for the stat cards
  const todayTotals = { walk: 0, water: 0, sleep: 0 };
  const today = new Date().toISOString().slice(0, 10);
  logs.forEach(log => {
    if (log.logged_at.slice(0, 10) === today) {
      todayTotals[log.type] += Number(log.value);
    }
  });

  return (
    <>
      <div className="main-header">
        <h1>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="date-line">{todayFormatted}</p>
        <p>Here's your activity for today.</p>
      </div>

        <ActivityCards todayTotals={todayTotals} goals={goals} />

        <div className="card" style={{ marginBottom: 24 }}>
  <h2>Today's Progress</h2>
  <div className="progress-summary">
    {[
      { key: 'walk', label: 'Steps', goal: Number(goals.walk_goal), color: '#378ADD', icon: <FaWalking /> },
      { key: 'water', label: 'Water', goal: Number(goals.water_goal), color: '#16a34a', icon: <FaTint /> },
      { key: 'sleep', label: 'Sleep', goal: Number(goals.sleep_goal), color: '#6a4c93', icon: <FaBed /> },
    ].map(({ key, label, goal, color, icon }) => {
      const current = todayTotals[key] || 0;
      const pct = Math.min(100, Math.round((current / goal) * 100));
      return (
        
        <div className="progress-row" key={key}>
                <span className="progress-row-icon" style={{ background: `${color}22`, color }}>
                  {icon}
                </span>
                <span className="progress-row-label">{label}</span>
                <div className="progress-row-bar">
                  <div className="progress-row-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="progress-row-value">
                  {current.toLocaleString()} / {goal.toLocaleString()}
                </span>
                <span className="progress-row-pct" style={{ color }}>{pct}%</span>
              </div>
              );
            })}
          </div>
        </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2>Quick log</h2>
            {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={handleLog} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select value={type} onChange={e => setType(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #c7cdd8', borderRadius: 10 }}>
                <option value="walk">Walk (steps)</option>
                <option value="water">Water (ml)</option>
                <option value="sleep">Sleep (hours)</option>
              </select>
              <input
                type="number"
                step="any"
                placeholder="Amount"
                value={value}
                onChange={e => setValue(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #c7cdd8', borderRadius: 10 }}
              />
              <button type="submit"
                style={{ padding: '10px 18px', border: 'none', borderRadius: 10, background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Log it
              </button>
            </form>
          </div>

      <div className="overview-card">
          <div className="overview-header">
            <h2>Weekly Trend</h2>
            <div className="metric-tabs">
              {Object.entries(metricConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  className={activeMetric === key ? 'metric-tab active' : 'metric-tab'}
                  onClick={() => setActiveMetric(key)}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="walkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7CFFD1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#7CFFD1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2b1f3d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2b1f3d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#2b1f3d', border: 'none', borderRadius: 8, color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={metricConfig[activeMetric].color}
                strokeWidth={2}
                fill={`url(#${metricConfig[activeMetric].gradientId})`}
                dot={{ fill: metricConfig[activeMetric].color, r: 4 }}
                name={metricConfig[activeMetric].label}
              />
            </AreaChart>
          </ResponsiveContainer>
      </div>

    </>
  );
}

export default Dashboard;