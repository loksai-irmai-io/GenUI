
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, X, Pin, PinOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WidgetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedWidgets: string[], pinnedWidgets: string[]) => void;
  selectedWidgets: string[];
  pinnedWidgets: string[];
}

// Updated comprehensive list of all available widgets organized by category
const CATEGORY_WIDGETS = {
  "Dashboard Essentials": [
    {
      id: "info-cards",
      name: "Key Metrics Overview",
      description: "Essential KPIs and metrics cards for dashboard overview",
    },
    {
      id: "sla-analysis-bar",
      name: "SLA Analysis Bar Chart",
      description: "Service Level Agreement analysis with activity duration metrics",
    },
    {
      id: "process-failure-patterns",
      name: "Process Failure Patterns",
      description: "Distribution chart showing different types of process failures",
    },
    {
      id: "mortgage-lifecycle",
      name: "Mortgage Application Lifecycle",
      description: "Interactive process flow diagram for mortgage applications",
    },
  ],
  "Process Discovery": [
    {
      id: "object-lifecycle",
      name: "Object Lifecycle",
      description: "Track object lifecycle and transitions",
    },
  ],
  "Outlier Analysis": [
    {
      id: "incomplete-cases-count",
      name: "Incomplete Cases (Info Card)",
      description: "Count of cases that remain incomplete displayed as info card",
    },
    {
      id: "incomplete-case-table",
      name: "Incomplete Cases Table",
      description: "Detailed table of all incomplete cases",
    },
    {
      id: "long-running-cases-count",
      name: "Long-Running Cases (Info Card)",
      description: "Count of cases taking longer than expected as info card",
    },
    {
      id: "long-running-table",
      name: "Long-Running Table",
      description: "Detailed table of all long-running cases",
    },
    {
      id: "resource-switches-count",
      name: "Resource Switches (Info Card)",
      description: "Count of resource handovers in processes as info card",
    },
    {
      id: "resource-switches-table",
      name: "Resource Switches Table",
      description: "Detailed table of all resource switches",
    },
    {
      id: "rework-activities-count",
      name: "Rework Activities (Info Card)",
      description: "Count of activities that required rework as info card",
    },
    {
      id: "timing-violations-count",
      name: "Timing Violations (Info Card)",
      description: "Count of identified timing violations as info card",
    },
    {
      id: "timing-violations-table",
      name: "Timing Violations Table",
      description: "Detailed table of all timing violations",
    },
    {
      id: "resource-performance",
      name: "Resource Performance Table",
      description: "Performance analysis table of resources by efficiency and utilization",
    },
    {
      id: "timing-analysis",
      name: "Timing Analysis Table",
      description: "Overview table of timing patterns and deviations",
    },
  ],
  "Legacy Widgets": [
    {
      id: "chart-widget",
      name: "Performance Chart",
      description: "Basic line chart for performance tracking",
    },
    {
      id: "sop-widget",
      name: "SOP Deviations",
      description: "Standard operating procedure deviation analysis",
    },
    {
      id: "data-viz",
      name: "Data Visualization",
      description: "Generic data visualization widget",
    },
    {
      id: "controls-identified-count",
      name: "Controls Identified (Info Card)",
      description: "Count of identified controls displayed as info card",
    },
  ],
};

const WidgetSelectionModal: React.FC<WidgetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedWidgets,
  pinnedWidgets,
}) => {
  const [localPinnedWidgets, setLocalPinnedWidgets] =
    useState<string[]>(pinnedWidgets);
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

      const hasNewChanges =
        JSON.stringify(newPinned.sort()) !==
        JSON.stringify(pinnedWidgets.sort());
      setHasChanges(hasNewChanges);

      return newPinned;
    });
  };

  const handleSave = () => {
    onSave(localPinnedWidgets, localPinnedWidgets);
    setHasChanges(false);
    onClose();

    toast({
      title: "Preferences Saved",
      description: "Your widget preferences have been updated successfully.",
    });
  };

  const handleCancel = () => {
    setLocalPinnedWidgets(pinnedWidgets);
    setHasChanges(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent
        className="max-w-6xl max-h-[85vh] overflow-y-auto bg-slate-800 border-slate-700 text-slate-200"
        aria-label="Widget Selection Modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-slate-100">
            <span>Configure Dashboard Widgets</span>
            <Badge variant="outline" className="border-slate-600 text-slate-300">{localPinnedWidgets.length} pinned</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {Object.entries(CATEGORY_WIDGETS).map(([category, widgets]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-100">{category}</h2>
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                  {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700 focus-within:ring-2 focus-within:ring-blue-400 transition-colors cursor-pointer"
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
                        <Pin className="w-5 h-5 text-blue-400" />
                      ) : (
                        <PinOff className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-100 flex items-center gap-2 flex-wrap">
                        {widget.name}
                        <Badge
                          variant="outline"
                          className="text-xs font-normal border-slate-600 text-slate-400"
                        >
                          {category}
                        </Badge>
                        {localPinnedWidgets.includes(widget.id) && (
                          <Badge
                            variant="default"
                            className="text-xs bg-blue-600 text-white"
                          >
                            Pinned
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Click widgets to pin/unpin them on your dashboard
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-200"
              aria-label="Cancel widget selection"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white"
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
