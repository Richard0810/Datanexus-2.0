'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LogoIcon from '@/components/icons/LogoIcon';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir cuando el estado de autenticación ya no esté cargando
    if (!loading) {
      if (user) {
        router.replace('/inicio');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Muestra una pantalla de carga mientras se determina el estado de autenticación
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-primary/10 mb-6">
        <LogoIcon className="w-16 h-16 animate-pulse" />
      </div>
      <p className="text-muted-foreground animate-pulse font-headline font-bold text-lg tracking-tight">
        Cargando <span className="text-slate-900">Data</span><span className="text-primary">nexus</span>...
      </p>
    </div>
  );
}
