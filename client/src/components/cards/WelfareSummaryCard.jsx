import React from 'react';

const WelfareSummaryCard = ({ title, count, trend, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{count}</h3>
        {trend && (
          <p className={`text-sm mt-2 font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>
            {trend} from last week
          </p>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl ${colorClass || 'bg-indigo-50 text-indigo-600'}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default WelfareSummaryCard;
