
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
import { useLocation } from "react-router-dom";

interface WidgetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedWidgets: string[], pinnedWidgets: string[]) => void;
  selectedWidgets: string[];
  pinnedWidgets: string[];
}

// Clean widget definitions organized by main categories only
const ALL_WIDGETS = {
  "Process Discovery": [
    {
      id: "mortgage-lifecycle",
      name: "Mortgage Application Lifecycle",
      description: "Interactive process flow diagram for mortgage applications",
      relevantPages: ["/", "/process-discovery"],
    },
  ],
  "Outlier Analysis": [
    {
      id: "all-failure-patterns-count",
      name: "All Failure Patterns Count",
      description:
        "Total count of all identified failure patterns as info card",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "sop-deviation-count",
      name: "SOP Deviation Count",
      description:
        "Count of standard operating procedure deviations as info card",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "incomplete-cases-count",
      name: "Incomplete Cases Count",
      description:
        "Count of cases that remain incomplete displayed as info card",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "incomplete-case-table",
      name: "Incomplete Cases Table",
      description: "Detailed table of all incomplete cases with analysis",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "long-running-cases-count",
      name: "Long-Running Cases Count",
      description: "Count of cases taking longer than expected as info card",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "long-running-table",
      name: "Long-Running Cases Table",
      description: "Detailed table of all long-running cases with metrics",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "resource-switches-count",
      name: "Resource Switches Count",
      description: "Count of resource handovers in processes as info card",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "resource-switches-count-table",
      name: "Resource Switches Count Table",
      description: "Summary table of resource switches by category",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "resource-switches-table",
      name: "Resource Switches Table",
      description: "Detailed table of all resource switches and handovers",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "rework-activities-count",
      name: "Rework Activities Count",
      description: "Count of activities that required rework as info card",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "reworked-activities-table",
      name: "Reworked Activities Table",
      description: "Detailed table of all reworked activities with analysis",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "timing-violations-count",
      name: "Timing Violations Count",
      description: "Count of identified timing violations as info card",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "timing-violations-table",
      name: "Timing Violations Table",
      description: "Detailed table of all timing violations with analysis",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "sop-deviation-patterns",
      name: "SOP Deviation Patterns",
      description: "Table showing patterns of SOP deviations across processes",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "resource-performance",
      name: "Resource Performance",
      description:
        "Performance analysis table of resources by efficiency and utilization",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "activity-pair-threshold",
      name: "Activity Pair Threshold",
      description: "Analysis of activity pair timing thresholds and violations",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "case-complexity-analysis",
      name: "Case Complexity Analysis",
      description: "Detailed analysis of case complexity factors and metrics",
      relevantPages: ["/", "/outlier-analysis"],
    },
    {
      id: "process-failure-patterns",
      name: "Process Failure Patterns Distribution",
      description:
        "Distribution chart showing different types of process failures",
      relevantPages: ["/", "/outlier-analysis"],
    },
  ],
  CCM: [
    {
      id: "controls-identified-count",
      name: "Controls Identified Count",
      description: "Count of identified controls displayed as info card",
      relevantPages: ["/", "/ccm"],
    },
    {
      id: "controls",
      name: "Controls",
      description: "Comprehensive controls management and tracking table",
      relevantPages: ["/", "/ccm"],
    },
    {
      id: "sla-analysis",
      name: "SLA Analysis",
      description:
        "Service Level Agreement analysis with activity duration metrics",
      relevantPages: ["/", "/ccm"],
    },
    {
      id: "sla-analysis-bar",
      name: "SLA Analysis Bar Chart",
      description:
        "Service Level Agreement analysis with activity duration metrics",
      relevantPages: ["/", "/ccm"],
    },
    {
      id: "kpi",
      name: "KPI",
      description: "Key Performance Indicators dashboard and metrics",
      relevantPages: ["/", "/ccm"],
    },
  ],
  FMEA: [
    {
      id: "fmea-dashboard",
      name: "FMEA Dashboard",
      description: "Risk Priority Number (RPN) and risk level overview with charts",
      relevantPages: ["/", "/fmea"],
    },
    {
      id: "fmea-analysis-table",
      name: "FMEA Analysis Table",
      description: "Detailed failure mode and effects analysis table",
      relevantPages: ["/", "/fmea"],
    },
    {
      id: "fmea-severity-analysis",
      name: "Severity Analysis",
      description: "Impact assessment of failure modes with severity scores",
      relevantPages: ["/", "/fmea"],
    },
    {
      id: "fmea-likelihood-analysis",
      name: "Likelihood Analysis",
      description: "Probability assessment of failure modes",
      relevantPages: ["/", "/fmea"],
    },
    {
      id: "fmea-detectability-analysis",
      name: "Detectability Analysis",
      description: "Detection capability assessment of failure modes",
      relevantPages: ["/", "/fmea"],
    },
    {
      id: "fmea-risk-charts",
      name: "FMEA Risk Charts",
      description: "Risk rating distribution and breakdown charts",
      relevantPages: ["/", "/fmea"],
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
  const location = useLocation();

  useEffect(() => {
    setLocalPinnedWidgets(pinnedWidgets);
    setHasChanges(false);
  }, [pinnedWidgets, isOpen]);

  // Show all widgets since this is the main configuration
  const getRelevantWidgets = () => {
    return ALL_WIDGETS;
  };

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

  const relevantWidgets = getRelevantWidgets();
  const totalRelevantWidgets = Object.values(relevantWidgets).reduce(
    (total, widgets) => total + widgets.length,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent
        className="max-w-6xl max-h-[85vh] overflow-y-auto bg-slate-800 border-slate-700 text-slate-200"
        aria-label="Widget Selection Modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-slate-100">
            <span>Configure Dashboard Widgets</span>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                {totalRelevantWidgets} available
              </Badge>
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                {localPinnedWidgets.length} pinned
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {Object.entries(relevantWidgets).map(([category, widgets]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-100">{category}</h2>
                <Badge
                  variant="secondary"
                  className="text-xs bg-slate-700 text-slate-300 border-slate-600"
                >
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
            Click widgets to pin/unpin them on your dashboard • Configure
            widgets from Process Discovery, Outlier Analysis, and CCM categories
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
