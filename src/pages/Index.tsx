
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataVisualizationWidget from "../components/widgets/DataVisualizationWidget";
import DataTable from "../components/widgets/DataTable";
import InfoCard from "../components/widgets/InfoCard";
import { ChevronRight } from "lucide-react";
import {
  fetchControlsIdentifiedCount,
  fetchSOPDeviationCount,
  fetchIncompleteCasesCount,
  fetchLongRunningCasesCount,
  fetchResourceSwitchesCount,
  fetchReworkActivitiesCount,
  fetchTimingViolationsCount,
} from "../services/dataService";
import { useMaximizeState } from "../hooks/useMaximizeState";

const Index = () => {
  const [controlsCount, setControlsCount] = useState<any[]>([]);
  const [sopDeviationCount, setSopDeviationCount] = useState(0);
  const [incompleteCasesCount, setIncompleteCasesCount] = useState(0);
  const [longRunningCasesCount, setLongRunningCasesCount] = useState(0);
  const [resourceSwitchesCount, setResourceSwitchesCount] = useState(0);
  const [reworkActivitiesCount, setReworkActivitiesCount] = useState(0);
  const [timingViolationsCount, setTimingViolationsCount] = useState(0);

  const [fmeaSummaryData, setFmeaSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toggleMaximize, isMaximized, minimizeAll } = useMaximizeState();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          controlsData,
          sopData,
          incompleteCasesCountData,
          longRunningCasesCountData,
          resourceSwitchesCountData,
          reworkActivitiesCountData,
          timingViolationsCountData,
        ] = await Promise.all([
          fetchControlsIdentifiedCount(),
          fetchSOPDeviationCount(),
          fetchIncompleteCasesCount(),
          fetchLongRunningCasesCount(),
          fetchResourceSwitchesCount(),
          fetchReworkActivitiesCount(),
          fetchTimingViolationsCount(),
        ]);

        setControlsCount(controlsData);
        setSopDeviationCount(sopData);
        setIncompleteCasesCount(incompleteCasesCountData);
        setLongRunningCasesCount(longRunningCasesCountData);
        setResourceSwitchesCount(resourceSwitchesCountData);
        setReworkActivitiesCount(reworkActivitiesCountData);
        setTimingViolationsCount(timingViolationsCountData);

        const fmeaSummaryRes = await fetch('/latest_fmea_summary.json');
        if (fmeaSummaryRes.ok) {
          const fmeaSummary = await fmeaSummaryRes.json();
          setFmeaSummaryData(fmeaSummary);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalControls = useMemo(() => {
    return controlsCount.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [controlsCount]);

  // Default widgets only - no auto-included or unexpected widgets
  const defaultWidgets = {
    "controls-identified-count": (
      <InfoCard
        title="Controls Identified Count"
        value={totalControls.toString()}
        subtitle="Total identified controls in the process"
        maximized={isMaximized("controls-identified-count")}
        widgetId="controls-identified-count"
        onToggleMaximize={() => toggleMaximize("controls-identified-count")}
      />
    ),
    "sop-deviation-count": (
      <InfoCard
        title="SOP Deviation Count"
        value={sopDeviationCount.toString()}
        subtitle="Standard operating procedure deviations"
        maximized={isMaximized("sop-deviation-count")}
        widgetId="sop-deviation-count"
        onToggleMaximize={() => toggleMaximize("sop-deviation-count")}
      />
    ),
    "incomplete-cases-count": (
      <InfoCard
        title="Incomplete Cases Count"
        value={incompleteCasesCount.toString()}
        subtitle="Cases that remain incomplete"
        maximized={isMaximized("incomplete-cases-count")}
        widgetId="incomplete-cases-count"
        onToggleMaximize={() => toggleMaximize("incomplete-cases-count")}
      />
    ),
    "long-running-cases-count": (
      <InfoCard
        title="Long-Running Cases Count"
        value={longRunningCasesCount.toString()}
        subtitle="Cases taking longer than expected"
        maximized={isMaximized("long-running-cases-count")}
        widgetId="long-running-cases-count"
        onToggleMaximize={() => toggleMaximize("long-running-cases-count")}
      />
    ),
    "resource-switches-count": (
      <InfoCard
        title="Resource Switches Count"
        value={resourceSwitchesCount.toString()}
        subtitle="Resource handovers in processes"
        maximized={isMaximized("resource-switches-count")}
        widgetId="resource-switches-count"
        onToggleMaximize={() => toggleMaximize("resource-switches-count")}
      />
    ),
    "rework-activities-count": (
      <InfoCard
        title="Rework Activities Count"
        value={reworkActivitiesCount.toString()}
        subtitle="Activities that required rework"
        maximized={isMaximized("rework-activities-count")}
        widgetId="rework-activities-count"
        onToggleMaximize={() => toggleMaximize("rework-activities-count")}
      />
    ),
    "timing-violations-count": (
      <InfoCard
        title="Timing Violations Count"
        value={timingViolationsCount.toString()}
        subtitle="Identified timing violations"
        maximized={isMaximized("timing-violations-count")}
        widgetId="timing-violations-count"
        onToggleMaximize={() => toggleMaximize("timing-violations-count")}
      />
    ),
    "controls-visualization": (
      <DataVisualizationWidget
        type="bar"
        title="Controls Distribution"
        data={controlsCount}
        maximized={isMaximized("controls-visualization")}
        widgetId="controls-visualization"
        onToggleMaximize={() => toggleMaximize("controls-visualization")}
      />
    )
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 enterprise-card max-w-md">
          <div className="text-red-400 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Error Loading Data</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Process Mining Analytics Dashboard
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-3xl">
            Comprehensive insights into mortgage process performance, compliance, and optimization opportunities.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800/50 border border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Compliance
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="risk"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Risk Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="enterprise-card p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
                Key Performance Indicators
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {defaultWidgets["controls-identified-count"]}
                {defaultWidgets["sop-deviation-count"]}
                {defaultWidgets["incomplete-cases-count"]}
                {defaultWidgets["long-running-cases-count"]}
              </div>
            </div>

            <div className="enterprise-card p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
                Resource & Activity Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultWidgets["resource-switches-count"]}
                {defaultWidgets["rework-activities-count"]}
                {defaultWidgets["timing-violations-count"]}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              {defaultWidgets["controls-visualization"]}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-8">
            <div className="enterprise-card p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-4"></div>
                Compliance Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {defaultWidgets["controls-identified-count"]}
                {defaultWidgets["sop-deviation-count"]}
                {defaultWidgets["timing-violations-count"]}
              </div>
              {defaultWidgets["controls-visualization"]}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            <div className="enterprise-card p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-4"></div>
                Performance Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {defaultWidgets["incomplete-cases-count"]}
                {defaultWidgets["long-running-cases-count"]}
                {defaultWidgets["resource-switches-count"]}
                {defaultWidgets["rework-activities-count"]}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-8">
            <div className="enterprise-card p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-rose-500 rounded-full mr-4"></div>
                Risk Analysis Dashboard
              </h2>
              {fmeaSummaryData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <InfoCard
                    title="RPN Score"
                    value={fmeaSummaryData.rpn.toString()}
                    subtitle={`${fmeaSummaryData.risk_level} Risk`}
                    maximized={isMaximized("rpn-score")}
                    widgetId="rpn-score"
                    onToggleMaximize={() => toggleMaximize("rpn-score")}
                  />
                  <InfoCard
                    title="Severity Rating"
                    value={fmeaSummaryData.severity_rating.toString()}
                    subtitle="Impact Assessment"
                    maximized={isMaximized("severity-rating")}
                    widgetId="severity-rating"
                    onToggleMaximize={() => toggleMaximize("severity-rating")}
                  />
                  <InfoCard
                    title="Likelihood Rating"
                    value={fmeaSummaryData.likelihood_rating.toString()}
                    subtitle="Probability Score"
                    maximized={isMaximized("likelihood-rating")}
                    widgetId="likelihood-rating"
                    onToggleMaximize={() => toggleMaximize("likelihood-rating")}
                  />
                </div>
              )}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-100 mb-4">Quick Access to Risk Analysis Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    to="/fmea"
                    className="group p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                          FMEA Analysis
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Detailed failure mode analysis
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                  <Link
                    to="/outlier-analysis"
                    className="group p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                          Outlier Analysis
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Statistical anomaly detection
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                  <Link
                    to="/predictive-risk"
                    className="group p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                          Predictive Risk
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          AI-powered risk prediction
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
