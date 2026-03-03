import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const RiskDistribution = ({ data }) => {
  const chartData = [
    { name: 'High Risk', value: data.highRisk, color: '#ef4444' }, // red-500
    { name: 'Medium Risk', value: data.mediumRisk, color: '#facc15' }, // yellow-400
    { name: 'Stable', value: data.stable, color: '#22c55e' } // green-500
  ];

  const total = data.highRisk + data.mediumRisk + data.stable;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-gray-800 self-start w-full mb-2">Risk Distribution</h3>
      <div className="relative w-full h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              stroke="none"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-gray-500 font-medium leading-none">Total Students</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 leading-none">{total}</span>
        </div>
      </div>
      <div className="w-full mt-4 flex items-center justify-between gap-2 text-xs text-gray-600 font-medium px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span>Stable</span>
        </div>
      </div>
    </div>
  );
};

export default RiskDistribution;
