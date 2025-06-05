
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
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 tracking-tight">{title}</h3>
      <div className="w-full overflow-x-auto">
        <Table className="w-full border border-gray-200 rounded-lg">
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-200">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="px-6 py-4 text-sm font-semibold text-gray-700 border-gray-200"
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
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className="px-6 py-4 text-sm text-gray-600">
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
