import { Outlet } from 'react-router';

import {
  Sidebar,
} from '~/components/sidebar';
import {
  SidebarProvider,
} from '~/components/ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SidebarProvider>
        <Sidebar>
          <main className="grow flex flex-col max-w-screen-sm mx-auto p-4">
            <Outlet />
          </main>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
