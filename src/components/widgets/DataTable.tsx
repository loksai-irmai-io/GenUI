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
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none${
        maximized ? " max-w-4xl" : ""
      }`}
      tabIndex={0}
      aria-label={title}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div
        className={
          maximized
            ? "overflow-x-auto max-w-full"
            : "overflow-x-auto max-w-[32rem]"
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="font-semibold text-gray-700"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <TableCell key={column.key} className="text-gray-900">
                    {row[column.key]}
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
