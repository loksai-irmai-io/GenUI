
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Save, X, Pin, PinOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Widget {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface WidgetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedWidgets: string[], pinnedWidgets: string[]) => void;
  selectedWidgets: string[];
  pinnedWidgets: string[];
}

// Structured categories with their specific widgets
const CATEGORY_WIDGETS = {
  "Outlier Analysis": [
    { id: "timing-analysis", name: "Timing Analysis", description: "Analyze timing patterns and deviations" },
    { id: "resource-performance", name: "Resource Performance", description: "Monitor resource efficiency and utilization" }
  ],
  "Process Discovery": [
    { id: "object-lifecycle", name: "Object Lifecycle", description: "Track object lifecycle and transitions" }
  ],
  "CCM": [
    { id: "process-failure-patterns-distribution", name: "Process Failure Patterns", description: "Analyze failure patterns and distributions" }
  ]
};

const WidgetSelectionModal: React.FC<WidgetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedWidgets,
  pinnedWidgets,
}) => {
  const [localPinnedWidgets, setLocalPinnedWidgets] = useState<string[]>(pinnedWidgets);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLocalPinnedWidgets(pinnedWidgets);
    setHasChanges(false);
  }, [pinnedWidgets, isOpen]);

  const handleTogglePin = (widgetId: string) => {
    setLocalPinnedWidgets((prev) => {
      const newPinned = prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId];
      
      // Check if there are changes compared to the original pinned widgets
      const hasNewChanges = JSON.stringify(newPinned.sort()) !== JSON.stringify(pinnedWidgets.sort());
      setHasChanges(hasNewChanges);
      
      return newPinned;
    });
  };

  const handleSave = () => {
    // Save both selected and pinned widgets (pinned widgets are also selected)
    onSave(localPinnedWidgets, localPinnedWidgets);
    setHasChanges(false);
    onClose();
    
    toast({
      title: "Preferences Saved",
      description: "Your widget preferences have been updated successfully.",
    });
  };

  const handleCancel = () => {
    // Reset local state to original values
    setLocalPinnedWidgets(pinnedWidgets);
    setHasChanges(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        aria-label="Widget Selection Modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Configure Dashboard Widgets</span>
            <Badge variant="outline">{localPinnedWidgets.length} pinned</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {Object.entries(CATEGORY_WIDGETS).map(([category, widgets]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                <Badge variant="secondary" className="text-xs">
                  {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-400 transition-colors cursor-pointer"
                    tabIndex={0}
                    aria-label={`Toggle pin for widget: ${widget.name}`}
                    onClick={() => handleTogglePin(widget.id)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleTogglePin(widget.id)
                    }
                  >
                    <div className="flex items-center mt-1">
                      {localPinnedWidgets.includes(widget.id) ? (
                        <Pin className="w-5 h-5 text-blue-600" />
                      ) : (
                        <PinOff className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {widget.name}
                        <Badge variant="outline" className="text-xs font-normal">
                          {category}
                        </Badge>
                        {localPinnedWidgets.includes(widget.id) && (
                          <Badge variant="default" className="text-xs bg-blue-600">
                            Pinned
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <p className="text-sm text-gray-600">
            Click widgets to pin/unpin them on your dashboard
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              aria-label="Cancel widget selection"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              aria-label="Save widget preferences"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSelectionModal;
