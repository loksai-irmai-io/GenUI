
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WidgetRefreshContextType {
  refreshAll: () => void;
  isRefreshing: boolean;
  refreshWidget: (widgetId: string) => void;
}

const WidgetRefreshContext = createContext<WidgetRefreshContextType | undefined>(undefined);

interface WidgetRefreshProviderProps {
  children: ReactNode;
}

export const WidgetRefreshProvider: React.FC<WidgetRefreshProviderProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const refreshWidget = async (widgetId: string) => {
    console.log(`Refreshing widget: ${widgetId}`);
    // Individual widget refresh logic can be added here
  };

  return (
    <WidgetRefreshContext.Provider value={{ refreshAll, isRefreshing, refreshWidget }}>
      {children}
    </WidgetRefreshContext.Provider>
  );
};

export const useWidgetRefresh = () => {
  const context = useContext(WidgetRefreshContext);
  if (context === undefined) {
    throw new Error('useWidgetRefresh must be used within a WidgetRefreshProvider');
  }
  return context;
};
