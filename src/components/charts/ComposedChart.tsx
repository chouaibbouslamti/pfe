"use client";

import {
  ComposedChart as RechartsComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartElement {
  type: 'bar' | 'line';
  dataKey: string;
  color: string;
  name?: string;
}

interface ComposedChartProps {
  data: Array<{
    name: string;
    [key: string]: any;
  }>;
  elements: ChartElement[];
  xAxisDataKey?: string;
  height?: number;
}

export function ComposedChart({
  data,
  elements,
  xAxisDataKey = "name",
  height = 300
}: ComposedChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsComposedChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 10,
          bottom: 10,
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
        {elements.map((element, index) => {
          if (element.type === 'bar') {
            return (
              <Bar
                key={`bar-${index}`}
                dataKey={element.dataKey}
                fill={element.color}
                name={element.name || element.dataKey}
                radius={[4, 4, 0, 0]}
              />
            );
          } else {
            return (
              <Line
                key={`line-${index}`}
                type="monotone"
                dataKey={element.dataKey}
                stroke={element.color}
                name={element.name || element.dataKey}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            );
          }
        })}
      </RechartsComposedChart>
    </ResponsiveContainer>
  );
}
