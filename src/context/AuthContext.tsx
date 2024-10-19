import React, { createContext, useState, useEffect, useCallback, useContext, useMemo, ReactNode } from 'react';
import { useRouter } from 'src/routes/hooks';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:5000/users/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/users/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_username: username, user_password: password }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        localStorage.setItem('access_token', result.access_token);
        setIsAuthenticated(true);
        router.push('/');
      } else {
        throw new Error('Invalid username and/or password.');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [router]);

  const signOut = useCallback(() => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    router.push('/sign-in');
  }, [router]);

  const value = useMemo(() => ({
    isAuthenticated,
    loading,
    signIn,
    signOut,
  }), [isAuthenticated, loading, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};