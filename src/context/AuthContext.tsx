import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

export function AuthProvider({children}: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (auth_user) => {
      if (localStorage.getItem("userSetupStarted") === "true") {
        return
      }
      console.log("HERE I WAS CALLED");
      console.log("AUTH: ", auth)
      console.log("AUTH USER: ", auth_user)
      if (auth_user) {
        try {
          const token = await auth_user.getIdToken();
          const currentTime = Date.now()/1000;
          const decodedToken: any = jwtDecode(token);
          console.log("CURRENT TIME: ", currentTime+3580);
          console.log("EXP TIME: ", decodedToken.exp);

          if (decodedToken.exp < currentTime+3580) {
            console.log("SIGNING OUT LINE 43");
            signOut();
            navigate('/sign-in')
            return;
          }

          console.log("CALLING VALIDATE USER")
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
            console.log("SIGNING OUT LINE 65");
            signOut();
          }
        }
        catch (error) {
          console.error('Error validating user:', error);
          console.log("SIGNING OUT LINE 71");
          signOut();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [signOut, navigate]);

  const value = useMemo(() => ({
    user,
    loading,
    signOut,
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