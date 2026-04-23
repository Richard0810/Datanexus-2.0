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
  type LucideIcon,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/modulos', label: 'Módulos', icon: LayoutGrid },
  { href: '/simulador', label: 'Simulador', icon: FlaskConical },
  { href: '/herramientas-ia', label: 'Herramientas IA', icon: BrainCircuit },
  { href: '/gestor-referencias', label: 'Gestor de Referencias', icon: BookMarked },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/perfil', label: 'Perfil', icon: UserCircle },
  { href: '/modelo', label: 'Modelo de Datos', icon: DatabaseZap },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
