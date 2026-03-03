import React from 'react';

const ProgressIndicator = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100) || 0;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-500">
        <span>{current} of {total} completed</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
