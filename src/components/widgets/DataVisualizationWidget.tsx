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
  type:
    | "sop-table"
    | "incomplete-bar"
    | "longrunning-bar"
    | "resource-switches-bar"
    | "rework-activities-bar"
    | "timing-violations-bar"
    | "case-complexity-bar"
    | "case-complexity-table"
    | "resource-performance-table"
    | "timing-analysis-table"
    | "process-failure-patterns-bar";
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
    switch (type) {
      case "sop-table":
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
                  <TableHead className="px-2 py-1 text-xs font-medium whitespace-nowrap">
                    Pattern Count
                  </TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium whitespace-nowrap">
                    Percentage
                  </TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium whitespace-nowrap">
                    Sequence Preview
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <TableCell className="px-2 py-1 text-xs">
                      {row.pattern_count}
                    </TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                      {row.percentage}%
                    </TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${
                          row.deviation_status === "Deviation"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {row.deviation_status}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                      {row.sequence_preview}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case "resource-performance-table":
      case "timing-analysis-table":
      case "case-complexity-table":
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
                      {col}
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

      case "incomplete-bar":
      case "longrunning-bar":
      case "resource-switches-bar":
      case "rework-activities-bar":
      case "timing-violations-bar":
      case "case-complexity-bar":
      case "process-failure-patterns-bar": {
        // Always show all categories/labels, but only render bars for nonzero values (for process-failure-patterns-bar)
        const allData = Array.isArray(data) ? data : [];
        // For process-failure-patterns-bar, only render bars for nonzero values, but always show all labels
        const isProcessFailure = type === "process-failure-patterns-bar";
        // For process-failure-patterns-bar, create a separate array for bars (nonzero) and for x-axis (all)
        let barsData = allData;
        let barShape = undefined;
        if (isProcessFailure) {
          barsData = allData.map((d) => ({ ...d, _showBar: d.value !== 0 }));
          // Custom shape: only render bar if value is nonzero
          barShape = (props: any) => {
            const { x, y, width, height, fill, payload } = props;
            if (!payload._showBar) return null;
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                rx={6}
              />
            );
          };
        }
        return (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barsData}
                margin={{ top: 16, right: 16, left: 8, bottom: 40 }}
                barCategoryGap={isProcessFailure ? 10 : 40}
                barSize={isProcessFailure ? 40 : undefined}
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
                  barSize={isProcessFailure ? 40 : undefined}
                  shape={barShape}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Unsupported visualization type
          </div>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${className}${
        maximized ? " max-w-4xl" : ""
      }`}
      tabIndex={0}
      aria-label={title}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderVisualization()}
    </div>
  );
};

export default DataVisualizationWidget;
