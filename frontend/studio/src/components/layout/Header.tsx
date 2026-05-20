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
import { Accessibility, Contrast, Text, Volume2, LogOut, User, Search, Bell } from 'lucide-react';
import LogoIcon from '@/components/icons/LogoIcon';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/'); 
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 md:px-8">
      <SidebarTrigger className="md:hidden" />
      
      <div className="hidden md:flex flex-1 items-center max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Buscar módulo..." 
          className="w-full pl-11 h-11 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 placeholder:text-slate-400"
        />
      </div>

      <div className="flex w-full md:w-auto items-center justify-end gap-3">
        <Button variant="ghost" size="icon" className="rounded-2xl bg-slate-50 text-slate-500 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-destructive border-2 border-white rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-2xl bg-slate-50 text-slate-500">
              <Accessibility className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
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
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-3 h-12 px-2 hover:bg-slate-50 rounded-2xl transition-all">
                <Avatar className="h-9 w-9 border-2 border-primary/10 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{user.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2">
              <DropdownMenuLabel className="px-3 py-2">Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/perfil')} className="rounded-xl px-3 py-2 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-3 py-2 cursor-pointer text-destructive focus:text-destructive">
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