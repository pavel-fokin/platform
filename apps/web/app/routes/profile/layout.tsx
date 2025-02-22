import { Outlet } from 'react-router';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen max-w-screen-sm mx-auto p-4">
      <header className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Fair Interviews</h1>
      </header>
      <main className="grow flex flex-col max-w-screen-sm mx-auto p-4">
        <Outlet />
      </main>
      <footer className="flex flex-row items-center justify-between">
        <p>© 2025 Fair Interviews</p>
      </footer>
    </div>
  );
};

export default Layout;
