"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  FlaskConical,
  BrainCircuit,
  BookMarked,
  BarChart3,
  UserCircle,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/modulos', label: 'Módulos', icon: LayoutGrid },
  { href: '/simulador', label: 'Simulador', icon: FlaskConical },
  { href: '/herramientas-ia', label: 'Herramientas IA', icon: BrainCircuit },
  { href: '/gestor-referencias', label: 'Gestor de Referencias', icon: BookMarked },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/perfil', label: 'Perfil', icon: UserCircle },
  { href: '/usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
];

export function NavMenu() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = navItems.filter(item => {
    if (item.adminOnly && (!mounted || user?.role !== 'admin')) return false;
    return true;
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu className="space-y-2">
        {filteredItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "w-full justify-start h-12 px-4 rounded-2xl transition-all duration-300",
                  pathname === item.href 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                )}
                tooltip={item.label}
              >
                <a className="flex items-center gap-3">
                  <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-inherit")} />
                  <span className="font-medium">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <div className="mt-auto pt-8 border-t border-white/10 px-2 pb-4">
        {mounted && user ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
            <Avatar className="h-10 w-10 border-2 border-primary/20 rounded-xl overflow-hidden">
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user.name || 'Usuario'}</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5 truncate">
                {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-14 w-full bg-white/5 animate-pulse rounded-2xl" />
        )}
      </div>
    </div>
  );
}
