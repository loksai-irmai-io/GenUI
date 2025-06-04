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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataVisualizationWidgetProps {
  type: string; // Accept any string type
  title: string;
  data: any[];
  className?: string;
  maximized?: boolean;
}

const DataVisualizationWidget: React.FC<DataVisualizationWidgetProps> = ({
  type,
  title,
  data,
  className = "",
  maximized = false,
}) => {
  const renderVisualization = () => {
    // --- Table types: render generic table for any *-table type ---
    if (type.endsWith("-table")) {
      if (!Array.isArray(data) || data.length === 0) {
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available
          </div>
        );
      }
      const columns = Object.keys(data[0] || {});
      return (
        <div
          className={
            maximized
              ? "w-full overflow-x-auto max-w-full"
              : "w-full overflow-x-auto max-w-[32rem]"
          }
        >
          <Table className="w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className="px-2 py-1 text-xs font-medium whitespace-nowrap"
                  >
                    {col
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-gray-100 dark:border-gray-700"
                >
                  {columns.map((col) => (
                    <TableCell key={col} className="px-2 py-1 text-xs">
                      {typeof row[col] === "object" && row[col] !== null
                        ? JSON.stringify(row[col])
                        : String(row[col])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    // --- Bar types: render bar chart for any *-bar type ---
    if (type.endsWith("-bar")) {
      let processedData = Array.isArray(data) ? data : [];
      if (processedData.length === 0) {
        processedData = [{ name: "No Data", value: 0 }];
      }
      return (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 16, right: 16, left: 8, bottom: 40 }}
              barCategoryGap={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 14 }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#2563eb"
                minPointSize={4}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    // --- Special case: process-failure-patterns-bar ---
    if (type === "process-failure-patterns-bar") {
      let processedData = Array.isArray(data) ? data : [];
      if (processedData.length === 0) {
        processedData = [{ name: "No Data", value: 0 }];
      }
      const barsData = processedData.map((d) => ({
        ...d,
        _showBar: d.value !== 0,
      }));
      const barShape = (props: any) => {
        const { x, y, width, height, fill, payload } = props;
        if (!payload._showBar) return null;
        return (
          <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} />
        );
      };
      return (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barsData}
              margin={{ top: 16, right: 16, left: 8, bottom: 40 }}
              barCategoryGap={10}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 14 }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#2563eb"
                minPointSize={4}
                isAnimationActive={false}
                barSize={40}
                shape={barShape}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    // --- Special case: object-lifecycle and generic graph types ---
    if (type === "object-lifecycle") {
      return (
        <div className="w-full h-[400px] flex items-center justify-center">
          {/* You can replace this with a real graph component if needed */}
          <span className="text-blue-700 font-semibold">
            Object Lifecycle Graph Placeholder
          </span>
        </div>
      );
    }
    if (
      type === "activity-pair-threshold" ||
      type === "activity-pair-threshold-table" ||
      type === "activity-pair-threshold-graph"
    ) {
      return (
        <div className="w-full h-[400px] flex items-center justify-center">
          <span className="text-blue-700 font-semibold">
            Activity Pair Threshold Visualization Placeholder
          </span>
        </div>
      );
    }
    // --- SLA Analysis Bar ---
    if (type === "sla-analysis-bar") {
      let processedData = Array.isArray(data) ? data : [];
      if (processedData.length === 0) {
        processedData = [{ name: "No Data", value: 0 }];
      }
      return (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 16, right: 16, left: 8, bottom: 40 }}
              barCategoryGap={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 14 }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#2563eb"
                minPointSize={4}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    // --- Fallback ---
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Unsupported visualization type
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${className}${
        maximized ? " max-w-4xl" : ""
      }`}
      tabIndex={0}
      aria-label={title}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      {renderVisualization()}
    </div>
  );
};

export default DataVisualizationWidget;
