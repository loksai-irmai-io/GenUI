
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WidgetSelectionModal from "@/components/WidgetSelectionModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings } from "lucide-react";

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
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);
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
        setPinnedWidgets(data.pinned_widgets || []);
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
    const widgetProps = {
      key: widget.id,
      title: widget.widget_name,
      description: widget.description,
    };

    switch (widget.widget_type) {
      case "chart":
        return <ChartWidget {...widgetProps} type="line" data={[]} />;
      case "table":
        return <DataTable {...widgetProps} data={[]} columns={[]} />;
      case "info_card":
        return <InfoCard {...widgetProps} value="N/A" />;
      case "sop":
        return <SOPWidget {...widgetProps} type="count" data={{ count: 0, percentage: 0, threshold: 0 }} visualizationType="bar" />;
      case "timing_analysis":
        return <TimingAnalysisTable {...widgetProps} />;
      case "resource_performance":
        return <ResourcePerformanceTable {...widgetProps} />;
      case "data_visualization":
        return <DataVisualizationWidget {...widgetProps} type="chart" data={[]} />;
      default:
        return (
          <Card key={widget.id} className="p-6">
            <CardHeader>
              <CardTitle>{widget.widget_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{widget.description}</p>
            </CardContent>
          </Card>
        );
    }
  };

  const selectedWidgetData = availableWidgets.filter(widget => 
    selectedWidgets.includes(widget.id)
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
