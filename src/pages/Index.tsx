
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WidgetSelectionModal from "../components/WidgetSelectionModal";

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
    <div className="w-full h-full space-y-6">
      {/* Visualizations Section */}
      {visualizations.length > 0 && (
        <div className="w-full">
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm w-full">
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
            <CardContent className="p-6 w-full">
              <div className="space-y-6 w-full">
                {visualizations.map((viz) => (
                  <Card
                    key={viz.id}
                    className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 w-full"
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
                    <CardContent className="p-6 w-full">
                      <div className="bg-gray-50 rounded-lg border border-gray-200 w-full overflow-auto">
                        <div className="p-4 max-h-96 overflow-auto">
                          <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {JSON.stringify(viz.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
