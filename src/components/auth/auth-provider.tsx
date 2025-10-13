
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { createUserDocument } from '@/app/actions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Create a document in Firestore for the user if it doesn't exist
        createUserDocument(user.uid, user.email!);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isLandingPage = pathname === '/';

    // If the user is not logged in and not on an auth page or the landing page, redirect to login
    if (!user && !isAuthPage && !isLandingPage) {
      router.push('/login');
    } 
    // If the user is logged in and on an auth page, redirect to the dashboard
    else if (user && isAuthPage) {
      router.push('/dashboard');
    }
    // If the user is logged in and on the landing page, redirect to the dashboard
    else if (user && isLandingPage) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

    