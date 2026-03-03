import React from 'react';

const WelfareAlerts = ({ alerts }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-800">Campus Alerts</h2>
        <p className="text-sm text-gray-500">Live monitoring feed</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {alerts && alerts.length > 0 ? (
          <ul className="divide-y divide-gray-50">
            {alerts.map((alert) => (
              <li 
                key={alert.id} 
                className={`p-4 transition-all rounded-xl m-2
                  ${alert.type === 'High' ? 'bg-red-50/30 border border-red-100 hover:bg-red-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className={`text-sm font-medium leading-snug
                      ${alert.type === 'High' ? 'text-gray-900' : 'text-gray-800'}
                    `}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">{alert.time}</p>
                  </div>
                  {alert.type === 'High' && (
                    <span className="relative flex h-3 w-3 mt-1 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-sm border border-white"></span>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-400 p-8 pt-12 flex flex-col items-center">
            <span className="text-3xl mb-2 opacity-50">🪴</span>
            <p className="font-medium">No critical alerts detected.</p>
            <p className="text-xs mt-1">Campus status is stable.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelfareAlerts;
