
import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SOPCountData, SOPPatternData } from '@/services/sopDeviationService';

interface SOPWidgetProps {
  type: 'count' | 'patterns';
  data: SOPCountData | SOPPatternData[];
  visualizationType: 'bar' | 'line' | 'pie';
  title: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const SOPWidget: React.FC<SOPWidgetProps> = ({ type, data, visualizationType, title }) => {
  const renderCountVisualization = (countData: SOPCountData) => {
    const chartData = [
      { name: 'SOP Deviations', value: countData.count, percentage: countData.percentage }
    ];

    switch (visualizationType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
                formatter={(value, name) => [value, name === 'value' ? 'Count' : name]}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = [
          { name: 'Deviations', value: countData.percentage },
          { name: 'Compliant', value: 100 - countData.percentage }
        ];
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div className="p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{countData.count}</div>
            <div className="text-lg text-gray-600">SOP Deviations</div>
            <div className="text-sm text-gray-500">{countData.percentage}% of total</div>
          </div>
        );
    }
  };

  const renderPatternsVisualization = (patternsData: SOPPatternData[]) => {
    const chartData = patternsData.map(pattern => ({
      name: pattern.pattern_name,
      frequency: pattern.frequency,
      severity: pattern.severity
    }));

    switch (visualizationType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
              <Bar dataKey="frequency" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
              <Line 
                type="monotone" 
                dataKey="frequency" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="frequency"
                label={({ name, frequency }) => `${name}: ${frequency}`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Pattern</th>
                  <th className="text-left p-2">Frequency</th>
                  <th className="text-left p-2">Severity</th>
                </tr>
              </thead>
              <tbody>
                {patternsData.map((pattern, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{pattern.pattern_name}</td>
                    <td className="p-2">{pattern.frequency}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        pattern.severity === 'high' ? 'bg-red-100 text-red-800' :
                        pattern.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pattern.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {type === 'count' 
        ? renderCountVisualization(data as SOPCountData)
        : renderPatternsVisualization(data as SOPPatternData[])
      }
    </div>
  );
};

export default SOPWidget;
