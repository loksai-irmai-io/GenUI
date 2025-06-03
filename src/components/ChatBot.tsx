import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Minimize2, Loader2 } from "lucide-react";
import { sopDeviationService } from "@/services/sopDeviationService";
import { incompleteCasesService } from "@/services/incompleteCasesService";
import { longRunningCasesService } from "@/services/longRunningCasesService";
import { resourceSwitchesService } from "@/services/resourceSwitchesService";
import { reworkActivitiesService } from "@/services/reworkActivitiesService";
import { timingViolationsService } from "@/services/timingViolationsService";
import { caseComplexityService } from "@/services/caseComplexityService";
import { resourcePerformanceService } from "@/services/resourcePerformanceService";
import { timingAnalysisService } from "@/services/timingAnalysisService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DataVisualizationWidget from "./widgets/DataVisualizationWidget";
import SOPWidget from "./widgets/SOPWidget";
import { ConflictDialog } from "@/components/ui/alert-dialog";
import ProcessFlowGraph from "./ProcessFlowGraph";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface DataVisualizationProps {
  onDataReceived: (type: string, data: any[], title: string) => void;
  visualizations?: Array<{
    id: string;
    type: string;
    data: any[];
    title: string;
  }>;
  clearVisualizations?: () => void;
}

const ChatBot: React.FC<DataVisualizationProps> = ({
  onDataReceived,
  visualizations = [],
  clearVisualizations,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your GenUI assistant. Ask me about 'SOP deviation', 'Incomplete cases', or 'Long running cases' to visualize real data!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | undefined>(
    undefined
  );
  const { user } = useAuth();
  const { toast } = useToast(); // Debug visualizations state changes
  useEffect(() => {
    console.log(
      "[ChatBot] Visualizations updated:",
      JSON.stringify(visualizations)
    );

    // Alert for debugging - remove in production
    if (visualizations && visualizations.length > 0) {
      console.log("DEBUG - Visualization data structure:", {
        type: visualizations[0].type,
        data: JSON.stringify(visualizations[0].data).substring(0, 100) + "...",
        isArray: Array.isArray(visualizations[0].data),
        dataLength: Array.isArray(visualizations[0].data)
          ? visualizations[0].data.length
          : "not an array",
        hasCorrectProps:
          Array.isArray(visualizations[0].data) &&
          visualizations[0].data.length > 0
            ? "First item props: " +
              Object.keys(visualizations[0].data[0]).join(", ")
            : "No items or not array",
      });
    }
  }, [visualizations]);

  // Direct endpoint fetchers for chatbot visualizations
  const fetchVisualizationData = async (type: string) => {
    switch (type) {
      case "incomplete-bar": {
        const res = await fetch("http://127.0.0.1:8001/incompletecases/count");
        if (!res.ok) throw new Error("Failed to fetch incomplete cases");
        const data = await res.json();
        // API returns { incomplete: number, complete: number }
        if (Array.isArray(data)) return data;
        if (typeof data === "object" && data !== null) {
          // Normalize to [{ name, value }]
          return Object.entries(data).map(([name, value]) => ({ name, value }));
        }
        return [];
      }
      case "longrunning-bar": {
        const res = await fetch("http://127.0.0.1:8001/longrunningcases/count");
        if (!res.ok) throw new Error("Failed to fetch long running cases");
        const data = await res.json();
        // API returns { long_running: number, regular: number }
        if (Array.isArray(data)) return data;
        if (typeof data === "object" && data !== null) {
          return Object.entries(data).map(([name, value]) => ({ name, value }));
        }
        return [];
      }
      case "rework-activities-bar": {
        const res = await fetch("http://127.0.0.1:8001/reworkactivities/count");
        if (!res.ok) throw new Error("Failed to fetch rework activities");
        const data = await res.json();
        // API returns { rework_activities: number }
        if (Array.isArray(data)) return data;
        if (typeof data === "object" && data !== null) {
          return Object.entries(data).map(([name, value]) => ({ name, value }));
        }
        return [];
      }
      case "resource-switches-bar": {
        const res = await fetch("http://127.0.0.1:8001/resourceswitches/count");
        if (!res.ok) throw new Error("Failed to fetch resource switches");
        const data = await res.json();
        // API returns { resource_switches: number }
        if (Array.isArray(data)) return data;
        if (typeof data === "object" && data !== null) {
          return Object.entries(data).map(([name, value]) => ({ name, value }));
        }
        return [];
      }
      case "timing-violations-bar": {
        const res = await fetch("http://127.0.0.1:8001/timingviolations/count");
        if (!res.ok) throw new Error("Failed to fetch timing violations");
        const data = await res.json();
        // API returns { timing_violations: number }
        if (Array.isArray(data)) return data;
        if (typeof data === "object" && data !== null) {
          return Object.entries(data).map(([name, value]) => ({ name, value }));
        }
        return [];
      }
      case "sop-count":
      case "sop-patterns": {
        const res = await fetch("http://127.0.0.1:8001/sopdeviation");
        if (!res.ok) throw new Error("Failed to fetch sop deviation");
        const data = await res.json();
        if (!data || !Array.isArray(data.data)) return [];
        if (type === "sop-count") {
          const total = data.data.reduce(
            (sum, row) => sum + parseInt(row.pattern_count),
            0
          );
          const deviation = data.data
            .filter((row) => row.is_sop_deviation === 1)
            .reduce((sum, row) => sum + parseInt(row.pattern_count), 0);
          const percentage = total ? (deviation / total) * 100 : 0;
          return [
            {
              count: deviation,
              percentage: Math.round(percentage * 100) / 100,
              threshold: "30%",
            },
          ];
        } else {
          return data.data.map((row, idx) => ({
            pattern_no: idx + 1,
            pattern:
              Array.isArray(row.sop_deviation_sequence_preview) &&
              row.sop_deviation_sequence_preview.length > 0
                ? row.sop_deviation_sequence_preview.slice(0, 5).join(" → ") +
                  (row.sop_deviation_sequence_preview.length > 5 ? " ..." : "")
                : "",
            count: row.pattern_count,
            percentage: row.percentage,
          }));
        }
      }
      case "case-complexity-table": {
        const res = await fetch(
          "http://127.0.0.1:8001/casecomplexity?page=1&size=100"
        );
        if (!res.ok) throw new Error("Failed to fetch case complexity");
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
      }
      case "resource-performance-table": {
        const res = await fetch("http://127.0.0.1:8001/resourceperformance");
        if (!res.ok) throw new Error("Failed to fetch resource performance");
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
      }
      case "timing-analysis-table": {
        const res = await fetch("http://127.0.0.1:8001/timinganalysis");
        if (!res.ok) throw new Error("Failed to fetch timing analysis");
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
      }
      case "process-failure-patterns-bar": {
        const res = await fetch("http://127.0.0.1:8001/allcounts");
        if (!res.ok)
          throw new Error("Failed to fetch process failure patterns");
        let data = await res.json();
        if (data && !Array.isArray(data)) {
          data = Object.entries(data).map(([name, value]) => ({ name, value }));
        }
        return Array.isArray(data) ? data : [];
      }
      default:
        return null;
    }
  };

  const handleSOPDeviation = async () => {
    try {
      // Fetch count and patterns from API endpoints
      const [countData, patternsData] = await Promise.all([
        sopDeviationService.getSOPDeviationCount(),
        sopDeviationService.getSOPDeviationPatterns(),
      ]);
      // Add a delay to ensure visualizations render after messages
      setTimeout(() => {
        // Show count as a pie chart
        onDataReceived("sop-count", [countData], "SOP Deviation Count");
        // Show patterns as a bar chart
        onDataReceived(
          "sop-patterns",
          Array.isArray(patternsData)
            ? patternsData
            : patternsData
            ? [patternsData]
            : [],
          "SOP Deviation Patterns"
        );
      }, 100);

      const successMessage: Message = {
        id: Date.now(),
        text: `Loaded SOP deviation data! Percentage: ${countData.percentage}%. Found ${patternsData.length} patterns. Visualizations added to your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching SOP deviation data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching SOP deviation data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the SOP deviation data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleIncompleteCases = async () => {
    try {
      const data = await incompleteCasesService.getCountBar();
      console.log("[ChatBot] incompleteCasesService.getCountBar result:", data);
      // Add a delay to ensure visualization renders after messages
      setTimeout(() => {
        onDataReceived("incomplete-bar", data, "Incomplete Cases Analysis");
      }, 100);

      const successMessage: Message = {
        id: Date.now(),
        text: `Successfully loaded incomplete cases data from API! The analysis shows the distribution of complete vs incomplete cases. The data has been visualized as a bar chart on your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching incomplete cases data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching incomplete cases data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the incomplete cases data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleLongRunningCases = async () => {
    try {
      const data = await longRunningCasesService.getCountBar();
      // Add a delay to ensure visualization renders after messages
      setTimeout(() => {
        onDataReceived("longrunning-bar", data, "Long Running Cases Analysis");
      }, 100);

      const successMessage: Message = {
        id: Date.now(),
        text: `Successfully loaded long running cases data from API! Found ${
          data[0]?.value || 0
        } long running cases. The data has been visualized as a bar chart on your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching long running cases data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching long running cases data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the long running cases data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleResourceSwitches = async () => {
    try {
      const data = await resourceSwitchesService.getCountBar();
      onDataReceived("resource-switches-bar", data, "Resource Switches");
      const successMessage: Message = {
        id: Date.now(),
        text: `Loaded resource switches data! Visualized as a bar chart on your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching resource switches data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching resource switches data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the resource switches data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleReworkActivities = async () => {
    try {
      const data = await reworkActivitiesService.getCountBar();
      onDataReceived("rework-activities-bar", data, "Rework Activities");
      const successMessage: Message = {
        id: Date.now(),
        text: `Loaded rework activities data! Visualized as a bar chart on your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching rework activities data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching rework activities data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the rework activities data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleTimingViolations = async () => {
    try {
      const data = await timingViolationsService.getCountBar();
      onDataReceived("timing-violations-bar", data, "Timing Violations");
      const successMessage: Message = {
        id: Date.now(),
        text: `Loaded timing violations data! Visualized as a bar chart on your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching timing violations data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching timing violations data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the timing violations data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleCaseComplexityTable = async () => {
    try {
      const data = await caseComplexityService.getTable();
      onDataReceived(
        "case-complexity-table",
        Array.isArray(data) ? data : [],
        "Case Complexity Details"
      );
      const successMessage: Message = {
        id: Date.now(),
        text: `Loaded case complexity table data! Visualized as a table on your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching case complexity data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching case complexity table data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the case complexity table data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleResourcePerformance = async () => {
    try {
      const data = await resourcePerformanceService.getTable();
      onDataReceived(
        "resource-performance-table",
        data,
        "Resource Performance"
      );
      const successMessage: Message = {
        id: Date.now(),
        text: `Loaded resource performance data! Visualized as a table on your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching resource performance data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching resource performance data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the resource performance data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleTimingAnalysis = async () => {
    try {
      const data = await timingAnalysisService.getTable();
      onDataReceived("timing-analysis-table", data, "Timing Analysis");
      const successMessage: Message = {
        id: Date.now(),
        text: `Loaded timing analysis data! Visualized as a table on your chatbot.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching timing analysis data. Please try again."
        );
        setConflictOpen(true);
      } else {
        console.error("Error fetching timing analysis data:", error);
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, I couldn't fetch the timing analysis data from the API.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleProcessFailurePatterns = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/allcounts");
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      let data = await response.json();
      // Transform object to array for recharts
      if (data && !Array.isArray(data)) {
        data = Object.entries(data).map(([name, value]) => ({ name, value }));
      }
      onDataReceived(
        "process-failure-patterns-bar",
        Array.isArray(data) ? data : [],
        "Process Failure Patterns Distribution"
      );
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Loaded process failure patterns data! Visualized as a bar chart on your chatbot.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      if (
        error?.message?.includes("409") ||
        error?.toString().includes("409")
      ) {
        setConflictMessage(
          "A conflict occurred while fetching process failure patterns data. Please try again."
        );
        setConflictOpen(true);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Sorry, I couldn't fetch the process failure patterns data from the API.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  // Placeholder: Replace with your real LLM API call
  async function fetchAIAnalysis(question: string): Promise<string> {
    // Example: Call your backend or OpenAI API here
    // For now, just echo the question
    return `AI Analysis: Sorry, I can't answer this yet. (You asked: "${question}")`;
  }

  // Helper: determine if the last user message was a visualization request
  const isLastUserMessageVisualization = () => {
    if (messages.length === 0) return false;
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.sender === "user");
    if (!lastUserMsg) return false;
    const lower = lastUserMsg.text.toLowerCase();
    return (
      lower.includes("sop deviation") ||
      lower.includes("incomplete cases") ||
      lower.includes("long running cases") ||
      lower.includes("resource switches") ||
      lower.includes("rework activities") ||
      lower.includes("timing violations") ||
      lower.includes("case complexity") ||
      lower.includes("resource performance") ||
      lower.includes("timing analysis") ||
      lower.includes("process failure patterns") ||
      lower.includes("object lifecycle")
    );
  };

  // Helper: get the most recent visualization type from the last user message
  const getLastVisualizationType = () => {
    if (messages.length === 0) return null;
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.sender === "user");
    if (!lastUserMsg) return null;
    const lower = lastUserMsg.text.toLowerCase();
    if (lower.includes("sop deviation")) return "sop-patterns";
    if (lower.includes("incomplete cases")) return "incomplete-bar";
    if (lower.includes("long running cases")) return "longrunning-bar";
    if (lower.includes("resource switches")) return "resource-switches-bar";
    if (lower.includes("rework activities")) return "rework-activities-bar";
    if (lower.includes("timing violations")) return "timing-violations-bar";
    if (lower.includes("case complexity")) return "case-complexity-table";
    if (lower.includes("resource performance"))
      return "resource-performance-table";
    if (lower.includes("timing analysis")) return "timing-analysis-table";
    if (lower.includes("process failure patterns"))
      return "process-failure-patterns-bar";
    if (lower.includes("object lifecycle")) return "object-lifecycle";
    return null;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Clear previous visualizations before adding new ones
    if (clearVisualizations) clearVisualizations();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access data visualization features.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    const lowerMessage = message.toLowerCase();

    try {
      if (lowerMessage.includes("incomplete cases")) {
        const data = await fetchVisualizationData("incomplete-bar");
        if (data) {
          // Direct call - no delay
          console.log("Got incomplete cases data:", data);
          onDataReceived("incomplete-bar", data, "Incomplete Cases Analysis");

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: `Successfully loaded incomplete cases data from endpoint! The analysis shows the distribution of complete vs incomplete cases. The data has been visualized as a bar chart on your chatbot.`,
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          return;
        }
      } else if (lowerMessage.includes("long running cases")) {
        const data = await fetchVisualizationData("longrunning-bar");
        if (data) {
          // Direct call - no delay
          console.log("Got long running cases data:", data);
          onDataReceived(
            "longrunning-bar",
            data,
            "Long Running Cases Analysis"
          );

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: `Successfully loaded long running cases data from endpoint! The data has been visualized as a bar chart on your chatbot.`,
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          return;
        }
      } else if (lowerMessage.includes("sop deviation")) {
        const countData = await fetchVisualizationData("sop-count");
        const patternsData = await fetchVisualizationData("sop-patterns");
        if (countData && patternsData) {
          // Add a small delay to ensure visualizations render after messages
          setTimeout(() => {
            onDataReceived("sop-count", countData, "SOP Deviation Count");
            onDataReceived(
              "sop-patterns",
              patternsData,
              "SOP Deviation Patterns"
            );
          }, 100);

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: `Loaded SOP deviation data from endpoint! Visualizations added to your chatbot.`,
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          return;
        }
      }
      // fallback to original logic for other types and AI analysis
      if (lowerMessage.includes("sop deviation")) {
        await handleSOPDeviation();
      } else if (lowerMessage.includes("incomplete cases")) {
        await handleIncompleteCases();
      } else if (lowerMessage.includes("long running cases")) {
        await handleLongRunningCases();
      } else if (lowerMessage.includes("resource switches")) {
        await handleResourceSwitches();
      } else if (lowerMessage.includes("rework activities")) {
        await handleReworkActivities();
      } else if (lowerMessage.includes("timing violations")) {
        await handleTimingViolations();
      } else if (lowerMessage.includes("case complexity")) {
        await handleCaseComplexityTable();
      } else if (lowerMessage.includes("resource performance")) {
        await handleResourcePerformance();
      } else if (lowerMessage.includes("timing analysis")) {
        await handleTimingAnalysis();
      } else if (lowerMessage.includes("process failure patterns")) {
        await handleProcessFailurePatterns();
      } else if (lowerMessage.includes("object lifecycle")) {
        onDataReceived("object-lifecycle", [], "Object Lifecycle");
        setTimeout(() => {
          const botResponse: Message = {
            id: Date.now() + 1,
            text: "Here is the Object Lifecycle process flow graph!",
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botResponse]);
        }, 500);
      } else {
        // AI analysis for general questions
        const aiResponse = await fetchAIAnalysis(message);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: aiResponse,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-12 h-12 text-white" />
        </Button>
      ) : (
        <Card className="w-[540px] h-[700px] shadow-2xl border-0 bg-white">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center space-x-2">
                <MessageCircle className="w-6 h-6" />
                <span>GenUI Assistant</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[620px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[85%]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </div>
              )}{" "}
              {/* VISUALIZATIONS SECTION */}
              <div className="mt-6 space-y-6 visualization-container">
                {/* Dynamic visualization from props */}
                {visualizations && visualizations.length > 0 && (
                  <>
                    {visualizations.map((viz, idx) => (
                      <div
                        className="bg-white border rounded-lg shadow p-4 mb-4"
                        key={
                          viz.id +
                          "-" +
                          viz.type +
                          "-" +
                          (viz.title || "") +
                          "-" +
                          idx
                        }
                      >
                        <h3 className="text-lg font-bold mb-2">
                          {viz.title || "Data Visualization"}
                        </h3>
                        {/* Visualization renderer with proper type checking and data handling */}
                        {(() => {
                          // Explicit SOPWidget types
                          if (viz.type === "sop-count") {
                            return (
                              <SOPWidget
                                type="count"
                                data={
                                  Array.isArray(viz.data) && viz.data.length > 0
                                    ? viz.data[0]
                                    : {
                                        count: 0,
                                        percentage: 0,
                                        threshold: "30%",
                                      }
                                }
                                visualizationType="bar"
                                title={viz.title || "SOP Count"}
                              />
                            );
                          }
                          if (viz.type === "sop-patterns") {
                            return (
                              <SOPWidget
                                type="patterns"
                                data={Array.isArray(viz.data) ? viz.data : []}
                                visualizationType="bar"
                                title={viz.title || "SOP Patterns"}
                              />
                            );
                          }
                          // All other supported DataVisualizationWidget types
                          const supportedTypes = [
                            "incomplete-bar",
                            "longrunning-bar",
                            "resource-switches-bar",
                            "rework-activities-bar",
                            "timing-violations-bar",
                            "case-complexity-bar",
                            "case-complexity-table",
                            "resource-performance-table",
                            "timing-analysis-table",
                            "process-failure-patterns-bar",
                            "sop-table",
                          ];
                          if (supportedTypes.includes(viz.type)) {
                            return (
                              <DataVisualizationWidget
                                type={viz.type as any}
                                data={
                                  Array.isArray(viz.data) && viz.data.length > 0
                                    ? viz.data
                                    : [{ name: "No Data", value: 0 }]
                                }
                                title={viz.title || "Data Visualization"}
                              />
                            );
                          }
                          // Fallback for unknown types
                          return (
                            <div className="text-gray-500 text-center">
                              Unsupported visualization type: {viz.type}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div className="border-t p-3 flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about SOP deviation, incomplete cases, or long running cases..."
                className="flex-1 text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <ConflictDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        message={conflictMessage}
      />
    </div>
  );
};

export default ChatBot;
