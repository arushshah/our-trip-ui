import React, { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'src/context/AuthContext';

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const authContext = useAuth();

  if (!authContext || authContext.loading) {
    return <div>Loading...</div>; // Show a loading spinner or progress bar
  }

  if (!authContext.isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;