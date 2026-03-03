import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RiskTrendChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full h-[350px]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Campus Wellbeing Trend (Last 10 Weeks)</h2>
        <p className="text-sm text-gray-500">Average weekly wellness score across all monitored students</p>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="week" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} 
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', fontWeight: 600, color: '#1E293B' }}
              cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="avgScore" 
              stroke="#4F46E5" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRisk)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5', style: { filter: "drop-shadow(0px 0px 4px rgba(79, 70, 229, 0.5))" } }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskTrendChart;
