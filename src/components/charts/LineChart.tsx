"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface LineChartProps {
  data: Array<{
    name: string;
    [key: string]: any;
  }>;
  lines: Array<{
    dataKey: string;
    color: string;
    name?: string;
  }>;
  xAxisDataKey?: string;
  height?: number;
}

export function LineChart({
  data,
  lines,
  xAxisDataKey = "name",
  height = 200
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
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
        {lines.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            name={line.name || line.dataKey}
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
