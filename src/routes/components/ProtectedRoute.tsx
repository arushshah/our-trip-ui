import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'src/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/sign-in" />;
};

export default ProtectedRoute;