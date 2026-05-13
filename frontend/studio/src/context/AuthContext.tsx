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
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Sincronizamos con el backend. Esto asegura que el usuario exista en MongoDB.
          const response = await api.post('/auth/sync', { 
            token,
            name: firebaseUser.displayName 
          });
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: response.data.nombre || firebaseUser.displayName || 'Usuario',
          });

          // Redirigir si está en páginas de auth
          if (['/', '/login', '/register'].includes(pathname)) {
            router.push('/inicio');
          }
        } catch (error) {
          console.error('Error sincronizando con el backend:', error);
          // Si falla el backend, al menos mantenemos la sesión de Firebase
          setUser({ 
            uid: firebaseUser.uid, 
            email: firebaseUser.email, 
            name: firebaseUser.displayName 
          });
        }
      } else {
        setUser(null);
        // Protegemos las rutas privadas
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
      // Configuramos parámetros opcionales para forzar la selección de cuenta si es necesario
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Actualizamos el nombre en Firebase Auth
      await updateProfile(userCredential.user, { displayName: name });
      
      // La sincronización con MongoDB ocurrirá automáticamente en onAuthStateChanged
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
