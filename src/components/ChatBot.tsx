
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
  const { user } = useAuth();
  const { toast } = useToast();

  // Debug visualizations state changes
  useEffect(() => {
    console.log("[ChatBot] Visualizations updated:", JSON.stringify(visualizations));
  }, [visualizations]);

  const handleApiError = (error: any, dataType: string) => {
    console.error(`Error fetching ${dataType} data:`, error);
    
    let errorMessage = `Sorry, I couldn't fetch the ${dataType} data.`;
    
    if (error?.message?.includes("404")) {
      errorMessage = `The ${dataType} endpoint was not found. Please check if the API is running on port 8001.`;
    } else if (error?.message?.includes("409")) {
      errorMessage = `There was a conflict while fetching ${dataType} data. This might be a temporary issue, please try again.`;
    } else if (error?.message?.includes("Failed to fetch")) {
      errorMessage = `Cannot connect to the API server. Please ensure the backend is running on http://127.0.0.1:8001.`;
    }
    
    const errorMsg: Message = {
      id: Date.now(),
      text: errorMessage,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMsg]);
  };

  const fetchVisualizationData = async (type: string) => {
    const baseUrl = "http://127.0.0.1:8001";
    
    try {
      let endpoint = "";
      switch (type) {
        case "incomplete-bar":
          endpoint = "/incompletecases/count";
          break;
        case "longrunning-bar":
          endpoint = "/longrunningcases/count";
          break;
        case "rework-activities-bar":
          endpoint = "/reworkactivities/count";
          break;
        case "resource-switches-bar":
          endpoint = "/resourceswitches/count";
          break;
        case "timing-violations-bar":
          endpoint = "/timingviolations/count";
          break;
        case "sop-count":
        case "sop-patterns":
          endpoint = "/sopdeviation";
          break;
        case "case-complexity-table":
          endpoint = "/casecomplexity?page=1&size=100";
          break;
        case "resource-performance-table":
          endpoint = "/resourceperformance";
          break;
        case "timing-analysis-table":
          endpoint = "/timinganalysis";
          break;
        case "process-failure-patterns-bar":
          endpoint = "/allcounts";
          break;
        default:
          throw new Error(`Unknown visualization type: ${type}`);
      }

      console.log(`[ChatBot] Fetching data from: ${baseUrl}${endpoint}`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[ChatBot] Received data for ${type}:`, data);

      // Process the data based on type
      if (type === "sop-count" && data?.data) {
        const total = data.data.reduce((sum: number, row: any) => sum + parseInt(row.pattern_count), 0);
        const deviation = data.data
          .filter((row: any) => row.is_sop_deviation === 1)
          .reduce((sum: number, row: any) => sum + parseInt(row.pattern_count), 0);
        const percentage = total ? (deviation / total) * 100 : 0;
        
        return {
          count: deviation,
          percentage: Math.round(percentage * 100) / 100,
          threshold: "30%",
        };
      } else if (type === "sop-patterns" && data?.data) {
        return data.data.map((row: any, idx: number) => ({
          pattern_name: `Pattern ${idx + 1}`,
          frequency: row.pattern_count,
          severity: row.is_sop_deviation === 1 ? "high" : "low",
        }));
      } else if (Array.isArray(data)) {
        return data;
      } else if (typeof data === "object" && data !== null) {
        // Convert object to array format for charts
        return Object.entries(data).map(([name, value]) => ({ name, value }));
      }
      
      return [];
    } catch (error) {
      console.error(`[ChatBot] Error fetching ${type}:`, error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

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
        onDataReceived("incomplete-bar", data, "Incomplete Cases Analysis");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded incomplete cases data! Found ${data.length} data points. Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("long running cases")) {
        const data = await fetchVisualizationData("longrunning-bar");
        onDataReceived("longrunning-bar", data, "Long Running Cases Analysis");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded long running cases data! Found ${data.length} data points. Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("sop deviation")) {
        const countData = await fetchVisualizationData("sop-count");
        const patternsData = await fetchVisualizationData("sop-patterns");
        
        onDataReceived("sop-count", [countData], "SOP Deviation Count");
        onDataReceived("sop-patterns", patternsData, "SOP Deviation Patterns");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded SOP deviation data! Count: ${countData.count}, Patterns: ${patternsData.length}. Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("resource switches")) {
        const data = await fetchVisualizationData("resource-switches-bar");
        onDataReceived("resource-switches-bar", data, "Resource Switches");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded resource switches data! Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("rework activities")) {
        const data = await fetchVisualizationData("rework-activities-bar");
        onDataReceived("rework-activities-bar", data, "Rework Activities");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded rework activities data! Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("timing violations")) {
        const data = await fetchVisualizationData("timing-violations-bar");
        onDataReceived("timing-violations-bar", data, "Timing Violations");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded timing violations data! Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("case complexity")) {
        const data = await fetchVisualizationData("case-complexity-table");
        onDataReceived("case-complexity-table", data, "Case Complexity Details");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded case complexity data! Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("resource performance")) {
        const data = await fetchVisualizationData("resource-performance-table");
        onDataReceived("resource-performance-table", data, "Resource Performance");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded resource performance data! Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("timing analysis")) {
        const data = await fetchVisualizationData("timing-analysis-table");
        onDataReceived("timing-analysis-table", data, "Timing Analysis");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded timing analysis data! Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("process failure patterns")) {
        const data = await fetchVisualizationData("process-failure-patterns-bar");
        onDataReceived("process-failure-patterns-bar", data, "Process Failure Patterns");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Successfully loaded process failure patterns data! Check the visualizations above.`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else if (lowerMessage.includes("object lifecycle")) {
        onDataReceived("object-lifecycle", [], "Object Lifecycle");
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Here is the Object Lifecycle process flow graph! Check the visualizations above.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } else {
        // General AI response
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: `I can help you analyze process data. Try asking about:\n- SOP deviation\n- Incomplete cases\n- Long running cases\n- Resource switches\n- Rework activities\n- Timing violations\n- Case complexity\n- Resource performance\n- Timing analysis\n- Process failure patterns\n- Object lifecycle`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error: any) {
      handleApiError(error, "requested");
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
              )}
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
    </div>
  );
};

export default ChatBot;
