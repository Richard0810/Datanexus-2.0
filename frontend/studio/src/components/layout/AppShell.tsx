
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { NavMenu } from './NavMenu';
import { Header } from './Header';
import { Footer } from './Footer';
import LogoIcon from '@/components/icons/LogoIcon';
import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ya no necesitamos excluir '/' porque redirige a /inicio
  // pero mantenemos la lógica por si acaso se accede a una página "limpia"
  if (pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r" collapsible="icon" variant="sidebar">
        <SidebarHeader className="p-4">
          <Link href="/inicio" className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-semibold text-foreground">DataNexus</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <NavMenu />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
