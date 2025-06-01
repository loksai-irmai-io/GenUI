
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save } from "lucide-react";
import { widgetService, Widget } from '@/services/widgetService';
import { useToast } from '@/hooks/use-toast';

interface WidgetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedWidgets: string[], pinnedWidgets: string[]) => void;
  selectedWidgets: string[];
  pinnedWidgets: string[];
}

const availableWidgets: Widget[] = [
  { id: 'info-card-small', name: 'Small Info Card', category: 'Info Cards', description: 'Compact metric display' },
  { id: 'info-card-medium', name: 'Medium Info Card', category: 'Info Cards', description: 'Standard metric card' },
  { id: 'info-card-large', name: 'Large Info Card', category: 'Info Cards', description: 'Detailed metric overview' },
  { id: 'line-chart', name: 'Line Chart', category: 'Charts', description: 'Trend visualization' },
  { id: 'bar-chart', name: 'Bar Chart', category: 'Charts', description: 'Comparative data display' },
  { id: 'pie-chart', name: 'Pie Chart', category: 'Charts', description: 'Proportional data view' },
  { id: 'data-table', name: 'Data Table', category: 'Tables', description: 'Tabular data presentation' },
  { id: 'kpi-summary', name: 'KPI Summary', category: 'KPIs', description: 'Key performance indicators' },
  { id: 'timeline', name: 'Timeline Widget', category: 'Timeline', description: 'Chronological events' },
  { id: 'gauge', name: 'Gauge Widget', category: 'Gauges', description: 'Progress measurement' },
];

const WidgetSelectionModal: React.FC<WidgetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedWidgets,
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedWidgets);

  const handleToggleWidget = (widgetId: string) => {
    setLocalSelection(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSave = () => {
    onSave(localSelection, []);
    onClose();
  };

  const categories = Array.from(new Set(availableWidgets.map(w => w.category)));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Select Widgets for Your Dashboard</span>
            <Badge variant="outline">{localSelection.length} selected</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgets
                  .filter(widget => widget.category === category)
                  .map(widget => (
                    <div 
                      key={widget.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleToggleWidget(widget.id)}
                    >
                      <Checkbox 
                        checked={localSelection.includes(widget.id)}
                        onCheckedChange={() => handleToggleWidget(widget.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{widget.name}</h4>
                        <p className="text-sm text-gray-600">{widget.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSelectionModal;
