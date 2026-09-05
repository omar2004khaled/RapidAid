import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ResponseTimeChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-[#5B6859] text-sm">
        No response time data available for the selected period
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#BDD2B6" opacity={0.6} />
          <XAxis
            dataKey="date"
            stroke="#5B6859"
            tick={{ fontSize: 12, fill: '#5B6859' }}
            tickLine={false}
          />
          <YAxis
            stroke="#5B6859"
            tick={{ fontSize: 12, fill: '#5B6859' }}
            tickLine={false}
            unit="m"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#BDD2B6',
              borderRadius: '1rem',
              color: '#283227',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`${value} min`, 'Avg Response Time']}
          />
          <Line
            type="monotone"
            dataKey="averageTimeMinutes"
            name="Response Time"
            stroke="#798777"
            strokeWidth={3}
            dot={{ fill: '#798777', r: 4 }}
            activeDot={{ r: 6, fill: '#5B6859' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseTimeChart;
