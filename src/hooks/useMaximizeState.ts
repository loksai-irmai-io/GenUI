
import { useState } from 'react';

export const useMaximizeState = () => {
  const [maximizedWidgets, setMaximizedWidgets] = useState<Set<string>>(new Set());

  const toggleMaximize = (widgetId: string) => {
    setMaximizedWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  const isMaximized = (widgetId: string) => maximizedWidgets.has(widgetId);

  const minimizeAll = () => {
    setMaximizedWidgets(new Set());
  };

  return {
    toggleMaximize,
    isMaximized,
    minimizeAll,
    maximizedCount: maximizedWidgets.size
  };
};
