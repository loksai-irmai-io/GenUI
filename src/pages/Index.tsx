
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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";

// Default widgets for all users - only relevant enterprise widgets
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
  const [localPinned, setLocalPinned] = useState<string[]>([]);
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
                data: [data],
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
            default:
              break;
          }
        }
        setDataVisualizationWidgets(dashboardVisualizations);
      })();
    }
  }, [user, selectedWidgets, pinnedWidgets]);

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
        setSelectedWidgets(DEFAULT_WIDGETS);
        setPinnedWidgets(DEFAULT_WIDGETS);
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
      await supabase.rpc("remove_duplicate_user_widget_preferences", {
        user_id_param: user.id,
      });
      await supabase
        .from("user_widget_preferences")
        .delete()
        .eq("user_id", user.id)
        .not(
          "selected_module",
          "in",
          `(${pinned.map((w) => `'${w}'`).join(",")})`
        );
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

  const handleTogglePinWidget = (widgetId: string) => {
    setLocalPinned((prev) => {
      const next = prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId];
      setUnsaved(true);
      return next;
    });
  };

  const handleSaveDashboardPrefs = async () => {
    setPinnedWidgets(localPinned);
    setUnsaved(false);
    await handleSaveWidgets(selectedWidgets, localPinned);
  };

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

    const fetchedWidget = dataVisualizationWidgets.find(
      (w) => w.id === widgetId
    );
    let widgetContent = null;
    if (fetchedWidget) {
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
    }
    return widgetContent ? (
      <div key={widgetId} className="relative group">
        {pinButton}
        {widgetContent}
      </div>
    ) : null;
  };

  const widgetSet = new Set([...selectedWidgets, ...pinnedWidgets]);
  const allWidgets = dataVisualizationWidgets
    .filter((viz) => {
      return Array.from(widgetSet).some(
        (id) => viz.id === id || viz.id.startsWith(id)
      );
    })
    .map((viz) => renderWidget(viz.id));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header onSelectWidgets={() => setIsModalOpen(true)} />
          
          <main className="flex-1 pt-16 px-8 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Process Analytics Dashboard
                      </h2>
                      <p className="text-gray-600 text-lg">
                        Monitor process performance and identify optimization opportunities
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

              <div className="mb-8">
                <AnalyticsDashboard />
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Process Widgets</h3>
                  <p className="text-gray-600">Monitor key process metrics and deviations</p>
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

              {allWidgets.length === 0 ? (
                <div className="text-center py-20 animate-fade-in">
                  <Card className="max-w-md mx-auto bg-white border-blue-100 shadow-lg">
                    <CardContent className="p-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        No process widgets configured
                      </h3>
                      <p className="text-gray-600 mb-8">
                        Start monitoring your processes by configuring the available widgets
                      </p>
                      <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Configure Widgets
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
                  {allWidgets}
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
          
          <div className="fixed bottom-6 right-6 z-50">
            <ChatBot
              onDataReceived={handleDataReceived}
              visualizations={chatbotVisualizations}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
