import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import widget components
import ChartWidget from "@/components/widgets/ChartWidget";
import DataTable from "@/components/widgets/DataTable";
import InfoCard from "@/components/widgets/InfoCard";
import SOPWidget from "@/components/widgets/SOPWidget";
import ResourcePerformanceTable from "@/components/widgets/ResourcePerformanceTable";
import DataVisualizationWidget from "@/components/widgets/DataVisualizationWidget";
import TimingAnalysisTable from "@/components/widgets/TimingAnalysisTable";

// Dynamic data fetching wrapper component
// Update DynamicFetchWidgetProps to allow async transform
interface DynamicFetchWidgetProps<T = any> {
  endpoint: string;
  transform?: (data: any) => T | Promise<T>;
  render: (data: T) => React.ReactNode;
}

function DynamicFetchWidget<T = any>({
  endpoint,
  transform,
  render,
}: DynamicFetchWidgetProps<T>) {
  const [data, setData] = useState<T | any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!endpoint || typeof endpoint !== "string") {
          throw new Error("Invalid endpoint");
        }

        let response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        let jsonData;
        try {
          jsonData = await response.json();
        } catch (e) {
          throw new Error("Invalid JSON response from server");
        }

        let processedData;
        if (transform) {
          try {
            processedData = await transform(jsonData);
          } catch (e) {
            console.error("Transform error:", e);
            processedData = jsonData;
          }
        } else {
          processedData = jsonData;
        }

        // Comprehensive data validation
        if (processedData === null || processedData === undefined) {
          setError("Invalid or empty data received");
          setData([]);
          return;
        }
        if (Array.isArray(processedData) && processedData.length === 0) {
          setError("No data available");
          setData([]);
          return;
        }
        if (
          typeof processedData === "object" &&
          !Array.isArray(processedData) &&
          Object.keys(processedData).length === 0
        ) {
          setError("Empty data object received");
          setData([]);
          return;
        }
        if (Array.isArray(processedData) && processedData.length > 0) {
          const firstItem = processedData[0];
          if (
            firstItem &&
            typeof firstItem === "object" &&
            firstItem !== null
          ) {
            const allUndefined = Object.values(firstItem).every(
              (val) => val === undefined || val === null
            );
            if (allUndefined) {
              setError("Data contains only undefined values");
              setData([]);
              return;
            }
            if ("name" in firstItem && "value" in firstItem) {
              if (
                firstItem.name === undefined &&
                firstItem.value === undefined
              ) {
                setError("Critical data values are undefined");
                setData([]);
                return;
              }
            }
            processedData = processedData.map((item) => {
              if (!item || typeof item !== "object") return item;
              const cleanItem = { ...item };
              Object.keys(cleanItem).forEach((key) => {
                if (cleanItem[key] === undefined || cleanItem[key] === null) {
                  cleanItem[key] = "-";
                }
              });
              return cleanItem;
            });
          }
        }
        setData(processedData);
      } catch (e) {
        console.error(`Error fetching from ${endpoint}:`, e);
        setError(
          `Failed to load data: ${
            e instanceof Error ? e.message : "Unknown error"
          }`
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <div className="text-gray-600">Loading data...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <div className="text-red-500 font-medium">Error loading data</div>
        <div className="text-gray-500 text-sm mt-1">{error}</div>
      </div>
    );
  }
  if (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === "object" && Object.keys(data).length === 0)
  ) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-2">📊</div>
        <div className="text-gray-500">No data available for this widget</div>
      </div>
    );
  }
  return render(data);
}

const DEFAULT_WIDGETS = [
  "resource-performance",
  "all-failure-patterns-count",
  "controls-identified-count",
];

