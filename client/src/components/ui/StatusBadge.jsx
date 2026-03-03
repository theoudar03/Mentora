import React from 'react';

const StatusBadge = ({ level }) => {
  let styleClasses = '';
  
  switch(level) {
    case 'High':
      styleClasses = 'bg-rose-100/50 text-rose-700 border border-rose-200/60 shadow-[0_0_8px_rgba(225,29,72,0.15)]';
      break;
    case 'Medium':
      styleClasses = 'bg-amber-100/50 text-amber-700 border border-amber-200/60 shadow-[0_0_8px_rgba(217,119,6,0.15)]';
      break;
    case 'Low':
    case 'Stable':
      styleClasses = 'bg-emerald-100/50 text-emerald-700 border border-emerald-200/60 shadow-[0_0_8px_rgba(5,150,105,0.15)]';
      break;
    default:
      styleClasses = 'bg-slate-100/50 text-slate-600 border border-slate-200/60';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${styleClasses} transition-all`}>
      {level === 'Stable' ? 'Low' : level}
    </span>
  );
};

export default StatusBadge;
