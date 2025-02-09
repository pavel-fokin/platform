import { NavLink, Outlet, useLocation } from 'react-router';

import { User, Briefcase, Wallet } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarGroupLabel,
} from '~/components/ui/sidebar';
import { Button } from '~/components/ui/button';

export default function Layout({ children }: { children: React.ReactNode }) {
  const isActive = (path: string) => {
    return useLocation().pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-xl font-bold">Fair Interviews</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/profile')}>
                    <NavLink to="/me">
                      <User className="w-5 h-5" />
                      Profile
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/interviews')}>
                    <NavLink to="/me/interviews">
                      <Briefcase className="w-5 h-5" />
                      Interviews
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/wallet')}>
                    <NavLink to="/me/wallet">
                      <Wallet className="w-5 h-5" />
                      Wallet
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="outline" asChild>
              <NavLink to="/">Log out</NavLink>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="grow flex flex-col max-w-screen-sm mx-auto p-4">
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
