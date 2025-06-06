import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WidgetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedWidgets: string[], pinnedWidgets: string[]) => void;
  selectedWidgets: string[];
  pinnedWidgets: string[];
}

const WIDGET_SECTIONS = {
  "Process Discovery": [
    { id: "mortgage-lifecycle", name: "Mortgage Application Lifecycle" },
  ],
  "Outlier Analysis": [
    { id: "sop-deviation-count", name: "SOP Deviation Count" },
    { id: "incomplete-cases-count", name: "Incomplete Cases Count" },
    { id: "incomplete-case-table", name: "Incomplete Cases Table" },
    { id: "long-running-cases-count", name: "Long-Running Cases Count" },
    { id: "long-running-table", name: "Long-Running Cases Table" },
    { id: "resource-switches-count", name: "Resource Switches Count" },
    { id: "resource-switches-count-table", name: "Resource Switches Count Table" },
    { id: "resource-switches-table", name: "Resource Switches Table" },
    { id: "rework-activities-count", name: "Rework Activities Count" },
    { id: "reworked-activities-table", name: "Reworked Activities Table" },
    { id: "timing-violations-count", name: "Timing Violations Count" },
    { id: "timing-violations-table", name: "Timing Violations Table" },
    { id: "sop-deviation-patterns", name: "SOP Deviation Patterns" },
    { id: "resource-performance", name: "Resource Performance" },
    { id: "activity-pair-threshold", name: "Activity Pair Threshold" },
    { id: "case-complexity-analysis", name: "Case Complexity Analysis" },
  ],
  "CCM": [
    { id: "controls-identified-count", name: "Controls Identified Count" },
    { id: "controls", name: "Controls" },
    { id: "sla-analysis-bar", name: "SLA Analysis Bar Graph" },
    { id: "kpi", name: "KPI" },
  ],
  "Dashboard Essentials": [
    { id: "process-failure-patterns", name: "Process Failure Patterns" },
  ],
  "FMEA": [
    { id: "fmea-dashboard", name: "FMEA Dashboard" },
    { id: "fmea-analysis-table", name: "FMEA Analysis Table" },
    { id: "fmea-severity-analysis", name: "Severity Analysis" },
    { id: "fmea-likelihood-analysis", name: "Likelihood Analysis" },
    { id: "fmea-detectability-analysis", name: "Detectability Analysis" },
    { id: "fmea-risk-charts", name: "FMEA Risk Charts" },
  ],
};

const WidgetSelectionModal: React.FC<WidgetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedWidgets,
  pinnedWidgets,
}) => {
  const [tempSelectedWidgets, setTempSelectedWidgets] = useState<string[]>(
    selectedWidgets
  );
  const [tempPinnedWidgets, setTempPinnedWidgets] = useState<string[]>(
    pinnedWidgets
  );

  const handleWidgetToggle = (widgetId: string, checked: boolean) => {
    setTempSelectedWidgets((prev) =>
      checked
        ? [...prev, widgetId]
        : prev.filter((id) => id !== widgetId)
    );

    if (!checked) {
      setTempPinnedWidgets((prev) => prev.filter((id) => id !== widgetId));
    }
  };

  const handlePinToggle = (widgetId: string) => {
    setTempPinnedWidgets((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSave = () => {
    onSave(tempSelectedWidgets, tempPinnedWidgets);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-100">
            Configure Dashboard Widgets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(WIDGET_SECTIONS).map(([sectionName, widgets]) => (
            <div key={sectionName} className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-700 pb-2">
                {sectionName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors"
                  >
                    <Checkbox
                      id={widget.id}
                      checked={tempSelectedWidgets.includes(widget.id)}
                      onCheckedChange={(checked) =>
                        handleWidgetToggle(widget.id, checked as boolean)
                      }
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                      htmlFor={widget.id}
                      className="flex-1 text-sm text-slate-200 cursor-pointer"
                    >
                      {widget.name}
                    </label>
                    {tempSelectedWidgets.includes(widget.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePinToggle(widget.id)}
                        className={`p-1 ${
                          tempPinnedWidgets.includes(widget.id)
                            ? "text-yellow-400 hover:text-yellow-500"
                            : "text-slate-400 hover:text-yellow-400"
                        }`}
                      >
                        <Pin className="w-4 h-4" />
                      </Button>
                    )}
                    {tempPinnedWidgets.includes(widget.id) && (
                      <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                        Pinned
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSelectionModal;
