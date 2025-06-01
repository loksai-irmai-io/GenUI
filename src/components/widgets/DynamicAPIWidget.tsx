
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Database, RefreshCw, Download, Maximize2 } from "lucide-react";
import { apiService } from '@/services/apiService';
import { mockDataService } from '@/services/dataService';
import { Loading } from '@/components/ui/loading';
import { useWidgetRefresh } from '@/contexts/WidgetRefreshContext';

interface DynamicAPIWidgetProps {
  type: 'bar' | 'table' | 'sop-count' | 'sop-patterns' | 'incomplete-bar' | 'longrunning-bar' | 'resource-switches-bar' | 'rework-activities-bar' | 'timing-violations-bar' | 'case-complexity-bar' | 'resource-performance-table' | 'timing-analysis-table' | 'process-failure-patterns-bar';
  endpoint?: string;
  title: string;
  data?: any[];
  id?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const DynamicAPIWidget: React.FC<DynamicAPIWidgetProps> = ({ type, endpoint, title, data: initialData, id }) => {
  const [data, setData] = useState<any[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const { refreshingWidgets } = useWidgetRefresh();

  const widgetId = id || `${type}-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const isRefreshing = refreshingWidgets.has(widgetId);

  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, [endpoint, type, initialData]);

  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail?.widgetId === widgetId || event.type === 'refreshAllWidgets') {
        fetchData();
      }
    };

    window.addEventListener('refreshWidget', handleRefresh as EventListener);
    window.addEventListener('refreshAllWidgets', handleRefresh as EventListener);

    return () => {
      window.removeEventListener('refreshWidget', handleRefresh as EventListener);
      window.removeEventListener('refreshAllWidgets', handleRefresh as EventListener);
    };
  }, [widgetId]);

  const fetchData = async () => {
    if (!endpoint && !type) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      // Try API first, fall back to mock data
      try {
        if (endpoint) {
          result = await apiService.fetchData(endpoint);
        } else {
          // Use mock data based on type
          switch (type) {
            case 'sop-count':
              result = await mockDataService.getSOPDeviationCount();
              break;
            case 'sop-patterns':
              result = await mockDataService.getSOPDeviationPatterns();
              break;
            case 'incomplete-bar':
              result = await mockDataService.getIncompleteCasesCount();
              break;
            case 'longrunning-bar':
              result = await mockDataService.getLongRunningCasesCount();
              break;
            case 'resource-switches-bar':
              result = await mockDataService.getResourceSwitchesCount();
              break;
            case 'rework-activities-bar':
              result = await mockDataService.getReworkActivitiesCount();
              break;
            case 'timing-violations-bar':
              result = await mockDataService.getTimingViolationsCount();
              break;
            case 'case-complexity-bar':
              result = await mockDataService.getCaseComplexityData();
              break;
            case 'resource-performance-table':
              result = await mockDataService.getResourcePerformanceData();
              break;
            case 'timing-analysis-table':
              result = await mockDataService.getTimingAnalysisData();
              break;
            default:
              result = [];
          }
        }
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
        // Fall back to mock data with the same switch logic
        switch (type) {
          case 'sop-count':
            result = await mockDataService.getSOPDeviationCount();
            break;
          case 'sop-patterns':
            result = await mockDataService.getSOPDeviationPatterns();
            break;
          case 'incomplete-bar':
            result = await mockDataService.getIncompleteCasesCount();
            break;
          case 'longrunning-bar':
            result = await mockDataService.getLongRunningCasesCount();
            break;
          case 'resource-switches-bar':
            result = await mockDataService.getResourceSwitchesCount();
            break;
          case 'rework-activities-bar':
            result = await mockDataService.getReworkActivitiesCount();
            break;
          case 'timing-violations-bar':
            result = await mockDataService.getTimingViolationsCount();
            break;
          case 'case-complexity-bar':
            result = await mockDataService.getCaseComplexityData();
            break;
          case 'resource-performance-table':
            result = await mockDataService.getResourcePerformanceData();
            break;
          case 'timing-analysis-table':
            result = await mockDataService.getTimingAnalysisData();
            break;
          default:
            result = [];
        }
      }
      
      setData(Array.isArray(result) ? result : [result]);
      setLastUpdated(new Date());
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchData();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
            {error && (
              <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      );
    }

    switch (type) {
      case 'sop-count':
        return (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{data[0]?.count || 0}</div>
                <div className="text-sm text-gray-600">Total Deviations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{data[0]?.percentage || 0}%</div>
                <div className="text-sm text-gray-600">Deviation Rate</div>
                <Progress value={data[0]?.percentage || 0} className="mt-2" />
              </div>
            </div>
          </div>
        );
      
      case 'bar':
      case 'incomplete-bar':
      case 'longrunning-bar':
      case 'resource-switches-bar':
      case 'rework-activities-bar':
      case 'timing-violations-bar':
      case 'case-complexity-bar':
      case 'process-failure-patterns-bar':
        return (
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#6b7280"
                />
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
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderTable = () => {
    if (!data || data.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No data available</p>
          {error && (
            <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      );
    }

    const columns = Object.keys(data[0] || {});

    return (
      <div className="overflow-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {columns.map((column) => (
                <TableHead key={column} className="font-semibold text-gray-700 capitalize">
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <TableCell key={column} className="text-gray-700">
                    {typeof row[column] === 'number' && column.includes('percentage') ? (
                      <Badge variant="outline" className="font-mono">
                        {row[column]}%
                      </Badge>
                    ) : typeof row[column] === 'number' && column.includes('efficiency') ? (
                      <div className="flex items-center space-x-2">
                        <span>{row[column]}%</span>
                        <Progress value={row[column]} className="w-16" />
                      </div>
                    ) : (
                      row[column]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const getIcon = () => {
    switch (type) {
      case 'sop-count':
      case 'sop-patterns':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'incomplete-bar':
        return <Activity className="h-5 w-5 text-blue-600" />;
      case 'longrunning-bar':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default:
        return <Database className="h-5 w-5 text-gray-600" />;
    }
  };

  const isTableType = type.includes('table') || type === 'sop-patterns';

  return (
    <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(loading || isRefreshing) && <Loading size="sm" text="" />}
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                disabled={loading || isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                disabled={!data || data.length === 0}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            <Badge variant={error ? "destructive" : "default"} className="text-xs">
              {error ? `Error (${retryCount})` : endpoint ? "Live" : "Demo"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {loading || isRefreshing ? (
          <div className="h-64 flex items-center justify-center">
            <Loading size="lg" text="Loading data..." />
          </div>
        ) : isTableType ? (
          renderTable()
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicAPIWidget;
