
import React, { createContext, useContext, useState, useCallback } from 'react';

interface WidgetRefreshContextType {
  refreshWidget: (widgetId: string) => void;
  refreshingWidgets: Set<string>;
  refreshAll: () => void;
}

const WidgetRefreshContext = createContext<WidgetRefreshContextType | undefined>(undefined);

export const useWidgetRefresh = () => {
  const context = useContext(WidgetRefreshContext);
  if (!context) {
    throw new Error('useWidgetRefresh must be used within a WidgetRefreshProvider');
  }
  return context;
};

export const WidgetRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshingWidgets, setRefreshingWidgets] = useState<Set<string>>(new Set());

  const refreshWidget = useCallback((widgetId: string) => {
    setRefreshingWidgets(prev => new Set([...prev, widgetId]));
    
    // Simulate refresh time
    setTimeout(() => {
      setRefreshingWidgets(prev => {
        const newSet = new Set(prev);
        newSet.delete(widgetId);
        return newSet;
      });
      
      // Trigger refresh event
      window.dispatchEvent(new CustomEvent('refreshWidget', { detail: { widgetId } }));
    }, 1000);
  }, []);

  const refreshAll = useCallback(() => {
    window.dispatchEvent(new CustomEvent('refreshAllWidgets'));
  }, []);

  const value = {
    refreshWidget,
    refreshingWidgets,
    refreshAll
  };

  return (
    <WidgetRefreshContext.Provider value={value}>
      {children}
    </WidgetRefreshContext.Provider>
  );
};
