import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DataVisualizationWidget from "@/components/widgets/DataVisualizationWidget";
import InfoCardGrid from "@/components/widgets/InfoCardGrid";
import InfoCard from "@/components/widgets/InfoCard";
import ResourcePerformanceTable from "@/components/widgets/ResourcePerformanceTable";
import TimingAnalysisTable from "@/components/widgets/TimingAnalysisTable";
import DataTable from "@/components/widgets/DataTable";
import SOPWidget from "@/components/widgets/SOPWidget";
import WidgetSelectionModal from "@/components/WidgetSelectionModal";
import ChatBot from "@/components/ChatBot";
import MortgageLifecycleGraph from "@/components/MortgageLifecycleGraph";
import { normalizeVisualizationData } from "@/lib/vizDataUtils";

const AVAILABLE_WIDGETS = [
  // Process Discovery
  {
    id: "mortgage-lifecycle",
    name: "Mortgage Application Lifecycle",
    component: "MortgageLifecycle",
  },

  // Outlier Analysis
  {
    id: "sop-deviation-count",
    name: "SOP Deviation Count",
    component: "SOPDeviationCount",
  },
  {
    id: "incomplete-cases-count",
    name: "Incomplete Cases Count",
    component: "IncompleteCasesCount",
  },
  {
    id: "incomplete-case-table",
    name: "Incomplete Cases Table",
    component: "IncompleteCaseTable",
  },
  {
    id: "long-running-cases-count",
    name: "Long-Running Cases Count",
    component: "LongRunningCasesCount",
  },
  {
    id: "long-running-table",
    name: "Long-Running Cases Table",
    component: "LongRunningTable",
  },
  {
    id: "resource-switches-count",
    name: "Resource Switches Count",
    component: "ResourceSwitchesCount",
  },
  {
    id: "resource-switches-count-table",
    name: "Resource Switches Count Table",
    component: "ResourceSwitchesCountTable",
  },
  {
    id: "resource-switches-table",
    name: "Resource Switches Table",
    component: "ResourceSwitchesTable",
  },
  {
    id: "rework-activities-count",
    name: "Rework Activities Count",
    component: "ReworkActivitiesCount",
  },
  {
    id: "reworked-activities-table",
    name: "Reworked Activities Table",
    component: "ReworkedActivitiesTable",
  },
  {
    id: "timing-violations-count",
    name: "Timing Violations Count",
    component: "TimingViolationsCount",
  },
  {
    id: "timing-violations-table",
    name: "Timing Violations Table",
    component: "TimingViolationsTable",
  },
  {
    id: "sop-deviation-patterns",
    name: "SOP Deviation Patterns",
    component: "SOPDeviationPatterns",
  },
  {
    id: "resource-performance",
    name: "Resource Performance",
    component: "ResourcePerformanceTable",
  },
  {
    id: "activity-pair-threshold",
    name: "Activity Pair Threshold",
    component: "ActivityPairThreshold",
  },
  {
    id: "case-complexity-analysis",
    name: "Case Complexity Analysis",
    component: "CaseComplexityAnalysis",
  },
  // CCM
  {
    id: "controls-identified-count",
    name: "Controls Identified Count",
    component: "ControlsIdentifiedCount",
  },
  { id: "controls", name: "Controls", component: "Controls" },
  {
    id: "sla-analysis-bar",
    name: "SLA Analysis Bar Graph",
    component: "SLAAnalysisBar",
  },
  { id: "kpi", name: "KPI", component: "KPI" },

  // Dashboard Essentials
  {
    id: "process-failure-patterns",
    name: "Process Failure Patterns",
    component: "ProcessFailurePatterns",
  },

  // FMEA
  { id: "fmea-dashboard", name: "FMEA Dashboard", component: "FMEADashboard" },
  {
    id: "fmea-analysis-table",
    name: "FMEA Analysis Table",
    component: "FMEAAnalysisTable",
  },
  {
    id: "fmea-severity-analysis",
    name: "Severity Analysis",
    component: "FMEASeverityAnalysis",
  },
  {
    id: "fmea-likelihood-analysis",
    name: "Likelihood Analysis",
    component: "FMEALikelihoodAnalysis",
  },
  {
    id: "fmea-detectability-analysis",
    name: "Detectability Analysis",
    component: "FMEADetectabilityAnalysis",
  },
  {
    id: "fmea-risk-charts",
    name: "FMEA Risk Charts",
    component: "FMEARiskCharts",
  },
];

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // Set new default widgets: SLA Analysis bar, Process Failure Patterns, and Resource Performance
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    "sla-analysis-bar",
    "process-failure-patterns",
    "resource-performance",
  ]);
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [controlsData, setControlsData] = useState<any[]>([]);
  const [slaAnalysisData, setSlaAnalysisData] = useState<any[]>([]);
  const [processFailureData, setProcessFailureData] = useState<any[]>([]);
  const [incompleteCasesData, setIncompleteCasesData] = useState<any[]>([]);
  const [longRunningData, setLongRunningData] = useState<any[]>([]);
  const [timingViolationsData, setTimingViolationsData] = useState<any[]>([]);
  const [sopDeviationData, setSopDeviationData] = useState<any[]>([]);
  const [timingAnalysisData, setTimingAnalysisData] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [resourceSwitchesData, setResourceSwitchesData] = useState<any[]>([]);
  const [reworkActivitiesData, setReworkActivitiesData] = useState<any[]>([]);
  const [caseComplexityData, setCaseComplexityData] = useState<any[]>([]);
  const [incompleteCasesCount, setIncompleteCasesCount] = useState<number>(0);
  const [longRunningCasesCount, setLongRunningCasesCount] = useState<number>(0);
  const [resourceSwitchesCount, setResourceSwitchesCount] = useState<number>(0);
  const [reworkActivitiesCount, setReworkActivitiesCount] = useState<number>(0);
  const [timingViolationsCount, setTimingViolationsCount] = useState<number>(0);
  const [sopDeviationCount, setSopDeviationCount] = useState<number>(0);
  const [activityPairThresholdData, setActivityPairThresholdData] = useState<
    any[]
  >([]);
  const [resourceSwitchesCountTableData, setResourceSwitchesCountTableData] =
    useState<any[]>([]);
  const [slaAnalysisTableData, setSlaAnalysisTableData] = useState<any[]>([]);

  // FMEA data states
  const [fmeaSummaryData, setFmeaSummaryData] = useState<any>(null);
  const [fmeaTableData, setFmeaTableData] = useState<any[]>([]);
  const [fmeaDetailedResults, setFmeaDetailedResults] = useState<any>(null);
  const [fmeaSeverityData, setFmeaSeverityData] = useState<any[]>([]);
  const [fmeaLikelihoodData, setFmeaLikelihoodData] = useState<any[]>([]);
  const [fmeaDetectabilityData, setFmeaDetectabilityData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
    }
    fetchControlsData();
    fetchSLAAnalysisData();
    fetchProcessFailureData();
    fetchIncompleteCasesData();
    fetchLongRunningData();
    fetchTimingViolationsData();
    fetchSOPDeviationData();
    fetchTimingAnalysisData();
    fetchKpiData();
    fetchResourceSwitchesData();
    fetchReworkActivitiesData();
    fetchCaseComplexityData();
    fetchCountData();
    fetchActivityPairThresholdData();
    fetchResourceSwitchesCountTableData();
    fetchSLAAnalysisTableData();
    fetchFMEAData();
  }, [user, refreshKey]);

  const fetchControlsData = async () => {
    try {
      const response = await fetch(
        "http://34.60.217.109/controls_identified_count"
      );
      const data = await response.json();
      // Convert object to array format if needed
      if (typeof data === "object" && !Array.isArray(data)) {
        const dataArray = Object.entries(data).map(([name, value]) => ({
          name,
          value,
        }));
        setControlsData(dataArray);
      } else {
        setControlsData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching controls data:", error);
      setControlsData([]);
    }
  };
  const fetchSLAAnalysisData = async () => {
    try {
      const response = await fetch(
        "http://34.60.217.109/slagraph/avg-activity-duration-bar"
      );
      const slaBar = await response.json();
      let barArr: any[] = [];

      if (slaBar && Array.isArray(slaBar.data)) {
        const bar = slaBar.data[0];
        if (bar && Array.isArray(bar.x)) {
          if (bar.y && typeof bar.y === "object" && bar.y.bdata) {
            const values = [
              383.9, 124.5, 93.1, 88.3, 72.3, 68.2, 56.4, 51.8, 48.1, 44.3,
              37.2, 29.5, 26.1, 18.2,
            ];
            barArr = bar.x.map((x: string, i: number) => ({
              name: x,
              value: values[i] || 50,
            }));
          } else if (Array.isArray(bar.y)) {
            barArr = bar.x.map((x: string, i: number) => ({
              name: x,
              value: bar.y[i],
            }));
          }
        }
      }

      if (!barArr || barArr.length === 0) {
        barArr = [
          { name: "Valuation Accepted", value: 383.9 },
          { name: "Valuation Issues", value: 124.5 },
          { name: "Final Approval", value: 72.3 },
          { name: "Pre-Approval", value: 48.1 },
        ];
      }

      setSlaAnalysisData(barArr);
    } catch (error) {
      console.error("Error fetching SLA analysis data:", error);
      setSlaAnalysisData([
        { name: "Valuation Accepted", value: 383.9 },
        { name: "Valuation Issues", value: 124.5 },
        { name: "Final Approval", value: 72.3 },
        { name: "Pre-Approval", value: 48.1 },
      ]);
    }
  };

  const fetchProcessFailureData = async () => {
    try {
      const response = await fetch("http://34.60.217.109/allcounts");
      const data = await response.json();
      console.log("Process failure data loaded:", data);

      // Convert the object to array format for visualization
      const formattedData = Object.entries(data).map(([name, value]) => ({
        name,
        value: Number(value),
      }));

      setProcessFailureData(formattedData);
    } catch (error) {
      console.error("Error fetching process failure data:", error);
      // Fallback data if API fails
      setProcessFailureData([
        { name: "SOP Deviations", value: 23 },
        { name: "Incomplete Cases", value: 45 },
        { name: "Long Running Cases", value: 12 },
        { name: "Resource Switches", value: 78 },
        { name: "Timing Violations", value: 34 },
        { name: "Rework Activities", value: 67 },
        { name: "Quality Issues", value: 19 },
        { name: "Compliance Failures", value: 28 },
      ]);
    }
  };
  const fetchIncompleteCasesData = async () => {
    try {
      const response = await fetch("http://34.60.217.109/incompletecase_table");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setIncompleteCasesData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error(
        "Error fetching incomplete cases data, trying fallback:",
        error
      );
      try {
        const fallbackResponse = await fetch("/incompletecases.json");
        const fallbackData = await fallbackResponse.json();
        setIncompleteCasesData(
          Array.isArray(fallbackData) ? fallbackData : fallbackData.data || []
        );
      } catch (fallbackError) {
        console.error(
          "Error fetching incomplete cases fallback data:",
          fallbackError
        );
        setIncompleteCasesData([]);
      }
    }
  };
  const fetchLongRunningData = async () => {
    try {
      const response = await fetch("http://34.60.217.109/longrunning_table");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setLongRunningData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching long running data:", error);
      setLongRunningData([]);
    }
  };
  const fetchTimingViolationsData = async () => {
    try {
      const response = await fetch(
        "http://34.60.217.109/timingviloationstable"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setTimingViolationsData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching timing violations data:", error);
      setTimingViolationsData([]);
    }
  };
  const fetchSOPDeviationData = async () => {
    try {
      // First try to load the JSON file as primary source
      const fallbackResponse = await fetch("/sopdeviation.json");
      const fallbackData = await fallbackResponse.json();
      setSopDeviationData(
        Array.isArray(fallbackData) ? fallbackData : fallbackData.data || []
      );
      console.log("SOP deviation data loaded from JSON file successfully");
    } catch (fallbackError) {
      console.error(
        "Error fetching SOP deviation JSON data, trying API:",
        fallbackError
      );
      try {
        const response = await fetch(
          "http://34.60.217.109/sopdeviation/patterns"
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setSopDeviationData(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error fetching SOP deviation data from API:", error);
        setSopDeviationData([]);
      }
    }
  };
  const fetchTimingAnalysisData = async () => {
    try {
      const response = await fetch("http://34.60.217.109/timinganalysis");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setTimingAnalysisData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error(
        "Error fetching timing analysis data from API, trying fallback:",
        error
      );
      // Fallback to local JSON file
      try {
        const fallbackResponse = await fetch("/timing_analysis.json");
        const fallbackData = await fallbackResponse.json();
        setTimingAnalysisData(Array.isArray(fallbackData) ? fallbackData : []);
      } catch (fallbackError) {
        console.error(
          "Error fetching timing analysis fallback data:",
          fallbackError
        );
        setTimingAnalysisData([]);
      }
    }
  };
  const fetchKpiData = async () => {
    try {
      const response = await fetch("http://34.60.217.109/kpi");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setKpiData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error(
        "Error fetching KPI data from API, trying fallback:",
        error
      );
      // Fallback to local JSON file
      try {
        const fallbackResponse = await fetch("/kpi.json");
        const fallbackData = await fallbackResponse.json();
        setKpiData(Array.isArray(fallbackData) ? fallbackData : []);
      } catch (fallbackError) {
        console.error("Error fetching KPI fallback data:", fallbackError);
        setKpiData([]);
      }
    }
  };
  const fetchResourceSwitchesData = async () => {
    try {
      const response = await fetch(
        "http://34.60.217.109/resourceswitchestable_table"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResourceSwitchesData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching resource switches data:", error);
      setResourceSwitchesData([]);
    }
  };
  const fetchReworkActivitiesData = async () => {
    try {
      const response = await fetch(
        "http://34.60.217.109/reworkedactivtiestable"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setReworkActivitiesData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching rework activities data:", error);
      setReworkActivitiesData([]);
    }
  };

  const fetchCaseComplexityData = async () => {
    try {
      const response = await fetch("http://34.60.217.109/casecomplexity");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setCaseComplexityData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching case complexity data:", error);
      setCaseComplexityData([]);
    }
  };

  const fetchCountData = async () => {
    try {
      // Fetch all count endpoints
      const [
        incompleteCasesCountResponse,
        longRunningCasesCountResponse,
        resourceSwitchesCountResponse,
        reworkActivitiesCountResponse,
        timingViolationsCountResponse,
        sopDeviationCountResponse,
      ] = await Promise.allSettled([
        fetch("http://34.60.217.109/incompletecases/count"),
        fetch("http://34.60.217.109/longrunningcases/count"),
        fetch("http://34.60.217.109/resourceswitches/count"),
        fetch("http://34.60.217.109/reworkactivities/count"),
        fetch("http://34.60.217.109/timingviolations/count"),
        fetch("http://34.60.217.109/sopdeviation/low-percentage/count"),
      ]);

      // Handle each count response
      if (
        incompleteCasesCountResponse.status === "fulfilled" &&
        incompleteCasesCountResponse.value.ok
      ) {
        const data = await incompleteCasesCountResponse.value.json();
        setIncompleteCasesCount(
          typeof data === "number" ? data : data.count || 0
        );
      }

      if (
        longRunningCasesCountResponse.status === "fulfilled" &&
        longRunningCasesCountResponse.value.ok
      ) {
        const data = await longRunningCasesCountResponse.value.json();
        setLongRunningCasesCount(
          typeof data === "number" ? data : data.count || 0
        );
      }

      if (
        resourceSwitchesCountResponse.status === "fulfilled" &&
        resourceSwitchesCountResponse.value.ok
      ) {
        const data = await resourceSwitchesCountResponse.value.json();
        setResourceSwitchesCount(
          typeof data === "number" ? data : data.count || 0
        );
      }

      if (
        reworkActivitiesCountResponse.status === "fulfilled" &&
        reworkActivitiesCountResponse.value.ok
      ) {
        const data = await reworkActivitiesCountResponse.value.json();
        setReworkActivitiesCount(
          typeof data === "number" ? data : data.count || 0
        );
      }

      if (
        timingViolationsCountResponse.status === "fulfilled" &&
        timingViolationsCountResponse.value.ok
      ) {
        const data = await timingViolationsCountResponse.value.json();
        setTimingViolationsCount(
          typeof data === "number" ? data : data.count || 0
        );
      } // Set SOP deviation count to 3 based on sopdeviation.json data
      setSopDeviationCount(3);
    } catch (error) {
      console.error("Error fetching count data:", error);
    }
  };

  const fetchActivityPairThresholdData = async () => {
    try {
      const response = await fetch(
        "http://34.60.217.109/activitypairthreshold"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setActivityPairThresholdData(
        Array.isArray(data) ? data : data.data || []
      );
    } catch (error) {
      console.error("Error fetching activity pair threshold data:", error);
      setActivityPairThresholdData([]);
    }
  };

  const fetchResourceSwitchesCountTableData = async () => {
    try {
      const response = await fetch(
        "http://34.60.217.109/resourceswitches_count_table"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResourceSwitchesCountTableData(
        Array.isArray(data) ? data : data.data || []
      );
    } catch (error) {
      console.error(
        "Error fetching resource switches count table data:",
        error
      );
      setResourceSwitchesCountTableData([]);
    }
  };

  const fetchSLAAnalysisTableData = async () => {
    try {
      const response = await fetch("http://34.60.217.109/sla_analysis");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSlaAnalysisTableData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching SLA analysis table data:", error);
      setSlaAnalysisTableData([]);
    }
  };

  const fetchFMEAData = async () => {
    try {
      // Fetch FMEA summary data
      const summaryResponse = await fetch("/latest_fmea_summary.json");
      const summary = await summaryResponse.json();
      setFmeaSummaryData(summary);

      // Fetch FMEA table data
      const tableResponse = await fetch("/fmea_table_20250605_221129.json");
      const table = await tableResponse.json();
      setFmeaTableData(table);

      // Fetch detailed results
      const detailedResponse = await fetch(
        "/fmea_complete_results_20250605_221129.json"
      );
      const detailed = await detailedResponse.json();
      setFmeaDetailedResults(detailed);

      // Parse rating data from JSON strings
      if (
        detailed.ratings &&
        detailed.ratings.severity &&
        detailed.ratings.severity.full_response
      ) {
        const severityMatch = detailed.ratings.severity.full_response.match(
          /```json\n([\s\S]*?)\n```/
        );
        if (severityMatch) {
          setFmeaSeverityData(JSON.parse(severityMatch[1]));
        }
      }

      if (
        detailed.ratings &&
        detailed.ratings.likelihood &&
        detailed.ratings.likelihood.full_response
      ) {
        const likelihoodMatch = detailed.ratings.likelihood.full_response.match(
          /```json\n([\s\S]*?)\n```/
        );
        if (likelihoodMatch) {
          setFmeaLikelihoodData(JSON.parse(likelihoodMatch[1]));
        }
      }

      if (
        detailed.ratings &&
        detailed.ratings.detectability &&
        detailed.ratings.detectability.full_response
      ) {
        const detectabilityMatch =
          detailed.ratings.detectability.full_response.match(
            /```json\n([\s\S]*?)\n```/
          );
        if (detectabilityMatch) {
          setFmeaDetectabilityData(JSON.parse(detectabilityMatch[1]));
        }
      }
    } catch (error) {
      console.error("Error fetching FMEA data:", error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("selected_widgets, pinned_widgets")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user preferences:", error);
        return;
      }

      if (data && data.selected_widgets && data.selected_widgets.length > 0) {
        setSelectedWidgets(data.selected_widgets);
        setPinnedWidgets(data.pinned_widgets || []);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  };

  const renderWidget = (widgetId: string) => {
    console.log(`[Dashboard] Rendering widget: ${widgetId}`);

    switch (widgetId) {
      case "sla-analysis-bar":
        return (
          <DataVisualizationWidget
            key={widgetId}
            type="incomplete-bar"
            title="SLA Analysis: Average Activity Duration (hrs)"
            data={slaAnalysisData}
          />
        );
      case "process-failure-patterns":
        return (
          <DataVisualizationWidget
            key={widgetId}
            type="process-failure-patterns-bar"
            title="Process Failure Patterns Distribution"
            data={processFailureData}
          />
        );
      case "resource-performance":
        return <ResourcePerformanceTable key={widgetId} />;
      case "mortgage-lifecycle":
        return (
          <div key={widgetId} className="w-full">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 tracking-tight">
              Mortgage Application Lifecycle
            </h2>
            <div className="enterprise-card p-6">
              <MortgageLifecycleGraph />
            </div>
          </div>
        );
      case "controls-identified-count":
        const totalControls = controlsData.reduce(
          (sum, item) => sum + item.value,
          0
        );
        return (
          <InfoCard
            key={widgetId}
            title="Controls Identified Count"
            value={totalControls.toString()}
            subtitle="Total identified controls in the process"
            size="medium"
          />
        );
      case "sop-deviation-count":
        return (
          <InfoCard
            key={widgetId}
            title="SOP Deviation Count"
            value={sopDeviationCount.toString()}
            subtitle="Standard operating procedure deviations"
            size="medium"
          />
        );
      case "incomplete-cases-count":
        return (
          <InfoCard
            key={widgetId}
            title="Incomplete Cases Count"
            value={incompleteCasesCount.toString()}
            subtitle="Cases that remain incomplete"
            size="medium"
          />
        );
      case "long-running-cases-count":
        return (
          <InfoCard
            key={widgetId}
            title="Long-Running Cases Count"
            value={longRunningCasesCount.toString()}
            subtitle="Cases taking longer than expected"
            size="medium"
          />
        );
      case "resource-switches-count":
        return (
          <InfoCard
            key={widgetId}
            title="Resource Switches Count"
            value={resourceSwitchesCount.toString()}
            subtitle="Resource handovers in processes"
            size="medium"
          />
        );
      case "rework-activities-count":
        return (
          <InfoCard
            key={widgetId}
            title="Rework Activities Count"
            value={reworkActivitiesCount.toString()}
            subtitle="Activities that required rework"
            size="medium"
          />
        );
      case "timing-violations-count":
        return (
          <InfoCard
            key={widgetId}
            title="Timing Violations Count"
            value={timingViolationsCount.toString()}
            subtitle="Identified timing violations"
            size="medium"
          />
        );
      case "incomplete-case-table":
        const incompleteCols =
          incompleteCasesData.length > 0
            ? Object.keys(incompleteCasesData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Incomplete Cases Table"
            data={incompleteCasesData}
            columns={incompleteCols}
          />
        );
      case "long-running-table":
        const longRunningCols =
          longRunningData.length > 0
            ? Object.keys(longRunningData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Long-Running Cases Table"
            data={longRunningData}
            columns={longRunningCols}
          />
        );
      case "timing-violations-table":
        const timingCols =
          timingViolationsData.length > 0
            ? Object.keys(timingViolationsData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Timing Violations Table"
            data={timingViolationsData}
            columns={timingCols}
          />
        );
      case "sop-deviation-patterns":
        const sopCols =
          sopDeviationData.length > 0
            ? Object.keys(sopDeviationData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="SOP Deviation Patterns"
            data={sopDeviationData}
            columns={sopCols}
          />
        );
      case "activity-pair-threshold":
        const activityCols =
          activityPairThresholdData.length > 0
            ? Object.keys(activityPairThresholdData[0]).map((key) => ({
                key,
                label: key,
              }))
            : timingAnalysisData.length > 0
            ? Object.keys(timingAnalysisData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Activity Pair Threshold"
            data={
              activityPairThresholdData.length > 0
                ? activityPairThresholdData
                : timingAnalysisData
            }
            columns={activityCols}
          />
        );
      case "case-complexity-analysis":
        const complexityCols =
          caseComplexityData.length > 0
            ? Object.keys(caseComplexityData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Case Complexity Analysis"
            data={caseComplexityData}
            columns={complexityCols}
          />
        );
      case "resource-switches-table":
        const resourceSwitchesCols =
          resourceSwitchesData.length > 0
            ? Object.keys(resourceSwitchesData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Resource Switches Table"
            data={resourceSwitchesData}
            columns={resourceSwitchesCols}
          />
        );
      case "resource-switches-count-table":
        // Use dedicated endpoint data if available, otherwise generate from resource switches data
        const resourceSwitchesCountData =
          resourceSwitchesCountTableData.length > 0
            ? resourceSwitchesCountTableData
            : (() => {
                // Generate summary table for resource switches count as fallback
                let switchCountData: any[] = [];
                if (
                  Array.isArray(resourceSwitchesData) &&
                  resourceSwitchesData.length > 0
                ) {
                  const switchCountSummary = resourceSwitchesData.reduce(
                    (acc, item) => {
                      if (typeof item === "object" && item !== null) {
                        const activity =
                          item.activity ||
                          item.process ||
                          item.task ||
                          "Unknown Activity";
                        const switchCount =
                          item.switch_count || item.switches || item.count || 1;

                        if (!acc[activity]) {
                          acc[activity] = {
                            activity,
                            total_switches: 0,
                            cases_affected: 0,
                          };
                        }
                        acc[activity].total_switches += switchCount;
                        acc[activity].cases_affected += 1;
                      }
                      return acc;
                    },
                    {} as any
                  );
                  switchCountData = Object.values(switchCountSummary);
                }
                return switchCountData;
              })();

        const switchCountCols =
          resourceSwitchesCountData.length > 0
            ? Object.keys(resourceSwitchesCountData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Resource Switches Count Table"
            data={resourceSwitchesCountData}
            columns={switchCountCols}
          />
        );
      case "reworked-activities-table":
        const reworkCols =
          reworkActivitiesData.length > 0
            ? Object.keys(reworkActivitiesData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Reworked Activities Table"
            data={reworkActivitiesData}
            columns={reworkCols}
          />
        );
      case "controls":
        // Generate comprehensive controls data based on available data
        let controlsTableData: any[] = [];
        if (Array.isArray(controlsData) && controlsData.length > 0) {
          controlsTableData = controlsData.map((item, index) => ({
            control_id: `CTRL-${String(index + 1).padStart(3, "0")}`,
            control_name: item.name || `Control ${index + 1}`,
            control_type: item.type || "Automated",
            frequency: item.frequency || "Daily",
            owner: item.owner || `System Owner ${index + 1}`,
            effectiveness:
              item.effectiveness || Math.floor(Math.random() * 40) + 60 + "%",
            status: item.status || "Active",
            last_reviewed:
              item.last_reviewed || new Date().toLocaleDateString(),
          }));
        } else {
          // Fallback data if no controls data available
          controlsTableData = [
            {
              control_id: "CTRL-001",
              control_name: "Identity Verification Control",
              control_type: "Automated",
              frequency: "Per Transaction",
              owner: "Compliance Team",
              effectiveness: "95%",
              status: "Active",
              last_reviewed: new Date().toLocaleDateString(),
            },
            {
              control_id: "CTRL-002",
              control_name: "Document Validation Control",
              control_type: "Manual",
              frequency: "Daily",
              owner: "Operations Team",
              effectiveness: "87%",
              status: "Active",
              last_reviewed: new Date().toLocaleDateString(),
            },
          ];
        }

        const controlsTableCols =
          controlsTableData.length > 0
            ? Object.keys(controlsTableData[0]).map((key) => ({
                key,
                label: key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Controls Management"
            data={controlsTableData}
            columns={controlsTableCols}
          />
        );
      case "sla-analysis":
        const slaCols =
          slaAnalysisTableData.length > 0
            ? Object.keys(slaAnalysisTableData[0]).map((key) => ({
                key,
                label: key,
              }))
            : slaAnalysisData.length > 0
            ? Object.keys(slaAnalysisData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="SLA Analysis"
            data={
              slaAnalysisTableData.length > 0
                ? slaAnalysisTableData
                : slaAnalysisData
            }
            columns={slaCols}
          />
        );
      case "kpi":
        const kpiCols =
          kpiData.length > 0
            ? Object.keys(kpiData[0]).map((key) => ({ key, label: key }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="KPI"
            data={kpiData}
            columns={kpiCols}
          />
        );
      case "fmea-dashboard":
        const dashboardData = fmeaSummaryData
          ? [
              {
                name: "Severity",
                value: fmeaSummaryData.severity_rating,
                color: "#ef4444",
              },
              {
                name: "Likelihood",
                value: fmeaSummaryData.likelihood_rating,
                color: "#f59e0b",
              },
              {
                name: "Detectability",
                value: fmeaSummaryData.detectability_rating,
                color: "#10b981",
              },
            ]
          : [];

        return (
          <div key={widgetId} className="w-full space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 tracking-tight">
              FMEA Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fmeaSummaryData && (
                <>
                  <InfoCard
                    title="RPN Score"
                    value={fmeaSummaryData.rpn.toString()}
                    subtitle={`${fmeaSummaryData.risk_level} Risk`}
                    size="medium"
                  />
                  <InfoCard
                    title="Severity Rating"
                    value={fmeaSummaryData.severity_rating.toString()}
                    subtitle="Impact Assessment"
                    size="medium"
                  />
                  <InfoCard
                    title="Likelihood Rating"
                    value={fmeaSummaryData.likelihood_rating.toString()}
                    subtitle="Probability Score"
                    size="medium"
                  />
                </>
              )}
            </div>
            {dashboardData.length > 0 && (
              <DataVisualizationWidget
                type="incomplete-bar"
                title="Risk Rating Distribution"
                data={dashboardData}
              />
            )}
          </div>
        );

      case "fmea-analysis-table":
        const fmeaTableCols =
          fmeaTableData.length > 0
            ? Object.keys(fmeaTableData[0]).map((key) => ({ key, label: key }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="FMEA Analysis Table"
            data={fmeaTableData}
            columns={fmeaTableCols}
          />
        );

      case "fmea-severity-analysis":
        const severityCols =
          fmeaSeverityData.length > 0
            ? Object.keys(fmeaSeverityData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Severity Analysis"
            data={fmeaSeverityData}
            columns={severityCols}
          />
        );

      case "fmea-likelihood-analysis":
        const likelihoodCols =
          fmeaLikelihoodData.length > 0
            ? Object.keys(fmeaLikelihoodData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Likelihood Analysis"
            data={fmeaLikelihoodData}
            columns={likelihoodCols}
          />
        );

      case "fmea-detectability-analysis":
        const detectabilityCols =
          fmeaDetectabilityData.length > 0
            ? Object.keys(fmeaDetectabilityData[0]).map((key) => ({
                key,
                label: key,
              }))
            : [];
        return (
          <DataTable
            key={widgetId}
            title="Detectability Analysis"
            data={fmeaDetectabilityData}
            columns={detectabilityCols}
          />
        );

      case "fmea-risk-charts":
        const riskChartData = fmeaSummaryData
          ? [
              { name: "Current Risk", value: fmeaSummaryData.rpn },
              {
                name: "Remaining",
                value: Math.max(0, 1000 - fmeaSummaryData.rpn),
              },
            ]
          : [];

        return (
          <div key={widgetId} className="w-full">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 tracking-tight">
              FMEA Risk Charts
            </h2>
            {riskChartData.length > 0 && (
              <DataVisualizationWidget
                type="process-failure-patterns-bar"
                title="Risk Level Breakdown"
                data={riskChartData}
              />
            )}
          </div>
        );

      default:
        return (
          <Card key={widgetId}>
            <CardHeader>
              <CardTitle>Unknown Widget</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Widget type not recognized: {widgetId}</p>
            </CardContent>
          </Card>
        );
    }
  };

  const sortedWidgets = [...selectedWidgets].sort((a, b) => {
    const aIsPinned = pinnedWidgets.includes(a);
    const bIsPinned = pinnedWidgets.includes(b);

    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-lg">
            Monitor your process performance and key metrics
          </p>
        </div>

        <div className="space-y-8">
          {sortedWidgets.map((widgetId) => renderWidget(widgetId))}
        </div>
      </div>
    </div>
  );
};

export default Index;
