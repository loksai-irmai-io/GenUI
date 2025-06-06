import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, TrendingUp, Target, Shield, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMaximizeState } from "../hooks/useMaximizeState";
import DataTable from "@/components/widgets/DataTable";

interface FMEASummary {
  timestamp: string;
  datetime: string;
  severity_rating: number;
  likelihood_rating: number;
  detectability_rating: number;
  rpn: number;
  risk_level: string;
}

interface FMEATableItem {
  process: string;
  step: string;
  failure_mode: string;
  effect: string;
  cause: string;
}

interface RatingAnalysis {
  failure_mode: string;
  severity_score?: number;
  likelihood_score?: number;
  detectability_score?: number;
  severity_label?: string;
  justification: string;
}

interface FMEACompleteResults {
  timestamp: string;
  datetime: string;
  workflow_status: string;
  fmea_analysis: {
    full_analysis: string;
    table_data: FMEATableItem[];
  };
  ratings: {
    severity: {
      rating: number;
      full_response: string;
      table_data: RatingAnalysis[];
    };
    likelihood: {
      rating: number;
      full_response: string;
      table_data: RatingAnalysis[];
    };
    detectability: {
      rating: number;
      full_response: string;
      table_data: RatingAnalysis[];
    };
  };
  risk_assessment: {
    rpn: number;
    risk_level: string;
    individual_ratings: {
      S: number;
      L: number;
      D: number;
    };
  };
}

