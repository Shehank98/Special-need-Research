import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Guards routes by auth state and (optionally) role.
export default function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/home'} replace />;
  }
  return children;
}
