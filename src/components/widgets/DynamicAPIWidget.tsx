
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiService } from '@/services/apiService';
import { mockDataService } from '@/services/dataService';

interface DynamicAPIWidgetProps {
  widgetType: 'sop-deviation-count' | 'sop-deviation-patterns' | 'incomplete-cases' | 
             'long-running-cases' | 'resource-switches' | 'rework-activities' | 
             'timing-violations' | 'case-complexity' | 'resource-performance' | 'timing-analysis';
  title: string;
  visualizationType: 'bar' | 'table';
}

const DynamicAPIWidget: React.FC<DynamicAPIWidgetProps> = ({ 
  widgetType, 
  title, 
  visualizationType 
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingMockData(false);
        
        console.log(`Attempting to fetch data for widget type: ${widgetType}`);
        
        let fetchedData;
        
        // Try to fetch from real API first
        try {
          switch (widgetType) {
            case 'sop-deviation-count':
              fetchedData = await apiService.getSOPDeviationCount();
              break;
            case 'sop-deviation-patterns':
              fetchedData = await apiService.getSOPDeviationPatterns();
              break;
            case 'incomplete-cases':
              fetchedData = await apiService.getIncompleteCasesCount();
              break;
            case 'long-running-cases':
              fetchedData = await apiService.getLongRunningCasesCount();
              break;
            case 'resource-switches':
              fetchedData = await apiService.getResourceSwitchesCount();
              break;
            case 'rework-activities':
              fetchedData = await apiService.getReworkActivitiesCount();
              break;
            case 'timing-violations':
              fetchedData = await apiService.getTimingViolationsCount();
              break;
            case 'case-complexity':
              fetchedData = await apiService.getCaseComplexity();
              break;
            case 'resource-performance':
              fetchedData = await apiService.getResourcePerformance();
              break;
            case 'timing-analysis':
              fetchedData = await apiService.getTimingAnalysis();
              break;
            default:
              throw new Error(`Unknown widget type: ${widgetType}`);
          }
        } catch (apiError) {
          console.warn(`API fetch failed for ${widgetType}, falling back to mock data:`, apiError);
          
          // Fallback to mock data
          setUsingMockData(true);
          switch (widgetType) {
            case 'sop-deviation-count':
              fetchedData = await mockDataService.getSOPDeviationCount();
              break;
            case 'sop-deviation-patterns':
              fetchedData = await mockDataService.getSOPDeviationPatterns();
              break;
            case 'incomplete-cases':
              fetchedData = await mockDataService.getIncompleteCasesCount();
              break;
            case 'long-running-cases':
              fetchedData = await mockDataService.getLongRunningCasesCount();
              break;
            case 'resource-switches':
              fetchedData = await mockDataService.getResourceSwitchesCount();
              break;
            case 'rework-activities':
              fetchedData = await mockDataService.getReworkActivitiesCount();
              break;
            case 'timing-violations':
              fetchedData = await mockDataService.getTimingViolationsCount();
              break;
            case 'case-complexity':
              fetchedData = await mockDataService.getCaseComplexity();
              break;
            case 'resource-performance':
              fetchedData = await mockDataService.getResourcePerformance();
              break;
            case 'timing-analysis':
              fetchedData = await mockDataService.getTimingAnalysis();
              break;
            default:
              throw new Error(`Unknown widget type: ${widgetType}`);
          }
        }
        
        console.log(`Successfully loaded data for ${widgetType}:`, fetchedData);
        setData(fetchedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Error fetching widget data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [widgetType]);

  const renderBarChart = () => {
    if (!data) return null;

    let chartData;
    switch (widgetType) {
      case 'sop-deviation-count':
        chartData = [{ name: 'SOP Deviations', value: data.count, percentage: data.percentage }];
        break;
      case 'incomplete-cases':
      case 'long-running-cases':
      case 'resource-switches':
      case 'rework-activities':
      case 'timing-violations':
        chartData = [
          { name: 'Affected Cases', value: data.count },
          { name: 'Normal Cases', value: data.total_cases - data.count }
        ];
        break;
      default:
        return <div className="text-center text-gray-500">Bar chart not available for this data type</div>;
    }

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
          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTable = () => {
    if (!data) return null;

    switch (widgetType) {
      case 'sop-deviation-patterns':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern ID</TableHead>
                  <TableHead>Pattern Name</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((pattern: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{pattern.pattern_id}</TableCell>
                    <TableCell>{pattern.pattern_name}</TableCell>
                    <TableCell>{pattern.frequency}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        pattern.severity === 'high' ? 'bg-red-100 text-red-800' :
                        pattern.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pattern.severity}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(pattern.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'case-complexity':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Complexity Score</TableHead>
                  <TableHead>Event Count</TableHead>
                  <TableHead>Z-Score</TableHead>
                  <TableHead>Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.case_id}</TableCell>
                    <TableCell>{item.complexity_score.toFixed(2)}</TableCell>
                    <TableCell>{item.event_count}</TableCell>
                    <TableCell>{item.z_score.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.classification === 'high' ? 'bg-red-100 text-red-800' :
                        item.classification === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.classification}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'resource-performance':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>Resource Name</TableHead>
                  <TableHead>Avg Duration (hrs)</TableHead>
                  <TableHead>Total Activities</TableHead>
                  <TableHead>Efficiency Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((resource: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{resource.resource_id}</TableCell>
                    <TableCell>{resource.resource_name}</TableCell>
                    <TableCell>{resource.avg_duration.toFixed(2)}</TableCell>
                    <TableCell>{resource.total_activities}</TableCell>
                    <TableCell>{resource.efficiency_score.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'timing-analysis':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity Pair</TableHead>
                  <TableHead>Avg Gap (hrs)</TableHead>
                  <TableHead>Max Gap (hrs)</TableHead>
                  <TableHead>Min Gap (hrs)</TableHead>
                  <TableHead>Violations Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((timing: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{timing.activity_pair}</TableCell>
                    <TableCell>{timing.avg_gap.toFixed(2)}</TableCell>
                    <TableCell>{timing.max_gap.toFixed(2)}</TableCell>
                    <TableCell>{timing.min_gap.toFixed(2)}</TableCell>
                    <TableCell>{timing.violations_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return <div className="text-center text-gray-500">Table view not available for this data type</div>;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      );
    }

    if (error && !usingMockData) {
      return (
        <div className="flex items-center justify-center h-64 text-center">
          <div className="text-red-600">
            <p className="font-semibold">API Connection Failed</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 text-gray-600">Displaying sample data instead</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {usingMockData && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <span className="font-medium">Demo Mode:</span> Showing sample data (API server not available)
          </div>
        )}
        {visualizationType === 'bar' ? renderBarChart() : renderTable()}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderContent()}
    </div>
  );
};

export default DynamicAPIWidget;
