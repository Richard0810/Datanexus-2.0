
"use client";

import { useState, useEffect } from 'react';
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
import { Accessibility, Contrast, Text, LogOut, User, Search, Bell, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '../ui/input';

export function Header() {
  const { user, signOut } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/'); 
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0 && pathname !== '/modulos') {
      router.push('/modulos');
    }
  };

  if (!mounted) return <header className="sticky top-0 z-10 flex h-20 items-center border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 md:px-12 w-full" />;

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 md:px-12 w-full">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="md:hidden" />
        
        <div className="flex-1 max-w-xs md:max-w-md relative group">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar módulo..." 
            className="w-full pl-9 md:pl-11 pr-10 h-10 md:h-11 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 placeholder:text-slate-400 text-sm"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        <Button variant="ghost" size="icon" className="hidden sm:flex rounded-2xl bg-slate-50 text-slate-500 relative h-9 w-9 md:h-10 md:w-10">
          <Bell className="h-4 w-4 md:h-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-destructive border-2 border-white rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-2xl bg-slate-50 text-slate-500 h-9 w-9 md:h-10 md:w-10">
              <Accessibility className="h-4 w-4 md:h-5" />
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

        <div className="h-8 w-[1px] bg-slate-100 mx-1 md:mx-2 hidden sm:block"></div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2 md:gap-3 h-10 md:h-12 px-1 md:px-2 hover:bg-slate-50 rounded-2xl transition-all">
                <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-primary/10 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xs md:text-sm">{getInitials(user.name)}</AvatarFallback>
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
        ) : (
          <div className="h-10 w-10 md:h-12 md:w-32 bg-slate-50 animate-pulse rounded-2xl" />
        )}
      </div>
    </header>
  );
}
