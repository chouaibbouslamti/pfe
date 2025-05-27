"use client";

import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
  xAxisDataKey?: string;
  barDataKey?: string;
  height?: number;
}

export function BarChart({ 
  data, 
  color = "#4f46e5", 
  xAxisDataKey = "name", 
  barDataKey = "value",
  height = 200
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 5,
          right: 5,
          left: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey={xAxisDataKey} fontSize={12} tickMargin={10} />
        <YAxis fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "rgba(255, 255, 255, 0.95)", 
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "none"
          }} 
        />
        <Legend />
        <Bar dataKey={barDataKey} fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
