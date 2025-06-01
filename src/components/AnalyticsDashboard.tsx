
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Database, Users, BarChart3 } from "lucide-react";

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: "System Status",
      value: "Operational",
      change: 100,
      trend: 'stable',
      icon: <CheckCircle className="h-8 w-8" />,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Active Widgets",
      value: 12,
      change: 8.5,
      trend: 'up',
      icon: <Activity className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Data Sources",
      value: "Connected",
      change: 0,
      trend: 'stable',
      icon: <Database className="h-8 w-8" />,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Active Users",
      value: 127,
      change: 12.3,
      trend: 'up',
      icon: <Users className="h-8 w-8" />,
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "API Calls",
      value: "1.2K",
      change: -2.1,
      trend: 'down',
      icon: <BarChart3 className="h-8 w-8" />,
      color: "from-yellow-500 to-orange-600"
    },
    {
      title: "Alerts",
      value: 3,
      change: -25,
      trend: 'down',
      icon: <AlertTriangle className="h-8 w-8" />,
      color: "from-orange-500 to-red-600"
    }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'stable') return 'text-gray-600';
    if (change > 0) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h2>
          <p className="text-lg text-gray-600">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Time</div>
            <div className="font-semibold text-gray-800">{currentTime.toLocaleTimeString()}</div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className={`bg-gradient-to-r ${metric.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">
                  {metric.title}
                </CardTitle>
                <div className="opacity-80">
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{metric.value}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${metric.change === 0 ? 'opacity-70' : ''}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
                {typeof metric.value === 'number' && metric.title.includes('Progress') && (
                  <Progress value={metric.value} className="w-16 bg-white/20" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health Indicators */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">99.9%</div>
          <div className="text-sm text-gray-600">Uptime</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">45ms</div>
          <div className="text-sm text-gray-600">Avg Response</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">2.1GB</div>
          <div className="text-sm text-gray-600">Data Processed</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">15</div>
          <div className="text-sm text-gray-600">Data Sources</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
