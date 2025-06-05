
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
import { Save, X } from "lucide-react";
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

// Cleaned up page mappings with only valid widgets
const PAGE_CATEGORIES = {
  "Process Discovery": ["Process Discovery"],
  "Outlier Analysis": ["Outlier Analysis"],
  "CCM": ["CCM", "Case Complexity Management"],
  "Analytics": ["Analytics", "General"],
  "Performance": ["Performance", "Resource Performance"],
  "SOP": ["SOP", "Standard Operating Procedures"]
};

// Valid widgets mapping to ensure only supported widgets are shown
const VALID_WIDGETS = {
  "Process Discovery": ["object-lifecycle"],
  "Outlier Analysis": ["timing-analysis", "resource-performance"],
  "CCM": ["process-failure-patterns-distribution"],
  "Analytics": ["sla-analysis", "controls-definition", "kpi"],
  "Performance": ["resource-performance", "timing-analysis"],
  "SOP": ["sop-deviation", "sop-patterns"]
};

const WidgetSelectionModal: React.FC<WidgetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedWidgets,
  pinnedWidgets,
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedWidgets);
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchWidgets();
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalSelection(selectedWidgets);
  }, [selectedWidgets]);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .order("widget_category", { ascending: true })
        .order("widget_name", { ascending: true });

      if (error) throw error;

      const formattedWidgets: Widget[] = (data || []).map((widget) => ({
        id: String(widget.id),
        name: widget.widget_name,
        category: widget.widget_category,
        description: widget.description || "",
      })).filter(widget => {
        // Only include widgets that are in our valid widgets list
        const page = getPageForCategory(widget.category);
        return VALID_WIDGETS[page]?.includes(widget.id) || false;
      });

      setAvailableWidgets(formattedWidgets);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      toast({
        title: "Error Loading Widgets",
        description: "Failed to load available widgets from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Group widgets by page categories
  const getPageForCategory = (category: string): string => {
    for (const [page, categories] of Object.entries(PAGE_CATEGORIES)) {
      if (categories.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
        return page;
      }
    }
    return "Other";
  };

  const groupedWidgets = availableWidgets.reduce((acc, widget) => {
    const page = getPageForCategory(widget.category);
    if (!acc[page]) {
      acc[page] = [];
    }
    acc[page].push(widget);
    return acc;
  }, {} as Record<string, Widget[]>);

  const pageOrder = ["Process Discovery", "Outlier Analysis", "CCM", "Analytics", "Performance", "SOP"];
  const sortedPages = pageOrder.filter(page => groupedWidgets[page]?.length > 0);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading widgets...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl max-h-[80vh] overflow-y-auto"
        aria-label="Widget Selection Modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Select Widgets for Your Dashboard</span>
            <Badge variant="outline">{localSelection.length} selected</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {sortedPages.map((page) => (
            <div key={page} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{page}</h2>
                <Badge variant="secondary" className="text-xs">
                  {groupedWidgets[page].length} widgets
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedWidgets[page].map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-400 transition-colors cursor-pointer"
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
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {widget.name}
                        <Badge variant="outline" className="text-xs font-normal">
                          {widget.category}
                        </Badge>
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

        <div className="flex justify-end space-x-3 pt-6 border-t">
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
