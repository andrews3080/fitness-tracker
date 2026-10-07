// pages/History.jsx
import { FaWalking, FaTint, FaBed } from 'react-icons/fa';
import { useLogsData } from '../useLogsData';
import { useAuth } from '../AuthContext';

const TYPE_META = {
  walk: { label: 'Walk', unit: 'steps', icon: <FaWalking />, className: 'type-walk' },
  water: { label: 'Water', unit: 'ml', icon: <FaTint />, className: 'type-water' },
  sleep: { label: 'Sleep', unit: 'hrs', icon: <FaBed />, className: 'type-sleep' },
};

function History() {
  const { logs, loading, refreshAll } = useLogsData();
  const { token, API_BASE } = useAuth();

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this log entry?');
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/logs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      refreshAll();
    } catch (err) {
      console.error(err);
      alert('Something went wrong deleting that log.');
    }
  };

  if (loading) return <p className="empty-note">Loading...</p>;

  return (
    <>
      <div className="main-header">
        <h1>History</h1>
        <p>All your logged activity.</p>
      </div>

      <div className="card">
        {logs.length === 0 ? (
          <div className="history-empty">
            <p>No logs yet — head to the dashboard to add your first one.</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const meta = TYPE_META[log.type];
                return (
                  <tr key={log.id}>
                    <td>
                      <span className={`type-pill ${meta.className}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </td>
                    <td className="history-value">
                      {Number(log.value).toLocaleString()} <span className="unit">{meta.unit}</span>
                    </td>
                    <td className="history-date">
                      {new Date(log.logged_at).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td>
                      <button
                        className="icon-btn delete"
                        onClick={() => handleDelete(log.id)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default History;