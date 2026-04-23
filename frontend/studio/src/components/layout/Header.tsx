
"use client";

import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Accessibility, Contrast, Text, Volume2, LogOut, User } from 'lucide-react';
import LogoIcon from '@/components/icons/LogoIcon';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, signOut } = useAuth(); // CORRECCIÓN: Se llama signOut, no logout.
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(); // CORRECCIÓN: Llamamos a la función correcta.
    // La redirección ya la maneja la función signOut, pero la dejamos por si acaso.
    router.push('/'); 
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2 md:hidden">
        <LogoIcon className="h-6 w-6 text-primary" />
        <span className="font-headline text-lg font-semibold">DataNexus</span>
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Opciones de Accesibilidad">
              <Accessibility className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Accesibilidad</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Contrast className="mr-2 h-4 w-4" />
              <span>Alto Contraste</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Text className="mr-2 h-4 w-4" />
              <span>Aumentar Fuente</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Text className="mr-2 h-4 w-4" /> 
              <span>Disminuir Fuente</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Volume2 className="mr-2 h-4 w-4" />
              <span>Leer Texto (Próximamente)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  {/* CORRECCIÓN: La propiedad es 'name', no 'nombre' */}
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/perfil')}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