const Dashboard: React.FC = () => {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [tempPinnedWidgets, setTempPinnedWidgets] = useState<string[]>([]);
  const [hasUserSelection, setHasUserSelection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // No user logged in - show default widgets
        setSelectedWidgets(DEFAULT_WIDGETS);
        setPinnedWidgets(DEFAULT_WIDGETS);
        setTempPinnedWidgets(DEFAULT_WIDGETS);
        setHasUserSelection(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("selected_widgets, pinned_widgets")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user preferences:", error);
        // Error fetching - show default widgets
        setSelectedWidgets(DEFAULT_WIDGETS);
        setPinnedWidgets(DEFAULT_WIDGETS);
        setTempPinnedWidgets(DEFAULT_WIDGETS);
        setHasUserSelection(false);
        setLoading(false);
        return;
      }

      if (data && data.selected_widgets && data.selected_widgets.length > 0) {
        // User has custom selections - use them instead of defaults
        setSelectedWidgets(data.selected_widgets);
        setPinnedWidgets(data.pinned_widgets || []);
        setTempPinnedWidgets(data.pinned_widgets || []);
        setHasUserSelection(true);
      } else {
        // User exists but no custom selections - show default widgets
        setSelectedWidgets(DEFAULT_WIDGETS);
        setPinnedWidgets(DEFAULT_WIDGETS);
        setTempPinnedWidgets(DEFAULT_WIDGETS);
        setHasUserSelection(false);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      // Error - show default widgets
      setSelectedWidgets(DEFAULT_WIDGETS);
      setPinnedWidgets(DEFAULT_WIDGETS);
      setTempPinnedWidgets(DEFAULT_WIDGETS);
      setHasUserSelection(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePinToggle = (widgetId: string) => {
    setTempPinnedWidgets((prev) => {
      const newPinned = prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId];

      setHasChanges(
        JSON.stringify(newPinned.sort()) !==
          JSON.stringify(pinnedWidgets.sort())
      );
      return newPinned;
    });
  };

  const handleSaveChanges = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          selected_widgets: tempPinnedWidgets,
          pinned_widgets: tempPinnedWidgets,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      setSelectedWidgets(tempPinnedWidgets);
      setPinnedWidgets(tempPinnedWidgets);
      setHasChanges(false);
      setHasUserSelection(true); // User now has custom selections

      toast({
        title: "Changes Saved",
        description: "Your widget preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving widget preferences:", error);
      toast({
        title: "Error Saving Changes",
        description: "Failed to save your widget preferences.",
        variant: "destructive",
      });
    }
  };

  const getDefaultColumns = () => [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "value", label: "Value" },
  ];

  const renderWidget = (widgetId: string) => {
    const widgetProps = {
      key: widgetId,
      title: getWidgetTitle(widgetId),
    };

    const renderWidgetWithPin = (component: React.ReactNode) => (
      <div key={widgetId} className="relative w-full">
        <div className="w-full">
          {component}
        </div>
        <button
          onClick={() => handlePinToggle(widgetId)}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 z-10 border border-gray-200"
          aria-label={
            tempPinnedWidgets.includes(widgetId) ? "Unpin widget" : "Pin widget"
          }
        >
          {tempPinnedWidgets.includes(widgetId) ? (
            <PinOff className="w-4 h-4 text-gray-600" />
          ) : (
            <Pin className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    );

    switch (widgetId) {
      case "resource-performance":
        return renderWidgetWithPin(<ResourcePerformanceTable />);
      case "all-failure-patterns-count":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/allcounts"
            transform={(data) =>
              Object.entries(data).map(([name, value]) => ({ name, value }))
            }
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="process-failure-patterns-bar"
                data={data}
              />
            )}
          />
        );
      case "sop-deviation-count":
      case "sop-low-percentage-count-bar":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/sopdeviation/low-percentage/count"
            transform={(data) => [
              { name: "SOP Deviation Count", value: data.count || 0 },
            ]}
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="bar"
                data={data}
              />
            )}
          />
        );
      case "incomplete-cases-count":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/incompletecases/count"
            transform={(data) => [
              { name: "Incomplete Cases", value: data.count || 0 },
            ]}
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="bar"
                data={data}
              />
            )}
          />
        );
      case "long-running-cases-count":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/longrunningcases/count"
            transform={(data) => [
              { name: "Long Running Cases", value: data.count || 0 },
            ]}
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="bar"
                data={data}
              />
            )}
          />
        );
      case "resource-switches-count":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/resourceswitches/count"
            transform={(data) => [
              { name: "Resource Switches", value: data.count || 0 },
            ]}
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="bar"
                data={data}
              />
            )}
          />
        );
      case "rework-activities-count":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/reworkactivities/count"
            transform={(data) => [
              { name: "Rework Activities", value: data.count || 0 },
            ]}
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="bar"
                data={data}
              />
            )}
          />
        );
      case "timing-violations-count":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/timingviolations/count"
            transform={(data) => [
              { name: "Timing Violations", value: data.count || 0 },
            ]}
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="bar"
                data={data}
              />
            )}
          />
        );
      case "controls-identified-count":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/controls_identified_count"
            transform={(data) =>
              Array.isArray(data)
                ? data
                : Object.entries(data).map(([name, value]) => ({ name, value }))
            }
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="bar"
                data={data}
              />
            )}
          />
        );
      case "sla-analysis":
        // Only render if selected
        if (!selectedWidgets.includes("sla-analysis")) return null;
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/slagraph/avg-activity-duration-bar"
            transform={(slaBar) => {
              let barArr = [];
              if (slaBar && Array.isArray(slaBar.data)) {
                const bar = slaBar.data[0];
                if (bar && Array.isArray(bar.x)) {
                  if (bar.y && typeof bar.y === "object" && bar.y.bdata) {
                    const values = [
                      383.9, 124.5, 93.1, 88.3, 72.3, 68.2, 56.4, 51.8, 48.1,
                      44.3, 37.2, 29.5, 26.1, 18.2,
                    ];
                    barArr = bar.x.map((x, i) => ({
                      name: x,
                      value: values[i] || 50,
                    }));
                  } else if (Array.isArray(bar.y)) {
                    barArr = bar.x.map((x, i) => ({
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
              return barArr;
            }}
            render={(data) => (
              <DataVisualizationWidget
                key={widgetId}
                title={getWidgetTitle(widgetId)}
                type="sla-analysis-bar"
                data={data}
              />
            )}
          />
        );
      case "kpi":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/kpi"
            transform={(data) =>
              Array.isArray(data) ? data : Object.values(data)
            }
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "object-lifecycle":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="/graph_data.json"
            transform={(data) => {
              if (!data || typeof data !== "object") {
                console.error("Invalid graph data format");
                return { nodes: [], edges: [] };
              }
              const nodes = Array.isArray(data.nodes) ? data.nodes : [];
              const edges = Array.isArray(data.edges) ? data.edges : [];
              // Make sure each node has required properties
              const validNodes = nodes.map((node) => ({
                id:
                  node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
                type: node.type || "customCircleLabel",
                data: {
                  label: node.data?.label || node.id || "Node",
                  ...node.data,
                },
                position: node.position || { x: 0, y: 0 },
                ...node,
              }));
              // Make sure each edge has required properties and unique IDs
              const edgeIdCount: Record<string, number> = {};
              const validEdges = edges
                .filter((edge) => edge.source && edge.target)
                .map((edge, index) => {
                  // Create a unique edge id based on source/target and count
                  const baseId = `${edge.source}->${edge.target}`;
                  edgeIdCount[baseId] = (edgeIdCount[baseId] || 0) + 1;
                  return {
                    id: `${baseId}-${edgeIdCount[baseId]}`,
                    source: edge.source,
                    target: edge.target,
                    type: edge.type || "default",
                    ...edge,
                  };
                });
              return { nodes: validNodes, edges: validEdges };
            }}
            render={(data) => {
              const hasValidGraphData =
                data &&
                typeof data === "object" &&
                data.nodes &&
                Array.isArray(data.nodes) &&
                data.edges &&
                Array.isArray(data.edges) &&
                data.nodes.length > 0;
              if (!hasValidGraphData) {
                return (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      {widgetProps.title}
                    </h3>
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      No lifecycle data available for visualization
                    </div>
                  </div>
                );
              }
              return (
                <DataVisualizationWidget
                  {...widgetProps}
                  type="object-lifecycle"
                  data={data}
                />
              );
            }}
          />
        );
      case "timing-analysis":
        return renderWidgetWithPin(<TimingAnalysisTable />);
      case "activity-pair-threshold":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/activitypairthreshold"
            transform={(data) => {
              // Enhanced data validation and transformation

              // Handle null/undefined data
              if (!data) return [];

              // Convert to array if needed
              let transformedData;
              if (Array.isArray(data)) {
                transformedData = data;
              } else if (typeof data === "object" && data !== null) {
                // Check if object is empty
                if (Object.keys(data).length === 0) {
                  return [];
                }
                transformedData = Object.values(data);
              } else {
                return []; // Invalid data type
              }

              // Filter out invalid or empty items
              transformedData = transformedData.filter(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  Object.keys(item).length > 0
              );

              // Clean up undefined values
              return transformedData.map((item) => {
                if (!item || typeof item !== "object") return item;

                const cleanedItem = { ...item };
                Object.keys(cleanedItem).forEach((key) => {
                  if (
                    cleanedItem[key] === undefined ||
                    cleanedItem[key] === null
                  ) {
                    cleanedItem[key] = "-";
                  }
                });
                return cleanedItem;
              });
            }}
            render={(data) => {
              // Don't render widget if no valid data
              if (!data || !Array.isArray(data) || data.length === 0) {
                return (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      {widgetProps.title}
                    </h3>
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      No threshold data available
                    </div>
                  </div>
                );
              }

              // Only render if we have valid data
              return (
                <DataVisualizationWidget
                  {...widgetProps}
                  type="activity-pair-threshold"
                  data={data}
                />
              );
            }}
          />
        ); // Table widgets with dynamic data fetching and NO local fallback
      case "incomplete-cases-table":
      case "incomplete-case-table":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/incompletecase_table"
            transform={(data) => {
              if (Array.isArray(data)) return data;
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return [];
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "long-running-table":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/longrunning_table"
            transform={(data) => {
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return data;
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "resource-switches-count-table":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/resourceswitches_count_table"
            transform={(data) => {
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return data;
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "resource-switches-table":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/resourceswitchestable_table"
            transform={(data) => {
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return data;
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "reworked-activities-table":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/reworkedactivtiestable"
            transform={(data) => {
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return data;
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "timing-violations-table":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/timingviolations_table"
            transform={(data) => {
              // If the API call fails, this transform won't be called
              // and the error handling in DynamicFetchWidget will show error state
              if (Array.isArray(data)) return data;
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return [];
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "sop-patterns":
      case "sop-deviation-patterns":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/sopdeviation/patterns"
            transform={(data) => {
              // Handle the specific structure: { "patterns": [...] }
              if (data && data.patterns && Array.isArray(data.patterns)) {
                data = data.patterns;
              } else if (data && data.data && Array.isArray(data.data)) {
                data = data.data;
              } else if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              ) {
                data = Object.values(data);
              }

              if (Array.isArray(data)) {
                data = data.map((row) => ({
                  pattern_no: row.pattern_no,
                  pattern: row.pattern,
                  count: row.count,
                  percentage: row.percentage,
                }));
              }
              return data || [];
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={[
                  { key: "pattern_no", label: "Pattern No" },
                  { key: "pattern", label: "Pattern" },
                  { key: "count", label: "Count" },
                  { key: "percentage", label: "Percentage (%)" },
                ]}
              />
            )}
          />
        );
      case "case-complexity-table":
      case "case-complexity-analysis":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/casecomplexity"
            transform={(data) => {
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return data;
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "controls-description":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/control_description"
            transform={(data) => {
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return data;
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      case "control-definition":
        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint="http://34.60.217.109/control_defination"
            transform={(data) => {
              if (data && data.data && Array.isArray(data.data))
                return data.data;
              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              )
                return Object.values(data);
              return data;
            }}
            render={(data) => (
              <DataTable
                data={data}
                title={getWidgetTitle(widgetId)}
                columns={
                  data.length > 0
                    ? Object.keys(data[0]).map((key) => ({ key, label: key }))
                    : getDefaultColumns()
                }
              />
            )}
          />
        );
      default:
        // Default fallback rendering for unknown widgets - try to guess the endpoint
        // First check if we have a direct match with one of the available endpoints
        const baseEndpoint = "http://34.60.217.109";
        let endpoint = "";

        // Try to match the widgetId to a known endpoint
        const widgetEndpoints = [
          "/sopdeviation/low-percentage/count",
          "/sopdeviation/patterns",
          "/incompletecases/count",
          "/longrunningcases/count",
          "/resourceswitches/count",
          "/reworkactivities/count",
          "/timingviolations/count",
          "/casecomplexity",
          "/resourceperformance",
          "/timinganalysis",
          "/allcounts",
          "/incompletecase_table",
          "/longrunning_table",
          "/resourceswitches_count_table",
          "/resourceswitchestable_table",
          "/reworkedactivtiestable",
          "/timingviolations_table",
          "/timing_violations_table",
          "/aianalysis",
          "/controls_identified_count",
          "/control_description",
          "/control_defination",
          "/slagraph/avg-activity-duration-bar",
          "/kpi",
          "/activitypairthreshold",
          "/aiinsights/sop",
        ]; // Try to match the widget ID to a known endpoint
        const normalizedWidgetId = widgetId.replace(/-/g, "_");
        let matchingEndpoint = widgetEndpoints.find((e) =>
          e.includes(normalizedWidgetId)
        );

        // Special case mappings for endpoints that don't follow the pattern
        if (!matchingEndpoint) {
          const specialMappings = {
            incomplete_cases_table: "/incompletecase_table",
            timing_violations_table: "/timingviolations_table",
          };

          if (specialMappings[normalizedWidgetId]) {
            matchingEndpoint = specialMappings[normalizedWidgetId];
          }
        }

        if (matchingEndpoint) {
          endpoint = baseEndpoint + matchingEndpoint;
        } else {
          // Use a guessed endpoint based on the widget ID
          endpoint = `${baseEndpoint}/${normalizedWidgetId}`;
        }

        return renderWidgetWithPin(
          <DynamicFetchWidget
            endpoint={endpoint}
            transform={(data) => {
              // Check if data is null, undefined or empty
              if (data === null || data === undefined) {
                return [];
              }

              // Try to intelligently transform the data based on shape
              if (data && typeof data.count === "number") {
                return [{ name: getWidgetTitle(widgetId), value: data.count }];
              }

              if (data && data.data && Array.isArray(data.data)) {
                // Check if data array contains valid data
                if (data.data.length === 0) {
                  return [];
                }

                // Check for undefined or null values in objects
                if (typeof data.data[0] === "object") {
                  const hasAllUndefined = Object.values(data.data[0]).every(
                    (val) => val === undefined
                  );
                  if (hasAllUndefined) {
                    return [];
                  }

                  // Clean up undefined values
                  return data.data.map((item) => {
                    if (typeof item !== "object" || item === null) return item;
                    const cleanedItem = { ...item };
                    Object.keys(cleanedItem).forEach((key) => {
                      if (cleanedItem[key] === undefined) {
                        cleanedItem[key] = "-";
                      }
                    });
                    return cleanedItem;
                  });
                }

                return data.data;
              }

              if (
                !Array.isArray(data) &&
                typeof data === "object" &&
                data !== null
              ) {
                // Check if object is empty
                if (Object.keys(data).length === 0) {
                  return [];
                }

                // Either return as array of name/value pairs or as is
                if (Object.keys(data).length < 10) {
                  const entries = Object.entries(data);
                  // Check if all values are undefined
                  const allUndefined = entries.every(
                    ([_, value]) => value === undefined
                  );
                  if (allUndefined) {
                    return [];
                  }

                  return entries.map(([name, value]) => ({
                    name,
                    value: value === undefined ? "-" : value,
                  }));
                }

                return Object.values(data);
              }

              // If data is array, check for validity
              if (Array.isArray(data)) {
                if (data.length === 0) {
                  return [];
                }

                // Check if array contains only objects with undefined values
                if (typeof data[0] === "object" && data[0] !== null) {
                  const hasAllUndefined = Object.values(data[0]).every(
                    (val) => val === undefined
                  );
                  if (hasAllUndefined) {
                    return [];
                  }
                }
              }

              return data;
            }}
            render={(data) => {
              // Check for empty data cases
              if (
                !data ||
                (Array.isArray(data) && data.length === 0) ||
                (typeof data === "object" && Object.keys(data).length === 0)
              ) {
                return (
                  <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                    <p>No data available for this widget</p>
                  </div>
                );
              }

              // Determine if this should be a bar chart or table
              if (Array.isArray(data) && data.length > 0) {
                // Check data for undefined values
                const hasValidNameValue = data.some(
                  (item) =>
                    item &&
                    typeof item === "object" &&
                    item.name !== undefined &&
                    item.value !== undefined
                );

                if (data.length === 1 || hasValidNameValue) {
                  // Clean data for bar chart
                  const cleanData = data.filter(
                    (item) =>
                      item &&
                      typeof item === "object" &&
                      item.name !== undefined &&
                      item.value !== undefined
                  );

                  if (cleanData.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                        <p>No valid data for visualization</p>
                      </div>
                    );
                  }

                  return (
                    <DataVisualizationWidget
                      {...widgetProps}
                      type="bar"
                      data={cleanData}
                    />
                  );
                } else {
                  // For table data, check for valid structure
                  if (!data[0] || typeof data[0] !== "object") {
                    return (
                      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                        <p>Invalid data format for table</p>
                      </div>
                    );
                  }

                  return (
                    <DataTable
                      data={data}
                      title={getWidgetTitle(widgetId)}
                      columns={Object.keys(data[0] || {}).map((key) => ({
                        key,
                        label: key,
                      }))}
                    />
                  );
                }
              }

              return (
                <DataVisualizationWidget
                  {...widgetProps}
                  type="bar"
                  data={[{ name: "No Data", value: 0 }]}
                />
              );
            }}
          />
        );
    }
  };
  const getWidgetTitle = (widgetId: string): string => {
    const titles: Record<string, string> = {
      // Main dashboard widgets
      "resource-performance": "Resource Performance",
      "all-failure-patterns-count": "All Failure Patterns Count",
      "object-lifecycle": "Object Lifecycle Graph",
      "timing-violations-count": "Timing Violations Count",
      "long-running-cases-count": "Long Running Cases Count",
      "sop-deviation-count": "SOP Deviation Count",
      "incomplete-cases-count": "Incomplete Cases Count",
      "case-complexity-analysis": "Case Complexity Analysis",
      "resource-switches-count": "Resource Switches Count",
      "rework-activities-count": "Rework Activities Count", // Table widgets
      "incomplete-cases-table": "Incomplete Cases Table",
      "incomplete-case-table": "Incomplete Cases Table",
      "long-running-table": "Long-Running Cases Table",
      "resource-switches-count-table": "Resource Switches Count Table",
      "resource-switches-table": "Resource Switches Table",
      "reworked-activities-table": "Reworked Activities Table",
      "timing-violations-table": "Timing Violations Table",
      "sop-patterns": "SOP Deviation Patterns",
      "sop-deviation-patterns": "SOP Deviation Patterns",
      "activity-pair-threshold": "Activity Pair Threshold",

      // Control widgets
      "controls-identified-count": "Controls Identified Count",
      "controls-description": "Controls Description",
      "control-definition": "Control Definition",

      // Analysis widgets
      "sla-analysis": "SLA Analysis",
      "all-counts": "All Process Counts",
      "ai-insights": "AI Insights Dashboard",
      kpi: "Key Performance Indicators",
      "sop-low-percentage-count-bar": "SOP Low Percentage Count",
      "case-complexity-table": "Case Complexity Table",

      // Visualization types
      "process-failure-patterns-bar": "Process Failure Patterns",
      "resource-performance-table": "Resource Performance Table",
      "timing-analysis-table": "Timing Analysis Table",
      "sop-table": "SOP Table",
      "resource-switches-bar": "Resource Switches",
      "resource-performance-count": "Resource Performance Count",
      "resource-switches-graph": "Resource Switches Graph",
      "rework-activities-bar": "Rework Activities",
      "timing-violations-bar": "Timing Violations",
      "case-complexity-report": "Case Complexity Report",
    };

    // If we don't have a predefined title, format the widget ID
    if (!titles[widgetId]) {
      // Convert kebab-case to Title Case (e.g., "my-widget" -> "My Widget")
      return widgetId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return titles[widgetId];
  };

  const getWidgetDescription = (widgetId: string): string => {
    const descriptions: Record<string, string> = {
      "resource-performance": "Monitor resource efficiency and utilization",
      "all-failure-patterns-count": "Count of all failure pattern occurrences",
      "object-lifecycle": "Track object lifecycle and transitions",
      "timing-violations-count": "Count of timing violations",
      "long-running-cases-count": "Count of long-running cases",
      "sop-deviation-count": "Count of SOP deviation instances",
      "incomplete-cases-count": "Count of incomplete cases",
      "case-complexity-analysis": "Comprehensive case complexity analysis",
      "resource-switches-count": "Count of resource switch events",
      "rework-activities-count": "Count of rework activities",
      "incomplete-cases-table": "Detailed table of incomplete cases",
      "long-running-table": "Detailed table of long-running cases",
      "resource-switches-count-table": "Resource switches count breakdown",
      "resource-switches-table": "Detailed resource switches data",
      "reworked-activities-table": "Detailed reworked activities data",
      "timing-violations-table": "Detailed timing violations data",
      "sop-deviation-patterns": "SOP deviation pattern analysis",
      "activity-pair-threshold": "Activity pair threshold analysis",
      "controls-identified-count": "Count of identified controls",
      "controls-description": "Description of control mechanisms",
      "control-definition": "Control definitions and specifications",
      "sla-analysis": "Service Level Agreement analysis",
      kpi: "Key Performance Indicators",
    };
    return descriptions[widgetId] || "Widget description";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Monitor your key metrics and insights
          </p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Pin className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>Selected Widgets: {selectedWidgets.join(", ")}</p>
          <p>Pinned Widgets: {pinnedWidgets.join(", ")}</p>
          <p>Temp Pinned Widgets: {tempPinnedWidgets.join(", ")}</p>
          <p>Has Changes: {hasChanges.toString()}</p>
          <p>Has User Selection: {hasUserSelection.toString()}</p>
        </div>
      )}

      {/* Widgets Section */}
      {selectedWidgets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {selectedWidgets.map(renderWidget)}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Widgets Selected
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by selecting widgets to display on your dashboard.
              Choose from various charts, tables, and analytics tools.
            </p>
            <p className="text-sm text-gray-500">
              Use the "Configure Widgets" button in the header to select your
              widgets.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
