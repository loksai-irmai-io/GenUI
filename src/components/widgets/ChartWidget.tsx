import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import InfoCard from "./InfoCard";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartWidgetProps {
  type: "line" | "bar" | "pie";
  title: string;
  data: ChartData[];
  dataKey?: string;
  xAxisKey?: string;
  maximized?: boolean;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const ChartWidget: React.FC<ChartWidgetProps> = ({
  type,
  title,
  data,
  dataKey = "value",
  xAxisKey = "name",
  maximized = false,
}) => {
  // If it's a bar chart with only one data point, render as InfoCard instead
  if (type === "bar" && data.length === 1) {
    const singleItem = data[0];
    return (
      <InfoCard
        title={title}
        value={singleItem[dataKey]?.toLocaleString() || "0"}
        subtitle={`Single ${singleItem[xAxisKey] || "item"} measurement`}
        maximized={maximized}
      />
    );
  }

  const renderChart = () => {
    const commonTooltipStyle = {
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      border: '1px solid rgba(71, 85, 105, 0.5)',
      borderRadius: '8px',
      color: '#f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    };

    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12, fill: '#cbd5e1' }}
                axisLine={{ stroke: '#64748b' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#cbd5e1' }}
                axisLine={{ stroke: '#64748b' }}
              />
              <Tooltip contentStyle={commonTooltipStyle} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12, fill: '#cbd5e1' }}
                axisLine={{ stroke: '#64748b' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#cbd5e1' }}
                axisLine={{ stroke: '#64748b' }}
              />
              <Tooltip contentStyle={commonTooltipStyle} />
              <Bar dataKey={dataKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey={dataKey}
                label={({ name, percent }) => (
                  <text 
                    fill="#f1f5f9" 
                    fontSize={12} 
                    fontWeight={500}
                  >
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={commonTooltipStyle}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend 
                wrapperStyle={{ 
                  color: '#cbd5e1',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="text-center text-slate-300">
            Unsupported chart type
          </div>
        );
    }
  };

  return (
    <div
      className={`enterprise-card p-6${
        maximized ? " max-w-4xl" : ""
      } focus-visible:ring-2 focus-visible:ring-blue-400 outline-none`}
      tabIndex={0}
      aria-label={title}
    >
      <h3 className="text-xl font-semibold text-slate-100 mb-6 tracking-tight">{title}</h3>
      {renderChart()}
    </div>
  );
};

export default ChartWidget;
