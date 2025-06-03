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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
          <ScrollArea className="w-full h-[400px] rounded-lg border">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-slate-50 to-gray-50 sticky top-0 z-10">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Pattern Count
                  </TableHead>
                  <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Percentage
                  </TableHead>
                  <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Sequence Preview
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.pattern_count}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700">
                      {row.percentage}%
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant={row.deviation_status === "Deviation" ? "destructive" : "secondary"}
                        className={
                          row.deviation_status === "Deviation"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }
                      >
                        {row.deviation_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700">
                      {row.sequence_preview}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        );

      case "resource-performance-table":
      case "timing-analysis-table":
      case "case-complexity-table":
        if (!Array.isArray(data) || data.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium">No data available</p>
                <p className="text-sm text-gray-400">Check back later for updates</p>
              </div>
            </div>
          );
        }
        const columns = Object.keys(data[0] || {});
        return (
          <ScrollArea className="w-full h-[400px] rounded-lg border">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-slate-50 to-gray-50 sticky top-0 z-10">
                <TableRow className="border-b border-gray-200">
                  {columns.map((col) => (
                    <TableHead
                      key={col}
                      className="px-6 py-4 text-sm font-semibold text-gray-700"
                    >
                      {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <TableCell key={col} className="px-6 py-4 text-sm text-gray-700">
                        {typeof row[col] === "object" && row[col] !== null
                          ? JSON.stringify(row[col])
                          : String(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        );

      case "incomplete-bar":
      case "longrunning-bar":
      case "resource-switches-bar":
      case "rework-activities-bar":
      case "timing-violations-bar":
      case "case-complexity-bar":
      case "process-failure-patterns-bar": {
        console.log(
          `[DataVisualizationWidget] Rendering ${type} chart with data:`,
          data
        );

        // Handle and normalize data
        let processedData = data;

        // Handle empty or invalid data
        if (!Array.isArray(data)) {
          console.warn(
            `[DataVisualizationWidget] Expected array for ${type} but got:`,
            typeof data
          );
          processedData = [];
        }

        // Convert object to array if needed (for compatibility)
        if (
          !Array.isArray(processedData) &&
          typeof processedData === "object" &&
          processedData !== null
        ) {
          processedData = Object.entries(processedData).map(
            ([name, value]) => ({ name, value })
          );
          console.log(
            "[DataVisualizationWidget] Converted object to array:",
            processedData
          );
        }

        // Always show all categories/labels, but only render bars for nonzero values
        const allData = Array.isArray(processedData) ? processedData : [];

        // For empty data, show a placeholder
        if (allData.length === 0) {
          console.warn(`[DataVisualizationWidget] No data for ${type}`);
          return (
            <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-medium">No chart data available</p>
                <p className="text-sm text-gray-400">Data will appear here when available</p>
              </div>
            </div>
          );
        }

        // For process-failure-patterns-bar, only render bars for nonzero values, but always show all labels
        const isProcessFailure = type === "process-failure-patterns-bar";
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

        // Enhanced color scheme based on chart type
        const getBarColor = (type: string) => {
          switch (type) {
            case "incomplete-bar": return "#EF4444"; // Red
            case "longrunning-bar": return "#F59E0B"; // Orange
            case "resource-switches-bar": return "#8B5CF6"; // Purple
            case "rework-activities-bar": return "#EC4899"; // Pink
            case "timing-violations-bar": return "#DC2626"; // Dark red
            case "case-complexity-bar": return "#059669"; // Emerald
            case "process-failure-patterns-bar": return "#7C3AED"; // Violet
            default: return "#3B82F6"; // Blue
          }
        };

        return (
          <div className="w-full h-[450px] bg-white rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap={isProcessFailure ? 10 : 40}
                barSize={isProcessFailure ? 40 : undefined}
              >
                <defs>
                  <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={getBarColor(type)} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={getBarColor(type)} stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  angle={-20}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={`url(#gradient-${type})`}
                  minPointSize={4}
                  isAnimationActive={true}
                  animationDuration={800}
                  barSize={isProcessFailure ? 40 : undefined}
                  shape={barShape}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="font-medium">Unsupported visualization type</p>
              <p className="text-sm text-gray-400">Please check the configuration</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card
      className={`shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 w-full ${className}`}
      tabIndex={0}
      aria-label={title}
    >
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 w-full">
        {renderVisualization()}
      </CardContent>
    </Card>
  );
};

export default DataVisualizationWidget;
