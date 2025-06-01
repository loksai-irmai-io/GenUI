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
  // Track local pin state for immediate UI feedback
  const [localPinned, setLocalPinned] = useState<string[]>([]);
  // Track if there are unsaved changes
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserWidgetPreferences();
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
          <InfoCard
            key={widgetId}
            title="Revenue"
            value="$45,231"
            change={12}
            changeType="increase"
            size="small"
          />
        );
      case "info-card-medium":
        return (
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
      case "info-card-large":
        return (
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
      case "line-chart":
        return (
          <ChartWidget
            key={widgetId}
            type="line"
            title="Sales Trend"
            data={sampleLineData}
          />
        );
      case "bar-chart":
        return (
          <ChartWidget
            key={widgetId}
            type="bar"
            title="Product Performance"
            data={sampleBarData}
          />
        );
      case "pie-chart":
        return (
          <ChartWidget
            key={widgetId}
            type="pie"
            title="Traffic Sources"
            data={samplePieData}
          />
        );
      case "data-table":
        return (
          <DataTable
            key={widgetId}
            title="User Management"
            data={sampleTableData}
            columns={tableColumns}
          />
        );
      default:
        return null;
    }
  };

  const renderDataVisualizationWidgets = () => {
    return dataVisualizationWidgets.map((widget) => (
      <DataVisualizationWidget
        key={widget.id}
        type={widget.type as "sop-table" | "incomplete-bar" | "longrunning-bar"}
        data={widget.data}
        title={widget.title}
      />
    ));
  };

  const allWidgets = [
    ...selectedWidgets.map((widgetId) => renderWidget(widgetId)),
    ...renderDataVisualizationWidgets(),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSelectWidgets={() => setIsModalOpen(true)} />
      <main className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Overview
            </h2>
            <p className="text-gray-600">
              Welcome back, {user?.email}! Customize your data visualization
              experience
            </p>
          </div>

          {allWidgets.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  No widgets selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose widgets to personalize your dashboard or ask the
                  chatbot for data analysis
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Select Widgets
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      />

      <ChatBot onDataReceived={handleDataReceived} />
    </div>
  );
};

export default Index;
