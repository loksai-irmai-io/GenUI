
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Eye, MousePointer, Clock, Target } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 65000, target: 60000 },
  { month: 'Feb', revenue: 72000, target: 65000 },
  { month: 'Mar', revenue: 68000, target: 70000 },
  { month: 'Apr', revenue: 85000, target: 75000 },
  { month: 'May', revenue: 91000, target: 80000 },
  { month: 'Jun', revenue: 87000, target: 85000 },
];

const userEngagementData = [
  { day: 'Mon', sessions: 1240, pageViews: 3650, bounceRate: 32 },
  { day: 'Tue', sessions: 1380, pageViews: 4120, bounceRate: 28 },
  { day: 'Wed', sessions: 1150, pageViews: 3400, bounceRate: 35 },
  { day: 'Thu', sessions: 1520, pageViews: 4890, bounceRate: 25 },
  { day: 'Fri', sessions: 1680, pageViews: 5200, bounceRate: 22 },
  { day: 'Sat', sessions: 890, pageViews: 2650, bounceRate: 40 },
  { day: 'Sun', sessions: 750, pageViews: 2200, bounceRate: 45 },
];

const trafficSourceData = [
  { name: 'Organic Search', value: 42, color: '#3b82f6' },
  { name: 'Direct', value: 28, color: '#10b981' },
  { name: 'Social Media', value: 18, color: '#f59e0b' },
  { name: 'Email', value: 8, color: '#ef4444' },
  { name: 'Referral', value: 4, color: '#8b5cf6' },
];

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Revenue and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="enterprise-card">
          <CardHeader className="enterprise-card-header">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Revenue vs Target
            </CardTitle>
            <CardDescription>Monthly revenue performance compared to targets</CardDescription>
          </CardHeader>
          <CardContent className="enterprise-card-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#e2e8f0" name="Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="enterprise-card-header">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-green-600" />
              User Engagement
            </CardTitle>
            <CardDescription>Daily sessions and page views tracking</CardDescription>
          </CardHeader>
          <CardContent className="enterprise-card-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userEngagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Sessions"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pageViews" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Page Views"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources and KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="enterprise-card">
          <CardHeader className="enterprise-card-header">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MousePointer className="w-5 h-5 text-purple-600" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Distribution of website traffic by source</CardDescription>
          </CardHeader>
          <CardContent className="enterprise-card-content">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="enterprise-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900">4m 32s</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    +18% vs last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900">28.5%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <Target className="w-4 h-4 mr-1" />
                    -5.2% improvement
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">425.8K</p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Eye className="w-4 h-4 mr-1" />
                    +12.3% this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Goal Completion</p>
                  <p className="text-2xl font-bold text-gray-900">87.2%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <Activity className="w-4 h-4 mr-1" />
                    Above target
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
