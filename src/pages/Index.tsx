
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import WidgetSelectionModal from '../components/WidgetSelectionModal';
import InfoCard from '../components/widgets/InfoCard';
import ChartWidget from '../components/widgets/ChartWidget';
import DataTable from '../components/widgets/DataTable';
import SOPWidget from '../components/widgets/SOPWidget';
import ChatBot from '../components/ChatBot';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SOPCountData, SOPPatternData } from '@/services/sopDeviationService';
import { useToast } from '@/hooks/use-toast';

// Sample data for widgets
const sampleLineData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

const sampleBarData = [
  { name: 'Product A', value: 4000 },
  { name: 'Product B', value: 3000 },
  { name: 'Product C', value: 2000 },
  { name: 'Product D', value: 2780 },
];

const samplePieData = [
  { name: 'Desktop', value: 45 },
  { name: 'Mobile', value: 35 },
  { name: 'Tablet', value: 20 },
];

const sampleTableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
];

const tableColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    'info-card-medium',
    'line-chart',
    'bar-chart',
    'data-table'
  ]);
  const [sopCountData, setSOPCountData] = useState<SOPCountData | null>(null);
  const [sopPatternsData, setSOPPatternsData] = useState<SOPPatternData[] | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserWidgetPreferences();
    }
  }, [user]);

  const loadUserWidgetPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_widget_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        // Extract widget IDs from preferences
        const widgetIds = data.map(pref => pref.selected_module).filter(Boolean);
        if (widgetIds.length > 0) {
          setSelectedWidgets(widgetIds);
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const handleSaveWidgets = async (widgets: string[]) => {
    setSelectedWidgets(widgets);

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save widget preferences.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete existing preferences
      await supabase
        .from('user_widget_preferences')
        .delete()
        .eq('user_id', user.id);

      // Insert new preferences
      const preferences = widgets.map(widgetId => ({
        user_id: user.id,
        widget_id: crypto.randomUUID(),
        selected_module: widgetId,
      }));

      const { error } = await supabase
        .from('user_widget_preferences')
        .insert(preferences);

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your widget preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error Saving Preferences",
        description: "There was a problem saving your widget preferences.",
        variant: "destructive",
      });
    }
  };

  const handleSOPDataReceived = (countData: SOPCountData, patternsData: SOPPatternData[]) => {
    setSOPCountData(countData);
    setSOPPatternsData(patternsData);
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'info-card-small':
        return <InfoCard key={widgetId} title="Revenue" value="$45,231" change={12} changeType="increase" size="small" />;
      case 'info-card-medium':
        return <InfoCard key={widgetId} title="Total Users" value="2,543" change={8} changeType="increase" size="medium" subtitle="Active this month" />;
      case 'info-card-large':
        return <InfoCard key={widgetId} title="Sales Performance" value="$123,456" change={-2} changeType="decrease" size="large" subtitle="Quarterly results" />;
      case 'line-chart':
        return <ChartWidget key={widgetId} type="line" title="Sales Trend" data={sampleLineData} />;
      case 'bar-chart':
        return <ChartWidget key={widgetId} type="bar" title="Product Performance" data={sampleBarData} />;
      case 'pie-chart':
        return <ChartWidget key={widgetId} type="pie" title="Traffic Sources" data={samplePieData} />;
      case 'data-table':
        return <DataTable key={widgetId} title="User Management" data={sampleTableData} columns={tableColumns} />;
      default:
        return null;
    }
  };

  const renderSOPWidgets = () => {
    const widgets = [];
    
    if (sopCountData) {
      widgets.push(
        <SOPWidget
          key="sop-count-bar"
          type="count"
          data={sopCountData}
          visualizationType="bar"
          title="SOP Deviation Count"
        />,
        <SOPWidget
          key="sop-count-pie"
          type="count"
          data={sopCountData}
          visualizationType="pie"
          title="SOP Compliance Overview"
        />
      );
    }
    
    if (sopPatternsData) {
      widgets.push(
        <SOPWidget
          key="sop-patterns-bar"
          type="patterns"
          data={sopPatternsData}
          visualizationType="bar"
          title="SOP Deviation Patterns (Bar)"
        />,
        <SOPWidget
          key="sop-patterns-line"
          type="patterns"
          data={sopPatternsData}
          visualizationType="line"
          title="SOP Deviation Patterns (Line)"
        />
      );
    }
    
    return widgets;
  };

  const allWidgets = [
    ...selectedWidgets.map(widgetId => renderWidget(widgetId)),
    ...renderSOPWidgets()
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSelectWidgets={() => setIsModalOpen(true)} />
      
      <main className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
            <p className="text-gray-600">
              Welcome back, {user?.email}! Customize your data visualization experience
            </p>
          </div>
          
          {allWidgets.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No widgets selected</h3>
                <p className="text-gray-600 mb-6">Choose widgets to personalize your dashboard experience or ask the chatbot for SOP deviation data</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Select Widgets
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allWidgets}
            </div>
          )}
        </div>
      </main>
      
      <WidgetSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWidgets}
        selectedWidgets={selectedWidgets}
      />
      
      <ChatBot onSOPDataReceived={handleSOPDataReceived} />
    </div>
  );
};

export default Index;
