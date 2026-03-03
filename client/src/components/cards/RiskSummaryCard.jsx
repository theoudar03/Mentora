import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const RiskSummaryCard = ({ title, count, trend, type }) => {
  const isPositiveTrend = trend.startsWith('+');
  
  const getConfig = () => {
    switch(type) {
      case 'High':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          bgIcon: 'bg-red-50',
          textColor: 'text-red-600'
        };
      case 'Medium':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          bgIcon: 'bg-yellow-50',
          textColor: 'text-yellow-600'
        };
      case 'Stable':
      default:
        return {
          icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
          bgIcon: 'bg-green-50',
          textColor: 'text-green-600'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">{count}</span>
          <span className={`text-xs font-semibold ${isPositiveTrend ? 'text-green-600' : 'text-red-500'}`}>
            {trend} this week
          </span>
        </div>
      </div>
      <div className={`p-4 rounded-full ${config.bgIcon}`}>
        {config.icon}
      </div>
    </div>
  );
};

export default RiskSummaryCard;
