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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  widget?: React.ReactNode;
}

const ChatBot: React.FC = () => {
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

  useEffect(() => {
    fetchFMEAData();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): { text: string; widget?: React.ReactNode } => {
    const message = userMessage.toLowerCase();
    
    // FMEA-related responses
    if (message.includes("fmea") || message.includes("failure mode") || message.includes("risk priority")) {
      if (message.includes("dashboard") || message.includes("overview") || message.includes("rpn")) {
        const dashboardData = fmeaSummaryData ? [
          { name: 'Severity', value: fmeaSummaryData.severity_rating, color: '#ef4444' },
          { name: 'Likelihood', value: fmeaSummaryData.likelihood_rating, color: '#f59e0b' },
          { name: 'Detectability', value: fmeaSummaryData.detectability_rating, color: '#10b981' }
        ] : [];

        return {
          text: fmeaSummaryData 
            ? `Here's your FMEA dashboard overview. The current Risk Priority Number (RPN) is ${fmeaSummaryData.rpn} with a ${fmeaSummaryData.risk_level} risk level. The severity rating is ${fmeaSummaryData.severity_rating}, likelihood is ${fmeaSummaryData.likelihood_rating}, and detectability is ${fmeaSummaryData.detectability_rating}.`
            : "I'm showing you the FMEA dashboard with risk analysis metrics.",
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
      }

      if (message.includes("table") || message.includes("analysis table")) {
        const fmeaTableCols = fmeaTableData.length > 0
          ? Object.keys(fmeaTableData[0]).map((key) => ({ key, label: key }))
          : [];
        
        return {
          text: "Here's the detailed FMEA analysis table showing all failure modes, effects, and causes across different processes.",
          widget: (
            <DataTable
              title="FMEA Analysis Table"
              data={fmeaTableData}
              columns={fmeaTableCols}
            />
          ),
        };
      }

      if (message.includes("severity")) {
        const severityCols = fmeaSeverityData.length > 0
          ? Object.keys(fmeaSeverityData[0]).map((key) => ({ key, label: key }))
          : [];
        
        return {
          text: "Here's the severity analysis showing the impact assessment of different failure modes with their severity scores and justifications.",
          widget: (
            <DataTable
              title="Severity Analysis"
              data={fmeaSeverityData}
              columns={severityCols}
            />
          ),
        };
      }

      if (message.includes("likelihood") || message.includes("probability")) {
        const likelihoodCols = fmeaLikelihoodData.length > 0
          ? Object.keys(fmeaLikelihoodData[0]).map((key) => ({ key, label: key }))
          : [];
        
        return {
          text: "Here's the likelihood analysis showing the probability assessment of failure modes occurring.",
          widget: (
            <DataTable
              title="Likelihood Analysis"
              data={fmeaLikelihoodData}
              columns={likelihoodCols}
            />
          ),
        };
      }

      if (message.includes("detectability") || message.includes("detection")) {
        const detectabilityCols = fmeaDetectabilityData.length > 0
          ? Object.keys(fmeaDetectabilityData[0]).map((key) => ({ key, label: key }))
          : [];
        
        return {
          text: "Here's the detectability analysis showing how well we can detect failure modes before they impact customers.",
          widget: (
            <DataTable
              title="Detectability Analysis"
              data={fmeaDetectabilityData}
              columns={detectabilityCols}
            />
          ),
        };
      }

      // General FMEA response
      return {
        text: "FMEA (Failure Mode and Effects Analysis) helps identify potential failure points in our mortgage process. Would you like to see the dashboard overview, analysis table, or specific ratings (severity, likelihood, detectability)?",
      };
    }

    if (message.includes("sla") || message.includes("service level agreement")) {
      return {
        text: "Here's an analysis of our Service Level Agreements. I'm showing you the average activity duration.",
        widget: (
          <DataVisualizationWidget
            type="incomplete-bar"
            title="SLA Analysis: Average Activity Duration (hrs)"
            data={[
              { name: "Valuation Accepted", value: 383.9 },
              { name: "Valuation Issues", value: 124.5 },
              { name: "Final Approval", value: 72.3 },
              { name: "Pre-Approval", value: 48.1 },
            ]}
          />
        ),
      };
    }

    if (
      message.includes("resource") &&
      (message.includes("performance") || message.includes("efficiency"))
    ) {
      return {
        text: "Here's a performance analysis of our resources, showing efficiency and utilization metrics.",
        widget: <ResourcePerformanceTable />,
      };
    }

    if (message.includes("failure patterns") || message.includes("failures")) {
      return {
        text: "Here's a distribution of process failure patterns to help identify common issues.",
        widget: (
          <DataVisualizationWidget
            type="process-failure-patterns-bar"
            title="Process Failure Patterns Distribution"
            data={[
              { name: "SOP Deviations", value: 23 },
              { name: "Incomplete Cases", value: 45 },
              { name: "Long Running Cases", value: 12 },
              { name: "Resource Switches", value: 78 },
            ]}
          />
        ),
      };
    }

    // Default response
    return {
      text: "I can help you with process analysis! Try asking about:\n• SLA analysis and performance metrics\n• Resource performance and efficiency\n• Process failure patterns\n• FMEA analysis and risk assessment\n• Outlier detection and analysis\n\nWhat would you like to explore?",
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
        <Card className="w-[380px] bg-slate-900 border-slate-700 shadow-lg rounded-md overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-200">
                Process Assistant
              </h3>
            </div>
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

          <CardContent className="p-4 h-[400px] overflow-y-auto flex-grow">
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
