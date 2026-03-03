import React from 'react';

const OptionSelector = ({ options, selectedValue, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-5">
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;
        return (
          <button
            key={index}
            onClick={() => onSelect(option.value)}
            className={`
              flex-1 min-w-[120px] px-4 py-3 rounded-xl border text-sm font-medium
              transition-all duration-200 outline-none
              ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-[0_0_0_1px_rgba(99,102,241,1)]'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }
            `}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default OptionSelector;
