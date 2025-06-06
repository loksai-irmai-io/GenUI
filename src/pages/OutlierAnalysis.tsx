
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "../components/widgets/DataTable";
import { TrendingUp, AlertTriangle, Target, BarChart3 } from "lucide-react";
import { useMaximizeState } from "../hooks/useMaximizeState";

interface OutlierData {
  case_id: string;
  process_name: string;
  outlier_type: string;
  severity: string;
  description: string;
  timestamp: string;
}

const OutlierAnalysis = () => {
  const [outlierData, setOutlierData] = useState<OutlierData[]>([]);
  const [loading, setLoading] = useState(true);

  const { toggleMaximize, isMaximized } = useMaximizeState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for demonstration
        const mockData: OutlierData[] = [
          {
            case_id: "CASE_001",
            process_name: "Mortgage Application",
            outlier_type: "Duration",
            severity: "High",
            description: "Process took 45 days vs. average 15 days",
            timestamp: "2024-01-15T10:30:00Z"
          },
          {
            case_id: "CASE_002", 
            process_name: "Document Verification",
            outlier_type: "Resource Usage",
            severity: "Medium",
            description: "Required 8 reviewers vs. average 3",
            timestamp: "2024-01-16T14:20:00Z"
          },
          {
            case_id: "CASE_003",
            process_name: "Credit Check",
            outlier_type: "Cost",
            severity: "High", 
            description: "Cost $2,500 vs. average $300",
            timestamp: "2024-01-17T09:15:00Z"
          }
        ];
        setOutlierData(mockData);
      } catch (error) {
        console.error('Error fetching outlier data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading outlier analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Outlier Analysis</h1>
              <p className="text-slate-400">Statistical anomaly detection and analysis</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Overview</TabsTrigger>
            <TabsTrigger value="detailed" className="data-[state=active]:bg-blue-600">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-blue-600">Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Total Outliers</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">{outlierData.length}</div>
                  <p className="text-xs text-slate-400 mt-1">Detected anomalies</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">High Severity</CardTitle>
                  <Target className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {outlierData.filter(item => item.severity === 'High').length}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Critical outliers</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Types Detected</CardTitle>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {new Set(outlierData.map(item => item.outlier_type)).size}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Outlier categories</p>
                </CardContent>
              </Card>
            </div>

            <DataTable
              title="Outlier Analysis Results"
              data={outlierData}
              columns={[
                { key: "case_id", label: "Case ID" },
                { key: "process_name", label: "Process Name" },
                { key: "outlier_type", label: "Outlier Type" },
                { key: "severity", label: "Severity" },
                { key: "description", label: "Description" },
                { key: "timestamp", label: "Timestamp" }
              ]}
              maximized={isMaximized("outlier-analysis-table")}
              widgetId="outlier-analysis-table"
              onToggleMaximize={() => toggleMaximize("outlier-analysis-table")}
            />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <DataTable
              title="Detailed Outlier Analysis"
              data={outlierData}
              columns={[
                { key: "case_id", label: "Case ID" },
                { key: "process_name", label: "Process Name" },
                { key: "outlier_type", label: "Outlier Type" },
                { key: "severity", label: "Severity" },
                { key: "description", label: "Description" },
                { key: "timestamp", label: "Timestamp" }
              ]}
              maximized={isMaximized("detailed-outlier-table")}
              widgetId="detailed-outlier-table"
              onToggleMaximize={() => toggleMaximize("detailed-outlier-table")}
            />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <DataTable
              title="Outlier Pattern Analysis"
              data={outlierData}
              columns={[
                { key: "outlier_type", label: "Pattern Type" },
                { key: "severity", label: "Severity" },
                { key: "description", label: "Pattern Description" }
              ]}
              maximized={isMaximized("pattern-analysis-table")}
              widgetId="pattern-analysis-table"
              onToggleMaximize={() => toggleMaximize("pattern-analysis-table")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OutlierAnalysis;
