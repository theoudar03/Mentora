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
    <div className="group flex flex-col p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 -mr-10 -mt-10 ${config.bgIcon} pointer-events-none`}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{title}</h3>
        <div className={`p-2 rounded-xl bg-slate-50/50 backdrop-blur-sm border border-slate-100 ${config.textColor}`}>
          {config.icon}
        </div>
      </div>
      <div className="flex items-baseline gap-3 relative z-10">
        <span className="text-4xl font-bold text-slate-900 tracking-tight">{count}</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isPositiveTrend ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend} this wk
        </span>
      </div>
    </div>
  );
};

export default RiskSummaryCard;
