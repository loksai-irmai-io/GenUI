
import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InfoCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  size?: "small" | "medium" | "large";
  subtitle?: string;
  maximized?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  size = "medium",
  subtitle,
  maximized,
}) => {
  const sizeClasses = {
    small: "p-4",
    medium: "p-6",
    large: "p-8",
  };

  const textSizes = {
    small: { title: "text-sm", value: "text-2xl", subtitle: "text-xs" },
    medium: { title: "text-base", value: "text-3xl", subtitle: "text-sm" },
    large: { title: "text-lg", value: "text-4xl", subtitle: "text-base" },
  };

  const getTrendIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "decrease":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case "increase":
        return "text-emerald-400";
      case "decrease":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div
      className={`enterprise-card${
        maximized ? " max-w-2xl" : ""
      } ${
        sizeClasses[size]
      } focus-visible:ring-2 focus-visible:ring-blue-400 outline-none`}
      tabIndex={0}
      aria-label={`${title}: ${value}`}
    >
      <div className="space-y-3">
        <h3 className={`font-semibold text-slate-300 ${textSizes[size].title} tracking-tight`}>
          {title}
        </h3>
        <div className={`font-bold text-slate-100 ${textSizes[size].value}`}>
          {value}
        </div>
        {subtitle && (
          <p className={`text-slate-400 ${textSizes[size].subtitle}`}>
            {subtitle}
          </p>
        )}
        {change !== undefined && (
          <div className={`flex items-center space-x-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoCard;
