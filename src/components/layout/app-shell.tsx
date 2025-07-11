"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { BrainCircuit, LayoutDashboard, LogOut, Target } from 'lucide-react';
import { useAuth } from '../auth/auth-provider';
import { auth } from '@/lib/firebase';
import { Button } from '../ui/button';
import { ThemeToggle } from './theme-toggle';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  const handleLogout = () => {
    auth.signOut();
  };

  if (!user && !loading) {
    return <main className="flex-1">{children}</main>;
  }
  
  if (loading) {
     return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-4 flex flex-col">
          <SidebarMenu className='flex-1'>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/'}
                tooltip={{ children: 'Dashboard' }}
              >
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/goals'}
                tooltip={{ children: 'Goals' }}
              >
                <Link href="/goals">
                  <Target />
                  <span>Goals</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/meditation'}
                tooltip={{ children: 'Meditation' }}
              >
                <Link href="/meditation">
                  <BrainCircuit />
                  <span>Meditation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarFooter className='flex-row justify-between items-center'>
             <Button variant="ghost" className="justify-start gap-2" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </Button>
            <ThemeToggle />
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold font-headline">Thrive Daily</h1>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
