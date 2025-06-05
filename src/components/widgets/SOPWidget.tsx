import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SOPCountData, SOPPatternData } from "@/services/sopDeviationService";

interface SOPWidgetProps {
  type: "count" | "patterns";
  data: SOPCountData | SOPPatternData[];
  visualizationType: "bar" | "line" | "pie";
  title: string;
  maximized?: boolean;
}

const SOPWidget: React.FC<SOPWidgetProps> = ({
  type,
  data,
  visualizationType,
  title,
  maximized = false,
}) => {
  // DEBUG: Log props on every render
  // eslint-disable-next-line no-console
  console.log("[SOPWidget] Render:", { type, data, visualizationType, title });
  // Defensive checks
  if (!data) {
    return (
      <div className="enterprise-card p-6 text-center">
        <h3 className="text-xl font-semibold text-slate-100 mb-4 tracking-tight">{title}</h3>
        <div className="text-red-400">Data is missing or could not be loaded.</div>
      </div>
    );
  }
  if (
    type === "count" &&
    (typeof data !== "object" ||
      Array.isArray(data) ||
      typeof data.count !== "number")
  ) {
    return (
      <div className="enterprise-card p-6 text-center">
        <h3 className="text-xl font-semibold text-slate-100 mb-4 tracking-tight">{title}</h3>
        <div className="text-red-400 mb-4">
          Invalid data format for SOP Deviation Count. Expected an object with a
          numeric "count" property.
        </div>
        <pre className="text-xs text-slate-400 text-left overflow-x-auto bg-slate-800/50 p-3 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }
  if (type === "patterns" && !Array.isArray(data)) {
    return (
      <div className="enterprise-card p-6 text-center">
        <h3 className="text-xl font-semibold text-slate-100 mb-4 tracking-tight">{title}</h3>
        <div className="text-red-400 mb-4">
          Invalid data format for SOP Deviation Patterns. Expected an array.
        </div>
        <pre className="text-xs text-slate-400 text-left overflow-x-auto bg-slate-800/50 p-3 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  // Always render bar for count
  const renderCountVisualization = (countData: SOPCountData) => {
    const chartData = [
      {
        name: "SOP Deviations",
        value: countData.count,
        percentage: countData.percentage,
      },
    ];
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#cbd5e1' }}
            axisLine={{ stroke: '#64748b' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#cbd5e1' }}
            axisLine={{ stroke: '#64748b' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '8px',
              color: '#f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value, name) => [
              value,
              name === "value" ? "Count" : name,
            ]}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Always render table for patterns
  const renderPatternsVisualization = (patternsData: SOPPatternData[]) => {
    return (
      <div
        className={
          maximized
            ? "overflow-x-auto max-w-full"
            : "overflow-x-auto max-w-[32rem]"
        }
      >
        <table className="w-full text-sm bg-slate-800/50 border border-slate-700 rounded-lg">
          <thead className="bg-slate-700/80">
            <tr className="border-b border-slate-600">
              <th className="text-left p-4 text-slate-200 font-semibold">Pattern</th>
              <th className="text-left p-4 text-slate-200 font-semibold">Frequency</th>
              <th className="text-left p-4 text-slate-200 font-semibold">Severity</th>
            </tr>
          </thead>
          <tbody>
            {patternsData.map((pattern, index) => (
              <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-4 text-slate-300">{pattern.pattern_name}</td>
                <td className="p-4 text-slate-300">{pattern.frequency}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pattern.severity === "high"
                        ? "bg-red-900/50 text-red-300 border border-red-700"
                        : pattern.severity === "medium"
                        ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                        : "bg-green-900/50 text-green-300 border border-green-700"
                    }`}
                  >
                    {pattern.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVisualization = () => {
    if (type === "count") {
      return renderCountVisualization(data as SOPCountData);
    } else {
      return renderPatternsVisualization(data as SOPPatternData[]);
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
      {renderVisualization()}
    </div>
  );
};

export default SOPWidget;
