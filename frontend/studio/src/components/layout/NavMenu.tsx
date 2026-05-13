
"use client";

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
  DatabaseZap,
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

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
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
  { href: '/modelo', label: 'Modelo de Datos', icon: DatabaseZap },
];

export function NavMenu() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredItems = navItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    return true;
  });

  return (
    <SidebarMenu>
      {filteredItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              tooltip={item.label}
            >
              <a>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
