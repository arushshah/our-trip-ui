import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from 'src/firebaseConfig';
import { jwtDecode } from 'jwt-decode';
import { apiUrl } from 'src/config';

interface User {
  firstName: string;
  lastName: string;
  userId: string;
  phoneNumber: string;
  isCurrentTripHost: null | boolean;
  rsvpStatus: null | string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  idToken: string | null;
  skipValidationRef: React.MutableRefObject<boolean>;
  setSkipValidation: (skip: boolean) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}
console.log("AuthProvider initialized");

export const AuthProvider: React.FC<AuthProviderProps> = React.memo(({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  
  const skipValidationRef = useRef(false);
  const isProcessingRef = useRef(false);
  
  const setSkipValidation = useCallback((skip: boolean) => {
    skipValidationRef.current = skip;
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    localStorage.clear()
    setUser(null);
    setIdToken(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebase_user) => {
      if (skipValidationRef.current) {
        return;
      }
      if (isProcessingRef.current) {
        return;
      }
      if (firebase_user) {
        isProcessingRef.current = true;
        try {
          const token = await firebase_user.getIdToken();
          setIdToken(token);
          const currentTime = Date.now()/1000;
          const decodedToken: any = jwtDecode(token);

          if (decodedToken.exp < currentTime) {
            signOut();
            navigate('/sign-in')
            return;
          }
          const response = await fetch(`${apiUrl}/users/validate-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone_number: firebase_user.phoneNumber })
          });

          const data = await response.json();
          if (response.status === 200) {
            setUser({firstName: data.firstName, lastName: data.lastName, userId: data.id, phoneNumber: data.phoneNumber, isCurrentTripHost: null, rsvpStatus: null});
          } else {
            console.error('User entry does not exist in the database.');
            setUser(null);
            setIdToken(null);
            signOut();
          }
        }
        catch (error) {
          console.error('Error validating user:', error);
          setUser(null);
          setIdToken(null);
          signOut();
        }
        finally {
          isProcessingRef.current = false;
          setLoading(false);
        }
      } else {
        setUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [signOut, navigate, setSkipValidation]);

  const value = useMemo(() => ({
    user,
    loading,
    signOut,
    idToken,
    skipValidationRef,
    setSkipValidation
  }), [user, loading, signOut, idToken, setSkipValidation]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};