import { Link, useLocation, Form } from 'react-router';
import {
  BriefcaseIcon,
  CalendarIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
  WalletIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet';

interface NavItem {
  label: string;
  href: string;
  icon: typeof HomeIcon;
}

interface SidebarProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/me',
    icon: HomeIcon,
  },
  {
    label: 'Profile',
    href: '/me/profile',
    icon: UserIcon,
  },
  {
    label: 'Interviews',
    href: '/me/interviews',
    icon: CalendarIcon,
  },
  {
    label: 'Wallet',
    href: '/me/wallet',
    icon: WalletIcon,
  },
];

export function Sidebar({ children }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const NavContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          {/* <BriefcaseIcon className="h-6 w-6" /> */}
          <span>Fair Interviews</span>
        </Link>
      </div>

      <div className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800',
                isActive && 'bg-gray-100 dark:bg-gray-800'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400',
                  isActive && 'text-blue-600 dark:text-blue-400'
                )}
              />
              <span
                className={cn(
                  'text-gray-700 dark:text-gray-300',
                  isActive && 'text-blue-600 dark:text-blue-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto border-t px-3 py-4">
        <Form method="post" action="/auth/logout">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 px-3"
          >
            <LogOutIcon className="h-5 w-5" />
            Sign Out
          </Button>
        </Form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 border-r lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        <NavContent />
      </aside>

      {/* Mobile Trigger */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 dark:bg-gray-900 sm:gap-x-6 sm:px-6 lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <NavContent />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <Link to="/" className="-m-1.5 flex items-center gap-2 p-1.5">
              {/* <BriefcaseIcon className="h-6 w-6" /> */}
              <span className="font-semibold">Fair Interviews</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Wrapper */}
      <main className="lg:pl-64">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </main>
    </>
  );
}