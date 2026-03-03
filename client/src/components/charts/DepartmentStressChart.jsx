import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DepartmentStressChart = ({ data }) => {
  // Determine color based on score severity
  const getColor = (score) => {
    if (score >= 66) return '#ef4444'; // Red for High Risk
    if (score >= 36) return '#facc15'; // Yellow for Medium Risk
    return '#6366f1'; // Indigo for Stable/Low Risk
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Department Stress Analysis</h2>
        <p className="text-sm text-gray-500">Average mental health risk score per department</p>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentStressChart;
