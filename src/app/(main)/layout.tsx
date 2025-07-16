
"use client";

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { LogOut, Search, Undo2, Redo2, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';


function LayoutContent({ children }: { children: React.ReactNode }) {
  const { searchTerm, setSearchTerm, undoLastChange, canUndo, redoLastChange, canRedo } = useAppContext();
  const router = useRouter();
  
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader className='border-b border-sidebar-border'>
          <div className="flex items-center gap-2">
            <AppLogo className="size-8 text-sidebar-foreground" />
            <span className="text-lg font-semibold text-sidebar-foreground">PharmaTrack</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className='border-t border-sidebar-border'>
            <div className="flex items-center gap-3 p-2 rounded-md transition-colors">
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person portrait" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-sm truncate text-sidebar-foreground">John Doe, RPh</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate">Pharmacist</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                    <LogOut className="w-4 h-4"/>
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => router.forward()}><ArrowRight className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => router.push('/patients')}><ArrowUp className="h-4 w-4" /></Button>
            </div>
            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by patient M.R./name or medication..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="flex-col h-auto" onClick={undoLastChange} disabled={!canUndo}>
                  <Undo2 className="h-4 w-4" />
                  <span className="text-xs">U</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo Last Change</p>
              </TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                 <Button variant="ghost" className="flex-col h-auto" onClick={redoLastChange} disabled={!canRedo}>
                  <Redo2 className="h-4 w-4" />
                  <span className="text-xs">R</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo Last Change</p>
              </TooltipContent>
            </Tooltip>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <LayoutContent>{children}</LayoutContent>
    </AppProvider>
  );
}
