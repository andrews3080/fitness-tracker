// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <p className="empty-note">Loading...</p>;
  if (!token) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;