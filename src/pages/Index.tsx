
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import WidgetSelectionModal from '../components/WidgetSelectionModal';
import InfoCard from '../components/widgets/InfoCard';
import ChartWidget from '../components/widgets/ChartWidget';
import DataTable from '../components/widgets/DataTable';
import ChatBot from '../components/ChatBot';
import DynamicAPIWidget from '../components/widgets/DynamicAPIWidget';
import { useAuth } from '@/hooks/useAuth';
import { widgetService, UserWidgetPreference } from '@/services/widgetService';
import { useToast } from '@/hooks/use-toast';

// Sample data for legacy widgets
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
  const [userWidgetPreferences, setUserWidgetPreferences] = useState<UserWidgetPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserWidgetPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserWidgetPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const preferences = await widgetService.getUserWidgetPreferences(user.id);
      console.log('Loaded user preferences:', preferences);
      setUserWidgetPreferences(preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
      toast({
        title: "Error Loading Preferences",
        description: "Failed to load your widget preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWidgets = async (widgetNames: string[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save widget preferences.",
        variant: "destructive",
      });
      return;
    }

    try {
      await widgetService.saveUserWidgetPreferences(user.id, widgetNames);
      await loadUserWidgetPreferences();
      
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

  const renderWidget = (widgetName: string, index: number) => {
    const key = `${widgetName}-${index}`;
    
    switch (widgetName) {
      // Legacy static widgets
      case 'info-card-small':
        return <InfoCard key={key} title="Revenue" value="$45,231" change={12} changeType="increase" size="small" />;
      case 'info-card-medium':
        return <InfoCard key={key} title="Total Users" value="2,543" change={8} changeType="increase" size="medium" subtitle="Active this month" />;
      case 'info-card-large':
        return <InfoCard key={key} title="Sales Performance" value="$123,456" change={-2} changeType="decrease" size="large" subtitle="Quarterly results" />;
      case 'line-chart':
        return <ChartWidget key={key} type="line" title="Sales Trend" data={sampleLineData} />;
      case 'bar-chart':
        return <ChartWidget key={key} type="bar" title="Product Performance" data={sampleBarData} />;
      case 'pie-chart':
        return <ChartWidget key={key} type="pie" title="Traffic Sources" data={samplePieData} />;
      case 'data-table':
        return <DataTable key={key} title="User Management" data={sampleTableData} columns={tableColumns} />;
      
      // New dynamic API widgets
      case 'Object Type Metrics':
        return <DynamicAPIWidget key={key} widgetType="sop-deviation-count" title="SOP Deviation Count" visualizationType="bar" />;
      case 'Case Complexity Outliers (Z-Score & Event Count)':
        return <DynamicAPIWidget key={key} widgetType="case-complexity" title="Case Complexity Analysis" visualizationType="table" />;
      case 'Distribution of Time Gaps: Application Submission → Initial Assessment':
        return <DynamicAPIWidget key={key} widgetType="timing-analysis" title="Timing Analysis" visualizationType="table" />;
      case 'Rework Instances by Excess':
        return <DynamicAPIWidget key={key} widgetType="rework-activities" title="Rework Activities Count" visualizationType="bar" />;
      case 'Resource Summary Table':
        return <DynamicAPIWidget key={key} widgetType="resource-performance" title="Resource Performance" visualizationType="table" />;
      case 'Activity Duration Outliers (Based on Timing Violations)':
        return <DynamicAPIWidget key={key} widgetType="timing-violations" title="Timing Violations Count" visualizationType="bar" />;
      case 'Distribution of Gap Violation Severity (All Patterns)':
        return <DynamicAPIWidget key={key} widgetType="sop-deviation-patterns" title="SOP Deviation Patterns" visualizationType="table" />;
      case 'Overall Incomplete Cases by Time Since Last Event':
        return <DynamicAPIWidget key={key} widgetType="incomplete-cases" title="Incomplete Cases Count" visualizationType="bar" />;
      case 'Cases by Resource Switch Count (All Patterns)':
        return <DynamicAPIWidget key={key} widgetType="resource-switches" title="Resource Switches Count" visualizationType="bar" />;
      case 'Resource Performance (Avg Step Duration)':
        return <DynamicAPIWidget key={key} widgetType="resource-performance" title="Resource Performance Summary" visualizationType="table" />;
      
      default:
        return null;
    }
  };

  // Get selected widget names for the modal
  const selectedWidgetNames = userWidgetPreferences.map(pref => pref.widget.widget_name);
  
  // Render widgets from user preferences
  const userWidgets = userWidgetPreferences.map((pref, index) => 
    renderWidget(pref.widget.widget_name, index)
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSelectWidgets={() => setIsModalOpen(true)} />
      
      <main className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
            <p className="text-gray-600">
              Welcome back, {user?.email}! Your data is fetched dynamically from API endpoints
            </p>
          </div>
          
          {userWidgets.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No widgets selected</h3>
                <p className="text-gray-600 mb-6">Choose widgets to personalize your dashboard with real-time API data</p>
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
              {userWidgets}
            </div>
          )}
        </div>
      </main>
      
      <WidgetSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWidgets}
        selectedWidgets={selectedWidgetNames}
      />
      
      <ChatBot onDataReceived={() => {}} />
    </div>
  );
};

export default Index;
