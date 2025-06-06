import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
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
import { fetchIncompleteCasesData } from "@/services/incompleteCasesService";
import { fetchLongRunningCasesData } from "@/services/longRunningCasesService";
import { fetchResourceSwitchesData } from "@/services/resourceSwitchesService";
import { fetchReworkActivitiesData } from "@/services/reworkActivitiesService";
import { fetchTimingViolationsData } from "@/services/timingViolationsService";
import { fetchSOPDeviationData } from "@/services/sopDeviationService";
import { fetchTimingAnalysisData } from "@/services/timingAnalysisService";

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
  clearVisualizations 
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
  const [realDataCache, setRealDataCache] = useState<{[key: string]: any}>({});

  useEffect(() => {
    fetchFMEAData();
    preloadRealData();
  }, []);

  const fetchFMEAData = async () => {
    try {
      // Fetch FMEA summary data
      const summaryResponse = await fetch('/latest_fmea_summary.json');
      const summary = await summaryResponse.json();
      setFmeaSummaryData(summary);

      // Fetch FMEA table data
      const tableResponse = await fetch('/fmea_table_20250605_221129.json');
      const table = await tableResponse.json();
      setFmeaTableData(table);

      // Fetch detailed results
      const detailedResponse = await fetch('/fmea_complete_results_20250605_221129.json');
      const detailed = await detailedResponse.json();

      // Parse rating data from JSON strings
      if (detailed.ratings && detailed.ratings.severity && detailed.ratings.severity.full_response) {
        const severityMatch = detailed.ratings.severity.full_response.match(/```json\n([\s\S]*?)\n```/);
        if (severityMatch) {
          setFmeaSeverityData(JSON.parse(severityMatch[1]));
        }
      }

      if (detailed.ratings && detailed.ratings.likelihood && detailed.ratings.likelihood.full_response) {
        const likelihoodMatch = detailed.ratings.likelihood.full_response.match(/```json\n([\s\S]*?)\n```/);
        if (likelihoodMatch) {
          setFmeaLikelihoodData(JSON.parse(likelihoodMatch[1]));
        }
      }

      if (detailed.ratings && detailed.ratings.detectability && detailed.ratings.detectability.full_response) {
        const detectabilityMatch = detailed.ratings.detectability.full_response.match(/```json\n([\s\S]*?)\n```/);
        if (detectabilityMatch) {
          setFmeaDetectabilityData(JSON.parse(detectabilityMatch[1]));
        }
      }
    } catch (error) {
      console.error('Error fetching FMEA data:', error);
    }
  };

  const preloadRealData = async () => {
    try {
      const [
        incompleteCases,
        longRunningCases,
        resourceSwitches,
        reworkActivities,
        timingViolations,
        sopDeviation,
        timingAnalysis
      ] = await Promise.all([
        fetchIncompleteCasesData(),
        fetchLongRunningCasesData(),
        fetchResourceSwitchesData(),
        fetchReworkActivitiesData(),
        fetchTimingViolationsData(),
        fetchSOPDeviationData(),
        fetchTimingAnalysisData()
      ]);

      setRealDataCache({
        incompleteCases,
        longRunningCases,
        resourceSwitches,
        reworkActivities,
        timingViolations,
        sopDeviation,
        timingAnalysis
      });
    } catch (error) {
      console.error('Error preloading real data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): { text: string; widget?: React.ReactNode } => {
    const message = userMessage.toLowerCase();
    
    // FMEA-related responses
    if (message.includes("severity analysis") || (message.includes("fmea") && message.includes("severity"))) {
      const severityCols = fmeaSeverityData.length > 0
        ? Object.keys(fmeaSeverityData[0]).map((key) => ({ key, label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
        : [];
      
      const response = {
        text: "Here's the severity analysis showing the impact assessment of different failure modes with their severity scores and justifications.",
        widget: fmeaSeverityData.length > 0 ? (
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
        onDataReceived("fmea-severity", fmeaSeverityData, "FMEA Severity Analysis");
      }

      return response;
    }

    if (message.includes("likelihood analysis") || (message.includes("fmea") && (message.includes("likelihood") || message.includes("probability")))) {
      const likelihoodCols = fmeaLikelihoodData.length > 0
        ? Object.keys(fmeaLikelihoodData[0]).map((key) => ({ key, label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
        : [];
      
      const response = {
        text: "Here's the likelihood analysis showing the probability assessment of failure modes occurring.",
        widget: fmeaLikelihoodData.length > 0 ? (
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
        onDataReceived("fmea-likelihood", fmeaLikelihoodData, "FMEA Likelihood Analysis");
      }

      return response;
    }

    if (message.includes("detectability analysis") || (message.includes("fmea") && (message.includes("detectability") || message.includes("detection")))) {
      const detectabilityCols = fmeaDetectabilityData.length > 0
        ? Object.keys(fmeaDetectabilityData[0]).map((key) => ({ key, label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
        : [];
      
      const response = {
        text: "Here's the detectability analysis showing how well we can detect failure modes before they impact customers.",
        widget: fmeaDetectabilityData.length > 0 ? (
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
        onDataReceived("fmea-detectability", fmeaDetectabilityData, "FMEA Detectability Analysis");
      }

      return response;
    }

    if (message.includes("fmea") || message.includes("failure mode") || message.includes("risk priority")) {
      if (message.includes("table") || message.includes("analysis table")) {
        const fmeaTableCols = fmeaTableData.length > 0
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
      const dashboardData = fmeaSummaryData ? [
        { name: 'Severity', value: fmeaSummaryData.severity_rating, color: '#ef4444' },
        { name: 'Likelihood', value: fmeaSummaryData.likelihood_rating, color: '#f59e0b' },
        { name: 'Detectability', value: fmeaSummaryData.detectability_rating, color: '#10b981' }
      ] : [];

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
        onDataReceived("fmea-dashboard", dashboardData, "FMEA Risk Rating Distribution");
      }

      return response;
    }

    // Use real data for other queries
    if (message.includes("incomplete") || message.includes("incomplete cases")) {
      const data = realDataCache.incompleteCases;
      if (data) {
        if (onDataReceived) {
          onDataReceived("incomplete-cases", data, "Incomplete Cases Analysis");
        }
        return {
          text: "Here's the analysis of incomplete cases in the mortgage process.",
          widget: (
            <DataVisualizationWidget
              type="incomplete-bar"
              title="Incomplete Cases"
              data={data}
            />
          ),
        };
      }
    }

    if (message.includes("long running") || message.includes("longrunning")) {
      const data = realDataCache.longRunningCases;
      if (data) {
        if (onDataReceived) {
          onDataReceived("long-running-cases", data, "Long Running Cases Analysis");
        }
        return {
          text: "Here's the analysis of long running cases that exceed normal processing times.",
          widget: (
            <DataVisualizationWidget
              type="longrunning-bar"
              title="Long Running Cases"
              data={data}
            />
          ),
        };
      }
    }

    if (message.includes("resource switches") || (message.includes("resource") && message.includes("switch"))) {
      const data = realDataCache.resourceSwitches;
      if (data) {
        if (onDataReceived) {
          onDataReceived("resource-switches", data, "Resource Switches Analysis");
        }
        return {
          text: "Here's the analysis of resource switches during case processing.",
          widget: (
            <DataVisualizationWidget
              type="resource-switches-bar"
              title="Resource Switches"
              data={data}
            />
          ),
        };
      }
    }

    if (message.includes("rework") || message.includes("rework activities")) {
      const data = realDataCache.reworkActivities;
      if (data) {
        if (onDataReceived) {
          onDataReceived("rework-activities", data, "Rework Activities Analysis");
        }
        return {
          text: "Here's the analysis of rework activities in the process.",
          widget: (
            <DataVisualizationWidget
              type="rework-activities-bar"
              title="Rework Activities"
              data={data}
            />
          ),
        };
      }
    }

    if (message.includes("timing violations") || (message.includes("timing") && message.includes("violation"))) {
      const data = realDataCache.timingViolations;
      if (data) {
        if (onDataReceived) {
          onDataReceived("timing-violations", data, "Timing Violations Analysis");
        }
        return {
          text: "Here's the analysis of timing violations in the process.",
          widget: (
            <DataVisualizationWidget
              type="timing-violations-bar"
              title="Timing Violations"
              data={data}
            />
          ),
        };
      }
    }

    if (message.includes("sop") || message.includes("standard operating") || message.includes("deviation")) {
      const data = realDataCache.sopDeviation;
      if (data) {
        if (onDataReceived) {
          onDataReceived("sop-deviation", data, "SOP Deviation Analysis");
        }
        return {
          text: "Here's the analysis of Standard Operating Procedure deviations.",
          widget: <SOPWidget />,
        };
      }
    }

    if (message.includes("timing analysis") || (message.includes("timing") && message.includes("analysis"))) {
      const data = realDataCache.timingAnalysis;
      if (data) {
        if (onDataReceived) {
          onDataReceived("timing-analysis", data, "Timing Analysis");
        }
        return {
          text: "Here's the detailed timing analysis of process activities.",
          widget: <TimingAnalysisTable />,
        };
      }
    }

    if (message.includes("resource") && (message.includes("performance") || message.includes("efficiency"))) {
      return {
        text: "Here's a performance analysis of our resources, showing efficiency and utilization metrics.",
        widget: <ResourcePerformanceTable />,
      };
    }

    if (message.includes("sla") || message.includes("service level agreement")) {
      const slaData = [
        { name: "Valuation Accepted", value: 383.9 },
        { name: "Valuation Issues", value: 124.5 },
        { name: "Final Approval", value: 72.3 },
        { name: "Pre-Approval", value: 48.1 },
      ];

      if (onDataReceived) {
        onDataReceived("sla-analysis", slaData, "SLA Analysis: Average Activity Duration");
      }

      return {
        text: "Here's an analysis of our Service Level Agreements showing average activity duration.",
        widget: (
          <DataVisualizationWidget
            type="incomplete-bar"
            title="SLA Analysis: Average Activity Duration (hrs)"
            data={slaData}
          />
        ),
      };
    }

    // Process overview for general queries
    if (message.includes("process") || message.includes("overview") || message.includes("summary")) {
      const processData = [
        { name: "Active Cases", value: 245 },
        { name: "Completed Cases", value: 1823 },
        { name: "Pending Cases", value: 67 },
        { name: "Failed Cases", value: 34 }
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
    }

    // Default response for unrecognized queries
    return {
      text: "I can help you analyze various aspects of the process. Try asking about: incomplete cases, long running cases, resource switches, rework activities, timing violations, SOP deviations, timing analysis, resource performance, FMEA analysis, or SLA performance.",
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

    setTimeout(() => {
      const response = generateResponse(newMessage.text);
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
              {clearVisualizations && visualizations && visualizations.length > 0 && (
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
                {message.widget && (
                  <div className="mt-2">
                    {message.widget}
                  </div>
                )}
              </div>
            ))}
            
            {visualizations && visualizations.length > 0 && (
              <div className="mb-3">
                <div className="bg-slate-700 text-slate-300 rounded-lg p-3">
                  <p className="text-sm mb-2">External visualizations:</p>
                  {visualizations.map((viz) => (
                    <div key={viz.id} className="mb-2 p-2 bg-slate-600 rounded">
                      <p className="text-xs font-medium">{viz.title}</p>
                      <p className="text-xs text-slate-400">Type: {viz.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
