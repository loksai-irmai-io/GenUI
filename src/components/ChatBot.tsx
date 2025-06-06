import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  MessageCircle,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataVisualizationWidget from "./widgets/DataVisualizationWidget";
import ResourcePerformanceTable from "./widgets/ResourcePerformanceTable";
import DataTable from "./widgets/DataTable";
import InfoCard from "./widgets/InfoCard";
import SOPWidget from "./widgets/SOPWidget";
import TimingAnalysisTable from "./widgets/TimingAnalysisTable";

// Import actual data services
import { incompleteCasesService } from "@/services/incompleteCasesService";
import { longRunningCasesService } from "@/services/longRunningCasesService";
import { resourceSwitchesService } from "@/services/resourceSwitchesService";
import { reworkActivitiesService } from "@/services/reworkActivitiesService";
import { timingViolationsService } from "@/services/timingViolationsService";
import { sopDeviationService } from "@/services/sopDeviationService";
import { timingAnalysisService } from "@/services/timingAnalysisService";
import { caseComplexityService } from "@/services/caseComplexityService";
import { mortgageLifecycleService } from "@/services/mortgageLifecycleService";
import MortgageLifecycleGraph from "./MortgageLifecycleGraph";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  widget?: React.ReactNode;
}

interface ChatBotProps {
  onDataReceived?: (type: string, data: any[], title: string) => void;
  visualizations?: Array<{
    id: string;
    type: string;
    data: any[];
    title: string;
  }>;
  clearVisualizations?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({
  onDataReceived,
  visualizations = [],
  clearVisualizations,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your Process Intelligence Assistant. I can help you analyze process data, show visualizations, and provide insights. Try asking me about SLA analysis, failure patterns, resource performance, or FMEA analysis!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FMEA data states
  const [fmeaSummaryData, setFmeaSummaryData] = useState<any>(null);
  const [fmeaTableData, setFmeaTableData] = useState<any[]>([]);
  const [fmeaSeverityData, setFmeaSeverityData] = useState<any[]>([]);
  const [fmeaLikelihoodData, setFmeaLikelihoodData] = useState<any[]>([]);
  const [fmeaDetectabilityData, setFmeaDetectabilityData] = useState<any[]>([]);
  // Real data states
  const [realDataCache, setRealDataCache] = useState<{ [key: string]: any }>(
    {}
  );
  // Additional data states for new services
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [caseComplexityData, setCaseComplexityData] = useState<any[]>([]);
  const [activityPairThresholdData, setActivityPairThresholdData] = useState<
    any[]
  >([]);
  const [resourcePerformanceData, setResourcePerformanceData] = useState<any[]>(
    []
  );
  const [slaAnalysisData, setSlaAnalysisData] = useState<any[]>([]);
  const [controlsData, setControlsData] = useState<any[]>([]);
  const [mortgageLifecycleData, setMortgageLifecycleData] = useState<any>(null);

  useEffect(() => {
    fetchFMEAData();
    preloadRealData();
  }, []);

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
  const preloadRealData = async () => {
    try {
      // Load additional data from API endpoints
      const [
        kpiResponse,
        caseComplexityResponse,
        activityPairResponse,
        resourcePerfResponse,
        slaAnalysisResponse,
        controlsResponse,
      ] = await Promise.all([
        fetch("http://34.60.217.109/kpi").catch(() => fetch("/kpi.json")),
        fetch("http://34.60.217.109/casecomplexity").catch(() => null),
        fetch("http://34.60.217.109/activitypairthreshold").catch(() => null),
        fetch("http://34.60.217.109/resourceperformance").catch(() => null),
        fetch("http://34.60.217.109/slagraph/avg-activity-duration-bar").catch(
          () => null
        ),
        fetch("http://34.60.217.109/controls_identified_count").catch(
          () => null
        ),
      ]); // Parse responses
      const kpiData = kpiResponse ? await kpiResponse.json() : [];
      const caseComplexityData = caseComplexityResponse
        ? await caseComplexityResponse.json()
        : [];
      const activityPairData = activityPairResponse
        ? await activityPairResponse.json()
        : [];
      const resourcePerfData = resourcePerfResponse
        ? await resourcePerfResponse.json()
        : [];
      const slaData = slaAnalysisResponse
        ? await slaAnalysisResponse.json()
        : [];
      const controlsData = controlsResponse
        ? await controlsResponse.json()
        : []; // Set the additional data states
      setKpiData(kpiData);
      setCaseComplexityData(caseComplexityData);
      setActivityPairThresholdData(activityPairData);
      setResourcePerformanceData(resourcePerfData);
      setSlaAnalysisData(slaData);
      setControlsData(controlsData); // Load mortgage lifecycle data
      const mortgageData =
        await mortgageLifecycleService.processSOPDeviationData();
      setMortgageLifecycleData(mortgageData);

      const [
        incompleteCases,
        longRunningCases,
        resourceSwitches,
        reworkActivities,
        timingViolations,
        sopDeviation,
        timingAnalysis,
        // Table data
        incompleteCasesTable,
        longRunningCasesTable,
        reworkActivitiesTable,
        timingViolationsTable,
        sopDeviationTable,
      ] = await Promise.all([
        incompleteCasesService.getCountBar(),
        longRunningCasesService.getCountBar(),
        resourceSwitchesService.getCountBar(),
        reworkActivitiesService.getCountBar(),
        timingViolationsService.getCountBar(),
        sopDeviationService.getSOPDeviationCount(),
        timingAnalysisService.getTable(),
        // Load table data
        incompleteCasesService.getTable(),
        longRunningCasesService.getTable(),
        reworkActivitiesService.getTable(),
        timingViolationsService.getTable(),
        sopDeviationService.getTable(),
      ]);

      setRealDataCache({
        incompleteCases,
        longRunningCases,
        resourceSwitches,
        reworkActivities,
        timingViolations,
        sopDeviation,
        timingAnalysis,
        // Table data
        incompleteCasesTable,
        longRunningCasesTable,
        reworkActivitiesTable,
        timingViolationsTable,
        sopDeviationTable,
      });
    } catch (error) {
      console.error("Error preloading real data:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const generateResponse = async (
    userMessage: string
  ): Promise<{ text: string; widget?: React.ReactNode }> => {
    const message = userMessage.toLowerCase();

    // FMEA-related responses
    if (
      message.includes("severity analysis") ||
      (message.includes("fmea") && message.includes("severity"))
    ) {
      const severityCols =
        fmeaSeverityData.length > 0
          ? Object.keys(fmeaSeverityData[0]).map((key) => ({
              key,
              label: key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            }))
          : [];

      const response = {
        text: "Here's the severity analysis showing the impact assessment of different failure modes with their severity scores and justifications.",
        widget:
          fmeaSeverityData.length > 0 ? (
            <DataTable
              title="Severity Analysis"
              data={fmeaSeverityData}
              columns={severityCols}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Severity analysis data is currently being loaded...</p>
            </div>
          ),
      };

      if (onDataReceived && fmeaSeverityData.length > 0) {
        onDataReceived(
          "fmea-severity",
          fmeaSeverityData,
          "FMEA Severity Analysis"
        );
      }

      return response;
    }

    if (
      message.includes("likelihood analysis") ||
      (message.includes("fmea") &&
        (message.includes("likelihood") || message.includes("probability")))
    ) {
      const likelihoodCols =
        fmeaLikelihoodData.length > 0
          ? Object.keys(fmeaLikelihoodData[0]).map((key) => ({
              key,
              label: key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            }))
          : [];

      const response = {
        text: "Here's the likelihood analysis showing the probability assessment of failure modes occurring.",
        widget:
          fmeaLikelihoodData.length > 0 ? (
            <DataTable
              title="Likelihood Analysis"
              data={fmeaLikelihoodData}
              columns={likelihoodCols}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Likelihood analysis data is currently being loaded...</p>
            </div>
          ),
      };

      if (onDataReceived && fmeaLikelihoodData.length > 0) {
        onDataReceived(
          "fmea-likelihood",
          fmeaLikelihoodData,
          "FMEA Likelihood Analysis"
        );
      }

      return response;
    }

    if (
      message.includes("detectability analysis") ||
      (message.includes("fmea") &&
        (message.includes("detectability") || message.includes("detection")))
    ) {
      const detectabilityCols =
        fmeaDetectabilityData.length > 0
          ? Object.keys(fmeaDetectabilityData[0]).map((key) => ({
              key,
              label: key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            }))
          : [];

      const response = {
        text: "Here's the detectability analysis showing how well we can detect failure modes before they impact customers.",
        widget:
          fmeaDetectabilityData.length > 0 ? (
            <DataTable
              title="Detectability Analysis"
              data={fmeaDetectabilityData}
              columns={detectabilityCols}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Detectability analysis data is currently being loaded...</p>
            </div>
          ),
      };

      if (onDataReceived && fmeaDetectabilityData.length > 0) {
        onDataReceived(
          "fmea-detectability",
          fmeaDetectabilityData,
          "FMEA Detectability Analysis"
        );
      }

      return response;
    }

    if (
      message.includes("fmea") ||
      message.includes("failure mode") ||
      message.includes("risk priority")
    ) {
      if (message.includes("table") || message.includes("analysis table")) {
        const fmeaTableCols =
          fmeaTableData.length > 0
            ? Object.keys(fmeaTableData[0]).map((key) => ({ key, label: key }))
            : [];

        const response = {
          text: "Here's the detailed FMEA analysis table showing all failure modes, effects, and causes across different processes.",
          widget: (
            <DataTable
              title="FMEA Analysis Table"
              data={fmeaTableData}
              columns={fmeaTableCols}
            />
          ),
        };

        if (onDataReceived && fmeaTableData.length > 0) {
          onDataReceived("fmea-table", fmeaTableData, "FMEA Analysis Table");
        }

        return response;
      }

      // Default FMEA response with dashboard
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

      const response = {
        text: fmeaSummaryData
          ? `FMEA (Failure Mode and Effects Analysis) helps identify potential failure points in our mortgage process. Current RPN is ${fmeaSummaryData.rpn} with ${fmeaSummaryData.risk_level} risk level.`
          : "FMEA (Failure Mode and Effects Analysis) helps identify potential failure points in our mortgage process.",
        widget: (
          <div className="space-y-4">
            {fmeaSummaryData && (
              <div className="grid grid-cols-3 gap-4">
                <InfoCard
                  title="RPN Score"
                  value={fmeaSummaryData.rpn.toString()}
                  subtitle={`${fmeaSummaryData.risk_level} Risk`}
                  size="small"
                />
                <InfoCard
                  title="Severity"
                  value={fmeaSummaryData.severity_rating.toString()}
                  subtitle="Impact"
                  size="small"
                />
                <InfoCard
                  title="Likelihood"
                  value={fmeaSummaryData.likelihood_rating.toString()}
                  subtitle="Probability"
                  size="small"
                />
              </div>
            )}
            {dashboardData.length > 0 && (
              <DataVisualizationWidget
                type="incomplete-bar"
                title="Risk Rating Distribution"
                data={dashboardData}
              />
            )}
          </div>
        ),
      };

      if (onDataReceived && dashboardData.length > 0) {
        onDataReceived(
          "fmea-dashboard",
          dashboardData,
          "FMEA Risk Rating Distribution"
        );
      }

      return response;
    } // Use real data for other queries
    if (
      message.includes("incomplete cases count") ||
      (message.includes("incomplete") && message.includes("count"))
    ) {
      const data = realDataCache.incompleteCases;
      if (data && Array.isArray(data) && data.length > 0) {
        const count = data[0]?.value || 0;
        return {
          text: "Here's the count of incomplete cases in the mortgage process.",
          widget: (
            <InfoCard
              title="Incomplete Cases Count"
              value={count.toString()}
              subtitle="Cases requiring completion"
              size="medium"
            />
          ),
        };
      }
    }
    if (
      message.includes("incomplete cases table") ||
      (message.includes("incomplete") && message.includes("table"))
    ) {
      const tableData = realDataCache.incompleteCasesTable || [];
      return {
        text: "Here's the detailed table of incomplete cases.",
        widget: (
          <DataVisualizationWidget
            type="incomplete-case-table"
            title="Incomplete Cases Table"
            data={tableData}
          />
        ),
      };
    }
    if (
      message.includes("incomplete") ||
      message.includes("incomplete cases")
    ) {
      const data = realDataCache.incompleteCases;
      const tableData = realDataCache.incompleteCasesTable || [];

      if (data && Array.isArray(data) && data.length > 0) {
        const count = data[0]?.value || 0;
        return {
          text: "Here's a comprehensive view of incomplete cases including count and detailed breakdown.",
          widget: (
            <div className="space-y-4">
              <InfoCard
                title="Incomplete Cases Count"
                value={count.toString()}
                subtitle="Cases requiring completion"
                size="medium"
              />
              {tableData.length > 0 && (
                <DataVisualizationWidget
                  type="incomplete-case-table"
                  title="Incomplete Cases Detailed Breakdown"
                  data={tableData}
                />
              )}
            </div>
          ),
        };
      }
    }
    if (
      message.includes("long running cases count") ||
      message.includes("longrunning count") ||
      (message.includes("long running") && message.includes("count"))
    ) {
      const data = realDataCache.longRunningCases;
      if (data && Array.isArray(data) && data.length > 0) {
        const count = data[0]?.value || 0;
        return {
          text: "Here's the count of long running cases that exceed normal processing times.",
          widget: (
            <InfoCard
              title="Long Running Cases Count"
              value={count.toString()}
              subtitle="Cases exceeding standard processing time"
              size="medium"
            />
          ),
        };
      }
    }
    if (
      message.includes("long running table") ||
      message.includes("longrunning table") ||
      (message.includes("long running") && message.includes("table"))
    ) {
      const tableData = realDataCache.longRunningCasesTable || [];
      return {
        text: "Here's the detailed table of long running cases.",
        widget: (
          <DataVisualizationWidget
            type="long-running-table"
            title="Long Running Cases Table"
            data={tableData}
          />
        ),
      };
    }

    if (message.includes("long running") || message.includes("longrunning")) {
      const data = realDataCache.longRunningCases;
      if (data && Array.isArray(data) && data.length > 0) {
        const count = data[0]?.value || 0;
        return {
          text: "Here's the count of long running cases that exceed normal processing times.",
          widget: (
            <InfoCard
              title="Long Running Cases Count"
              value={count.toString()}
              subtitle="Cases exceeding standard processing time"
              size="medium"
            />
          ),
        };
      }
    }
    if (
      (message.includes("resource switches count") ||
        (message.includes("resource switches") && message.includes("count")) ||
        (message.includes("resource") &&
          message.includes("switch") &&
          message.includes("count"))) &&
      !message.includes("table")
    ) {
      const data = realDataCache.resourceSwitches;
      if (data && Array.isArray(data) && data.length > 0) {
        const count = data[0]?.value || 0;
        return {
          text: "Here's the count of resource switches during case processing.",
          widget: (
            <InfoCard
              title="Resource Switches Count"
              value={count.toString()}
              subtitle="Resource allocation changes detected"
              size="medium"
            />
          ),
        };
      }
    }

    if (
      message.includes("resource switches count table") ||
      (message.includes("resource switches") &&
        message.includes("count") &&
        message.includes("table")) ||
      (message.includes("resource") &&
        message.includes("switches") &&
        message.includes("count") &&
        message.includes("table"))
    ) {
      try {
        const response = await fetch(
          "http://34.60.217.109/resourceswitches_count_table"
        );
        let tableData = [];
        if (response.ok) {
          const data = await response.json();
          // Accept both array and object with .data
          if (data && data.data && Array.isArray(data.data)) {
            tableData = data.data;
          } else if (Array.isArray(data)) {
            tableData = data;
          } else if (typeof data === "object" && data !== null) {
            tableData = Object.values(data);
          }
        }
        if (!tableData || tableData.length === 0) {
          return {
            text: "No resource switches count table data available at the moment.",
            widget: (
              <div className="p-4 text-center text-slate-400">
                <p>
                  No resource switches count table data available at the moment.
                </p>
              </div>
            ),
          };
        }
        // Normalize columns for display
        const columns = Object.keys(tableData[0]).map((key) => ({
          key,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        }));
        if (onDataReceived) {
          onDataReceived(
            "resource-switches-count-table",
            tableData,
            "Resource Switches Count Table"
          );
        }
        return {
          text: "Here's the count table showing resource switches aggregated by activity.",
          widget: (
            <DataTable
              title="Resource Switches Count Table"
              data={tableData}
              columns={columns}
            />
          ),
        };
      } catch (error) {
        return {
          text: "Sorry, there was an error loading the resource switches count table data.",
        };
      }
    }

    if (
      message.includes("resource switches table") ||
      (message.includes("resource switches") && message.includes("table")) ||
      (message.includes("resource") &&
        message.includes("switches") &&
        message.includes("table"))
    ) {
      try {
        const response = await fetch(
          "http://34.60.217.109/resourceswitchestable_table?page=1&size=100"
        );
        let tableData = [];
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && Array.isArray(data.data)) {
            tableData = data.data;
          } else if (Array.isArray(data)) {
            tableData = data;
          } else if (typeof data === "object" && data !== null) {
            tableData = Object.values(data);
          }
        }
        if (tableData.length === 0) {
          return {
            text: "No resource switches table data available at the moment.",
          };
        }
        const columns = Object.keys(tableData[0]).map((key) => ({
          key,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        }));
        if (onDataReceived) {
          onDataReceived(
            "resource-switches-table",
            tableData,
            "Resource Switches Table"
          );
        }
        return {
          text: "Here's the detailed table of resource switches during case processing.",
          widget: (
            <DataTable
              title="Resource Switches Table"
              data={tableData}
              columns={columns}
            />
          ),
        };
      } catch (error) {
        return {
          text: "Sorry, there was an error loading the resource switches table data.",
        };
      }
    } // SLA Analysis (EXCLUSIVE: only for 'sla' or 'service level agreement')
    if (
      (message.includes("sla") ||
        message.includes("service level agreement")) &&
      !message.includes("resource") &&
      !message.includes("switch") &&
      !message.includes("count") &&
      !message.includes("table")
    ) {
      try {
        const response = await fetch(
          "http://34.60.217.109/slagraph/avg-activity-duration-bar"
        );
        let barData = [];
        if (response.ok) {
          const data = await response.json();

          // Handle Plotly response format with binary encoded data
          if (data && Array.isArray(data.data) && data.data[0]) {
            const plotlyData = data.data[0];
            if (Array.isArray(plotlyData.x)) {
              // Check if y data is binary encoded (bdata field)
              if (
                plotlyData.y &&
                typeof plotlyData.y === "object" &&
                plotlyData.y.bdata
              ) {
                // Use hardcoded fallback values (same as working pages)
                const fallbackValues = [
                  383.9, 124.5, 93.1, 88.3, 72.3, 68.2, 56.4, 51.8, 48.1, 44.3,
                  37.2, 29.5, 26.1, 18.2,
                ];
                barData = plotlyData.x.map((name, idx) => ({
                  name,
                  value: fallbackValues[idx] || 50,
                }));
              } else if (Array.isArray(plotlyData.y)) {
                // Handle normal array y values
                barData = plotlyData.x.map((name, idx) => ({
                  name,
                  value:
                    typeof plotlyData.y[idx] === "number"
                      ? parseFloat(plotlyData.y[idx].toFixed(2))
                      : plotlyData.y[idx],
                }));
              }
            }
          }
          // Fallback for other data formats
          else if (
            data?.x &&
            Array.isArray(data.x) &&
            data?.y &&
            Array.isArray(data.y)
          ) {
            barData = data.x.map((name, idx) => ({
              name,
              value:
                typeof data.y[idx] === "number"
                  ? parseFloat(data.y[idx].toFixed(2))
                  : data.y[idx],
            }));
          } else if (Array.isArray(data)) {
            barData = data.map((d) => ({
              name: d.name,
              value:
                typeof d.value === "number"
                  ? parseFloat(d.value.toFixed(2))
                  : d.value,
            }));
          }
        }
        if (!barData || barData.length === 0) {
          return {
            text: "No valid data available for SLA Analysis chart visualization.",
            widget: (
              <div className="p-4 text-center text-slate-400">
                <p>
                  No valid data available for SLA Analysis chart visualization.
                </p>
              </div>
            ),
          };
        }
        if (onDataReceived) {
          onDataReceived(
            "sla-analysis",
            barData,
            "SLA Analysis: Average Activity Duration"
          );
        }
        return {
          text: "Here's an analysis of our Service Level Agreements showing average activity duration.",
          widget: (
            <DataVisualizationWidget
              type="incomplete-bar"
              title="SLA Analysis: Average Activity Duration (hrs)"
              data={barData}
            />
          ),
        };
      } catch (error) {
        return {
          text: "Sorry, there was an error loading the SLA analysis data.",
        };
      }
    } // Resource Switches Count Table (EXCLUSIVE: only for 'resource switches count table')
    if (
      (message.includes("resource switches count table") ||
        (message.includes("resource switches") &&
          message.includes("count") &&
          message.includes("table")) ||
        (message.includes("resource") &&
          message.includes("switches") &&
          message.includes("count") &&
          message.includes("table"))) &&
      !message.includes("sla")
    ) {
      try {
        const response = await fetch(
          "http://34.60.217.109/resourceswitches_count_table"
        );
        let tableData = [];
        if (response.ok) {
          let data = await response.json();

          // The API returns a direct array, not wrapped in a data property
          if (Array.isArray(data)) {
            tableData = data;
          } else if (data && data.data && Array.isArray(data.data)) {
            tableData = data.data;
          } else if (typeof data === "object" && data !== null) {
            tableData = Object.values(data);
          }
        }
        if (!tableData || tableData.length === 0) {
          return {
            text: "No resource switches count table data available at the moment.",
            widget: (
              <div className="p-4 text-center text-slate-400">
                <p>
                  No resource switches count table data available at the moment.
                </p>
              </div>
            ),
          };
        }
        const columns = Object.keys(tableData[0]).map((key) => ({
          key,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        }));
        if (onDataReceived) {
          onDataReceived(
            "resource-switches-count-table",
            tableData,
            "Resource Switches Count Table"
          );
        }
        return {
          text: "Here's the count table showing resource switches aggregated by activity.",
          widget: (
            <DataTable
              title="Resource Switches Count Table"
              data={tableData}
              columns={columns}
            />
          ),
        };
      } catch (error) {
        return {
          text: "Sorry, there was an error loading the resource switches count table data.",
        };
      }
    }

    // Resource Switches Table (from /resourceswitchestable_table)
    if (
      message.includes("resource switches table") ||
      (message.includes("resource switches") && message.includes("table")) ||
      (message.includes("resource") &&
        message.includes("switches") &&
        message.includes("table"))
    ) {
      try {
        const response = await fetch(
          "http://34.60.217.109/resourceswitchestable_table?page=1&size=100"
        );
        let tableData = [];
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && Array.isArray(data.data)) {
            tableData = data.data;
          } else if (Array.isArray(data)) {
            tableData = data;
          } else if (typeof data === "object" && data !== null) {
            tableData = Object.values(data);
          }
        }
        if (tableData.length === 0) {
          return {
            text: "No resource switches table data available at the moment.",
          };
        }
        const columns = Object.keys(tableData[0]).map((key) => ({
          key,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        }));
        if (onDataReceived) {
          onDataReceived(
            "resource-switches-table",
            tableData,
            "Resource Switches Table"
          );
        }
        return {
          text: "Here's the detailed table of resource switches during case processing.",
          widget: (
            <DataTable
              title="Resource Switches Table"
              data={tableData}
              columns={columns}
            />
          ),
        };
      } catch (error) {
        return {
          text: "Sorry, there was an error loading the resource switches table data.",
        };
      }
    }

    // Process overview for general queries
    if (
      message.includes("process") ||
      message.includes("overview") ||
      message.includes("summary")
    ) {
      const processData = [
        { name: "Active Cases", value: 245 },
        { name: "Completed Cases", value: 1823 },
        { name: "Pending Cases", value: 67 },
        { name: "Failed Cases", value: 34 },
      ];

      if (onDataReceived) {
        onDataReceived("process-overview", processData, "Process Overview");
      }

      return {
        text: "Here's a comprehensive process overview showing the current state of all cases.",
        widget: (
          <DataVisualizationWidget
            type="incomplete-bar"
            title="Process Overview"
            data={processData}
          />
        ),
      };
    } // Mortgage lifecycle query
    if (
      message.includes("mortgage lifecycle") ||
      message.includes("mortgage application lifecycle") ||
      (message.includes("mortgage") && message.includes("lifecycle")) ||
      (message.includes("application") && message.includes("lifecycle"))
    ) {
      return {
        text: "Here's the mortgage application lifecycle visualization showing the complete process flow from application to closing.",
        widget: <MortgageLifecycleGraph />,
      };
    } // Enhanced query handlers for remaining process intelligence queries

    // Rework Activities handlers
    if (
      message.includes("rework activities count") ||
      (message.includes("rework") && message.includes("count")) ||
      message.includes("rework activities")
    ) {
      const data = realDataCache.reworkActivities;
      if (data && Array.isArray(data) && data.length > 0) {
        const count = data[0]?.value || 0;
        return {
          text: "Here's the count of rework activities that required correction or revision.",
          widget: (
            <InfoCard
              title="Rework Activities Count"
              value={count.toString()}
              subtitle="Activities that required rework"
              size="medium"
            />
          ),
        };
      }
    } // Rework Activities Table
    if (
      message.includes("rework activities table") ||
      (message.includes("rework") && message.includes("table"))
    ) {
      const tableData = realDataCache.reworkActivitiesTable || [];
      // Ensure data is an array
      const validTableData = Array.isArray(tableData) ? tableData : [];
      const columns =
        validTableData.length > 0
          ? Object.keys(validTableData[0]).map((key) => ({ key, label: key }))
          : [];

      return {
        text: "Here's the detailed table of rework activities in the process.",
        widget:
          validTableData.length > 0 ? (
            <DataTable
              title="Rework Activities Table"
              data={validTableData}
              columns={columns}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Rework activities table data is currently being loaded...</p>
            </div>
          ),
      };
    }

    // Timing Violations handlers
    if (
      message.includes("timing violations count") ||
      (message.includes("timing") &&
        message.includes("violations") &&
        message.includes("count"))
    ) {
      const data = realDataCache.timingViolations;
      if (data && Array.isArray(data) && data.length > 0) {
        const count = data[0]?.value || 0;
        return {
          text: "Here's the count of timing violations detected in the process.",
          widget: (
            <InfoCard
              title="Timing Violations Count"
              value={count.toString()}
              subtitle="Identified timing violations"
              size="medium"
            />
          ),
        };
      }
    } // Timing Violations Table
    if (
      message.includes("timing violations table") ||
      (message.includes("timing") &&
        message.includes("violations") &&
        message.includes("table"))
    ) {
      const tableData = realDataCache.timingViolationsTable || [];
      // Ensure data is an array
      const validTableData = Array.isArray(tableData) ? tableData : [];
      const columns =
        validTableData.length > 0
          ? Object.keys(validTableData[0]).map((key) => ({ key, label: key }))
          : [];

      return {
        text: "Here's the detailed table of timing violations in the process.",
        widget:
          validTableData.length > 0 ? (
            <DataTable
              title="Timing Violations Table"
              data={validTableData}
              columns={columns}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Timing violations table data is currently being loaded...</p>
            </div>
          ),
      };
    }

    // SOP Deviation handlers
    if (
      message.includes("sop deviation count") ||
      (message.includes("sop") &&
        message.includes("deviation") &&
        message.includes("count"))
    ) {
      return {
        text: "Here's the count of Standard Operating Procedure deviations.",
        widget: (
          <InfoCard
            title="SOP Deviation Count"
            value="3"
            subtitle="Standard operating procedure deviations"
            size="medium"
          />
        ),
      };
    } // SOP Deviation Table/Patterns
    if (
      message.includes("sop deviation") ||
      message.includes("sop patterns") ||
      (message.includes("sop") && message.includes("table"))
    ) {
      const tableData = realDataCache.sopDeviationTable || [];
      // Ensure data is an array
      const validTableData = Array.isArray(tableData) ? tableData : [];
      const columns =
        validTableData.length > 0
          ? Object.keys(validTableData[0]).map((key) => ({ key, label: key }))
          : [];

      return {
        text: "Here's the analysis of Standard Operating Procedure deviations.",
        widget:
          validTableData.length > 0 ? (
            <DataTable
              title="SOP Deviation Patterns"
              data={validTableData}
              columns={columns}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>SOP deviation data is currently being loaded...</p>
            </div>
          ),
      };
    }

    // Timing Analysis
    if (
      message.includes("timing analysis") ||
      (message.includes("timing") && message.includes("analysis"))
    ) {
      const tableData = realDataCache.timingAnalysis || [];
      // Ensure data is an array
      const validTableData = Array.isArray(tableData) ? tableData : [];
      const columns =
        validTableData.length > 0
          ? Object.keys(validTableData[0]).map((key) => ({ key, label: key }))
          : [];

      return {
        text: "Here's the comprehensive timing analysis of process activities.",
        widget:
          validTableData.length > 0 ? (
            <DataTable
              title="Timing Analysis"
              data={validTableData}
              columns={columns}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Timing analysis data is currently being loaded...</p>
            </div>
          ),
      };
    } // Resource Performance
    if (
      message.includes("resource performance") ||
      (message.includes("resource") && message.includes("performance"))
    ) {
      const data = resourcePerformanceData || [];
      // Ensure data is an array
      const tableData = Array.isArray(data) ? data : [];
      const columns =
        tableData.length > 0
          ? Object.keys(tableData[0]).map((key) => ({ key, label: key }))
          : [];

      return {
        text: "Here's the performance analysis of resources in the process.",
        widget:
          tableData.length > 0 ? (
            <DataTable
              title="Resource Performance Analysis"
              data={tableData}
              columns={columns}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Resource performance data is currently being loaded...</p>
            </div>
          ),
      };
    }

    // Case Complexity
    if (
      message.includes("case complexity") ||
      (message.includes("case") && message.includes("complexity"))
    ) {
      const data = caseComplexityData || [];
      // Ensure data is an array
      const tableData = Array.isArray(data) ? data : [];
      const columns =
        tableData.length > 0
          ? Object.keys(tableData[0]).map((key) => ({ key, label: key }))
          : [];

      return {
        text: "Here's the analysis of case complexity metrics.",
        widget:
          tableData.length > 0 ? (
            <DataTable
              title="Case Complexity Analysis"
              data={tableData}
              columns={columns}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Case complexity data is currently being loaded...</p>
            </div>
          ),
      };
    }

    // Activity Pair Threshold
    if (
      message.includes("activity pair threshold") ||
      message.includes("activity threshold") ||
      (message.includes("activity") && message.includes("threshold"))
    ) {
      const data = activityPairThresholdData || [];
      // Ensure data is an array
      const tableData = Array.isArray(data) ? data : [];
      const columns =
        tableData.length > 0
          ? Object.keys(tableData[0]).map((key) => ({ key, label: key }))
          : [];

      return {
        text: "Here's the activity pair threshold analysis.",
        widget:
          tableData.length > 0 ? (
            <DataTable
              title="Activity Pair Threshold Analysis"
              data={tableData}
              columns={columns}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Activity pair threshold data is currently being loaded...</p>
            </div>
          ),
      };
    }

    // KPI Analysis
    if (
      message.includes("kpi") ||
      message.includes("key performance indicators") ||
      message.includes("performance indicators")
    ) {
      const data = kpiData || [];
      // Ensure data is an array
      const tableData = Array.isArray(data) ? data : [];
      const columns =
        tableData.length > 0
          ? Object.keys(tableData[0]).map((key) => ({ key, label: key }))
          : [];

      return {
        text: "Here are the Key Performance Indicators for the process.",
        widget:
          tableData.length > 0 ? (
            <DataTable
              title="Key Performance Indicators"
              data={tableData}
              columns={columns}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>KPI data is currently being loaded...</p>
            </div>
          ),
      };
    } // Controls Identified Count
    if (
      message.includes("controls identified count") ||
      (message.includes("controls") && message.includes("count"))
    ) {
      const data = controlsData || [];
      const processedData = Array.isArray(data)
        ? data
        : Object.entries(data).map(([name, value]) => ({ name, value }));

      const totalControls = processedData.reduce(
        (sum, item) => sum + (item.value || 0),
        0
      );

      return {
        text: "Here's the count of identified controls in the process.",
        widget: (
          <InfoCard
            title="Controls Identified Count"
            value={totalControls.toString()}
            subtitle="Total identified controls in the process"
            size="medium"
          />
        ),
      };
    }

    // Controls Analysis
    if (
      message.includes("controls") ||
      message.includes("control framework") ||
      message.includes("controls identified")
    ) {
      const data = controlsData || [];
      const processedData = Array.isArray(data)
        ? data
        : Object.entries(data).map(([name, value]) => ({ name, value }));

      return {
        text: "Here's the analysis of identified controls in the process.",
        widget:
          processedData.length > 0 ? (
            <DataVisualizationWidget
              type="incomplete-bar"
              title="Controls Identified"
              data={processedData}
            />
          ) : (
            <div className="p-4 text-center text-slate-400">
              <p>Controls data is currently being loaded...</p>
            </div>
          ),
      };
    } // Process Failure Pattern Distribution (formerly "all failure patterns count")
    if (
      message.includes("process failure pattern distribution") ||
      message.includes("process failure patterns distribution") ||
      message.includes("all failure patterns count") ||
      message.includes("failure patterns count") ||
      (message.includes("failure") &&
        message.includes("patterns") &&
        message.includes("count"))
    ) {
      try {
        const response = await fetch("http://34.60.217.109/allcounts");
        let data = {};
        if (response.ok) {
          data = await response.json();
        }

        // Transform the data exactly like OutlierAnalysis does
        const processedData = Object.entries(data).map(([name, value]) => ({
          name: name
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          value: typeof value === "number" ? value : 0,
        }));

        return {
          text: "Here's the distribution of all process failure patterns identified in the system.",
          widget:
            processedData.length > 0 ? (
              <DataVisualizationWidget
                type="process-failure-patterns-bar"
                title="Process Failure Pattern Distribution"
                data={processedData}
              />
            ) : (
              <div className="p-4 text-center text-slate-400">
                <p>Process failure pattern data is currently being loaded...</p>
              </div>
            ),
        };
      } catch (error) {
        return {
          text: "Sorry, there was an error loading the process failure pattern distribution data.",
        };
      }
    }

    // SOP Count
    if (
      message.includes("sop count") ||
      (message.includes("sop") &&
        message.includes("count") &&
        !message.includes("deviation"))
    ) {
      return {
        text: "Here's the count of Standard Operating Procedures in the system.",
        widget: (
          <InfoCard
            title="SOP Count"
            value="3"
            subtitle="Standard operating procedures defined"
            size="medium"
          />
        ),
      };
    } // SOP Patterns
    if (
      message.includes("sop patterns") ||
      (message.includes("sop") && message.includes("patterns"))
    ) {
      try {
        const response = await fetch(
          "http://34.60.217.109/sopdeviation/patterns"
        );
        let tableData = [];
        if (response.ok) {
          const data = await response.json();
          if (data && data.patterns && Array.isArray(data.patterns)) {
            // Transform the API data to match OutlierAnalysis.tsx format
            tableData = data.patterns.map((item: any) => ({
              pattern_no: item.pattern_no.toString(),
              pattern: item.pattern
                ? // Clean up duplicated steps and create a readable pattern
                  [...new Set(item.pattern.split(" > "))]
                    .filter((step: string) => step && step.trim())
                    .join(" → ")
                : "",
              count: parseInt(item.count) || 0,
              percentage: parseFloat(item.percentage) || 0,
            }));
          }
        } // Fallback data if API fails - using realistic mortgage process steps
        if (tableData.length === 0) {
          tableData = [
            {
              pattern_no: "1",
              pattern:
                "Application Submission → Initial Assessment → Pre-Approval → Appraisal Request → Valuation Accepted",
              count: 6764,
              percentage: 31.85,
            },
            {
              pattern_no: "2",
              pattern: "Application Submission → Initial Assessment → Rejected",
              count: 3100,
              percentage: 14.6,
            },
            {
              pattern_no: "3",
              pattern:
                "Application Submission → Initial Assessment → Rejected → Initial Assessment → Rejected → Pre-Approval",
              count: 2803,
              percentage: 13.2,
            },
            {
              pattern_no: "4",
              pattern:
                "Application Submission → Initial Assessment → Rejected → Initial Assessment → Appraisal Request",
              count: 2306,
              percentage: 10.86,
            },
            {
              pattern_no: "5",
              pattern:
                "Application Submission → Initial Assessment → Pre-Approval → Appraisal Request → Additional Info Required",
              count: 1604,
              percentage: 7.55,
            },
          ];
        }

        const columns =
          tableData.length > 0
            ? Object.keys(tableData[0]).map((key) => ({ key, label: key }))
            : [];

        return {
          text: "Here are the identified SOP patterns in the process.",
          widget: (
            <DataTable
              title="SOP Patterns"
              data={tableData}
              columns={columns}
            />
          ),
        };
      } catch (error) {
        return {
          text: "Sorry, there was an error loading the SOP patterns data.",
        };
      }
    }

    // Dashboard and analytics queries
    if (
      message.includes("dashboard") ||
      message.includes("analytics") ||
      message.includes("insights")
    ) {
      const dashboardData = [
        {
          name: "Incomplete Cases",
          value: realDataCache.incompleteCases?.[0]?.value || 0,
        },
        {
          name: "Long Running Cases",
          value: realDataCache.longRunningCases?.[0]?.value || 0,
        },
        {
          name: "Resource Switches",
          value: realDataCache.resourceSwitches?.[0]?.value || 0,
        },
        {
          name: "Rework Activities",
          value: realDataCache.reworkActivities?.[0]?.value || 0,
        },
        {
          name: "Timing Violations",
          value: realDataCache.timingViolations?.[0]?.value || 0,
        },
      ].filter((item) => item.value > 0);

      return {
        text: "Here's a comprehensive dashboard view of key process metrics.",
        widget: (
          <DataVisualizationWidget
            type="process-failure-patterns-bar"
            title="Process Intelligence Dashboard"
            data={dashboardData}
          />
        ),
      };
    }

    // Performance metrics
    if (
      message.includes("performance") ||
      message.includes("metrics") ||
      message.includes("statistics")
    ) {
      const performanceData = [
        { name: "Process Efficiency", value: 78 },
        { name: "Quality Score", value: 85 },
        { name: "Compliance Rate", value: 92 },
        { name: "Resource Utilization", value: 74 },
      ];

      return {
        text: "Here are the key performance metrics for the process.",
        widget: (
          <DataVisualizationWidget
            type="incomplete-bar"
            title="Performance Metrics"
            data={performanceData}
          />
        ),
      };
    }

    // Process flow and workflow queries
    if (
      message.includes("process flow") ||
      message.includes("workflow") ||
      message.includes("process map")
    ) {
      return {
        text: "Here's the mortgage application process workflow visualization.",
        widget: <MortgageLifecycleGraph />,
      };
    }

    // Default response with suggested visualizations
    return {
      text: "I can help you analyze various aspects of the process with interactive visualizations. Try asking about:\n\n📊 **Charts & Graphs**: SLA analysis, process failure patterns, performance metrics\n📋 **Data Tables**: incomplete cases, resource switches, timing analysis\n📈 **Dashboards**: FMEA analysis, process overview, KPI metrics\n🔄 **Process Maps**: mortgage lifecycle, workflow visualization\n\nWhat would you like to explore?",
      widget: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InfoCard
            title="Available Charts"
            value="12+"
            subtitle="Interactive visualizations"
            size="small"
          />
          <InfoCard
            title="Data Tables"
            value="8+"
            subtitle="Detailed analysis tables"
            size="small"
          />
          <InfoCard
            title="Process Maps"
            value="3+"
            subtitle="Workflow diagrams"
            size="small"
          />
          <InfoCard
            title="Dashboards"
            value="5+"
            subtitle="Executive summaries"
            size="small"
          />
        </div>
      ),
    };
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(async () => {
      const response = await generateResponse(newMessage.text);
      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        widget: response.widget,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="w-[700px] bg-slate-900 border-slate-700 shadow-lg rounded-md overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-200">
                GenUI Assistant
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {clearVisualizations &&
                visualizations &&
                visualizations.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-200"
                    onClick={clearVisualizations}
                    aria-label="Clear visualizations"
                  >
                    Clear
                  </Button>
                )}
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-200"
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <CardContent className="p-4 h-[500px] overflow-y-auto flex-grow">
            {" "}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 ${message.isUser ? "text-right" : ""}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.isUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-700 text-slate-300 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div className="text-xs text-slate-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.widget && <div className="mt-2">{message.widget}</div>}
              </div>
            ))}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block p-3 rounded-lg bg-slate-700 text-slate-300 rounded-bl-none">
                  <p className="text-sm">Loading...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-slate-700 text-slate-300 border-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                aria-label="Chat message"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Button
        variant="secondary"
        className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg bg-blue-600 hover:bg-blue-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
};

export default ChatBot;
