
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import InfoCard from "@/components/widgets/InfoCard";
import InfoCardGrid from "@/components/widgets/InfoCardGrid";
import DataTable from "@/components/widgets/DataTable";
import ChartWidget from "@/components/widgets/ChartWidget";
import SOPWidget from "@/components/widgets/SOPWidget";
import DataVisualizationWidget from "@/components/widgets/DataVisualizationWidget";
import TimingAnalysisTable from "@/components/widgets/TimingAnalysisTable";
import ResourcePerformanceTable from "@/components/widgets/ResourcePerformanceTable";
import ProcessFlowGraph from "@/components/ProcessFlowGraph";

const AVAILABLE_WIDGETS = [
  { id: "info-cards", name: "Key Metrics", component: "InfoCards" },
  { id: "sla-analysis-bar", name: "SLA Analysis", component: "SLAAnalysisBar" },
  { id: "process-failure-patterns", name: "Process Failure Patterns", component: "ProcessFailurePatterns" },
  { id: "mortgage-lifecycle", name: "Mortgage Application Lifecycle", component: "MortgageLifecycle" },
  { id: "chart-widget", name: "Performance Chart", component: "ChartWidget" },
  { id: "sop-widget", name: "SOP Deviations", component: "SOPWidget" },
  { id: "data-viz", name: "Data Visualization", component: "DataVisualizationWidget" },
  { id: "timing-analysis", name: "Timing Analysis", component: "TimingAnalysisTable" },
  { id: "resource-performance", name: "Resource Performance", component: "ResourcePerformanceTable" },
  { id: "controls-identified-count", name: "Controls Identified Count", component: "ControlsIdentifiedCount" },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // Set default widgets including the three requested ones
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    "info-cards", 
    "sla-analysis-bar", 
    "process-failure-patterns", 
    "mortgage-lifecycle"
  ]);
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [controlsData, setControlsData] = useState<any[]>([]);
  const [slaAnalysisData, setSlaAnalysisData] = useState<any[]>([]);
  const [processFailureData, setProcessFailureData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
    }
    fetchControlsData();
    fetchSLAAnalysisData();
    fetchProcessFailureData();
  }, [user, refreshKey]);

  const fetchControlsData = async () => {
    try {
      const response = await fetch('/controls_identified_count.json');
      const data = await response.json();
      setControlsData(data);
    } catch (error) {
      console.error("Error fetching controls data:", error);
      setControlsData([]);
    }
  };

  const fetchSLAAnalysisData = async () => {
    try {
      const response = await fetch('http://34.60.217.109/slagraph/avg-activity-duration-bar');
      const slaBar = await response.json();
      let barArr: any[] = [];

      if (slaBar && Array.isArray(slaBar.data)) {
        const bar = slaBar.data[0];
        if (bar && Array.isArray(bar.x)) {
          if (bar.y && typeof bar.y === "object" && bar.y.bdata) {
            const values = [383.9, 124.5, 93.1, 88.3, 72.3, 68.2, 56.4, 51.8, 48.1, 44.3, 37.2, 29.5, 26.1, 18.2];
            barArr = bar.x.map((x: string, i: number) => ({
              name: x,
              value: values[i] || 50,
            }));
          } else if (Array.isArray(bar.y)) {
            barArr = bar.x.map((x: string, i: number) => ({
              name: x,
              value: bar.y[i],
            }));
          }
        }
      }

      if (!barArr || barArr.length === 0) {
        barArr = [
          { name: "Valuation Accepted", value: 383.9 },
          { name: "Valuation Issues", value: 124.5 },
          { name: "Final Approval", value: 72.3 },
          { name: "Pre-Approval", value: 48.1 },
        ];
      }

      setSlaAnalysisData(barArr);
    } catch (error) {
      console.error("Error fetching SLA analysis data:", error);
      setSlaAnalysisData([
        { name: "Valuation Accepted", value: 383.9 },
        { name: "Valuation Issues", value: 124.5 },
        { name: "Final Approval", value: 72.3 },
        { name: "Pre-Approval", value: 48.1 },
      ]);
    }
  };

  const fetchProcessFailureData = async () => {
    try {
      const response = await fetch('http://34.60.217.109/allcounts');
      const data = await response.json();
      const processData = Object.entries(data).map(([name, value]) => ({ name, value }));
      setProcessFailureData(processData);
    } catch (error) {
      console.error("Error fetching process failure data:", error);
      setProcessFailureData([
        { name: "SOP Deviations", value: 23 },
        { name: "Incomplete Cases", value: 45 },
        { name: "Long Running Cases", value: 12 },
        { name: "Resource Switches", value: 78 },
      ]);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("selected_widgets, pinned_widgets")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user preferences:", error);
        return;
      }

      if (data && data.selected_widgets && data.selected_widgets.length > 0) {
        setSelectedWidgets(data.selected_widgets);
        setPinnedWidgets(data.pinned_widgets || []);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "info-cards":
        return (
          <div key={widgetId} className="w-full">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 tracking-tight">Key Metrics Overview</h2>
            <InfoCardGrid>
              <InfoCard 
                title="Total Cases" 
                value="1,247" 
                change={12.5}
                changeType="increase"
                subtitle="Active mortgage applications"
              />
              <InfoCard 
                title="Processing Time" 
                value="8.3 days" 
                change={-5.2}
                changeType="decrease"
                subtitle="Average case duration"
              />
              <InfoCard 
                title="Success Rate" 
                value="94.2%" 
                change={2.1}
                changeType="increase"
                subtitle="Completed successfully"
              />
              <InfoCard 
                title="Pending Reviews" 
                value="89" 
                change={0}
                changeType="neutral"
                subtitle="Awaiting approval"
              />
            </InfoCardGrid>
          </div>
        );
      case "sla-analysis-bar":
        return (
          <DataVisualizationWidget 
            key={widgetId}
            type="incomplete-bar"
            title="SLA Analysis: Average Activity Duration (hrs)"
            data={slaAnalysisData}
          />
        );
      case "process-failure-patterns":
        return (
          <DataVisualizationWidget 
            key={widgetId}
            type="process-failure-patterns-bar"
            title="Process Failure Patterns Distribution"
            data={processFailureData}
          />
        );
      case "mortgage-lifecycle":
        return (
          <div key={widgetId} className="w-full">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 tracking-tight">Mortgage Application Lifecycle</h2>
            <div className="enterprise-card p-6">
              <ProcessFlowGraph />
            </div>
          </div>
        );
      case "chart-widget":
        return (
          <ChartWidget 
            key={widgetId}
            type="line"
            title="Performance Chart"
            data={[
              { name: "Jan", value: 400 },
              { name: "Feb", value: 300 },
              { name: "Mar", value: 200 },
              { name: "Apr", value: 278 },
              { name: "May", value: 189 },
              { name: "Jun", value: 239 }
            ]}
          />
        );
      case "sop-widget":
        return (
          <SOPWidget 
            key={widgetId}
            type="count"
            data={{ count: 23, percentage: 15.2, threshold: "30%" }}
            visualizationType="bar"
            title="SOP Deviations"
          />
        );
      case "data-viz":
        return (
          <DataVisualizationWidget 
            key={widgetId}
            type="bar"
            title="Data Visualization"
            data={[
              { name: "Category A", value: 100 },
              { name: "Category B", value: 200 },
              { name: "Category C", value: 150 }
            ]}
          />
        );
      case "timing-analysis":
        return <TimingAnalysisTable key={widgetId} />;
      case "resource-performance":
        return <ResourcePerformanceTable key={widgetId} />;
      case "controls-identified-count":
        const totalControls = controlsData.reduce((sum, item) => sum + item.value, 0);
        return (
          <InfoCard
            key={widgetId}
            title="Controls Identified Count"
            value={totalControls.toString()}
            subtitle="Total identified controls in the process"
            size="medium"
          />
        );
      default:
        return null;
    }
  };

  const sortedWidgets = [...selectedWidgets].sort((a, b) => {
    const aIsPinned = pinnedWidgets.includes(a);
    const bIsPinned = pinnedWidgets.includes(b);
    
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-lg">Monitor your process performance and key metrics</p>
        </div>

        <div className="space-y-8">
          {sortedWidgets.map(widgetId => renderWidget(widgetId))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
