import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import widget components
import ChartWidget from "@/components/widgets/ChartWidget";
import DataTable from "@/components/widgets/DataTable";
import InfoCard from "@/components/widgets/InfoCard";
import SOPWidget from "@/components/widgets/SOPWidget";
import ResourcePerformanceTable from "@/components/widgets/ResourcePerformanceTable";
import DataVisualizationWidget from "@/components/widgets/DataVisualizationWidget";

const DEFAULT_WIDGETS = ["resource-performance", "all-failure-patterns-count", "controls-identified-count"];

const Dashboard: React.FC = () => {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [tempPinnedWidgets, setTempPinnedWidgets] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSelectedWidgets(DEFAULT_WIDGETS);
        setPinnedWidgets(DEFAULT_WIDGETS);
        setTempPinnedWidgets(DEFAULT_WIDGETS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("selected_widgets, pinned_widgets")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user preferences:", error);
        setSelectedWidgets(DEFAULT_WIDGETS);
        setPinnedWidgets(DEFAULT_WIDGETS);
        setTempPinnedWidgets(DEFAULT_WIDGETS);
        setLoading(false);
        return;
      }

      if (data && data.selected_widgets && data.selected_widgets.length > 0) {
        setSelectedWidgets(data.selected_widgets || []);
        setPinnedWidgets(data.pinned_widgets || []);
        setTempPinnedWidgets(data.pinned_widgets || []);
      } else {
        setSelectedWidgets(DEFAULT_WIDGETS);
        setPinnedWidgets(DEFAULT_WIDGETS);
        setTempPinnedWidgets(DEFAULT_WIDGETS);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      setSelectedWidgets(DEFAULT_WIDGETS);
      setPinnedWidgets(DEFAULT_WIDGETS);
      setTempPinnedWidgets(DEFAULT_WIDGETS);
    } finally {
      setLoading(false);
    }
  };

  const handlePinToggle = (widgetId: string) => {
    setTempPinnedWidgets(prev => {
      const newPinned = prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId];
      
      setHasChanges(JSON.stringify(newPinned.sort()) !== JSON.stringify(pinnedWidgets.sort()));
      return newPinned;
    });
  };

  const handleSaveChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          selected_widgets: tempPinnedWidgets,
          pinned_widgets: tempPinnedWidgets,
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      setSelectedWidgets(tempPinnedWidgets);
      setPinnedWidgets(tempPinnedWidgets);
      setHasChanges(false);

      toast({
        title: "Changes Saved",
        description: "Your widget preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving widget preferences:", error);
      toast({
        title: "Error Saving Changes",
        description: "Failed to save your widget preferences.",
        variant: "destructive",
      });
    }
  };

  const getDefaultColumns = () => [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "value", label: "Value" }
  ];

  const renderWidget = (widgetId: string) => {
    const widgetProps = {
      key: widgetId,
      title: getWidgetTitle(widgetId),
      description: getWidgetDescription(widgetId),
    };

    const renderWidgetWithPin = (component: React.ReactNode) => (
      <div key={widgetId} className="relative">
        {component}
        <button
          onClick={() => handlePinToggle(widgetId)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors z-10"
          aria-label={tempPinnedWidgets.includes(widgetId) ? "Unpin widget" : "Pin widget"}
        >
          {tempPinnedWidgets.includes(widgetId) ? (
            <PinOff className="w-4 h-4 text-gray-600" />
          ) : (
            <Pin className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    );

    // Handle specific widget IDs that need special rendering
    switch (widgetId) {
      case "resource-performance":
        return renderWidgetWithPin(<ResourcePerformanceTable />);
      
      // Chart widgets that use DataVisualizationWidget with proper types
      case "all-failure-patterns-count":
        return renderWidgetWithPin(
          <DataVisualizationWidget {...widgetProps} type="process-failure-patterns-bar" data={[]} />
        );
      case "sop-deviation-count":
      case "incomplete-cases-count":
      case "long-running-cases-count":
      case "resource-switches-count":
      case "rework-activities-count":
      case "timing-violations-count":
      case "controls-identified-count":
        return renderWidgetWithPin(
          <DataVisualizationWidget {...widgetProps} type="bar" data={[]} />
        );
      case "sla-analysis":
        return renderWidgetWithPin(
          <DataVisualizationWidget {...widgetProps} type="sla-analysis-bar" data={[]} />
        );
      case "kpi":
        return renderWidgetWithPin(
          <DataVisualizationWidget {...widgetProps} type="bar" data={[]} />
        );
      case "object-lifecycle":
        return renderWidgetWithPin(
          <DataVisualizationWidget {...widgetProps} type="object-lifecycle" data={[]} />
        );
      case "activity-pair-threshold":
        return renderWidgetWithPin(
          <DataVisualizationWidget {...widgetProps} type="activity-pair-threshold" data={[]} />
        );
      
      // Table widgets with default columns
      case "incomplete-cases-table":
      case "long-running-table":
      case "resource-switches-count-table":
      case "resource-switches-table":
      case "reworked-activities-table":
      case "timing-violations-table":
      case "sop-deviation-patterns":
      case "case-complexity-analysis":
      case "controls-description":
      case "control-definition":
        return renderWidgetWithPin(
          <DataTable 
            data={[]} 
            title={getWidgetTitle(widgetId)} 
            columns={getDefaultColumns()}
          />
        );
      
      default:
        // Default fallback rendering for unknown widgets
        return renderWidgetWithPin(
          <DataVisualizationWidget {...widgetProps} type="bar" data={[]} />
        );
    }
  };

  const getWidgetTitle = (widgetId: string): string => {
    const titles: Record<string, string> = {
      "resource-performance": "Resource Performance", 
      "all-failure-patterns-count": "All Failure Patterns Count",
      "object-lifecycle": "Object Lifecycle",
      "timing-violations-count": "Timing Violations Count",
      "long-running-cases-count": "Long Running Cases Count",
      "sop-deviation-count": "SOP Deviation Count",
      "incomplete-cases-count": "Incomplete Cases Count",
      "case-complexity-analysis": "Case Complexity Analysis",
      "resource-switches-count": "Resource Switches Count",
      "rework-activities-count": "Rework Activities Count",
      "incomplete-cases-table": "Incomplete Cases Table",
      "long-running-table": "Long-Running Table",
      "resource-switches-count-table": "Resource Switches Count Table",
      "resource-switches-table": "Resource Switches Table",
      "reworked-activities-table": "Reworked Activities Table",
      "timing-violations-table": "Timing Violations Table",
      "sop-deviation-patterns": "SOP Deviation Patterns",
      "activity-pair-threshold": "Activity Pair Threshold",
      "controls-identified-count": "Controls Identified Count",
      "controls-description": "Controls Description",
      "control-definition": "Control Definition",
      "sla-analysis": "SLA Analysis",
      "kpi": "KPI"
    };
    return titles[widgetId] || "Widget";
  };

  const getWidgetDescription = (widgetId: string): string => {
    const descriptions: Record<string, string> = {
      "resource-performance": "Monitor resource efficiency and utilization",
      "all-failure-patterns-count": "Count of all failure pattern occurrences",
      "object-lifecycle": "Track object lifecycle and transitions",
      "timing-violations-count": "Count of timing violations",
      "long-running-cases-count": "Count of long-running cases",
      "sop-deviation-count": "Count of SOP deviation instances",
      "incomplete-cases-count": "Count of incomplete cases",
      "case-complexity-analysis": "Comprehensive case complexity analysis",
      "resource-switches-count": "Count of resource switch events",
      "rework-activities-count": "Count of rework activities",
      "incomplete-cases-table": "Detailed table of incomplete cases",
      "long-running-table": "Detailed table of long-running cases",
      "resource-switches-count-table": "Resource switches count breakdown",
      "resource-switches-table": "Detailed resource switches data",
      "reworked-activities-table": "Detailed reworked activities data",
      "timing-violations-table": "Detailed timing violations data",
      "sop-deviation-patterns": "SOP deviation pattern analysis",
      "activity-pair-threshold": "Activity pair threshold analysis",
      "controls-identified-count": "Count of identified controls",
      "controls-description": "Description of control mechanisms",
      "control-definition": "Control definitions and specifications",
      "sla-analysis": "Service Level Agreement analysis",
      "kpi": "Key Performance Indicators"
    };
    return descriptions[widgetId] || "Widget description";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Monitor your key metrics and insights</p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Pin className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>Selected Widgets: {selectedWidgets.join(', ')}</p>
          <p>Pinned Widgets: {pinnedWidgets.join(', ')}</p>
          <p>Temp Pinned Widgets: {tempPinnedWidgets.join(', ')}</p>
          <p>Has Changes: {hasChanges.toString()}</p>
        </div>
      )}

      {/* Widgets Section */}
      {selectedWidgets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {selectedWidgets.map(renderWidget)}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Widgets Selected</h3>
            <p className="text-gray-600 mb-6">
              Get started by selecting widgets to display on your dashboard. Choose from various charts, tables, and analytics tools.
            </p>
            <p className="text-sm text-gray-500">
              Use the "Configure Widgets" button in the header to select your widgets.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
