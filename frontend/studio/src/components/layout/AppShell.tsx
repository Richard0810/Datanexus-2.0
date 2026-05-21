
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

  const isAuthRoute = pathname === '/login' || pathname === '/register';

  if (isAuthRoute) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-none bg-sidebar text-sidebar-foreground shadow-2xl" collapsible="icon" variant="sidebar">
        <SidebarHeader className="p-8">
          <Link href="/inicio" className="flex items-center gap-3 group">
            <div className="bg-primary/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <LogoIcon className="h-8 w-8" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tight">
              <span className="text-white">Data</span>
              <span className="text-primary">nexus</span>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-4 py-2">
          <NavMenu />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen bg-background rounded-l-[3rem] overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth">
          {children}
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
