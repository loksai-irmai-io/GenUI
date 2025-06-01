import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import WidgetSelectionModal from "../components/WidgetSelectionModal";
import InfoCard from "../components/widgets/InfoCard";
import ChartWidget from "../components/widgets/ChartWidget";
import DataTable from "../components/widgets/DataTable";
import DataVisualizationWidget from "../components/widgets/DataVisualizationWidget";
import ChatBot from "../components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SOPWidget from "../components/widgets/SOPWidget";
import ResourcePerformanceTable from "../components/widgets/ResourcePerformanceTable";
import TimingAnalysisTable from "../components/widgets/TimingAnalysisTable";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { Pin, PinOff, Save, TrendingUp, Users, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Sample data for widgets
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
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);
  const [dataVisualizationWidgets, setDataVisualizationWidgets] = useState<
    Array<{
      id: string;
      type: string;
      data: any[];
      title: string;
    }>
  >([]);
  const [chatbotVisualizations, setChatbotVisualizations] = useState<
    Array<{
      id: string;
      type: string;
      data: any[];
      title: string;
    }>
  >([]);
  const { user } = useAuth();
  const { toast } = useToast();
  // Track local pin state for immediate UI feedback
  const [localPinned, setLocalPinned] = useState<string[]>([]);
  // Track if there are unsaved changes
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserWidgetPreferences();
    }
  }, [user]);

  useEffect(() => {
    setLocalPinned(pinnedWidgets);
  }, [pinnedWidgets]);

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
        const pinnedIds = data
          .filter((pref) => pref.pinned)
          .map((pref) => pref.selected_module);
        setSelectedWidgets(widgetIds.length > 0 ? widgetIds : DEFAULT_WIDGETS);
        setPinnedWidgets(pinnedIds.length > 0 ? pinnedIds : DEFAULT_WIDGETS);
      } else {
        // No preferences: set defaults
        setSelectedWidgets(DEFAULT_WIDGETS);
        setPinnedWidgets(DEFAULT_WIDGETS);
        // Insert default preferences for new user
        const preferences = DEFAULT_WIDGETS.map((widgetId) => ({
          user_id: user.id,
          widget_id: widgetId,
          selected_module: widgetId,
          pinned: true,
        }));
        await supabase
          .from("user_widget_preferences")
          .upsert(preferences, { onConflict: "user_id,selected_module" });
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  };

  // Save widgets: use the provided pinned list as the source of truth
  const handleSaveWidgets = async (widgets: string[], pinned: string[]) => {
    setSelectedWidgets(widgets);
    setPinnedWidgets(pinned);
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save widget preferences.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Remove duplicates for this user (defensive, in case migration missed any)
      await supabase.rpc("remove_duplicate_user_widget_preferences", {
        user_id_param: user.id,
      });
      // Only keep the currently pinned widgets in the DB
      await supabase
        .from("user_widget_preferences")
        .delete()
        .eq("user_id", user.id)
        .not(
          "selected_module",
          "in",
          `(${pinned.map((w) => `'${w}'`).join(",")})`
        );
      // Upsert only the currently pinned widgets
      const preferences = pinned.map((widgetId) => ({
        user_id: user.id,
        widget_id: widgetId,
        selected_module: widgetId,
        pinned: true,
      }));
      let error = null;
      try {
        const { error: upsertError } = await supabase
          .from("user_widget_preferences")
          .upsert(preferences, { onConflict: "user_id,selected_module" });
        error = upsertError;
      } catch (e) {
        error = e;
      }
      if (error) throw error;
      await loadUserWidgetPreferences();
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

  const handleDataReceived = (
    type: string,
    data: any,
    title: string,
    widgetId?: string
  ) => {
    if (widgetId) {
      // Replace (not append) dashboard data for this widgetId
      setDataVisualizationWidgets((prev) => {
        const filtered = prev.filter((w) => w.id !== widgetId);
        return [
          ...filtered,
          {
            id: widgetId,
            type,
            data,
            title,
          },
        ];
      });
    } else {
      // Chatbot visualization: always add a new one with a unique id
      const id = `data-viz-${Date.now()}`;
      setChatbotVisualizations((prev) => [
        ...prev,
        {
          id,
          type,
          data,
          title,
        },
      ]);
    }
  };

  // Pin/unpin handler for dashboard widgets
  const handleTogglePinWidget = (widgetId: string) => {
    setLocalPinned((prev) => {
      const next = prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId];
      setUnsaved(true);
      return next;
    });
  };

  // Save button handler for dashboard
  const handleSaveDashboardPrefs = async () => {
    setPinnedWidgets(localPinned);
    setUnsaved(false);
    await handleSaveWidgets(selectedWidgets, localPinned);
  };

  // Enhanced widget renderer with pin/unpin icon
  const renderWidget = (widgetId: string) => {
    const isPinned = localPinned.includes(widgetId);
    const pinButton = (
      <button
        aria-label={isPinned ? "Unpin widget" : "Pin widget"}
        className={`absolute top-2 right-2 z-10 rounded-full p-1 bg-white border shadow hover:bg-yellow-100 transition-colors ${
          isPinned ? "text-yellow-500" : "text-gray-400"
        }`}
        onClick={() => handleTogglePinWidget(widgetId)}
        type="button"
      >
        {isPinned ? (
          <Pin className="w-4 h-4" fill="#fde68a" />
        ) : (
          <PinOff className="w-4 h-4" />
        )}
      </button>
    );

    // Try to find fetched data for this widget
    const fetchedWidget = dataVisualizationWidgets.find(
      (w) => w.id === widgetId
    );
    let widgetContent = null;
    if (fetchedWidget) {
      // Render with fetched data
      if (fetchedWidget.type === "sop-count") {
        widgetContent = (
          <SOPWidget
            key={fetchedWidget.id}
            type="count"
            data={
              Array.isArray(fetchedWidget.data)
                ? fetchedWidget.data[0]
                : fetchedWidget.data
            }
            visualizationType="bar"
            title={fetchedWidget.title}
          />
        );
      } else if (fetchedWidget.type === "sop-patterns") {
        widgetContent = (
          <SOPWidget
            key={fetchedWidget.id}
            type="patterns"
            data={fetchedWidget.data}
            visualizationType="bar"
            title={fetchedWidget.title}
          />
        );
      } else {
        widgetContent = (
          <DataVisualizationWidget
            key={fetchedWidget.id}
            type={fetchedWidget.type as any}
            data={fetchedWidget.data}
            title={fetchedWidget.title}
          />
        );
      }
    } else {
      // Fallback to static widgets for known IDs
      switch (widgetId) {
        case "info-card-small":
          widgetContent = (
            <InfoCard
              key={widgetId}
              title="Revenue"
              value="$45,231"
              change={12}
              changeType="increase"
              size="small"
            />
          );
          break;
        case "info-card-medium":
          widgetContent = (
            <InfoCard
              key={widgetId}
              title="Total Users"
              value="2,543"
              change={8}
              changeType="increase"
              size="medium"
              subtitle="Active this month"
            />
          );
          break;
        case "info-card-large":
          widgetContent = (
            <InfoCard
              key={widgetId}
              title="Sales Performance"
              value="$123,456"
              change={-2}
              changeType="decrease"
              size="large"
              subtitle="Quarterly results"
            />
          );
          break;
        case "line-chart":
          widgetContent = (
            <ChartWidget
              key={widgetId}
              type="line"
              title="Sales Trend"
              data={sampleLineData}
            />
          );
          break;
        case "bar-chart":
          widgetContent = (
            <ChartWidget
              key={widgetId}
              type="bar"
              title="Product Performance"
              data={sampleBarData}
            />
          );
          break;
        case "pie-chart":
          widgetContent = (
            <ChartWidget
              key={widgetId}
              type="pie"
              title="Traffic Sources"
              data={samplePieData}
            />
          );
          break;
        case "data-table":
          widgetContent = (
            <DataTable
              key={widgetId}
              title="User Management"
              data={sampleTableData}
              columns={tableColumns}
            />
          );
          break;
        case "resource-performance-table":
          widgetContent = <ResourcePerformanceTable key={widgetId} />;
          break;
        case "timing-analysis-table":
          widgetContent = <TimingAnalysisTable key={widgetId} />;
          break;
        default:
          widgetContent = null;
      }
    }
    return widgetContent ? (
      <div key={widgetId} className="relative group">
        {pinButton}
        {widgetContent}
      </div>
    ) : null;
  };

  // Only render visualizations for selected/pinned widgets (by matching prefix)
  const widgetSet = new Set([...selectedWidgets, ...pinnedWidgets]);
  const allWidgets = dataVisualizationWidgets
    .filter((viz) => {
      // Show if the visualization's id starts with any selected/pinned widget id
      return Array.from(widgetSet).some(
        (id) => viz.id === id || viz.id.startsWith(id)
      );
    })
    .map((viz) => renderWidget(viz.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onSelectWidgets={() => setIsModalOpen(true)} />
      
      <main className="pt-24 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-enterprise p-8 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.email?.split('@')[0] || 'User'}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Monitor your business metrics and gain insights from your data
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{allWidgets.length}</div>
                    <div className="text-sm text-gray-500">Active Widgets</div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
            <Card className="enterprise-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$124,563</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">8,549</p>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <Users className="w-4 h-4 mr-1" />
                      +3.2% from last week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">24.8%</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <Activity className="w-4 h-4 mr-1" />
                      +1.8% improvement
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Health</p>
                    <p className="text-2xl font-bold text-gray-900">99.9%</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <Activity className="w-4 h-4 mr-1" />
                      All systems operational
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Dashboard */}
          <div className="mb-8">
            <AnalyticsDashboard />
          </div>

          {/* Widget Management */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Dashboard Widgets</h3>
              <p className="text-gray-600">Customize your dashboard with the widgets that matter most</p>
            </div>
            <Button
              onClick={handleSaveDashboardPrefs}
              disabled={!unsaved}
              className={`flex items-center gap-2 ${
                unsaved
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              } transition-all duration-200`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>

          {/* Widgets Grid */}
          {allWidgets.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <Card className="enterprise-card max-w-md mx-auto">
                <CardContent className="p-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    No widgets configured
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Start building your dashboard by selecting the widgets that provide the insights you need
                  </p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="enterprise-button-primary"
                  >
                    Configure Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-scale-in">
              {allWidgets}
            </div>
          )}
        </div>
      </main>

      {/* Modals and Floating Elements */}
      <WidgetSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWidgets}
        selectedWidgets={selectedWidgets}
        pinnedWidgets={pinnedWidgets}
      />
      
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBot
          onDataReceived={(type, data, title) =>
            handleDataReceived(type, data, title)
          }
          visualizations={chatbotVisualizations}
        />
      </div>
    </div>
  );
};

export default Index;
