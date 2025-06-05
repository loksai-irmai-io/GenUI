
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
    <div className="w-full enterprise-card p-6 hover:shadow-lg transition-all duration-200">
      <h3 className="text-xl font-semibold text-slate-100 mb-6 tracking-tight">{title}</h3>
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
