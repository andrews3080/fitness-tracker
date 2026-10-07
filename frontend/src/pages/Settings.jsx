// pages/Settings.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Settings() {
  const { user} = useAuth();

  return (
    <>
      <div className="main-header">
        <h1>Settings</h1>
        <p>Manage your account.</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2>Account</h2>
        <p className="settings-row"><strong>Name:</strong> {user?.name}</p>
        <p className="settings-row"><strong>Email:</strong> {user?.email}</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2>Daily Goals</h2>
        <p className="settings-row">
          Manage your step, water, and sleep targets on the <Link to="/goals">Goals</Link> page.
        </p>
      </div>
      </>
  );
}

export default Settings;