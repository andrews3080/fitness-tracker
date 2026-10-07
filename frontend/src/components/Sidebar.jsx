// components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { SiNeptune } from 'react-icons/si';
import { FaHome, FaHistory, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import './Sidebar.css';
import logo from '../assets/logo.png';
import { FaBullseye } from 'react-icons/fa';

function Sidebar() {
  const { logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="FitnessTracker" />
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHome className="fa-icon" />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHistory className="fa-icon" />
              <span>History</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaBullseye className="fa-icon" />
              <span>Goals</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaCog className="fa-icon" />
              <span>Settings</span>
            </NavLink>
          </li>
          <li>
            <button onClick={logout} className="sidebar-logout">
              <FaSignOutAlt className="fa-icon" />
              <span>Log out</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;