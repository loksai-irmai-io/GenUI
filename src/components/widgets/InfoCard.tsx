
import React from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  maximized?: boolean;
  widgetId?: string;
  isMinimized?: boolean;
  onToggleMaximize?: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  subtitle,
  maximized = false,
  widgetId,
  isMinimized = false,
  onToggleMaximize,
}) => {
  // If minimized, show compact tile
  if (isMinimized) {
    return (
      <div
        className="enterprise-card p-4 cursor-pointer hover:bg-slate-700/30 transition-all duration-300 transform hover:scale-105"
        onClick={onToggleMaximize}
        tabIndex={0}
        aria-label={`${title} - Click to maximize`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100 tracking-tight truncate">{title}</h3>
          <Maximize className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-sm text-slate-400 mt-2">Click to expand metric</p>
      </div>
    );
  }

  return (
    <div
      className={`enterprise-card p-6 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none transition-all duration-300 ${
        maximized ? "fixed inset-4 z-50 flex items-center justify-center animate-scale-in" : ""
      }`}
      tabIndex={0}
      aria-label={title}
    >
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-100 tracking-tight">{title}</h3>
          {onToggleMaximize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMaximize}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              aria-label={maximized ? "Minimize" : "Maximize"}
            >
              {maximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          )}
        </div>
        <div className={`text-center ${maximized ? "py-12" : ""}`}>
          <div className={`font-bold text-blue-400 ${maximized ? "text-8xl mb-8" : "text-4xl mb-2"}`}>
            {value}
          </div>
          {subtitle && (
            <p className={`text-slate-300 ${maximized ? "text-2xl" : "text-base"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
