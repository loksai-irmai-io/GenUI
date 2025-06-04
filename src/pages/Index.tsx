
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProcessFlowGraph from "@/components/ProcessFlowGraph";
import WidgetSelectionModal from "@/components/WidgetSelectionModal";
import ChartWidget from "@/components/widgets/ChartWidget";
import InfoCard from "@/components/widgets/InfoCard";
import DataTable from "@/components/widgets/DataTable";
import ResourcePerformanceTable from "@/components/widgets/ResourcePerformanceTable";
import TimingAnalysisTable from "@/components/widgets/TimingAnalysisTable";
import SOPWidget from "@/components/widgets/SOPWidget";
import DataVisualizationWidget from "@/components/widgets/DataVisualizationWidget";
import { BarChart, Activity, TrendingUp, Users, Clock, AlertTriangle, CheckCircle, Settings, LayoutGrid } from "lucide-react";

const Index = () => {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    "process-flow",
    "case-complexity",
    "resource-performance",
    "timing-analysis",
    "sop-adherence",
  ]);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

  const availableWidgets = [
    {
      id: "process-flow",
      name: "Process Flow Visualization",
      description: "Interactive process flow diagram",
      icon: <Activity className="w-5 h-5" />,
      category: "Process",
    },
    {
      id: "case-complexity",
      name: "Case Complexity Analysis",
      description: "Analysis of case complexity patterns",
      icon: <BarChart className="w-5 h-5" />,
      category: "Analytics",
    },
    {
      id: "resource-performance",
      name: "Resource Performance",
      description: "Resource utilization and performance metrics",
      icon: <Users className="w-5 h-5" />,
      category: "Resources",
    },
    {
      id: "timing-analysis",
      name: "Timing Analysis",
      description: "Process timing and bottleneck analysis",
      icon: <Clock className="w-5 h-5" />,
      category: "Performance",
    },
    {
      id: "sop-adherence",
      name: "SOP Adherence",
      description: "Standard Operating Procedure compliance",
      icon: <CheckCircle className="w-5 h-5" />,
      category: "Compliance",
    },
    {
      id: "data-visualization",
      name: "Data Visualization",
      description: "Custom data charts and graphs",
      icon: <TrendingUp className="w-5 h-5" />,
      category: "Analytics",
    },
  ];

  const handleWidgetToggle = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const renderWidget = (widgetId: string) => {
    const baseClassName = "process-widget";
    
    switch (widgetId) {
      case "process-flow":
        return (
          <Card key={widgetId} className={baseClassName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-600" />
                Process Flow Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessFlowGraph />
            </CardContent>
          </Card>
        );
      case "case-complexity":
        return (
          <ChartWidget
            key={widgetId}
            title="Case Complexity Analysis"
            description="Distribution of case complexity across different process instances"
            chartType="bar"
            className={baseClassName}
          />
        );
      case "resource-performance":
        return (
          <Card key={widgetId} className={baseClassName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-green-600" />
                Resource Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResourcePerformanceTable />
            </CardContent>
          </Card>
        );
      case "timing-analysis":
        return (
          <Card key={widgetId} className={baseClassName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-600" />
                Timing Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimingAnalysisTable />
            </CardContent>
          </Card>
        );
      case "sop-adherence":
        return (
          <SOPWidget key={widgetId} className={baseClassName} />
        );
      case "data-visualization":
        return (
          <DataVisualizationWidget key={widgetId} className={baseClassName} />
        );
      default:
        return null;
    }
  };

  const getMetricCards = () => [
    {
      title: "Total Cases",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: <LayoutGrid className="w-5 h-5 text-blue-600" />,
      color: "blue"
    },
    {
      title: "Avg. Processing Time",
      value: "4.2 days",
      change: "-8%",
      trend: "down",
      icon: <Clock className="w-5 h-5 text-green-600" />,
      color: "green"
    },
    {
      title: "SOP Compliance",
      value: "94.5%",
      change: "+3%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      color: "emerald"
    },
    {
      title: "Active Issues",
      value: "23",
      change: "-15%",
      trend: "down",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      color: "red"
    }
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-lg text-gray-600 mt-2 font-medium">
              Real-time insights into your process intelligence metrics
            </p>
          </div>
          <Button
            onClick={() => setShowWidgetModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Settings className="w-5 h-5 mr-2" />
            Configure Widgets
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getMetricCards().map((metric, index) => (
            <InfoCard key={index} {...metric} />
          ))}
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {selectedWidgets.map(renderWidget)}
        </div>
      </div>

      <WidgetSelectionModal
        isOpen={showWidgetModal}
        onClose={() => setShowWidgetModal(false)}
        availableWidgets={availableWidgets}
        selectedWidgets={selectedWidgets}
        onWidgetToggle={handleWidgetToggle}
      />
    </>
  );
};

export default Index;
