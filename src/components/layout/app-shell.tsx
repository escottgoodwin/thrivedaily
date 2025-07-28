
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { BrainCircuit, LayoutDashboard, LogOut, Target, Languages, Scale, Smile } from 'lucide-react';
import { useAuth } from '../auth/auth-provider';
import { auth } from '@/lib/firebase';
import { Button } from '../ui/button';
import { ThemeToggle } from './theme-toggle';
import { useLanguage, type Language } from '../i18n/language-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { t, setLanguage } = useLanguage();
  
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
                tooltip={{ children: t('sidebar.dashboard') }}
              >
                <Link href="/">
                  <LayoutDashboard />
                  <span>{t('sidebar.dashboard')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/goals')}
                tooltip={{ children: t('sidebar.goals') }}
              >
                <Link href="/goals">
                  <Target />
                  <span>{t('sidebar.goals')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/meditation'}
                tooltip={{ children: t('sidebar.meditation') }}
              >
                <Link href="/meditation">
                  <BrainCircuit />
                  <span>{t('sidebar.meditation')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/decision-matrix'}
                tooltip={{ children: t('sidebar.decisionMatrix') }}
              >
                <Link href="/decision-matrix">
                  <Scale />
                  <span>{t('sidebar.decisionMatrix')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/affirmations'}
                tooltip={{ children: t('sidebar.affirmations') }}
              >
                <Link href="/affirmations">
                  <Smile />
                  <span>{t('sidebar.affirmations')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarFooter className='flex-row justify-between items-center'>
             <Button variant="ghost" className="justify-start gap-2" onClick={handleLogout}>
              <LogOut />
              <span>{t('sidebar.logout')}</span>
            </Button>
            <div className="flex items-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Languages />
                             <span className="sr-only">{t('sidebar.language')}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLanguage('en' as Language)}>English</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('es' as Language)}>Español</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('fr' as Language)}>Français</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ThemeToggle />
            </div>
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
