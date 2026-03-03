import React from 'react';

const WelfareInsightPanel = ({ message }) => {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
      <div className="p-2 bg-white rounded-lg border border-indigo-100 shadow-sm flex-shrink-0">
        <span className="text-xl">✨</span>
      </div>
      <div>
        <h4 className="text-sm font-bold text-indigo-900 mb-1 uppercase tracking-wide flex items-center gap-2">
          AI Campus Insight
        </h4>
        <p className="text-indigo-800 leading-relaxed font-medium">
          {message || "Analyzing campus wellbeing metrics continuously to detect early risk trends."}
        </p>
      </div>
    </div>
  );
};

export default WelfareInsightPanel;
