import { Briefcase, User, Wallet } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '~/components/ui/sidebar';

export const Sidebar = () => {
  const isActive = (path: string) => {
    return useLocation().pathname === path;
  };

  return (
    <SidebarComponent>
      <SidebarHeader>
        <h2 className="text-xl font-bold">Fair Interviews</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/me')}>
                <NavLink to="/me">
                  <User className="w-5 h-5" />
                  Profile
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/me/interviews')}>
                <NavLink to="/me/interviews">
                  <Briefcase className="w-5 h-5" />
                  Interviews
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/me/wallet')}>
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
    </SidebarComponent>
  );
};