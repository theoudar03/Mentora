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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600">Mentora</span>
          <span className="text-[9px] font-semibold tracking-widest text-indigo-400 uppercase block -mt-1">Mental Health + Mentoring</span>
        </div>
        <nav className="p-4 space-y-2">
          <div className="px-2 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
            {user.role} Menu
          </div>
          <Link
            to={`/${user.role}`}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${location.pathname === `/${user.role}` ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Dashboard
          </Link>
          <Link
            to="/chat"
            className={`flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition ${location.pathname === '/chat' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span>Messages</span>
            {unread > 0 && (
              <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <button 
            onClick={logout}
            className="w-full text-left px-4 py-2 mt-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
