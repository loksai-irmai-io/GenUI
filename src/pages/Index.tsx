
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import WidgetSelectionModal from "../components/WidgetSelectionModal";
import ChatBot from "../components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";

interface Visualization {
  id: string;
  type: string;
  data: any[];
  title: string;
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log("User authenticated:", user.id);
    }
  }, [user]);

  const handleDataReceived = (type: string, data: any[], title: string) => {
    console.log("[Index] handleDataReceived called with:", { type, data, title });
    
    const newVisualization: Visualization = {
      id: `${type}-${Date.now()}`,
      type,
      data: Array.isArray(data) ? data : [data],
      title
    };

    setVisualizations(prev => {
      const updated = [...prev, newVisualization];
      console.log("[Index] Updated visualizations:", updated);
      return updated;
    });
  };

  const clearVisualizations = () => {
    console.log("[Index] Clearing visualizations");
    setVisualizations([]);
  };

  const handleSelectWidgets = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add widgets to your dashboard.",
        variant: "destructive",
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleSaveWidgets = async (selectedWidgetIds: string[], pinnedWidgetIds: string[]) => {
    console.log("[Index] Widgets saved:", { selectedWidgetIds, pinnedWidgetIds });
    setSelectedWidgets(selectedWidgetIds);
    setPinnedWidgets(pinnedWidgetIds);
    setIsModalOpen(false);
    
    toast({
      title: "Widgets Updated",
      description: `${selectedWidgetIds.length} widgets have been saved to your dashboard.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onSelectWidgets={handleSelectWidgets} />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6 leading-tight">
            Enterprise Process Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Advanced process mining and analytics platform designed for enterprise-scale 
            operational excellence. Discover insights, optimize workflows, and drive 
            data-driven decision making across your organization.
          </p>
          
          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Process Discovery</h3>
                <p className="text-sm text-gray-600">Automatically discover and map your business processes</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Performance Analytics</h3>
                <p className="text-sm text-gray-600">Real-time monitoring and performance optimization</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Compliance Management</h3>
                <p className="text-sm text-gray-600">Ensure regulatory compliance and governance</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Visualizations Section */}
        {visualizations.length > 0 && (
          <div className="mb-16">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      Analytics Dashboard
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {visualizations.length} Active Visualization{visualizations.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <button
                    onClick={clearVisualizations}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    Clear Dashboard
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {visualizations.map((viz) => (
                    <Card
                      key={viz.id}
                      className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300"
                    >
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {viz.title}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {viz.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {viz.data?.length || 0} records
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <pre className="text-xs text-gray-700 overflow-auto max-h-40 leading-relaxed">
                            {JSON.stringify(viz.data, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Getting Started Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Interact with our AI-powered assistant to explore your process data, 
              generate insights, and create custom visualizations tailored to your needs.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <Activity className="w-5 h-5" />
              <span className="font-medium">AI Assistant Available Below</span>
            </div>
          </CardContent>
        </Card>
      </main>

      <ChatBot
        onDataReceived={handleDataReceived}
        visualizations={visualizations}
        clearVisualizations={clearVisualizations}
      />

      <WidgetSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWidgets}
        selectedWidgets={selectedWidgets}
        pinnedWidgets={pinnedWidgets}
      />
    </div>
  );
};

export default Index;
