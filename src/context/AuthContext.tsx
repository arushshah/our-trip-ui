import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from 'src/firebaseConfig';
import { jwtDecode } from 'jwt-decode';
import { apiUrl } from 'src/config';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (auth_user) => {
      if (auth_user) {
        try {
          const token = await auth_user.getIdToken();
          const currentTime = Date.now()/1000;
          const decodedToken: any = jwtDecode(token);

          if (decodedToken.exp < currentTime) {
            await firebaseSignOut(auth);
            setUser(null);
            navigate('/sign-in')
            return;
          }

          const response = await fetch(`${apiUrl}/users/validate-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone_number: auth_user.phoneNumber })
          });

          const data = await response.json();
          if (response.status === 200) {
            setUser(auth_user);
            localStorage.setItem("first_name", data.firstName);
            localStorage.setItem("last_name", data.lastName);
          } else {
            console.error('User entry does not exist in the database.');
            await firebaseSignOut(auth);
            setUser(null);
          }
        }
        catch (error) {
          console.error('Error validating user:', error);
          await firebaseSignOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signOut
  }), [user, loading, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};