import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getChatList } from '../api/chatApi';

const DashboardLayout = ({ allowedRoles }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <span className="text-white font-bold text-xl leading-none">M</span>
          </div>
          <div>
            <span className="text-lg font-semibold text-slate-900 tracking-tight leading-none block">Mentora</span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">Platform</span>
          </div>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {user.role} Menu
          </div>
          <Link
            to={`/${user.role}`}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${location.pathname === `/${user.role}` ? 'text-indigo-700 bg-indigo-50 shadow-sm border-l-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'}`}
          >
            Dashboard
          </Link>
          <Link
            to="/chat"
            className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${location.pathname === '/chat' ? 'text-indigo-700 bg-indigo-50 shadow-sm border-l-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'}`}
          >
            <span>Messages</span>
            {unread > 0 && (
              <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-l-2 border-transparent"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800">{user.name}</span>
              <span className="text-[10px] font-medium text-slate-500 capitalize">{user.role}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 shadow-sm">
              {user.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
