
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { widgetService, Widget } from '@/services/widgetService';
import { useToast } from '@/hooks/use-toast';

interface WidgetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedWidgets: string[]) => void;
  selectedWidgets: string[];
}

const WidgetSelectionModal: React.FC<WidgetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedWidgets
}) => {
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
  const [localSelectedWidgets, setLocalSelectedWidgets] = useState<string[]>(selectedWidgets);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadAvailableWidgets();
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalSelectedWidgets(selectedWidgets);
  }, [selectedWidgets]);

  const loadAvailableWidgets = async () => {
    try {
      setLoading(true);
      const widgets = await widgetService.getAvailableWidgets();
      setAvailableWidgets(widgets);
    } catch (error) {
      console.error('Error loading widgets:', error);
      toast({
        title: "Error Loading Widgets",
        description: "Failed to load available widgets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWidgetToggle = (widgetName: string) => {
    setLocalSelectedWidgets(prev =>
      prev.includes(widgetName)
        ? prev.filter(w => w !== widgetName)
        : [...prev, widgetName]
    );
  };

  const handleSave = () => {
    onSave(localSelectedWidgets);
    onClose();
  };

  const handleClose = () => {
    setLocalSelectedWidgets(selectedWidgets);
    onClose();
  };

  if (!isOpen) return null;

  const widgetsByCategory = availableWidgets.reduce((acc, widget) => {
    if (!acc[widget.widget_category]) {
      acc[widget.widget_category] = [];
    }
    acc[widget.widget_category].push(widget);
    return acc;
  }, {} as Record<string, Widget[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Select Widgets</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading widgets...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {widgets.map((widget) => (
                      <div
                        key={widget.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          localSelectedWidgets.includes(widget.widget_name)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => handleWidgetToggle(widget.widget_name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {widget.widget_name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              localSelectedWidgets.includes(widget.widget_name)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {localSelectedWidgets.includes(widget.widget_name) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        {widget.description && (
                          <p className="text-sm text-gray-600">{widget.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {localSelectedWidgets.length} widget{localSelectedWidgets.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetSelectionModal;
