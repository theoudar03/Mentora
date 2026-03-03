import React from 'react';
import { Sparkles } from 'lucide-react';

const AIInsightBanner = () => {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-4 shadow-sm w-full">
      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shrink-0 mt-0.5">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-indigo-900 mb-0.5">AI Insight</span>
        <span className="text-sm text-indigo-800 leading-relaxed">
          Stress levels increased by 18% among 3rd year ECE students this week.
        </span>
      </div>
    </div>
  );
};

export default AIInsightBanner;
