import React from 'react';
import OptionSelector from './OptionSelector';

const QuestionCard = ({ questionId, questionText, index, options, selectedValue, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex flex-col mb-4">
        <span className="text-sm font-semibold text-indigo-500 mb-2 uppercase tracking-wide">
          Question {index + 1}
        </span>
        <h3 className="text-xl font-medium text-gray-800 leading-snug">
          {questionText}
        </h3>
      </div>
      
      <OptionSelector 
        questionId={questionId}
        options={options} 
        selectedValue={selectedValue} 
        onSelect={(val) => onSelect(questionId, val)} 
      />
    </div>
  );
};

export default QuestionCard;