const FMEA = () => {
  const [summaryData, setSummaryData] = useState<FMEASummary | null>(null);
  const [tableData, setTableData] = useState<FMEATableItem[]>([]);
  const [detailedResults, setDetailedResults] = useState<FMEACompleteResults | null>(null);
  const [severityData, setSeverityData] = useState<RatingAnalysis[]>([]);
  const [likelihoodData, setLikelihoodData] = useState<RatingAnalysis[]>([]);
  const [detectabilityData, setDetectabilityData] = useState<RatingAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const { toggleMaximize, isMaximized, minimizeAll } = useMaximizeState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryResponse = await fetch('/latest_fmea_summary.json');
        const summary = await summaryResponse.json();
        setSummaryData(summary);

        const tableResponse = await fetch('/fmea_table_20250605_221129.json');
        const table = await tableResponse.json();
        setTableData(table);

        const detailedResponse = await fetch('/fmea_complete_results_20250605_221129.json');
        const detailed = await detailedResponse.json();
        setDetailedResults(detailed);

        if (detailed.ratings.severity.full_response) {
          const severityMatch = detailed.ratings.severity.full_response.match(/```json\n([\s\S]*?)\n```/);
          if (severityMatch) {
            setSeverityData(JSON.parse(severityMatch[1]));
          }
        }

        if (detailed.ratings.likelihood.full_response) {
          const likelihoodMatch = detailed.ratings.likelihood.full_response.match(/```json\n([\s\S]*?)\n```/);
          if (likelihoodMatch) {
            setLikelihoodData(JSON.parse(likelihoodMatch[1]));
          }
        }

        if (detailed.ratings.detectability.full_response) {
          const detectabilityMatch = detailed.ratings.detectability.full_response.match(/```json\n([\s\S]*?)\n```/);
          if (detectabilityMatch) {
            setDetectabilityData(JSON.parse(detectabilityMatch[1]));
          }
        }
      } catch (error) {
        console.error('Error fetching FMEA data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (score: number) => {
    if (score <= 3) return '#10b981';
    if (score <= 6) return '#f59e0b';
    if (score <= 8) return '#f97316';
    return '#ef4444';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading FMEA data...</div>;
  }

  const dashboardData = summaryData ? [
    { name: 'Severity', value: summaryData.severity_rating, color: getSeverityColor(summaryData.severity_rating) },
    { name: 'Likelihood', value: summaryData.likelihood_rating, color: getSeverityColor(summaryData.likelihood_rating) },
    { name: 'Detectability', value: summaryData.detectability_rating, color: getSeverityColor(summaryData.detectability_rating) }
  ] : [];

  const TableCard = ({ title, description, data, columns, widgetId }: any) => {
    return (
      <DataTable
        title={title}
        data={data}
        columns={columns.map((col: string) => ({
          key: col.toLowerCase().replace(' ', '_'),
          label: col
        }))}
        maximized={isMaximized(widgetId)}
        widgetId={widgetId}
        onToggleMaximize={() => toggleMaximize(widgetId)}
      />
    );
  };

  const MetricCard = ({ icon: Icon, title, value, subtitle, color, widgetId }: any) => {
    const maximized = isMaximized(widgetId);
    
    return (
      <Card 
        className={`bg-slate-800 border-slate-700 transition-all duration-300 ${
          maximized ? "fixed inset-4 z-50 flex items-center justify-center animate-scale-in" : ""
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMaximize(widgetId)}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            >
              {maximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`${maximized ? "text-center py-12" : ""}`}>
            <div className={`font-bold text-slate-100 ${maximized ? "text-8xl mb-8" : "text-2xl"}`}>
              {value}
            </div>
            {subtitle && (
              <div className={maximized ? "text-2xl" : ""}>
                {typeof subtitle === 'string' ? (
                  <p className={`text-xs text-slate-400 ${maximized ? "text-2xl mt-4" : "mt-1"}`}>
                    {subtitle}
                  </p>
                ) : (
                  <Badge 
                    className={`mt-2 ${maximized ? "text-xl px-6 py-2" : ""}`}
                    style={{ backgroundColor: color }}
                  >
                    {subtitle.props ? subtitle.props.children : subtitle}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ChartCard = ({ title, description, children, widgetId }: any) => {
    const maximized = isMaximized(widgetId);
    
    return (
      <Card 
        className={`bg-slate-800 border-slate-700 transition-all duration-300 ${
          maximized ? "fixed inset-4 z-50 animate-scale-in overflow-auto" : ""
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">{title}</CardTitle>
              <CardDescription className="text-slate-400">{description}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMaximize(widgetId)}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            >
              {maximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className={maximized ? "h-[600px]" : "h-[300px]"}>
            {children}
          </ChartContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">FMEA Analysis</h1>
          <p className="text-slate-400">Failure Mode and Effects Analysis Dashboard</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">Dashboard</TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">FMEA Analysis</TabsTrigger>
          <TabsTrigger value="ratings" className="data-[state=active]:bg-blue-600">Detailed Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryData && (
              <>
                <MetricCard
                  icon={TrendingUp}
                  title="RPN Score"
                  value={summaryData.rpn}
                  subtitle={
                    <Badge 
                      className="mt-2" 
                      style={{ backgroundColor: getRiskLevelColor(summaryData.risk_level) }}
                    >
                      {summaryData.risk_level} Risk
                    </Badge>
                  }
                  color={getRiskLevelColor(summaryData.risk_level)}
                  widgetId="rpn-score"
                />
                <MetricCard
                  icon={Shield}
                  title="Severity"
                  value={summaryData.severity_rating}
                  subtitle="Impact Assessment"
                  widgetId="severity-rating"
                />
                <MetricCard
                  icon={Target}
                  title="Likelihood"
                  value={summaryData.likelihood_rating}
                  subtitle="Probability Score"
                  widgetId="likelihood-rating"
                />
                <MetricCard
                  icon={AlertTriangle}
                  title="Detectability"
                  value={summaryData.detectability_rating}
                  subtitle="Detection Score"
                  widgetId="detectability-rating"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Risk Rating Distribution"
              description="Severity, Likelihood, and Detectability scores"
              widgetId="risk-distribution-chart"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {summaryData && (
              <ChartCard
                title="Risk Level Breakdown"
                description={`Current risk assessment: ${summaryData.risk_level}`}
                widgetId="risk-breakdown-chart"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Current Risk', value: summaryData.rpn, fill: getRiskLevelColor(summaryData.risk_level) },
                        { name: 'Remaining', value: Math.max(0, 1000 - summaryData.rpn), fill: '#374151' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <TableCard
            title="FMEA Analysis Table"
            description="Detailed failure mode and effects analysis"
            data={tableData}
            columns={["Process", "Step", "Failure Mode", "Effect", "Cause"]}
            widgetId="fmea-analysis-table"
          />
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <TableCard
            title="Severity Analysis"
            description="Impact assessment of failure modes"
            data={severityData}
            columns={["Failure Mode", "Severity Score", "Severity Label", "Justification"]}
            widgetId="severity-analysis-table"
          />

          <TableCard
            title="Likelihood Analysis"
            description="Probability assessment of failure modes"
            data={likelihoodData}
            columns={["Failure Mode", "Likelihood Score", "Justification"]}
            widgetId="likelihood-analysis-table"
          />

          <TableCard
            title="Detectability Analysis"
            description="Detection capability assessment of failure modes"
            data={detectabilityData}
            columns={["Failure Mode", "Detectability Score", "Justification"]}
            widgetId="detectability-analysis-table"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FMEA;
