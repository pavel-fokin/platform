import { Outlet } from 'react-router';
import { Sidebar } from '~/components/sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="py-8">
              <Outlet />
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
