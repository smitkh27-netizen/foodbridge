'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'ngo' | 'volunteer' | 'admin';
  avatar?: string;
  isVerified: boolean;
  ngoName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('foodbridge_token');
    const storedUser = localStorage.getItem('foodbridge_user');
    
    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error("Corrupted local storage data. Clearing...");
        localStorage.removeItem('foodbridge_token');
        localStorage.removeItem('foodbridge_user');
      }
    } else if (storedUser === 'undefined') {
      localStorage.removeItem('foodbridge_user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // 2. Fetch user profile and role from Firestore
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData: any = { _id: fbUser.uid, email: fbUser.email, role: 'donor', name: 'User' };
      if (userDoc.exists()) {
        userData = { _id: fbUser.uid, ...userDoc.data() };
      }

      const token = await fbUser.getIdToken();

      // 3. Update local state and storage
      setToken(token);
      setUser(userData);
      localStorage.setItem('foodbridge_token', token);
      localStorage.setItem('foodbridge_user', JSON.stringify(userData));

      // 4. Redirect based on role
      const dashboardMap: Record<string, string> = {
        donor: '/dashboard/donor',
        ngo: '/dashboard/ngo',
        volunteer: '/dashboard/volunteer',
        admin: '/dashboard/admin',
      };
      router.push(dashboardMap[userData.role] || '/');
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      // Throw error to be caught by LoginPage for displaying Toast
      const msg = err.code?.replace('auth/', '').replace(/-/g, ' ') || 'Invalid credentials';
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
