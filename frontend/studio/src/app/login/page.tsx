'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import LogoIcon from '@/components/icons/LogoIcon';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { user, signInWithGoogle, signInWithEmail } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/inicio');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google.");
      console.error(err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoggingIn(true);
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError("Credenciales incorrectas o problema de conexión.");
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-none overflow-hidden rounded-[2.5rem]">
        <CardHeader className="text-center pt-10">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-50 p-6 rounded-[2rem] shadow-inner">
              <LogoIcon className="h-20 w-20" />
            </div>
          </div>
          <CardTitle className="text-4xl font-headline font-bold">
            <span className="text-slate-900">Data</span><span className="text-primary">nexus</span>
          </CardTitle>
          <CardDescription className="text-lg">Tu portal de investigación académica</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription className="text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoggingIn || isGoogleLoading}
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn || isGoogleLoading}
                className="rounded-2xl h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/20" disabled={isLoggingIn || isGoogleLoading}>
              {isLoggingIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Iniciar Sesión
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-muted-foreground">O continuar con</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 rounded-2xl border-slate-200" 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google
          </Button>

          <div className="mt-8 text-center text-sm text-slate-500">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Regístrate gratis
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
