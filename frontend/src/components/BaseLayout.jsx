import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/launch", label: "New Launch" },
  { to: "/history", label: "History" },
];

const STORAGE_KEY = "socialgen-dark-mode";

function getInitialDark() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === "true";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function BaseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const initial = getInitialDark();
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-[240px_1fr] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <header className="md:col-span-2 flex items-center justify-between px-4 py-3 bg-violet-600 dark:bg-violet-800 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 rounded hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle navigation sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-xl font-bold tracking-tight">SocialGen</span>
        </div>

        <span className="hidden sm:block text-sm font-medium truncate mx-4">
          Automated Social Media Content Generator
        </span>

        <button
          onClick={toggleDark}
          className="p-2 rounded hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-20 w-60
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          pt-4 pb-6 overflow-y-auto
        `}
        aria-label="Main navigation"
      >
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 ${
                  isActive
                    ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="p-6 overflow-auto" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
