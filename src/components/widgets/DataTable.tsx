
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableData {
  [key: string]: any;
}

interface DataTableProps {
  title: string;
  data: TableData[];
  columns: { key: string; label: string }[];
  maximized?: boolean;
  widgetId?: string;
  isMinimized?: boolean;
  onToggleMaximize?: () => void;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  columns,
  maximized = false,
  widgetId,
  isMinimized = false,
  onToggleMaximize,
}) => {
  // If minimized, show compact tile
  if (isMinimized) {
    return (
      <div
        className="w-full enterprise-card p-4 cursor-pointer hover:bg-slate-700/30 transition-all duration-300 transform hover:scale-105"
        onClick={onToggleMaximize}
        tabIndex={0}
        aria-label={`${title} - Click to maximize`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100 tracking-tight truncate">{title}</h3>
          <Maximize className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-sm text-slate-400 mt-2">Click to expand table ({data.length} rows)</p>
      </div>
    );
  }

  return (
    <div 
      className={`w-full enterprise-card p-6 hover:shadow-lg transition-all duration-300 ${
        maximized ? "fixed inset-4 z-50 animate-scale-in overflow-auto" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-100 tracking-tight">{title}</h3>
        {onToggleMaximize && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMaximize}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            aria-label={maximized ? "Minimize" : "Maximize"}
          >
            {maximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        )}
      </div>
      <div className="w-full overflow-x-auto">
        <Table className="w-full border border-slate-700 rounded-lg bg-slate-800/50">
          <TableHeader className="bg-slate-700/80">
            <TableRow className="border-slate-600">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="px-6 py-4 text-sm font-semibold text-slate-200 border-slate-600"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={index} 
                className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className="px-6 py-4 text-sm text-slate-300">
                    {typeof row[column.key] === "object" &&
                    row[column.key] !== null
                      ? JSON.stringify(row[column.key])
                      : String(row[column.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
