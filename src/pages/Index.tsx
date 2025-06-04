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
import { Pin, PinOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProcessFlowGraph from "../components/ProcessFlowGraph";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  normalizeVisualizationData,
  isValidVisualizationData,
} from "@/lib/vizDataUtils";

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
  "resource-performance",
  "long-running-cases-count",
  "process-failure-patterns-distribution",
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
  const { user } = useAuth();
  const { toast } = useToast();
  // Track local pin state for immediate UI feedback
  const [localPinned, setLocalPinned] = useState<string[]>([]);
  // Track if there are unsaved changes
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserWidgetPreferences(true); // force default on first load
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
                const response = await fetch("http://34.60.217.109/allcounts");
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
            case "object-lifecycle": {
              dashboardVisualizations.push({
                id: "object-lifecycle",
                type: "object-lifecycle",
                data: [],
                title: "Object Lifecycle",
              });
              break;
            }
            // Outlier Analysis widgets
            case "all-counts": {
              try {
                const res = await fetch("http://34.60.217.109/allcounts");
                const data = await res.json();
                const arr = Object.entries(data).map(([name, value]) => ({
                  name,
                  value,
                }));
                dashboardVisualizations.push({
                  id: "all-counts",
                  type: "process-failure-patterns-bar",
                  data: arr,
                  title: "All Failure Pattern Counts",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "all-counts",
                  type: "process-failure-patterns-bar",
                  data: [],
                  title: "All Failure Pattern Counts (Error)",
                });
              }
              break;
            }
            case "sop-patterns": {
              try {
                const res = await fetch("/sopdeviation.json");
                let data = await res.json();
                if (data && data.data && Array.isArray(data.data))
                  data = data.data;
                if (
                  !Array.isArray(data) &&
                  typeof data === "object" &&
                  data !== null
                )
                  data = Object.values(data);
                data = Array.isArray(data)
                  ? data.map((row, idx) => ({
                      pattern_no: idx + 1,
                      pattern: Array.isArray(row.sop_deviation_sequence_preview)
                        ? row.sop_deviation_sequence_preview
                            .slice(0, 5)
                            .join(" → ") +
                          (row.sop_deviation_sequence_preview.length > 5
                            ? " ..."
                            : "")
                        : "",
                      count: row.pattern_count,
                      percentage: row.percentage,
                    }))
                  : [];
                dashboardVisualizations.push({
                  id: "sop-patterns",
                  type: "sop-patterns-table",
                  data,
                  title: "SOP Deviation Patterns",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "sop-patterns",
                  type: "sop-patterns-table",
                  data: [],
                  title: "SOP Deviation Patterns (Error)",
                });
              }
              break;
            }
            case "sop-low-percentage-count-bar": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/sopdeviation/low-percentage/count"
                );
                let data = await res.json();
                let arr = [];
                if (data && typeof data.count === "number") {
                  arr = [{ name: "Low Percentage Count", value: data.count }];
                }
                dashboardVisualizations.push({
                  id: "sop-low-percentage-count-bar",
                  type: "incomplete-bar",
                  data: arr,
                  title: "SOP Deviation Low Percentage Count",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "sop-low-percentage-count-bar",
                  type: "incomplete-bar",
                  data: [],
                  title: "SOP Deviation Low Percentage Count (Error)",
                });
              }
              break;
            }
            case "sop-low-percentage-patterns-table": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/sopdeviation/patterns"
                );
                let data = await res.json();
                if (data && data.data && Array.isArray(data.data))
                  data = data.data;
                if (
                  !Array.isArray(data) &&
                  typeof data === "object" &&
                  data !== null
                )
                  data = Object.values(data);
                data = Array.isArray(data)
                  ? data.map((row) => ({
                      pattern_no: row.pattern_no,
                      pattern: row.pattern,
                      count: row.count,
                      percentage: row.percentage,
                    }))
                  : [];
                dashboardVisualizations.push({
                  id: "sop-low-percentage-patterns-table",
                  type: "sop-patterns-table",
                  data,
                  title: "SOP Deviation Low Percentage Patterns",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "sop-low-percentage-patterns-table",
                  type: "sop-patterns-table",
                  data: [],
                  title: "SOP Deviation Low Percentage Patterns (Error)",
                });
              }
              break;
            }
            case "incomplete-cases-count": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/incompletecases/count"
                );
                const data = await res.json();
                dashboardVisualizations.push({
                  id: "incomplete-cases-count",
                  type: "incomplete-bar",
                  data: [{ name: "Incomplete Cases", value: data.count }],
                  title: "Incomplete Cases Count",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "incomplete-cases-count",
                  type: "incomplete-bar",
                  data: [],
                  title: "Incomplete Cases Count (Error)",
                });
              }
              break;
            }
            case "incomplete-case-table": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/incompletecase_table"
                );
                let data = await res.json();
                if (data && data.data && Array.isArray(data.data))
                  data = data.data;
                if (
                  !Array.isArray(data) &&
                  typeof data === "object" &&
                  data !== null
                )
                  data = Object.values(data);
                dashboardVisualizations.push({
                  id: "incomplete-case-table",
                  type: "incomplete-case-table",
                  data,
                  title: "Incomplete Case Table",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "incomplete-case-table",
                  type: "incomplete-case-table",
                  data: [],
                  title: "Incomplete Case Table (Error)",
                });
              }
              break;
            }
            case "long-running-cases-count": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/longrunningcases/count"
                );
                const data = await res.json();
                dashboardVisualizations.push({
                  id: "long-running-cases-count",
                  type: "longrunning-bar",
                  data: [{ name: "Long Running Cases", value: data.count }],
                  title: "Long Running Cases Count",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "long-running-cases-count",
                  type: "longrunning-bar",
                  data: [],
                  title: "Long Running Cases Count (Error)",
                });
              }
              break;
            }
            case "long-running-table": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/longrunning_table?page=1&size=100"
                );
                let data = await res.json();
                if (data && data.data && Array.isArray(data.data))
                  data = data.data;
                if (
                  !Array.isArray(data) &&
                  typeof data === "object" &&
                  data !== null
                )
                  data = Object.values(data);
                dashboardVisualizations.push({
                  id: "long-running-table",
                  type: "long-running-table",
                  data,
                  title: "Long Running Table",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "long-running-table",
                  type: "long-running-table",
                  data: [],
                  title: "Long Running Table (Error)",
                });
              }
              break;
            }
            case "resource-switches-count": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/resourceswitches/count"
                );
                const data = await res.json();
                dashboardVisualizations.push({
                  id: "resource-switches-count",
                  type: "resource-switches-bar",
                  data: [{ name: "Resource Switches", value: data.count }],
                  title: "Resource Switches Count",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "resource-switches-count",
                  type: "resource-switches-bar",
                  data: [],
                  title: "Resource Switches Count (Error)",
                });
              }
              break;
            }
            case "resource-switches-count-table": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/resourceswitches_count_table"
                );
                let data = await res.json();
                if (data && data.data && Array.isArray(data.data))
                  data = data.data;
                if (
                  !Array.isArray(data) &&
                  typeof data === "object" &&
                  data !== null
                )
                  data = Object.values(data);
                dashboardVisualizations.push({
                  id: "resource-switches-count-table",
                  type: "resource-switches-count-table",
                  data,
                  title: "Resource Switches Count Table",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "resource-switches-count-table",
                  type: "resource-switches-count-table",
                  data: [],
                  title: "Resource Switches Count Table (Error)",
                });
              }
              break;
            }
            case "resource-switches-table": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/resourceswitchestable_table?page=1&size=100"
                );
                let data = await res.json();
                if (data && data.data && Array.isArray(data.data))
                  data = data.data;
                if (
                  !Array.isArray(data) &&
                  typeof data === "object" &&
                  data !== null
                )
                  data = Object.values(data);
                dashboardVisualizations.push({
                  id: "resource-switches-table",
                  type: "resource-switches-table",
                  data,
                  title: "Resource Switches Table",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "resource-switches-table",
                  type: "resource-switches-table",
                  data: [],
                  title: "Resource Switches Table (Error)",
                });
              }
              break;
            }
            // CCM widgets
            case "controls-identified-count": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/controls_identified_count"
                );
                let data = await res.json();
                let arr = Array.isArray(data)
                  ? data
                  : Object.entries(data).map(([name, value]) => ({
                      name,
                      value,
                    }));
                dashboardVisualizations.push({
                  id: "controls-identified-count",
                  type: "incomplete-bar",
                  data: arr,
                  title: "Controls Identified Count",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "controls-identified-count",
                  type: "incomplete-bar",
                  data: [],
                  title: "Controls Identified Count (Error)",
                });
              }
              break;
            }
            case "controls-description": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/control_description?page=1&size=100"
                );
                let data = await res.json();
                data = Array.isArray(data) ? data : data.data || [];
                dashboardVisualizations.push({
                  id: "controls-description",
                  type: "controls-description-table",
                  data,
                  title: "Controls Description",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "controls-description",
                  type: "controls-description-table",
                  data: [],
                  title: "Controls Description (Error)",
                });
              }
              break;
            }
            case "controls-definition": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/control_defination?page=1&size=100"
                );
                let data = await res.json();
                data = Array.isArray(data) ? data : data.data || [];
                dashboardVisualizations.push({
                  id: "controls-definition",
                  type: "controls-definition-table",
                  data,
                  title: "Controls Definition",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "controls-definition",
                  type: "controls-definition-table",
                  data: [],
                  title: "Controls Definition (Error)",
                });
              }
              break;
            }
            case "sla-analysis": {
              try {
                const res = await fetch(
                  "http://34.60.217.109/slagraph/avg-activity-duration-bar"
                );
                let data = await res.json();
                // Transform plotly-style data to recharts array if needed
                if (data && Array.isArray(data.data)) {
                  const bar = data.data[0];
                  if (bar && Array.isArray(bar.x) && Array.isArray(bar.y)) {
                    data = bar.x.map((x: string, i: number) => ({
                      name: x,
                      value: bar.y[i],
                    }));
                  }
                } else if (Array.isArray(data)) {
                  // Already in correct format
                } else {
                  data = [];
                }
                dashboardVisualizations.push({
                  id: "sla-analysis",
                  type: "sla-analysis-bar",
                  data,
                  title: "SLA Analysis (Average Activity Duration)",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "sla-analysis",
                  type: "sla-analysis-bar",
                  data: [],
                  title: "SLA Analysis (Error)",
                });
              }
              break;
            }
            case "kpi": {
              try {
                const res = await fetch("http://34.60.217.109/kpi");
                let data = await res.json();
                data = Array.isArray(data) ? data : data.data || [];
                dashboardVisualizations.push({
                  id: "kpi",
                  type: "kpi-table",
                  data,
                  title: "KPI",
                });
              } catch (err) {
                dashboardVisualizations.push({
                  id: "kpi",
                  type: "kpi-table",
                  data: [],
                  title: "KPI (Error)",
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
  const loadUserWidgetPreferences = async (forceDefault = false) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_widget_preferences")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      if (data && data.length > 0 && !forceDefault) {
        const widgetIds = data
          .map((pref) => pref.selected_module)
          .filter(Boolean);
        const pinnedIds = data
          .filter((pref) => pref.pinned)
          .map((pref) => pref.selected_module);
        setSelectedWidgets(widgetIds.length > 0 ? widgetIds : DEFAULT_WIDGETS);
        setPinnedWidgets(pinnedIds.length > 0 ? pinnedIds : DEFAULT_WIDGETS);
      } else {
        // No preferences or force default: set defaults
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
      // Remove all previous widget preferences for this user
      const { error: deleteError } = await supabase
        .from("user_widget_preferences")
        .delete()
        .eq("user_id", user.id);
      if (deleteError) {
        console.error("Error deleting previous preferences:", deleteError);
        throw deleteError;
      }
      // Upsert all selected widgets, marking pinned as true if in pinned array
      const preferences = widgets.map((widgetId) => ({
        user_id: user.id,
        widget_id: widgetId,
        selected_module: widgetId || "", // Ensure not null/undefined
        pinned: pinned.includes(widgetId),
      }));
      console.log("Saving widget preferences:", preferences); // DEBUG LOG
      let error = null;
      try {
        const { error: upsertError } = await supabase
          .from("user_widget_preferences")
          .upsert(preferences, { onConflict: "user_id,selected_module" });
        if (upsertError) {
          console.error("Error upserting preferences:", upsertError);
        }
        error = upsertError;
      } catch (e) {
        error = e;
        console.error("Exception during upsert:", e);
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
        description: `There was a problem saving your widget preferences.\n${
          error?.message || error
        }`,
        variant: "destructive",
      });
    }
  }; // Handle visualization data received from any source
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

  // Widget renderer
  const renderWidget = (widgetId: string, opts?: { forOverlay?: boolean }) => {
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
      // Outlier Analysis and CCM widget rendering
      // --- PATCH: Always render table-based widgets with DataTable ---
      const tableWidgetTypes = [
        "sop-patterns-table",
        "sop-low-percentage-patterns-table",
        "incomplete-case-table",
        "long-running-table",
        "resource-switches-count-table",
        "resource-switches-table",
        "controls-description-table",
        "controls-definition-table",
        "sla-analysis-table",
        "kpi-table",
      ];
      if (fetchedWidget.type === "object-lifecycle") {
        widgetContent = <ProcessFlowGraph key="object-lifecycle-graph" />;
      } else if (fetchedWidget.type === "sop-count") {
        widgetContent = (
          <ErrorBoundary>
            <SOPWidget
              key={fetchedWidget.id + (opts?.forOverlay ? "-max" : "")}
              type="count"
              data={
                Array.isArray(fetchedWidget.data)
                  ? fetchedWidget.data[0]
                  : fetchedWidget.data
              }
              visualizationType="bar"
              title={fetchedWidget.title}
            />
          </ErrorBoundary>
        );
      } else if (fetchedWidget.type === "sop-patterns") {
        widgetContent = (
          <ErrorBoundary>
            <SOPWidget
              key={fetchedWidget.id + (opts?.forOverlay ? "-max" : "")}
              type="patterns"
              data={fetchedWidget.data}
              visualizationType="bar"
              title={fetchedWidget.title}
            />
          </ErrorBoundary>
        );
      } else if (tableWidgetTypes.includes(fetchedWidget.type)) {
        // Use custom columns for known types, else auto-generate
        let columns;
        if (
          ["sop-patterns-table", "sop-low-percentage-patterns-table"].includes(
            fetchedWidget.type
          )
        ) {
          columns = [
            { key: "pattern_no", label: "Pattern No" },
            { key: "pattern", label: "Pattern" },
            { key: "count", label: "Count" },
            { key: "percentage", label: "Percentage (%)" },
          ];
        } else {
          columns = Object.keys(fetchedWidget.data[0] || {}).map((key) => ({
            key,
            label: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
          }));
        }
        widgetContent = (
          <DataTable
            key={fetchedWidget.id + (opts?.forOverlay ? "-max" : "")}
            title={fetchedWidget.title}
            data={fetchedWidget.data}
            columns={columns}
          />
        );
      } else {
        // Fallback to DataVisualizationWidget for all other types
        const normalized = normalizeVisualizationData(
          fetchedWidget.data,
          fetchedWidget.type
        );
        const valid = fetchedWidget.type.endsWith("bar")
          ? isValidVisualizationData(normalized, ["name", "value"])
          : Array.isArray(normalized);
        widgetContent = (
          <ErrorBoundary>
            <DataVisualizationWidget
              key={fetchedWidget.id + (opts?.forOverlay ? "-max" : "")}
              type={fetchedWidget.type as any}
              data={
                valid && normalized.length > 0
                  ? normalized
                  : [{ name: "No Data", value: 0 }]
              }
              title={fetchedWidget.title}
              {...(opts?.forOverlay ? { maximized: true } : {})}
            />
          </ErrorBoundary>
        );
      }
    } else {
      // Fallback to static widgets for known IDs
      switch (widgetId) {
        case "info-card-small":
          widgetContent = (
            <InfoCard
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
              title="Revenue"
              value="$45,231"
              change={12}
              changeType="increase"
              size={opts?.forOverlay ? "large" : "small"}
            />
          );
          break;
        case "info-card-medium":
          widgetContent = (
            <InfoCard
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
              title="Total Users"
              value="2,543"
              change={8}
              changeType="increase"
              size={opts?.forOverlay ? "large" : "medium"}
              subtitle="Active this month"
            />
          );
          break;
        case "info-card-large":
          widgetContent = (
            <InfoCard
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
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
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
              type="line"
              title="Sales Trend"
              data={sampleLineData}
              maximized={!!opts?.forOverlay}
            />
          );
          break;
        case "bar-chart":
          widgetContent = (
            <ChartWidget
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
              type="bar"
              title="Product Performance"
              data={sampleBarData}
              maximized={!!opts?.forOverlay}
            />
          );
          break;
        case "pie-chart":
          widgetContent = (
            <ChartWidget
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
              type="pie"
              title="Traffic Sources"
              data={samplePieData}
              maximized={!!opts?.forOverlay}
            />
          );
          break;
        case "data-table":
          widgetContent = (
            <DataTable
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
              title="User Management"
              data={sampleTableData}
              columns={tableColumns}
            />
          );
          break;
        case "resource-performance-table":
          widgetContent = (
            <ResourcePerformanceTable
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
            />
          );
          break;
        case "timing-analysis-table":
          widgetContent = (
            <TimingAnalysisTable
              key={widgetId + (opts?.forOverlay ? "-max" : "")}
            />
          );
          break;
        case "object-lifecycle":
          widgetContent = (
            <ProcessFlowGraph
              key="object-lifecycle-graph"
              maximized={!!opts?.forOverlay}
            />
          );
          break;
        default:
          widgetContent = null;
      }
    }
    if (opts?.forOverlay) {
      return widgetContent;
    }
    return (
      <div
        key={widgetId}
        className="relative process-widget"
        tabIndex={0}
        aria-label="Widget preview"
      >
        {pinButton}
        {widgetContent}
      </div>
    );
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
    <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex-1 flex flex-col">
        <Header onSelectWidgets={() => setIsModalOpen(true)} />
        <main className="flex-1 pt-16 px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8" aria-label="Dashboard Overview Section">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Overview
              </h2>
              <p className="text-gray-600">
                Welcome back, {user?.email}! Customize your data visualization
                experience
              </p>
            </div>

            <div className="mb-8"></div>

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Process Widgets
                </h3>
                <p className="text-gray-600">
                  Monitor key process metrics and deviations
                </p>
              </div>
              <Button
                aria-label="Save dashboard widget preferences"
                onClick={handleSaveDashboardPrefs}
                disabled={!unsaved}
                className={`flex items-center gap-2 ${
                  unsaved
                    ? "lovable-button-primary shadow-lovable-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                } transition-all duration-200`}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>

            {allWidgets.length === 0 ? (
              <div
                className="text-center py-20 animate-fade-in"
                role="status"
                aria-live="polite"
              >
                <Card
                  className="max-w-md mx-auto bg-white border-blue-100 shadow-lg focus-within:ring-2 focus-within:ring-blue-400"
                  tabIndex={0}
                  aria-label="No widgets configured"
                >
                  <CardContent className="p-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BarChart3 className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      No process widgets configured
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Start monitoring your processes by configuring the
                      available widgets
                    </p>
                    <Button
                      aria-label="Configure Widgets"
                      onClick={() => setIsModalOpen(true)}
                      className="lovable-button-primary"
                    >
                      Configure Widgets
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in"
                aria-label="Widget Grid"
              >
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
            onDataReceived={() => {}}
            visualizations={[]}
            clearVisualizations={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
