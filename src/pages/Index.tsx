
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import widget components
import ChartWidget from "@/components/widgets/ChartWidget";
import DataTable from "@/components/widgets/DataTable";
import InfoCard from "@/components/widgets/InfoCard";
import SOPWidget from "@/components/widgets/SOPWidget";
import TimingAnalysisTable from "@/components/widgets/TimingAnalysisTable";
import ResourcePerformanceTable from "@/components/widgets/ResourcePerformanceTable";
import DataVisualizationWidget from "@/components/widgets/DataVisualizationWidget";

const Dashboard: React.FC = () => {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserPreferences();
    fetchAvailableWidgets();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("selected_widgets, pinned_widgets")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user preferences:", error);
        return;
      }

      if (data) {
        setSelectedWidgets(data.selected_widgets || []);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableWidgets = async () => {
    try {
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .order("widget_category", { ascending: true })
        .order("widget_name", { ascending: true });

      if (error) throw error;
      setAvailableWidgets(data || []);
    } catch (error) {
      console.error("Error fetching widgets:", error);
    }
  };

  const renderWidget = (widget: any) => {
    const widgetId = String(widget.id);
    const widgetProps = {
      key: widgetId,
      title: widget.widget_name,
      description: widget.description,
    };

    // Handle specific widget IDs that need special rendering
    switch (widgetId) {
      case "timing-analysis":
        return <TimingAnalysisTable key={widgetId} />;
      case "resource-performance":
        return <ResourcePerformanceTable key={widgetId} />;
      case "all-counts":
      case "incomplete-cases-count":
      case "long-running-cases-count":
      case "resource-switches-count":
      case "controls-identified-count":
        return <DataVisualizationWidget {...widgetProps} type="bar" data={[]} />;
      case "process-failure-patterns-distribution":
        return <DataVisualizationWidget {...widgetProps} type="process-failure-patterns-bar" data={[]} />;
      case "object-lifecycle":
      case "object-lifecycle-process":
        return <DataVisualizationWidget {...widgetProps} type="object-lifecycle" data={[]} />;
      case "sla-analysis":
      case "controls-definition":
      case "controls-description":
      case "kpi":
      case "incomplete-case-table":
      case "long-running-table":
      case "resource-switches-table":
      case "resource-switches-count-table":
      case "sop-low-percentage-patterns-table":
        return <DataVisualizationWidget {...widgetProps} type="table" data={[]} />;
      case "sop-deviation":
        return <SOPWidget {...widgetProps} type="count" data={{ count: 0, percentage: 0, threshold: 0 }} visualizationType="bar" />;
      case "sop-patterns":
      case "sop-low-percentage-patterns-table":
        return <SOPWidget {...widgetProps} type="patterns" data={[]} visualizationType="table" />;
      default:
        // Use widget_type if available, otherwise fall back to default rendering
        if (widget.widget_type) {
          switch (widget.widget_type) {
            case "chart":
              return <ChartWidget {...widgetProps} type="line" data={[]} />;
            case "table":
              return <DataTable {...widgetProps} data={[]} columns={[]} />;
            case "info_card":
              return <InfoCard {...widgetProps} value="N/A" />;
            default:
              return <DataVisualizationWidget {...widgetProps} type="chart" data={[]} />;
          }
        } else {
          // Default fallback rendering for unknown widgets
          return <DataVisualizationWidget {...widgetProps} type="chart" data={[]} />;
        }
    }
  };

  const selectedWidgetData = availableWidgets.filter(widget => 
    selectedWidgets.includes(String(widget.id))
  );

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
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>Selected Widgets: {selectedWidgets.join(', ')}</p>
          <p>Available Widgets: {availableWidgets.length}</p>
          <p>Filtered Widgets: {selectedWidgetData.length}</p>
        </div>
      )}

      {/* Widgets Section */}
      {selectedWidgetData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {selectedWidgetData.map(renderWidget)}
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
