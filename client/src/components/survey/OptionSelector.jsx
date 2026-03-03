import React from 'react';

const OptionSelector = ({ questionId, options, selectedValue, onSelect }) => {
  if (!options || !Array.isArray(options)) return null;

  return (
    <div className="flex flex-col gap-3 mt-4">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <label 
            key={opt.value} 
            className={`
              flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer
              transition-all duration-200
              ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'hover:bg-gray-50 bg-white'}
            `}
          >
            <input
              type="radio"
              name={`question-${questionId}`}
              value={opt.value}
              checked={isSelected}
              onChange={() => onSelect(opt.value)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default OptionSelector;
