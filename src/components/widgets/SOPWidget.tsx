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
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const SOPWidget: React.FC<SOPWidgetProps> = ({
  type,
  data,
  visualizationType,
  title,
}) => {
  // DEBUG: Log props on every render
  // eslint-disable-next-line no-console
  console.log("[SOPWidget] Render:", { type, data, visualizationType, title });
  // Defensive checks
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-red-600">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div>Data is missing or could not be loaded.</div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-red-600">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div>
          Invalid data format for SOP Deviation Count. Expected an object with a
          numeric "count" property.
        </div>
        <pre className="text-xs text-gray-500 text-left overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }
  if (type === "patterns" && !Array.isArray(data)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-red-600">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div>
          Invalid data format for SOP Deviation Patterns. Expected an array.
        </div>
        <pre className="text-xs text-gray-500 text-left overflow-x-auto">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value, name) => [
              value,
              name === "value" ? "Count" : name,
            ]}
          />
          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Always render table for patterns
  const renderPatternsVisualization = (patternsData: SOPPatternData[]) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Pattern</th>
              <th className="text-left p-2">Frequency</th>
              <th className="text-left p-2">Severity</th>
            </tr>
          </thead>
          <tbody>
            {patternsData.map((pattern, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{pattern.pattern_name}</td>
                <td className="p-2">{pattern.frequency}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      pattern.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : pattern.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {type === "count"
        ? renderCountVisualization(data as SOPCountData)
        : renderPatternsVisualization(data as SOPPatternData[])}
    </div>
  );
};

export default SOPWidget;
