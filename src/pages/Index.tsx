
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WidgetSelectionModal from "@/components/WidgetSelectionModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, TrendingUp, Users, Activity, BarChart3 } from "lucide-react";

// Import widget components
import ChartWidget from "@/components/widgets/ChartWidget";
import DataTable from "@/components/widgets/DataTable";
import InfoCard from "@/components/widgets/InfoCard";
import SOPWidget from "@/components/widgets/SOPWidget";
import TimingAnalysisTable from "@/components/widgets/TimingAnalysisTable";
import ResourcePerformanceTable from "@/components/widgets/ResourcePerformanceTable";
import DataVisualizationWidget from "@/components/widgets/DataVisualizationWidget";

interface DashboardProps {
  isWidgetModalOpen: boolean;
  setIsWidgetModalOpen: (open: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isWidgetModalOpen, setIsWidgetModalOpen }) => {
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

  const handleSaveWidgets = async (newSelectedWidgets: string[], newPinnedWidgets: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          selected_widgets: newSelectedWidgets,
          pinned_widgets: newPinnedWidgets,
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      setSelectedWidgets(newSelectedWidgets);
      setPinnedWidgets(newPinnedWidgets);

      toast({
        title: "Preferences Saved",
        description: "Your widget preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving widget preferences:", error);
      toast({
        title: "Error Saving Preferences",
        description: "Failed to save your widget preferences.",
        variant: "destructive",
      });
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
        return <ChartWidget {...widgetProps} />;
      case "table":
        return <DataTable {...widgetProps} />;
      case "info_card":
        return <InfoCard {...widgetProps} />;
      case "sop":
        return <SOPWidget {...widgetProps} />;
      case "timing_analysis":
        return <TimingAnalysisTable {...widgetProps} />;
      case "resource_performance":
        return <ResourcePerformanceTable {...widgetProps} />;
      case "data_visualization":
        return <DataVisualizationWidget {...widgetProps} />;
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
        <Button
          onClick={() => setIsWidgetModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Settings className="w-4 h-4" />
          <span>Configure Widgets</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Widgets</p>
              <p className="text-3xl font-bold text-gray-900">{selectedWidgets.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-3xl font-bold text-gray-900">98.5%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-3xl font-bold text-gray-900">Excellent</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
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
            <Button
              onClick={() => setIsWidgetModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Widgets
            </Button>
          </div>
        </Card>
      )}

      {/* Widget Selection Modal */}
      <WidgetSelectionModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        onSave={handleSaveWidgets}
        selectedWidgets={selectedWidgets}
        pinnedWidgets={pinnedWidgets}
      />
    </div>
  );
};

export default Dashboard;
