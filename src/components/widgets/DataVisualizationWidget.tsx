
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataVisualizationWidgetProps {
  type: 'sop-table' | 'incomplete-bar' | 'longrunning-bar';
  title: string;
  data: any[];
}

const DataVisualizationWidget: React.FC<DataVisualizationWidgetProps> = ({ type, title, data }) => {
  const renderVisualization = () => {
    switch (type) {
      case 'sop-table':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern Count</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sequence Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.pattern_count}</TableCell>
                    <TableCell>{row.percentage}%</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        row.deviation_status === 'Deviation' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {row.deviation_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{row.sequence_preview}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'incomplete-bar':
      case 'longrunning-bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Bar 
                dataKey="value" 
                fill={type === 'incomplete-bar' ? '#EF4444' : '#3B82F6'} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center text-gray-500">Unsupported visualization type</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderVisualization()}
    </div>
  );
};

export default DataVisualizationWidget;
