import React from 'react';

const StatusBadge = ({ level }) => {
  let styleClasses = '';
  
  switch(level) {
    case 'High':
      styleClasses = 'bg-red-100 text-red-600 border border-red-200';
      break;
    case 'Medium':
      styleClasses = 'bg-yellow-100 text-yellow-600 border border-yellow-200';
      break;
    case 'Low':
    case 'Stable':
      styleClasses = 'bg-green-100 text-green-600 border border-green-200';
      break;
    default:
      styleClasses = 'bg-gray-100 text-gray-600 border border-gray-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styleClasses}`}>
      {level}
    </span>
  );
};

export default StatusBadge;
