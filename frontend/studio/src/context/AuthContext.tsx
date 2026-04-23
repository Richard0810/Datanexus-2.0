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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Sincronizamos con el backend pasándole también el nombre actual de Firebase
          const response = await api.post('/auth/sync', { 
            token,
            name: firebaseUser.displayName 
          });
          
          setUser({
            uid: response.data.firebaseUid || firebaseUser.uid,
            email: response.data.email || firebaseUser.email,
            name: response.data.nombre || firebaseUser.displayName,
          });

          if (['/', '/login', '/register'].includes(pathname)) {
            router.push('/inicio');
          }
        } catch (error) {
          console.error('Error sincronizando con el backend:', error);
          setUser({ 
            uid: firebaseUser.uid, 
            email: firebaseUser.email, 
            name: firebaseUser.displayName 
          });
        }
      } else {
        setUser(null);
        if (!['/', '/login', '/register', '/modelo'].includes(pathname)) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Primero actualizamos el perfil en Firebase
      await updateProfile(userCredential.user, { displayName: name });
      
      // Forzamos la sincronización inmediata con el nombre correcto
      const token = await userCredential.user.getIdToken();
      await api.post('/auth/sync', { token, name });
      
    } catch (error) {
      console.error("Error al registrar con email:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error al iniciar sesión con email:", error);
      throw error;
    }
  };

  const signOut = async () => {
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
