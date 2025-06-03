import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Save, X } from "lucide-react";

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

const availableWidgets: Widget[] = [
  {
    id: "sop-deviation",
    name: "SOP Deviation",
    category: "Process Analytics",
    description: "Deviation from standard operating procedures",
  },
  {
    id: "long-running-cases",
    name: "Long Running Cases",
    category: "Process Analytics",
    description: "Cases exceeding expected duration",
  },
  {
    id: "incomplete-cases",
    name: "Incomplete Cases",
    category: "Process Analytics",
    description: "Cases not completed within timeframe",
  },
  {
    id: "resource-switches",
    name: "Resource Switches",
    category: "Process Analytics",
    description: "Number of resource switches in cases",
  },
  {
    id: "rework-activities",
    name: "Rework Activities",
    category: "Process Analytics",
    description: "Activities repeated within cases",
  },
  {
    id: "timing-violations",
    name: "Timing Violations",
    category: "Process Analytics",
    description: "Violations of timing constraints",
  },
  {
    id: "case-complexity",
    name: "Case Complexity",
    category: "Process Analytics",
    description: "Complexity levels of cases",
  },
  {
    id: "resource-performance",
    name: "Resource Performance",
    category: "Process Analytics",
    description: "Performance metrics for resources",
  },
  {
    id: "timing-analysis",
    name: "Timing Analysis",
    category: "Process Analytics",
    description: "Detailed timing analysis of cases",
  },
  {
    id: "process-failure-patterns-distribution",
    name: "Process failure patterns distribution",
    category: "Process Analytics",
    description: "Distribution of process failure patterns as a bar graph",
  },
  {
    id: "object-lifecycle",
    name: "Object Lifecycle",
    category: "Process Analytics",
    description: "Visualize the object lifecycle as a process flow graph",
  },
];

// Add new widgets for all dashboard visualizations, including those from Process Discovery, Outlier Analysis, and CCM
const extendedWidgets: Widget[] = [
  ...availableWidgets,
  // Outlier Analysis widgets (add all from OutlierAnalysis.tsx)
  {
    id: "all-counts",
    name: "All Failure Pattern Counts",
    category: "Outlier Analysis",
    description: "Bar chart of all failure pattern counts",
  },
  {
    id: "sop-patterns",
    name: "SOP Deviation Patterns",
    category: "Outlier Analysis",
    description: "Table of SOP deviation patterns",
  },
  {
    id: "sop-low-percentage-count-bar",
    name: "SOP Deviation Low Percentage Count",
    category: "Outlier Analysis",
    description: "Bar chart of low percentage SOP deviations",
  },
  {
    id: "sop-low-percentage-patterns-table",
    name: "SOP Deviation Low Percentage Patterns",
    category: "Outlier Analysis",
    description: "Table of low percentage SOP deviation patterns",
  },
  {
    id: "incomplete-cases-count",
    name: "Incomplete Cases Count",
    category: "Outlier Analysis",
    description: "Bar chart of incomplete cases count",
  },
  {
    id: "incomplete-case-table",
    name: "Incomplete Case Table",
    category: "Outlier Analysis",
    description: "Table of incomplete cases",
  },
  {
    id: "long-running-cases-count",
    name: "Long Running Cases Count",
    category: "Outlier Analysis",
    description: "Bar chart of long running cases count",
  },
  {
    id: "long-running-table",
    name: "Long Running Table",
    category: "Outlier Analysis",
    description: "Table of long running cases",
  },
  {
    id: "resource-switches-count",
    name: "Resource Switches Count",
    category: "Outlier Analysis",
    description: "Bar chart of resource switches count",
  },
  {
    id: "resource-switches-count-table",
    name: "Resource Switches Count Table",
    category: "Outlier Analysis",
    description: "Table of resource switches count",
  },
  {
    id: "resource-switches-table",
    name: "Resource Switches Table",
    category: "Outlier Analysis",
    description: "Table of resource switches",
  },
  // Process Discovery
  {
    id: "object-lifecycle",
    name: "Object Lifecycle (Process Flow)",
    category: "Process Discovery",
    description: "Visualize the object lifecycle as a process flow graph",
  },
  // CCM widgets
  {
    id: "controls-identified-count",
    name: "Controls Identified Count",
    category: "CCM",
    description: "Bar chart of controls identified",
  },
  {
    id: "controls-description",
    name: "Controls Description",
    category: "CCM",
    description: "Table of controls description",
  },
  {
    id: "controls-definition",
    name: "Controls Definition",
    category: "CCM",
    description: "Table of controls definition",
  },
  {
    id: "sla-analysis",
    name: "SLA Analysis",
    category: "CCM",
    description: "Table of SLA analysis",
  },
  {
    id: "kpi",
    name: "KPI",
    category: "CCM",
    description: "Table of KPIs",
  },
];

const WidgetSelectionModal: React.FC<WidgetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedWidgets,
  pinnedWidgets, // keep for prop compatibility, but do not use
}) => {
  const [localSelection, setLocalSelection] =
    useState<string[]>(selectedWidgets);

  const handleToggleWidget = (widgetId: string) => {
    setLocalSelection((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSave = () => {
    // Deduplicate before saving to avoid 409 errors
    const deduped = Array.from(new Set(localSelection));
    onSave(deduped, deduped); // Treat all selected widgets as pinned
    onClose();
  };

  const categories = Array.from(
    new Set(extendedWidgets.map((w) => w.category))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        aria-label="Widget Selection Modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Select Widgets for Your Dashboard</span>
            <Badge variant="outline">{localSelection.length} selected</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extendedWidgets
                  .filter((widget) => widget.category === category)
                  .map((widget) => (
                    <div
                      key={widget.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-400 transition-colors cursor-pointer"
                      tabIndex={0}
                      aria-label={`Select widget: ${widget.name}`}
                      onClick={() => handleToggleWidget(widget.id)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        handleToggleWidget(widget.id)
                      }
                    >
                      <Checkbox
                        checked={localSelection.includes(widget.id)}
                        onCheckedChange={() => handleToggleWidget(widget.id)}
                        className="mt-1"
                        aria-label={`Toggle ${widget.name}`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          {widget.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            aria-label="Cancel widget selection"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            aria-label="Save widget preferences"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSelectionModal;
