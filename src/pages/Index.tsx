import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import WidgetSelectionModal from "../components/WidgetSelectionModal";
import InfoCard from "../components/widgets/InfoCard";
import ChartWidget from "../components/widgets/ChartWidget";
import DataTable from "../components/widgets/DataTable";
import DataVisualizationWidget from "../components/widgets/DataVisualizationWidget";
import DynamicAPIWidget from "../components/widgets/DynamicAPIWidget";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import ChatBot from "../components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from "lucide-react";

// Sample data for legacy widgets
const sampleLineData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 2000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
];

const sampleBarData = [
  { name: "Product A", value: 4000 },
  { name: "Product B", value: 3000 },
  { name: "Product C", value: 2000 },
  { name: "Product D", value: 2780 },
];

const samplePieData = [
  { name: "Desktop", value: 45 },
  { name: "Mobile", value: 35 },
  { name: "Tablet", value: 20 },
];

const sampleTableData = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Active" },
];

const tableColumns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

// Default widgets for all users
const DEFAULT_WIDGETS = [
  "sop-deviation",
  "resource-switches",
  "incomplete-cases",
];

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    "info-card-medium",
    "line-chart",
    "bar-chart",
    "data-table",
  ]);
  const [dataVisualizationWidgets, setDataVisualizationWidgets] = useState<
    Array<{
      id: string;
      type: string;
      data: any[];
      title: string;
    }>
  >([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserWidgetPreferences();
      loadPinnedWidgets();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (selectedWidgets.length > 0 || pinnedWidgets.length > 0)) {
      (async () => {
        const dashboardVisualizations: Array<{
          id: string;
          type: string;
          data: any[];
          title: string;
        }> = [];
        // Use a Set to avoid duplicates
        const widgetIds = Array.from(
          new Set([...selectedWidgets, ...pinnedWidgets])
        );
        for (const widgetId of widgetIds) {
          switch (widgetId) {
            case "sop-deviation": {
              const { sopDeviationService } = await import(
                "@/services/sopDeviationService"
              );
              const data = await sopDeviationService.getSOPDeviationCount();
              dashboardVisualizations.push({
                id: "sop-deviation",
                type: "sop-count",
                data: [data], // wrap in array for consistent type
                title: "SOP Deviation",
              });
              const patterns =
                await sopDeviationService.getSOPDeviationPatterns();
              dashboardVisualizations.push({
                id: "sop-deviation-patterns",
                type: "sop-patterns",
                data: patterns,
                title: "SOP Deviation Patterns",
              });
              break;
            }
            case "long-running-cases": {
              const { longRunningCasesService } = await import(
                "@/services/longRunningCasesService"
              );
              const data = await longRunningCasesService.getCountBar();
              dashboardVisualizations.push({
                id: "long-running-cases",
                type: "longrunning-bar",
                data,
                title: "Long Running Cases",
              });
              break;
            }
            case "incomplete-cases": {
              const { incompleteCasesService } = await import(
                "@/services/incompleteCasesService"
              );
              const data = await incompleteCasesService.getCountBar();
              dashboardVisualizations.push({
                id: "incomplete-cases",
                type: "incomplete-bar",
                data,
                title: "Incomplete Cases",
              });
              break;
            }
            case "resource-switches": {
              const { resourceSwitchesService } = await import(
                "@/services/resourceSwitchesService"
              );
              const data = await resourceSwitchesService.getCountBar();
              dashboardVisualizations.push({
                id: "resource-switches",
                type: "resource-switches-bar",
                data,
                title: "Resource Switches",
              });
              break;
            }
            case "rework-activities": {
              const { reworkActivitiesService } = await import(
                "@/services/reworkActivitiesService"
              );
              const data = await reworkActivitiesService.getCountBar();
              dashboardVisualizations.push({
                id: "rework-activities",
                type: "rework-activities-bar",
                data,
                title: "Rework Activities",
              });
              break;
            }
            case "timing-violations": {
              const { timingViolationsService } = await import(
                "@/services/timingViolationsService"
              );
              const data = await timingViolationsService.getCountBar();
              dashboardVisualizations.push({
                id: "timing-violations",
                type: "timing-violations-bar",
                data,
                title: "Timing Violations",
              });
              break;
            }
            case "case-complexity": {
              const { caseComplexityService } = await import(
                "@/services/caseComplexityService"
              );
              const data = await caseComplexityService.getCountBar();
              dashboardVisualizations.push({
                id: "case-complexity",
                type: "case-complexity-bar",
                data,
                title: "Case Complexity",
              });
              break;
            }
            case "resource-performance": {
              const { resourcePerformanceService } = await import(
                "@/services/resourcePerformanceService"
              );
              const data = await resourcePerformanceService.getTable();
              dashboardVisualizations.push({
                id: "resource-performance",
                type: "resource-performance-table",
                data,
                title: "Resource Performance",
              });
              break;
            }
            case "timing-analysis": {
              const { timingAnalysisService } = await import(
                "@/services/timingAnalysisService"
              );
              const data = await timingAnalysisService.getTable();
              dashboardVisualizations.push({
                id: "timing-analysis",
                type: "timing-analysis-table",
                data,
                title: "Timing Analysis",
              });
              break;
            }
            case "process-failure-patterns-distribution": {
              try {
                const response = await fetch("http://127.0.0.1:8001/allcounts");
                if (!response.ok)
                  throw new Error(`API error: ${response.status}`);
                let apiData = await response.json();
                // Transform object to array for recharts
                if (apiData && !Array.isArray(apiData)) {
                  apiData = Object.entries(apiData).map(([name, value]) => ({
                    name,
                    value,
                  }));
                }
                dashboardVisualizations.push({
                  id: "process-failure-patterns-distribution",
                  type: "process-failure-patterns-bar",
                  data: apiData,
                  title: "Process Failure Patterns Distribution",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "process-failure-patterns-distribution",
                  type: "process-failure-patterns-bar",
                  data: [],
                  title: "Process Failure Patterns Distribution (Error)",
                });
              }
              break;
            }
            default:
              break;
          }
        }
        setDataVisualizationWidgets(dashboardVisualizations);
      })();
    }
  }, [user, selectedWidgets, pinnedWidgets]);

  // Load user widget preferences, or set defaults for new users
  const loadUserWidgetPreferences = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_widget_preferences")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const widgetIds = data
          .map((pref) => pref.selected_module)
          .filter(Boolean);
        if (widgetIds.length > 0) {
          setSelectedWidgets(widgetIds);
        }
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  };

  const loadPinnedWidgets = async () => {
    if (!user) return;
    try {
      // Use the pinned column from user_widget_preferences instead of separate table
      const { data, error } = await supabase
        .from("user_widget_preferences")
        .select("*")
        .eq("user_id", user.id)
        .eq("pinned", true);

      if (error) throw error;

      if (data && data.length > 0) {
        const widgetIds = data.map((pref) => pref.selected_module).filter(Boolean);
        setPinnedWidgets(widgetIds);
      }
    } catch (error) {
      console.error("Error loading pinned widgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinWidget = async (widgetId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to pin widgets.",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyPinned = pinnedWidgets.includes(widgetId);

    try {
      if (isCurrentlyPinned) {
        // Unpin the widget
        const { error } = await supabase
          .from("user_widget_preferences")
          .update({ pinned: false })
          .eq("user_id", user.id)
          .eq("selected_module", widgetId);

        if (error) throw error;
        setPinnedWidgets((prev) => prev.filter((id) => id !== widgetId));
      } else {
        // Pin the widget
        const { error } = await supabase
          .from("user_widget_preferences")
          .update({ pinned: true })
          .eq("user_id", user.id)
          .eq("selected_module", widgetId);

        if (error) throw error;
        setPinnedWidgets((prev) => [...prev, widgetId]);
      }

      toast({
        title: "Widget Pinned",
        description: `Widget ${
          isCurrentlyPinned ? "unpinned" : "pinned"
        } successfully.`,
      });
    } catch (error) {
      console.error("Error pinning widget:", error);
      toast({
        title: "Error Pinning Widget",
        description: "There was a problem pinning this widget.",
        variant: "destructive",
      });
    }
  };

  const handleSaveWidgets = async (widgets: string[]) => {
    setSelectedWidgets(widgets);

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save widget preferences.",
        variant: "destructive",
      });
      return;
    }
    try {
      await supabase
        .from("user_widget_preferences")
        .delete()
        .eq("user_id", user.id);

      const preferences = widgets.map((widgetId) => ({
        user_id: user.id,
        widget_id: crypto.randomUUID(),
        selected_module: widgetId,
      }));

      const { error } = await supabase
        .from("user_widget_preferences")
        .insert(preferences);

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your widget preferences have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error Saving Preferences",
        description: "There was a problem saving your widget preferences.",
        variant: "destructive",
      });
    }
  };

  const handleDataReceived = (type: string, data: any[], title: string) => {
    const newWidget = {
      id: `data-viz-${Date.now()}`,
      type,
      data,
      title,
    };
    setDataVisualizationWidgets((prev) => [...prev, newWidget]);
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "info-card-small":
        return (
          <Card key={widgetId} className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-800">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">$45,231</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                  +12%
                </Badge>
                <span className="text-xs text-blue-600">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      case "info-card-medium":
        return (
          <Card key={widgetId} className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-emerald-800">Total Users</CardTitle>
                  <CardDescription className="text-emerald-600">Active this month</CardDescription>
                </div>
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 mb-3">2,543</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                    +8%
                  </Badge>
                  <span className="text-sm text-emerald-600">growth</span>
                </div>
                <Progress value={85} className="w-20" />
              </div>
            </CardContent>
          </Card>
        );
      case "info-card-large":
        return (
          <Card key={widgetId} className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-amber-800">Sales Performance</CardTitle>
                  <CardDescription className="text-amber-600">Quarterly results</CardDescription>
                </div>
                <TrendingDown className="h-6 w-6 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-900 mb-4">$123,456</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-amber-600">Target</div>
                  <div className="font-semibold text-amber-800">$125,000</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-amber-600">Variance</div>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">-2%</Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-amber-600">Progress</div>
                  <Progress value={98} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "line-chart":
        return (
          <Card key={widgetId} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 col-span-2">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChartWidget
                type="line"
                title=""
                data={sampleLineData}
              />
            </CardContent>
          </Card>
        );
      case "bar-chart":
        return (
          <Card key={widgetId} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 col-span-2">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChartWidget
                type="bar"
                title=""
                data={sampleBarData}
              />
            </CardContent>
          </Card>
        );
      case "pie-chart":
        return (
          <Card key={widgetId} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-800">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChartWidget
                type="pie"
                title=""
                data={samplePieData}
              />
            </CardContent>
          </Card>
        );
      case "data-table":
        return (
          <Card key={widgetId} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 col-span-3">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-indigo-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                title=""
                data={sampleTableData}
                columns={tableColumns}
              />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const renderDataVisualizationWidgets = () => {
    return dataVisualizationWidgets.map((widget) => (
      <Card key={widget.id} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 col-span-2">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            {widget.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DynamicAPIWidget
            type={widget.type as any}
            data={widget.data}
            title={widget.title}
            id={widget.id}
          />
        </CardContent>
      </Card>
    ));
  };

  const userWidgets = [
    ...selectedWidgets.map((widgetId) => renderWidget(widgetId)),
    ...renderDataVisualizationWidgets(),
  ].filter(Boolean);

  const totalWidgets = userWidgets.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header onSelectWidgets={() => setIsModalOpen(true)} />
      <main className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Analytics Dashboard */}
          <AnalyticsDashboard />

          {totalWidgets === 0 ? (
            <div className="text-center py-16">
              <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 max-w-md mx-auto">
                <CardContent className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                    No Widgets Selected
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-6">
                    Choose widgets to personalize your dashboard or ask the chatbot for data analysis
                  </CardDescription>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Select Widgets
                  </button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
              {userWidgets}
            </div>
          )}
        </div>
      </main>
      
      <WidgetSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWidgets}
        selectedWidgets={selectedWidgets}
        pinnedWidgets={pinnedWidgets}
      />

      <ChatBot onDataReceived={handleDataReceived} />
    </div>
  );
};

export default Index;
