
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableData {
  [key: string]: any;
}

interface DataTableProps {
  title: string;
  data: TableData[];
  columns: { key: string; label: string }[];
  maximized?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  columns,
  maximized = false,
}) => {
  return (
    <div
      className={`enterprise-card p-6 hover:shadow-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none${
        maximized ? " max-w-4xl" : ""
      }`}
      tabIndex={0}
      aria-label={title}
    >
      <h3 className="text-xl font-semibold text-slate-100 mb-6 tracking-tight">{title}</h3>
      <div
        className={
          maximized
            ? "overflow-x-auto max-w-full"
            : "overflow-x-auto max-w-[32rem]"
        }
      >
        <Table className="bg-slate-800/50 border border-slate-700">
          <TableHeader className="bg-slate-700/80">
            <TableRow className="border-slate-600">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="px-4 py-3 text-sm font-semibold text-slate-200 border-slate-600"
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
                  <TableCell key={column.key} className="px-4 py-3 text-sm text-slate-300">
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
