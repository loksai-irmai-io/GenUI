
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import WidgetSelectionModal from "../components/WidgetSelectionModal";
import ChatBot from "../components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Visualization {
  id: string;
  type: string;
  data: any[];
  title: string;
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
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

  const handleAddWidget = () => {
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

  const handleWidgetAdded = async (widgetType: string) => {
    console.log("[Index] Widget added:", widgetType);
    setIsModalOpen(false);
    
    toast({
      title: "Widget Added",
      description: `${widgetType} widget has been added to your dashboard.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddWidget={handleAddWidget} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Process Mining Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze your business processes with advanced mining techniques. 
            Use the AI assistant below to explore SOP deviations, incomplete cases, 
            and other process insights.
          </p>
        </div>

        {visualizations.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Generated Visualizations
              </h2>
              <button
                onClick={clearVisualizations}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {visualizations.map((viz) => (
                <div
                  key={viz.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {viz.title}
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Type: {viz.type} | Data items: {viz.data?.length || 0}
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(viz.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Get started by asking the AI assistant about your process data.
          </p>
        </div>
      </main>

      <ChatBot
        onDataReceived={handleDataReceived}
        visualizations={visualizations}
        clearVisualizations={clearVisualizations}
      />

      <WidgetSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWidgetSelect={handleWidgetAdded}
      />
    </div>
  );
};

export default Index;
