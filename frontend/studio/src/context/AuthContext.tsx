/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; 
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si auth no está inicializado (build time o error), marcar como no cargando
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Sincronizar con el backend de MongoDB
          const response = await api.post('/auth/sync', { 
            token,
            name: firebaseUser.displayName 
          });
          
          const userData = response.data;
          // Mapeamos 'rol' de MongoDB a 'role' del objeto de estado (Frontend)
          const rawRole = userData.rol || 'estudiante';
          const normalizedRole = rawRole.trim().toLowerCase();

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.nombre || firebaseUser.displayName || 'Usuario',
            role: normalizedRole,
          });

          if (['/', '/login', '/register'].includes(pathname)) {
            router.push('/inicio');
          }
        } catch (error) {
          console.error('Error sincronizando con el backend:', error);
          // Fallback de emergencia por correo
          const isAdminEmail = firebaseUser.email === 'richardai200308@gmail.com';
          setUser({ 
            uid: firebaseUser.uid, 
            email: firebaseUser.email, 
            name: firebaseUser.displayName,
            role: isAdminEmail ? 'admin' : 'estudiante'
          });
        }
      } else {
        setUser(null);
        if (!['/', '/login', '/register'].includes(pathname)) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        throw new Error('La ventana emergente fue bloqueada por el navegador.');
      }
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    if (!auth) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    registerWithEmail,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}