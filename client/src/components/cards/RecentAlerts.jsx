import React from 'react';
import { Bell } from 'lucide-react';

const RecentAlerts = ({ alerts }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 flex items-center gap-2">
        <Bell className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-800">Recent Alerts</h2>
        <span className="ml-auto bg-red-100 text-red-600 text-xs py-0.5 px-2 rounded-full font-bold">
          {alerts.filter(a => a.type === 'High').length} New
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="divide-y divide-gray-50">
          {alerts.map((alert) => (
            <li key={alert.id} className="p-4 hover:bg-gray-50/80 rounded-xl transition-colors mb-1 last:mb-0 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${alert.type === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-yellow-400'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${alert.type === 'High' ? 'text-red-500' : 'text-gray-900'}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                    {alert.timestamp}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {alerts.length === 0 && (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full text-gray-500">
            <Bell className="w-10 h-10 text-gray-200 mb-2 opacity-50" />
            <p className="text-sm">No recent alerts detected</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-50 bg-gray-50/50 text-center">
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          View all alerts
        </button>
      </div>
    </div>
  );
};

export default RecentAlerts;
