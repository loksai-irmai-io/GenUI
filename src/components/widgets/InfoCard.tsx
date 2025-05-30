
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InfoCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  subtitle?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  size = 'medium',
  subtitle 
}) => {
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const textSizes = {
    small: { title: 'text-sm', value: 'text-2xl', subtitle: 'text-xs' },
    medium: { title: 'text-base', value: 'text-3xl', subtitle: 'text-sm' },
    large: { title: 'text-lg', value: 'text-4xl', subtitle: 'text-base' }
  };

  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${sizeClasses[size]}`}>
      <div className="space-y-2">
        <h3 className={`font-medium text-gray-600 ${textSizes[size].title}`}>{title}</h3>
        <div className={`font-bold text-gray-900 ${textSizes[size].value}`}>{value}</div>
        {subtitle && (
          <p className={`text-gray-500 ${textSizes[size].subtitle}`}>{subtitle}</p>
        )}
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoCard;
