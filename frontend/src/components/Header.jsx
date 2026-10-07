// components/Header.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import { useLogsData } from '../useLogsData';

function Header() {
  const { user, logout } = useAuth();
  const { logs, goals } = useLogsData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Build notifications from real data — no separate backend table needed
  const buildNotifications = () => {
    if (!logs.length || !goals) return [];

    const notifications = [];

    // 1. Goal-met alerts for today
    const today = new Date().toISOString().slice(0, 10);
    const todayTotals = { walk: 0, water: 0, sleep: 0 };
    logs.forEach(log => {
      if (log.logged_at.slice(0, 10) === today) {
        todayTotals[log.type] += Number(log.value);
      }
    });

    const goalLabels = { walk: 'step', water: 'water', sleep: 'sleep' };
    Object.entries(todayTotals).forEach(([type, total]) => {
      const target = Number(goals[`${type}_goal`]);
      if (target > 0 && total >= target) {
        notifications.push({
          id: `goal-${type}`,
          text: `You hit your ${goalLabels[type]} goal today 🎉`,
        });
      }
    });

    // 2. Most recent log entries, as a simple activity feed
    const recent = [...logs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    recent.forEach(log => {
      notifications.push({
        id: `log-${log.id}`,
        text: `Logged ${Number(log.value).toLocaleString()} ${log.type} — ${new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
    });

    return notifications;
  };

  const notifications = buildNotifications();

  return (
    <header className="app-header">
      <div />

      <div className="app-header-right">
        <div className="header-notif">
          <button
            className="header-bell"
            title="Notifications"
            type="button"
            onClick={() => { setNotifOpen(o => !o); setMenuOpen(false); }}
          >
            <FaBell />
            {notifications.length > 0 && <span className="header-bell-dot" />}
          </button>

          {notifOpen && (
            <div className="header-notif-menu" onClick={e => e.stopPropagation()}>
              <div className="header-notif-title">Notifications</div>
              {notifications.length === 0 ? (
                <p className="header-notif-empty">Nothing new yet.</p>
              ) : (
                notifications.map(n => (
                  <div className="header-notif-item" key={n.id}>{n.text}</div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="header-user" onClick={() => { setMenuOpen(o => !o); setNotifOpen(false); }}>
          <span className="header-avatar">{initials}</span>
          <span className="header-name">{user?.name?.split(' ')[0]}</span>

          {menuOpen && (
            <div className="header-menu" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                Settings
              </button>
              <button onClick={logout}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;