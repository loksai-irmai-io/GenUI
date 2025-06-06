import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp, Target, Shield, Maximize, Minimize } from "lucide-react";
import { useMaximizeState } from "../hooks/useMaximizeState";
import DataTable from "../components/widgets/DataTable";
import {
  incompleteCasesService,
  longRunningCasesService,
  resourceSwitchesService,
  reworkActivitiesService,
  timingViolationsService,
  caseComplexityService,
  resourcePerformanceService,
  timingAnalysisService
} from "@/services";

interface CCMData {
  name: string;
  value: number;
}

const CCM = () => {
  const [incompleteCasesData, setIncompleteCasesData] = useState<CCMData[]>([]);
  const [longRunningCasesData, setLongRunningCasesData] = useState<CCMData[]>([]);
  const [resourceSwitchesData, setResourceSwitchesData] = useState<CCMData[]>([]);
  const [reworkActivitiesData, setReworkActivitiesData] = useState<CCMData[]>([]);
  const [timingViolationsData, setTimingViolationsData] = useState<CCMData[]>([]);
  const [caseComplexityData, setCaseComplexityData] = useState<CCMData[]>([]);

  const [incompleteCasesTableData, setIncompleteCasesTableData] = useState<any[]>([]);
  const [longRunningCasesTableData, setLongRunningCasesTableData] = useState<any[]>([]);
  const [reworkActivitiesTableData, setReworkActivitiesTableData] = useState<any[]>([]);
  const [timingViolationsTableData, setTimingViolationsTableData] = useState<any[]>([]);
  const [caseComplexityTableData, setCaseComplexityTableData] = useState<any[]>([]);
  const [resourcePerformanceTableData, setResourcePerformanceTableData] = useState<any[]>([]);
  const [timingAnalysisTableData, setTimingAnalysisTableData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toggleMaximize, isMaximized } = useMaximizeState();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          incompleteCases,
          longRunningCases,
          resourceSwitches,
          reworkActivities,
          timingViolations,
          caseComplexity,
          incompleteCasesTable,
          longRunningCasesTable,
          reworkActivitiesTable,
          timingViolationsTable,
          caseComplexityTable,
          resourcePerformanceTable,
          timingAnalysisTable
        ] = await Promise.all([
          incompleteCasesService.getCountBar(),
          longRunningCasesService.getCountBar(),
          resourceSwitchesService.getCountBar(),
          reworkActivitiesService.getCountBar(),
          timingViolationsService.getCountBar(),
          caseComplexityService.getCountBar(),
          incompleteCasesService.getTable(),
          longRunningCasesService.getTable(),
          reworkActivitiesService.getTable(),
          timingViolationsService.getTable(),
          caseComplexityService.getTable(),
          resourcePerformanceService.getTable(),
          timingAnalysisService.getTable()
        ]);

        setIncompleteCasesData(incompleteCases);
        setLongRunningCasesData(longRunningCases);
        setResourceSwitchesData(resourceSwitches);
        setReworkActivitiesData(reworkActivities);
        setTimingViolationsData(timingViolations);
        setCaseComplexityData(caseComplexity);

        setIncompleteCasesTableData(incompleteCasesTable);
        setLongRunningCasesTableData(longRunningCasesTable);
        setReworkActivitiesTableData(reworkActivitiesTable);
        setTimingViolationsTableData(timingViolationsTable);
        setCaseComplexityTableData(caseComplexityTable);
        setResourcePerformanceTableData(resourcePerformanceTable);
        setTimingAnalysisTableData(timingAnalysisTable);

      } catch (error) {
        console.error('Error loading CCM data:', error);
        setError('Failed to load CCM data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderTable = (widgetId: string, title: string, data: any[], columns: any[]) => {
    return (
      <DataTable
        title={title}
        data={data}
        columns={columns}
        maximized={isMaximized(widgetId)}
        widgetId={widgetId}
        onToggleMaximize={() => toggleMaximize(widgetId)}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading CCM data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 enterprise-card max-w-md">
          <div className="text-red-400 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Error Loading Data</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Case Cycle Management
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-3xl">
            Optimize case lifecycles with real-time insights into bottlenecks, deviations, and resource allocation.
          </p>
        </div>

        <Tabs defaultValue="incomplete-cases" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800/50 border border-slate-700">
            <TabsTrigger
              value="incomplete-cases"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Incomplete Cases
            </TabsTrigger>
            <TabsTrigger
              value="long-running"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Long Running Cases
            </TabsTrigger>
            <TabsTrigger
              value="resource-switches"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Resource Switches
            </TabsTrigger>
            <TabsTrigger
              value="rework-activities"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Rework Activities
            </TabsTrigger>
            <TabsTrigger
              value="timing-violations"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Timing Violations
            </TabsTrigger>
            <TabsTrigger
              value="case-complexity"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Case Complexity
            </TabsTrigger>
            <TabsTrigger
              value="resource-performance"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Resource Performance
            </TabsTrigger>
            <TabsTrigger
              value="timing-analysis"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Timing Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incomplete-cases" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Incomplete Cases</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {incompleteCasesData.reduce((sum, item) => (item.name === 'Incomplete Cases' ? item.value : sum), 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Active incomplete cases</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Cases Completed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {incompleteCasesData.reduce((sum, item) => (item.name === 'Complete Cases' ? item.value : sum), 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Recently completed cases</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {((incompleteCasesData.reduce((sum, item) => (item.name === 'Complete Cases' ? item.value : sum), 0) /
                      (incompleteCasesData.reduce((sum, item) => item.value + sum, 0) || 1)) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Current completion percentage</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Incomplete Cases Overview</CardTitle>
                  <CardDescription className="text-slate-400">Visual representation of incomplete vs complete cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incompleteCasesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {renderTable(
                "incomplete-cases-table",
                "Incomplete Cases Details",
                incompleteCasesTableData,
                [
                  { key: "case_id", label: "Case ID" },
                  { key: "case:concept:name", label: "Process Name" },
                  { key: "incomplete_duration_days", label: "Duration (Days)" },
                  { key: "last_activity", label: "Last Activity" },
                  { key: "last_timestamp", label: "Last Timestamp" }
                ]
              )}
            </div>
          </TabsContent>

          <TabsContent value="long-running" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Long Running Cases</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {longRunningCasesData.reduce((sum, item) => (item.name === 'Long Running Cases' ? item.value : sum), 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Cases exceeding expected duration</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Regular Cases</CardTitle>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {longRunningCasesData.reduce((sum, item) => (item.name === 'Regular Cases' ? item.value : sum), 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Cases within expected duration</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Long Running Rate</CardTitle>
                  <Target className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {((longRunningCasesData.reduce((sum, item) => (item.name === 'Long Running Cases' ? item.value : sum), 0) /
                      (longRunningCasesData.reduce((sum, item) => item.value + sum, 0) || 1)) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Percentage of long running cases</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Long Running Cases Overview</CardTitle>
                <CardDescription className="text-slate-400">Visual representation of long running vs regular cases</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={longRunningCasesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Bar dataKey="value" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {renderTable(
              "long-running-cases-table",
              "Long Running Cases Details",
              longRunningCasesTableData,
              [
                { key: "case_id", label: "Case ID" },
                { key: "start_time", label: "Start Time" },
                { key: "end_time", label: "End Time" },
                { key: "duration_hours", label: "Duration (Hours)" },
                { key: "activity_count", label: "Activity Count" }
              ]
            )}
          </TabsContent>

          <TabsContent value="resource-switches" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Resource Switches</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {resourceSwitchesData.reduce((sum, item) => item.value + sum, 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Total resource switches</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Resource Switches Overview</CardTitle>
                <CardDescription className="text-slate-400">Visual representation of resource allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceSwitchesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rework-activities" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Rework Activities</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {reworkActivitiesData.reduce((sum, item) => item.value + sum, 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Activities requiring rework</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Rework Activities Overview</CardTitle>
                <CardDescription className="text-slate-400">Visual representation of rework activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reworkActivitiesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Bar dataKey="value" fill="#e48352" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {renderTable(
              "rework-activities-table",
              "Rework Activities Details",
              reworkActivitiesTableData,
              [
                { key: "case_id", label: "Case ID" },
                { key: "activity", label: "Activity" },
                { key: "rework_count", label: "Rework Count" },
                { key: "original_timestamp", label: "Original Timestamp" },
                { key: "rework_timestamp", label: "Rework Timestamp" }
              ]
            )}
          </TabsContent>

          <TabsContent value="timing-violations" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Timing Violations</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {timingViolationsData.reduce((sum, item) => item.value + sum, 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Identified timing violations</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Timing Violations Overview</CardTitle>
                <CardDescription className="text-slate-400">Visual representation of timing violations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timingViolationsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Bar dataKey="value" fill="#f472b6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {renderTable(
              "timing-violations-table",
              "Timing Violations Details",
              timingViolationsTableData,
              [
                { key: "case_id", label: "Case ID" },
                { key: "activity", label: "Activity" },
                { key: "expected_duration", label: "Expected Duration" },
                { key: "actual_duration", label: "Actual Duration" },
                { key: "violation_type", label: "Violation Type" }
              ]
            )}
          </TabsContent>

          <TabsContent value="case-complexity" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Simple Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {caseComplexityData.reduce((sum, item) => (item.name === 'Simple' ? item.value : sum), 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Simple case count</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Moderate Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {caseComplexityData.reduce((sum, item) => (item.name === 'Moderate' ? item.value : sum), 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Moderate case count</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Complex Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {caseComplexityData.reduce((sum, item) => (item.name === 'Complex' ? item.value : sum), 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Complex case count</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Case Complexity Overview</CardTitle>
                <CardDescription className="text-slate-400">Visual representation of case complexity distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={caseComplexityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Bar dataKey="value" fill="#64748b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {renderTable(
              "case-complexity-table",
              "Case Complexity Analysis",
              caseComplexityTableData,
              [
                { key: "case_id", label: "Case ID" },
                { key: "complexity_level", label: "Complexity Level" },
                { key: "activity_count", label: "Activity Count" },
                { key: "duration_days", label: "Duration (Days)" },
                { key: "resource_count", label: "Resource Count" }
              ]
            )}
          </TabsContent>

          <TabsContent value="resource-performance" className="space-y-8">
            {renderTable(
              "resource-performance-table",
              "Resource Performance Analysis",
              resourcePerformanceTableData,
              [
                { key: "resource_id", label: "Resource ID" },
                { key: "resource_name", label: "Resource Name" },
                { key: "avg_processing_time", label: "Avg Processing Time" },
                { key: "case_count", label: "Case Count" },
                { key: "efficiency_score", label: "Efficiency Score" }
              ]
            )}
          </TabsContent>

          <TabsContent value="timing-analysis" className="space-y-8">
            {renderTable(
              "timing-analysis-table",
              "Detailed Timing Analysis",
              timingAnalysisTableData,
              [
                { key: "activity", label: "Activity" },
                { key: "avg_duration", label: "Average Duration" },
                { key: "min_duration", label: "Min Duration" },
                { key: "max_duration", label: "Max Duration" },
                { key: "std_deviation", label: "Std Deviation" }
              ]
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CCM;
