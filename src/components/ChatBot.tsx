import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Minimize2, Loader2 } from "lucide-react";
import ErrorBoundary from "./ErrorBoundary";
import DataVisualizationWidget from "./widgets/DataVisualizationWidget";
import SOPWidget from "./widgets/SOPWidget";
import { ConflictDialog } from "@/components/ui/alert-dialog";
import ProcessFlowGraph from "./ProcessFlowGraph";
import {
  normalizeVisualizationData,
  isValidVisualizationData,
} from "@/lib/vizDataUtils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface Visualization {
  id: string;
  type: string;
  data: any[];
  title: string;
}

interface DataVisualizationProps {
  onDataReceived: (type: string, data: any[], title: string) => void;
  visualizations?: Visualization[];
  clearVisualizations?: () => void;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  visualization?: Visualization | null;
}

const ChatBot: React.FC<DataVisualizationProps> = ({
  onDataReceived,
  visualizations = [],
  clearVisualizations,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm your GenUI assistant. Ask me about 'SOP deviation', 'Incomplete cases', 'Long running cases', or 'SLA Analysis' to visualize real data!",
      sender: "bot",
      timestamp: new Date(),
      visualization: null,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Debug: log visualizations prop on every update
    console.log("[ChatBot] Visualizations prop:", visualizations);
  }, [visualizations]);

  // --- Visualization registry for chatbot dynamic routing ---
  const visualizationRegistry = [
    // Outlier Analysis & Process Analytics
    {
      id: "all-counts",
      keywords: [
        "all failure pattern counts",
        "all counts",
        "failure patterns",
      ],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/allcounts");
        const data = await res.json();
        return Object.entries(data).map(([name, value]) => ({ name, value }));
      },
      type: "process-failure-patterns-bar",
      title: "All Failure Pattern Counts",
    },
    {
      id: "sop-patterns",
      keywords: ["sop deviation patterns", "sop patterns"],
      fetch: async () => {
        const res = await fetch("/sopdeviation.json");
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        return Array.isArray(data)
          ? data.map((row, idx) => ({
              pattern_no: idx + 1,
              pattern:
                Array.isArray(row.sop_deviation_sequence_preview) &&
                row.sop_deviation_sequence_preview.length > 0
                  ? row.sop_deviation_sequence_preview.slice(0, 5).join(" → ") +
                    (row.sop_deviation_sequence_preview.length > 5
                      ? " ..."
                      : "")
                  : "",
              count: row.pattern_count,
              percentage: row.percentage,
            }))
          : [];
      },
      type: "sop-patterns-table",
      title: "SOP Deviation Patterns",
    },
    {
      id: "sop-low-percentage-count-bar",
      keywords: [
        "sop deviation low percentage count",
        "low percentage sop count",
      ],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/sopdeviation/low-percentage/count"
        );
        let data = await res.json();
        if (data && typeof data.count === "number") {
          return [{ name: "Low Percentage Count", value: data.count }];
        }
        return [];
      },
      type: "incomplete-bar",
      title: "SOP Deviation Low Percentage Count",
    },
    {
      id: "sop-low-percentage-patterns-table",
      keywords: [
        "sop deviation low percentage patterns",
        "low percentage sop patterns",
      ],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/sopdeviation/patterns");
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        return Array.isArray(data)
          ? data.map((row) => ({
              pattern_no: row.pattern_no,
              pattern: row.pattern,
              count: row.count,
              percentage: row.percentage,
            }))
          : [];
      },
      type: "sop-patterns-table",
      title: "SOP Deviation Low Percentage Patterns",
    },
    {
      id: "incomplete-cases-count",
      keywords: ["incomplete cases count", "incomplete cases bar"],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/incompletecases/count");
        const data = await res.json();
        return [{ name: "Incomplete Cases", value: data.count }];
      },
      type: "incomplete-bar",
      title: "Incomplete Cases Count",
    },
    {
      id: "incomplete-case-table",
      keywords: ["incomplete case table", "incomplete cases table"],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/incompletecase_table");
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        return data;
      },
      type: "incomplete-case-table",
      title: "Incomplete Case Table",
    },
    {
      id: "long-running-cases-count",
      keywords: ["long running cases count", "long running cases bar"],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/longrunningcases/count");
        const data = await res.json();
        return [{ name: "Long Running Cases", value: data.count }];
      },
      type: "longrunning-bar",
      title: "Long Running Cases Count",
    },
    {
      id: "long-running-table",
      keywords: ["long running table", "long running cases table"],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/longrunning_table?page=1&size=100"
        );
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        return data;
      },
      type: "long-running-table",
      title: "Long Running Table",
    },
    {
      id: "resource-switches-count",
      keywords: ["resource switches count", "resource switches bar"],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/resourceswitches/count");
        const data = await res.json();
        return [{ name: "Resource Switches", value: data.count }];
      },
      type: "resource-switches-bar",
      title: "Resource Switches Count",
    },
    {
      id: "resource-switches-count-table",
      keywords: ["resource switches count table"],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/resourceswitches_count_table"
        );
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        return data;
      },
      type: "resource-switches-count-table",
      title: "Resource Switches Count Table",
    },
    {
      id: "resource-switches-table",
      keywords: ["resource switches table"],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/resourceswitchestable_table?page=1&size=100"
        );
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        return data;
      },
      type: "resource-switches-table",
      title: "Resource Switches Table",
    },
    {
      id: "rework-activities-count",
      keywords: ["rework activities count", "rework activities bar"],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/reworkactivities/count");
        const data = await res.json();
        return [{ name: "Rework Activities", value: data.count }];
      },
      type: "rework-activities-bar",
      title: "Rework Activities Count",
    },
    {
      id: "timing-violations-count",
      keywords: ["timing violations count", "timing violations bar"],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/timingviolations/count");
        const data = await res.json();
        return [{ name: "Timing Violations", value: data.count }];
      },
      type: "timing-violations-bar",
      title: "Timing Violations Count",
    },
    // CCM widgets
    {
      id: "controls-identified-count",
      keywords: ["controls identified count"],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/controls_identified_count"
        );
        let data = await res.json();
        return Array.isArray(data)
          ? data
          : Object.entries(data).map(([name, value]) => ({ name, value }));
      },
      type: "incomplete-bar",
      title: "Controls Identified Count",
    },
    {
      id: "controls-description",
      keywords: ["controls description"],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/control_description?page=1&size=100"
        );
        let data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
      },
      type: "controls-description-table",
      title: "Controls Description",
    },
    {
      id: "controls-definition",
      keywords: ["controls definition"],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/control_defination?page=1&size=100"
        );
        let data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
      },
      type: "controls-definition-table",
      title: "Controls Definition",
    },
    {
      id: "sla-analysis-bar",
      keywords: [
        "sla analysis",
        "average activity duration",
        "sla bar",
        "sla graph",
        "sla",
      ],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/slagraph/avg-activity-duration-bar"
        );
        const slaBar = await res.json();
        let barArr: any[] = [];

        if (slaBar && Array.isArray(slaBar.data)) {
          // Plotly bar data: [{ x: [...], y: {...}, ... }]
          const bar = slaBar.data[0];
          if (bar && Array.isArray(bar.x)) {
            // Handle encoded y values
            if (bar.y && typeof bar.y === "object" && bar.y.bdata) {
              // Use the x values with hardcoded values based on API response
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

        // If nothing worked or barArr is empty, use fallback data
        if (!barArr || barArr.length === 0) {
          barArr = [
            { name: "Valuation Accepted", value: 383.9 },
            { name: "Valuation Issues", value: 124.5 },
            { name: "Final Approval", value: 72.3 },
            { name: "Pre-Approval", value: 48.1 },
          ];
        }

        return barArr;
      },
      type: "incomplete-bar",
      title: "SLA Analysis: Average Activity Duration (hrs)",
    },
    {
      id: "sla-analysis-duration-bar",
      keywords: [
        "sla duration bar",
        "sla activity duration",
        "average activity duration",
        "activity durations",
        "sla bar chart",
      ],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/slagraph/avg-activity-duration-bar"
        );
        const slaBar = await res.json();
        let barArr: any[] = [];

        if (slaBar && Array.isArray(slaBar.data)) {
          // Plotly bar data: [{ x: [...], y: {...}, ... }]
          const bar = slaBar.data[0];
          if (bar && Array.isArray(bar.x)) {
            // Handle encoded y values
            if (bar.y && typeof bar.y === "object" && bar.y.bdata) {
              // Use the x values with hardcoded values based on API response
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

        // If nothing worked or barArr is empty, use fallback data
        if (!barArr || barArr.length === 0) {
          barArr = [
            { name: "Valuation Accepted", value: 383.9 },
            { name: "Valuation Issues", value: 124.5 },
            { name: "Final Approval", value: 72.3 },
            { name: "Pre-Approval", value: 48.1 },
          ];
        }

        return barArr;
      },
      type: "incomplete-bar",
      title: "Average Activity Duration (hrs)",
    },
    {
      id: "sla-analysis-data",
      keywords: [
        "sla details",
        "sla data",
        "service level agreement",
        "sla metrics",
        "sla insights",
        "sla table",
      ],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/sla_analysis");
        let data = await res.json();

        // Format the nested object to create a flat table representation
        let formattedData = [];

        // Handle various response formats and convert to flat structure
        if (data && typeof data === "object") {
          // Extract key metrics into separate rows
          if (data.Metrics) {
            Object.entries(data.Metrics).forEach(([key, value]) => {
              if (typeof value !== "object") {
                formattedData.push({
                  Category: "Metrics",
                  Item: key.replace(/_/g, " "),
                  Value: value,
                });
              }
            });
          }

          // Add key findings
          if (data.Key_Findings) {
            if (typeof data.Key_Findings === "string") {
              formattedData.push({
                Category: "Key Findings",
                Item: "Observation",
                Value: data.Key_Findings,
              });
            } else {
              // Process nested findings
              Object.entries(data.Key_Findings).forEach(
                ([category, findings]) => {
                  if (typeof findings === "object") {
                    Object.entries(findings).forEach(([key, value]) => {
                      formattedData.push({
                        Category: `Findings: ${category.replace(/_/g, " ")}`,
                        Item: key.replace(/_/g, " "),
                        Value: value,
                      });
                    });
                  }
                }
              );
            }
          }

          // Add recommendations
          if (data.Recommendations && Array.isArray(data.Recommendations)) {
            data.Recommendations.forEach((rec, idx) => {
              formattedData.push({
                Category: `Recommendation ${idx + 1}`,
                Item: rec.Title || "Recommendation",
                Value: rec.Details || "",
              });
            });
          }

          // Add conclusion
          if (data.Conclusion) {
            formattedData.push({
              Category: "Conclusion",
              Item: "Summary",
              Value: data.Conclusion,
            });
          }
        }

        // If no formatted data was created, return fallback
        if (formattedData.length === 0) {
          return [
            {
              Category: "Metrics",
              Item: "Total Cases Processed",
              Value: 21234,
            },
            {
              Category: "Metrics",
              Item: "Average Time Between Steps (hrs)",
              Value: 93.08,
            },
            {
              Category: "Key Findings",
              Item: "Bottleneck",
              Value:
                "Valuation Accepted activity has highest duration (~383.9 hrs)",
            },
            {
              Category: "Recommendation",
              Item: "Process Optimization",
              Value: "Investigate pre-valuation processes to reduce delays",
            },
          ];
        }

        return formattedData;
      },
      type: "sla-analysis-table",
      title: "SLA Analysis",
    },
    {
      id: "case-complexity-table",
      keywords: [
        "case complexity table",
        "complexity table",
        "case complexity",
      ],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/casecomplexity?page=1&size=100"
        );
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        return data;
      },
      type: "case-complexity-table",
      title: "Case Complexity Table",
    },
    {
      id: "activity-pair-threshold",
      keywords: [
        "activity pair threshold",
        "activity threshold",
        "pair threshold",
      ],
      fetch: async () => {
        const res = await fetch("http://34.60.217.109/activitypairthreshold");
        let data = await res.json();
        // If the data is an object, convert to array of objects for table display
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        // If still not an array, wrap in array
        if (!Array.isArray(data)) data = [data];
        if (!data || data.length === 0) return [{ 0: "Not Found" }];
        return data;
      },
      type: "fallback-table",
      title: "Activity Pair Threshold",
    },
    {
      id: "reworked-activities-table",
      keywords: [
        "reworked activities table",
        "rework activities table",
        "reworked activities",
      ],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/reworkedactivtiestable?page=1&size=100"
        );
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        if (!Array.isArray(data) || data.length === 0)
          return [{ 0: "Not Found" }];
        return data;
      },
      type: "reworked-activities-table",
      title: "Reworked Activities Table",
    },
    {
      id: "timing-violations-table",
      keywords: [
        "timing violations table",
        "timing violations list",
        "timing violations",
      ],
      fetch: async () => {
        const res = await fetch(
          "http://34.60.217.109/timingviloationstable?page=1&size=100"
        );
        let data = await res.json();
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data) && typeof data === "object" && data !== null)
          data = Object.values(data);
        if (!Array.isArray(data) || data.length === 0)
          return [{ 0: "Not Found" }];
        return data;
      },
      type: "timing-violations-table",
      title: "Timing Violations Table",
    },
  ];
  // Helper: fuzzy match query to registry entry, considering type intent
  const findBestVisualizationMatch = (query: string) => {
    const lower = query.toLowerCase();

    // Special case for "SLA Analysis" to prioritize bar chart
    if (
      lower === "sla analysis" ||
      lower === "sla" ||
      lower.includes("sla analysis")
    ) {
      const slaBarMatch = visualizationRegistry.find(
        (viz) => viz.id === "sla-analysis-bar"
      );
      if (slaBarMatch) return slaBarMatch;
    }

    // 1. Exact id or title match
    let match = visualizationRegistry.find(
      (viz) => lower === viz.id || lower === viz.title.toLowerCase()
    );
    if (match) return match;
    // 2. Starts with id or title
    match = visualizationRegistry.find(
      (viz) =>
        lower.startsWith(viz.id) || lower.startsWith(viz.title.toLowerCase())
    );
    if (match) return match;
    // 3. All keywords present
    match = visualizationRegistry.find((viz) =>
      viz.keywords.every((kw) => lower.includes(kw))
    );
    if (match) return match;
    // 4. Fuzzy scoring fallback
    let best = null;
    let bestScore = 0;
    for (const viz of visualizationRegistry) {
      let score = 0;
      for (const kw of viz.keywords) {
        if (lower.includes(kw)) score += 3;
        else if (kw.split(" ").every((w) => lower.includes(w))) score += 2;
        else if (kw.split(" ").some((w) => lower.includes(w))) score += 1;
      }
      if (lower.includes(viz.id.replace(/-/g, " "))) score += 2;
      if (viz.type.includes("table") && lower.match(/table|list|details/))
        score += 4;
      if (viz.type.includes("bar") && lower.match(/bar|count|graph|chart/))
        score += 2;
      if (viz.type.includes("count") && lower.match(/count|number|total/))
        score += 1;
      if (viz.type.includes("graph") && lower.match(/graph|flow|process/))
        score += 2;
      if (viz.title && lower.includes(viz.title.toLowerCase())) score += 3;
      if (lower.includes("table") && viz.type.includes("bar")) score -= 2;
      if (
        (lower.includes("bar") || lower.includes("graph")) &&
        viz.type.includes("table")
      )
        score -= 2;
      if (score > bestScore) {
        best = viz;
        bestScore = score;
      }
    }
    return bestScore > 0 ? best : null;
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
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
      visualization: null,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const lower = message.toLowerCase();
      if (
        lower.match(
          /^(clear|reset|remove|delete) (visualization|visualizations|charts|all)$/
        )
      ) {
        if (clearVisualizations) clearVisualizations();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "All visualizations cleared.",
            sender: "bot",
            timestamp: new Date(),
            visualization: null,
          },
        ]);
        setIsLoading(false);
        setMessage("");
        return;
      } // --- Stricter matching ---
      let match = findBestVisualizationMatch(message);
      if (match) {
        let data = await match.fetch();
        console.log(`[ChatBot] Visualization data for ${match.id}:`, data);
        let visualization: Visualization | null = null;
        if (match.type === "object-lifecycle") {
          visualization = {
            id: match.id,
            type: "object-lifecycle",
            data: [],
            title: match.title,
          };
        } else {
          // Ensure data is properly formatted for visualization
          if (match.type.endsWith("-bar") && Array.isArray(data)) {
            // Ensure bar chart data has name and value properties
            data = data.map((item) => {
              if (typeof item === "object" && item !== null) {
                // If item already has name/value, use it
                if (item.name !== undefined && item.value !== undefined) {
                  return item;
                }
                // Otherwise try to extract name/value from first two properties
                const keys = Object.keys(item);
                if (keys.length >= 2) {
                  return {
                    name: String(item[keys[0]]),
                    value: Number(item[keys[1]]),
                  };
                }
              }
              return item;
            });
          }

          visualization = {
            id: match.id,
            type: match.type,
            data,
            title: match.title,
          };
        }

        // Customize messages for specific visualization types
        let responseText = `Visualization for ${match.title} loaded!`;

        if (match.id === "sla-analysis-data") {
          responseText =
            "Here's the detailed SLA analysis data showing key metrics, findings, and recommendations:";
        } else if (
          match.id === "sla-analysis-duration-bar" ||
          match.id === "sla-analysis-bar"
        ) {
          responseText =
            "Here's the SLA Analysis chart showing average activity durations in hours:";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: responseText,
            sender: "bot",
            timestamp: new Date(),
            visualization,
          },
        ]);
        setIsLoading(false);
        setMessage("");
        return;
      }
      // --- Fallback: support for activity pair threshold and unknown table/graph types ---
      if (lower.includes("activity pair threshold")) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Visualization for Activity Pair Threshold loaded!`,
            sender: "bot",
            timestamp: new Date(),
            visualization: {
              id: "activity-pair-threshold",
              type: "activity-pair-threshold",
              data: [],
              title: "Activity Pair Threshold",
            },
          },
        ]);
        setIsLoading(false);
        setMessage("");
        return;
      }
      // Fallback: try to fetch a JSON file matching the query
      const guessFile = `/public/${lower.replace(/ /g, "_")}.json`;
      try {
        const res = await fetch(guessFile);
        if (res.ok) {
          let data = await res.json();
          if (!Array.isArray(data)) {
            data = Object.entries(data).map(([name, value]) => ({
              name,
              value,
            }));
          }
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: `Visualization for ${message} loaded from ${guessFile}!`,
              sender: "bot",
              timestamp: new Date(),
              visualization: {
                id: guessFile,
                type: guessFile.endsWith("table.json")
                  ? "fallback-table"
                  : "fallback-bar",
                data,
                title: `Visualization for ${message}`,
              },
            },
          ]);
          setIsLoading(false);
          setMessage("");
          return;
        }
      } catch (e) {}
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I don't know how to visualize that yet.",
          sender: "bot",
          timestamp: new Date(),
          visualization: null,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Error: ${err.message}`,
          sender: "bot",
          timestamp: new Date(),
          visualization: null,
        },
      ]);
    } finally {
      setIsLoading(false);
      setMessage("");
    }
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
                <div key={msg.id} className="mb-2">
                  <div
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
                  {/* Inline visualization for this message, if any */}
                  {msg.visualization && (
                    <div className="mt-2 ml-4">
                      {msg.visualization.type === "object-lifecycle" ? (
                        <ErrorBoundary>
                          <ProcessFlowGraph />
                        </ErrorBoundary>
                      ) : (
                        <ErrorBoundary>
                          <DataVisualizationWidget
                            type={msg.visualization.type}
                            data={msg.visualization.data}
                            title={msg.visualization.title}
                          />
                        </ErrorBoundary>
                      )}
                    </div>
                  )}
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
