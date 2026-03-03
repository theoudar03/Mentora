import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const RiskDistributionPie = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full h-full flex flex-col justify-between">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-semibold text-gray-800">Campus Risk Overview</h2>
        <p className="text-sm text-gray-500">Distribution across all monitored students</p>
      </div>

      <div className="flex-1 w-full min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-800">
            {data.reduce((acc, curr) => acc + curr.value, 0)}
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Total
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-sm font-medium text-gray-600">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskDistributionPie;
