// components/ActivityCards.jsx
import { FaWalking, FaTint, FaBed } from 'react-icons/fa';
import './ActivityCards.css';

// Goals are hardcoded for now — could later be stored per-user in the database
const GOALS = {
  walk: { label: 'Walk', unit: 'steps', target: 8000, icon: <FaWalking /> },
  water: { label: 'Water', unit: 'ml', target: 2000, icon: <FaTint /> },
  sleep: { label: 'Sleep', unit: 'hrs', target: 8, icon: <FaBed /> },
};

const TYPE_META = {
  walk: { label: 'Walk', unit: 'steps', icon: <FaWalking /> },
  water: { label: 'Water', unit: 'ml', icon: <FaTint /> },
  sleep: { label: 'Sleep', unit: 'hrs', icon: <FaBed /> },
};

function ActivityCards({ todayTotals, goals }) {
  return (
    <div className="activity-cards">
      {Object.entries(TYPE_META).map(([type, meta]) => {
        const target = Number(goals[`${type}_goal`]);
        const current = todayTotals[type] || 0;
        const progress = Math.min(100, Math.round((current / target) * 100));
        const remaining = Math.max(0, target - current);

        return (
          <div className="activity-card" key={type}>
            <div className="activity-header">
              <div className="activity-icon">{meta.icon}</div>
              <div className="activity-name">{meta.label}</div>
            </div>
            <div className="activity-info">
              <div className="activity-details">Goal: {target.toLocaleString()} {meta.unit}</div>
              <div className="progress-header">
                <span className="progress-label">Progress</span>
                <span className="progress-percent">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="current-progress">
                <span>{current.toLocaleString()} / {target.toLocaleString()} {meta.unit}</span>
                <span className="days-left">
                  {remaining === 0 ? 'Goal met!' : `${remaining.toLocaleString()} to go`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityCards;