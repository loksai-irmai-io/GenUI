
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, TrendingUp, Target, Shield } from "lucide-react";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch summary data
        const summaryResponse = await fetch('/latest_fmea_summary.json');
        const summary = await summaryResponse.json();
        setSummaryData(summary);

        // Fetch table data
        const tableResponse = await fetch('/fmea_table_20250605_221129.json');
        const table = await tableResponse.json();
        setTableData(table);

        // Fetch detailed results
        const detailedResponse = await fetch('/fmea_complete_results_20250605_221129.json');
        const detailed = await detailedResponse.json();
        setDetailedResults(detailed);

        // Parse rating data from JSON strings
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
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">RPN Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-100">{summaryData.rpn}</div>
                    <Badge 
                      className="mt-2" 
                      style={{ backgroundColor: getRiskLevelColor(summaryData.risk_level) }}
                    >
                      {summaryData.risk_level} Risk
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">Severity</CardTitle>
                    <Shield className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-100">{summaryData.severity_rating}</div>
                    <p className="text-xs text-slate-400 mt-1">Impact Assessment</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">Likelihood</CardTitle>
                    <Target className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-100">{summaryData.likelihood_rating}</div>
                    <p className="text-xs text-slate-400 mt-1">Probability Score</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">Detectability</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-100">{summaryData.detectability_rating}</div>
                    <p className="text-xs text-slate-400 mt-1">Detection Score</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Risk Rating Distribution</CardTitle>
                <CardDescription className="text-slate-400">
                  Severity, Likelihood, and Detectability scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {summaryData && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Risk Level Breakdown</CardTitle>
                  <CardDescription className="text-slate-400">
                    Current risk assessment: {summaryData.risk_level}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
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
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">FMEA Analysis Table</CardTitle>
              <CardDescription className="text-slate-400">
                Detailed failure mode and effects analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tableData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-200">Process</TableHead>
                      <TableHead className="text-slate-200">Step</TableHead>
                      <TableHead className="text-slate-200">Failure Mode</TableHead>
                      <TableHead className="text-slate-200">Effect</TableHead>
                      <TableHead className="text-slate-200">Cause</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((item, index) => (
                      <TableRow key={index} className="border-slate-700">
                        <TableCell className="text-slate-300">{item.process}</TableCell>
                        <TableCell className="text-slate-300">{item.step}</TableCell>
                        <TableCell className="text-slate-300">{item.failure_mode}</TableCell>
                        <TableCell className="text-slate-300">{item.effect}</TableCell>
                        <TableCell className="text-slate-300">{item.cause}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No FMEA analysis data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          {/* Severity Analysis */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Severity Analysis</CardTitle>
              <CardDescription className="text-slate-400">
                Impact assessment of failure modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-200">Failure Mode</TableHead>
                    <TableHead className="text-slate-200">Score</TableHead>
                    <TableHead className="text-slate-200">Label</TableHead>
                    <TableHead className="text-slate-200">Justification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {severityData.map((item, index) => (
                    <TableRow key={index} className="border-slate-700">
                      <TableCell className="text-slate-300">{item.failure_mode}</TableCell>
                      <TableCell className="text-slate-300">
                        <Badge style={{ backgroundColor: getSeverityColor(item.severity_score || 0) }}>
                          {item.severity_score}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{item.severity_label}</TableCell>
                      <TableCell className="text-slate-300">{item.justification}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Likelihood Analysis */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Likelihood Analysis</CardTitle>
              <CardDescription className="text-slate-400">
                Probability assessment of failure modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-200">Failure Mode</TableHead>
                    <TableHead className="text-slate-200">Score</TableHead>
                    <TableHead className="text-slate-200">Justification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {likelihoodData.map((item, index) => (
                    <TableRow key={index} className="border-slate-700">
                      <TableCell className="text-slate-300">{item.failure_mode}</TableCell>
                      <TableCell className="text-slate-300">
                        <Badge style={{ backgroundColor: getSeverityColor(item.likelihood_score || 0) }}>
                          {item.likelihood_score}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{item.justification}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detectability Analysis */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Detectability Analysis</CardTitle>
              <CardDescription className="text-slate-400">
                Detection capability assessment of failure modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-200">Failure Mode</TableHead>
                    <TableHead className="text-slate-200">Score</TableHead>
                    <TableHead className="text-slate-200">Justification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detectabilityData.map((item, index) => (
                    <TableRow key={index} className="border-slate-700">
                      <TableCell className="text-slate-300">{item.failure_mode}</TableCell>
                      <TableCell className="text-slate-300">
                        <Badge style={{ backgroundColor: getSeverityColor(item.detectability_score || 0) }}>
                          {item.detectability_score}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{item.justification}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FMEA;
