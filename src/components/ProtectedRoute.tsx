import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'club' | 'fan';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] loading:', loading, '| user:', user);

  if (loading) {
    console.log('[ProtectedRoute] still loading → showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] no user → redirecting to login');
    const redirectTo = requiredRole === 'club' ? '/auth/club-login' : '/fan/login';
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('[ProtectedRoute] wrong role:', user.role, '→ redirecting');
    const redirectPath = user.role === 'club' ? '/club/dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  console.log('[ProtectedRoute] access granted for role:', user.role);
  return <>{children}</>;
};