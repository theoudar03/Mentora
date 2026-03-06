import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getChatList } from '../api/chatApi';
import { Menu, X, LayoutDashboard, MessageCircle, LogOut } from 'lucide-react';

const DashboardLayout = ({ allowedRoles }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Poll unread count every 5s
  useEffect(() => {
    if (!user) return;
    const fetchUnread = () =>
      getChatList().then(r => {
        const total = r.data.reduce((sum, c) => sum + (c.unread || 0), 0);
        setUnread(total);
      }).catch(() => {});
    fetchUnread();
    const t = setInterval(fetchUnread, 5000);
    return () => clearInterval(t);
  }, [user]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500 text-sm">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  const navItems = [
    { to: `/${user.role}`, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'Messages', icon: MessageCircle, badge: unread },
  ];

  const NavLinks = () => (
    <>
      {navItems.map(({ to, label, icon: Icon, badge }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
              ${active
                ? 'text-indigo-700 bg-indigo-50 border-l-2 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
              }`}
          >
            <span className="flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </span>
            {badge > 0 && (
              <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:relative z-40 h-full
        w-64 bg-white border-r border-slate-200 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <span className="text-white font-bold text-xl leading-none">M</span>
            </div>
            <div>
              <span className="text-lg font-semibold text-slate-900 tracking-tight leading-none block">Mentora</span>
              <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">Platform</span>
            </div>
          </div>
          {/* Close button – mobile only */}
          <button
            className="md:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 flex-1 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {user.role} Menu
          </div>
          <NavLinks />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-l-2 border-transparent"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        {/* Top header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          {/* Hamburger – mobile only */}
          <button
            className="md:hidden text-slate-600 hover:text-indigo-600 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Spacer on desktop */}
          <div className="hidden md:block" />

          {/* User info */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</span>
              <span className="text-[10px] font-medium text-slate-500 capitalize">{user.role}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 shadow-sm text-sm">
              {user.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
