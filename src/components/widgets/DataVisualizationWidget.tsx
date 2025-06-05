import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
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

interface GraphNode {
  id: string;
  type?: string;
  data?: {
    label?: string;
    [key: string]: any;
  };
  position?: {
    x: number;
    y: number;
  };
  [key: string]: any;
}

interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: {
    [key: string]: any;
  };
  [key: string]: any;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface BarChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface TableData {
  [key: string]: any;
}

type WidgetData = BarChartData[] | TableData[] | GraphData;

interface DataVisualizationWidgetProps {
  type: string;
  title: string;
  data: WidgetData;
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
    if (type.endsWith("-table") || type === "kpi-table") {
      // Validate input data
      if (!Array.isArray(data)) {
        return (
          <div className="flex items-center justify-center h-full text-slate-300">
            Invalid data format for table
          </div>
        );
      }

      if (data.length === 0) {
        return (
          <div className="flex items-center justify-center h-full text-slate-300">
            No data available
          </div>
        );
      }

      // Check if all objects in the array have undefined values
      const firstRow = data[0];
      if (!firstRow || typeof firstRow !== "object") {
        return (
          <div className="flex items-center justify-center h-full text-slate-300">
            Invalid data structure for table
          </div>
        );
      }

      const allUndefined = Object.values(firstRow).every(
        (val) => val === undefined || val === null
      );

      if (allUndefined) {
        return (
          <div className="flex items-center justify-center h-full text-slate-300">
            Table contains undefined values only
          </div>
        );
      }

      // Clean up data - replace undefined/null values
      const cleanedData = data.map((row) => {
        if (!row || typeof row !== "object") return row;
        const cleanRow = { ...row };
        Object.keys(cleanRow).forEach((key) => {
          if (cleanRow[key] === undefined || cleanRow[key] === null) {
            cleanRow[key] = "-";
          }
        });
        return cleanRow;
      });

      const columns = Object.keys(cleanedData[0] || {});
      return (
        <div
          className={
            maximized
              ? "w-full overflow-x-auto max-w-full"
              : "w-full overflow-x-auto max-w-[32rem]"
          }
        >
          <Table className="w-full bg-slate-800/50 border border-slate-700">
            <TableHeader className="bg-slate-700/80">
              <TableRow className="border-slate-600">
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-slate-200 border-slate-600"
                  >
                    {col
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cleanedData.map((row, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-slate-700 hover:bg-slate-700/50"
                >
                  {columns.map((col) => (
                    <TableCell key={col} className="px-4 py-3 text-sm text-slate-300">
                      {(() => {
                        const value = row[col];
                        // Handle undefined/null values
                        if (value === undefined || value === null) {
                          return "-";
                        }
                        // Handle object values (including arrays)
                        if (typeof value === "object") {
                          try {
                            return JSON.stringify(value);
                          } catch (e) {
                            return "Complex Object";
                          }
                        }
                        // Handle other value types
                        return String(value);
                      })()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    } // --- Default bar chart for most widgets ---
    if (
      type === "bar" ||
      type.endsWith("-bar") ||
      type === "process-failure-patterns-bar" ||
      type === "sla-analysis-bar"
    ) {
      // First, validate and clean the data
      if (!Array.isArray(data)) {
        return (
          <div className="flex items-center justify-center h-[400px] text-slate-300">
            Invalid data format for bar chart
          </div>
        );
      }

      // Filter out invalid data items
      let processedData = data.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          item.name !== undefined &&
          item.name !== null &&
          item.value !== undefined &&
          item.value !== null
      );

      // Convert any string values to numbers if possible
      processedData = processedData.map((item) => ({
        name: item.name,
        value:
          typeof item.value === "string" && !isNaN(Number(item.value))
            ? Number(item.value)
            : item.value,
      }));

      // Final check for empty data
      if (processedData.length === 0) {
        return (
          <div className="flex items-center justify-center h-[400px] text-slate-300">
            No valid data available for chart visualization
          </div>
        );
      }

      return (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 16, right: 16, left: 8, bottom: 40 }}
              barCategoryGap={40}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12, fill: '#cbd5e1' }}
                axisLine={{ stroke: '#64748b' }}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: 12, fill: '#cbd5e1' }}
                axisLine={{ stroke: '#64748b' }}
              />
              <Tooltip
                formatter={(value) => [value, "Value"]}
                labelFormatter={(name) => `${name}`}
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                minPointSize={4}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } // --- Special case: object-lifecycle ---
    if (type === "object-lifecycle") {
      // Type guard to verify if data is GraphData
      const isGraphData = (value: any): value is GraphData => {
        return (
          value &&
          typeof value === "object" &&
          "nodes" in value &&
          "edges" in value &&
          Array.isArray(value.nodes) &&
          Array.isArray(value.edges)
        );
      };

      if (!isGraphData(data) || data.nodes.length === 0) {
        return (
          <div className="flex items-center justify-center h-[400px] text-slate-300">
            No lifecycle data available
          </div>
        );
      }

      // Import our dedicated data-compatible component
      const ProcessFlowGraphWithData = React.lazy(
        () => import("@/components/ProcessFlowGraphWithData")
      );
      return (
        <div className="w-full h-[400px]">
          <React.Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-600">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading process flow graph...</p>
                </div>
              </div>
            }
          >
            {" "}
            <ErrorBoundary isWidget={true}>
              <ProcessFlowGraphWithData data={data} />
            </ErrorBoundary>
          </React.Suspense>
        </div>
      );
    } // --- Special case: activity-pair-threshold ---
    if (type === "activity-pair-threshold") {
      // Check for missing or invalid data
      if (
        !Array.isArray(data) ||
        data.length === 0 ||
        (typeof data === "object" && Object.keys(data).length === 0)
      ) {
        return (
          <div className="flex items-center justify-center h-[400px] text-slate-300">
            No threshold data available
          </div>
        );
      }

      // Check for valid structure in data
      const hasData = data.some(
        (item) =>
          item && typeof item === "object" && Object.keys(item).length > 0
      );

      if (!hasData) {
        return (
          <div className="flex items-center justify-center h-[400px] text-slate-300">
            No valid threshold data available
          </div>
        );
      }

      // Check for undefined values in the data
      const hasUndefinedValues = data.some((item) =>
        Object.values(item).some((val) => val === undefined || val === null)
      );

      if (hasUndefinedValues) {
        // Clean up the data - replace undefined values with "-"
        data = data.map((item) => {
          const cleanItem = { ...item };
          Object.keys(cleanItem).forEach((key) => {
            if (cleanItem[key] === undefined || cleanItem[key] === null) {
              cleanItem[key] = "-";
            }
          });
          return cleanItem;
        });
      }

      // Display actual threshold data as a table
      const columns = data[0] ? Object.keys(data[0]) : [];

      return (
        <div
          className={
            maximized
              ? "w-full overflow-x-auto max-w-full"
              : "w-full overflow-x-auto max-w-[32rem]"
          }
        >
          <Table className="w-full bg-slate-800/50 border border-slate-700">
            <TableHeader className="bg-slate-700/80">
              <TableRow className="border-slate-600">
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-slate-200 border-slate-600"
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
                  className="border-b border-slate-700 hover:bg-slate-700/50"
                >
                  {columns.map((col) => (
                    <TableCell key={col} className="px-4 py-3 text-sm text-slate-300">
                      {typeof row[col] === "object" && row[col] !== null
                        ? JSON.stringify(row[col])
                        : String(row[col] ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // --- Fallback for any unrecognized type ---
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <span className="text-xl font-semibold text-slate-200">
          {title} Visualization
        </span>
      </div>
    );
  };

  return (
    <div
      className={`enterprise-card p-6 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${className}${
        maximized ? " max-w-4xl" : ""
      }`}
      tabIndex={0}
      aria-label={title}
    >
      <h3 className="text-xl font-semibold text-slate-100 mb-6 tracking-tight">{title}</h3>
      {renderVisualization()}
    </div>
  );
};

export default DataVisualizationWidget;
