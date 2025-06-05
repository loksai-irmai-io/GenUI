
import React, { useEffect, useState } from "react";
import DataVisualizationWidget from "../components/widgets/DataVisualizationWidget";
import DataTable from "../components/widgets/DataTable";

const widgetConfigs = [
  {
    id: "all-counts",
    title: "All Failure Pattern Counts",
    type: "bar",
    fetch: async () => {
      const res = await fetch("http://34.60.217.109/allcounts");
      const data = await res.json();
      return Object.entries(data).map(([name, value]) => ({ name, value }));
    },
    render: (data, title) => (
      <DataVisualizationWidget
        type="process-failure-patterns-bar"
        title={title}
        data={data}
        maximized
      />
    ),
  },
  {
    id: "sop-patterns",
    title: "SOP Deviation Patterns",
    type: "table",
    fetch: async () => {
      const res = await fetch("/sopdeviation.json");
      let data = await res.json();
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      if (!Array.isArray(data) && typeof data === "object" && data !== null)
        data = Object.values(data);
      // Map to correct columns for display
      if (Array.isArray(data)) {
        data = data.map((row, idx) => ({
          pattern_no: idx + 1,
          pattern: Array.isArray(row.sop_deviation_sequence_preview)
            ? row.sop_deviation_sequence_preview.slice(0, 5).join(" → ") +
              (row.sop_deviation_sequence_preview.length > 5 ? " ..." : "")
            : "",
          count: row.pattern_count,
          percentage: row.percentage,
        }));
      }
      return data;
    },
    render: (data, title) => {
      if (!Array.isArray(data) || data.length === 0) return <div>No data</div>;
      const columns = [
        { key: "pattern_no", label: "Pattern No" },
        { key: "pattern", label: "Pattern" },
        { key: "count", label: "Count" },
        { key: "percentage", label: "Percentage (%)" },
      ];
      return (
        <DataTable title={title} data={data} columns={columns} maximized />
      );
    },
  },
  {
    id: "sop-low-percentage-count-bar",
    title: "SOP Deviation Low Percentage Count",
    type: "bar",
    fetch: async () => {
      const res = await fetch(
        "http://34.60.217.109/sopdeviation/low-percentage/count"
      );
      let data = await res.json();
      // Always return as array for bar chart
      if (data && typeof data.count === "number") {
        return [{ name: "Low Percentage Count", value: data.count }];
      }
      return [];
    },
    render: (data, title) => (
      <DataVisualizationWidget
        type="incomplete-bar"
        title={title}
        data={data}
        maximized
      />
    ),
  },
  {
    id: "sop-low-percentage-patterns-table",
    title: "SOP Deviation Low Percentage Patterns",
    type: "table",
    fetch: async () => {
      const res = await fetch("http://34.60.217.109/sopdeviation/patterns");
      let data = await res.json();
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      if (!Array.isArray(data) && typeof data === "object" && data !== null)
        data = Object.values(data);
      if (Array.isArray(data)) {
        data = data.map((row) => ({
          pattern_no: row.pattern_no,
          pattern: row.pattern,
          count: row.count,
          percentage: row.percentage,
        }));
      }
      return data;
    },
    render: (data, title) => {
      if (!Array.isArray(data) || data.length === 0) return <div>No data</div>;
      const columns = [
        { key: "pattern_no", label: "Pattern No" },
        { key: "pattern", label: "Pattern" },
        { key: "count", label: "Count" },
        { key: "percentage", label: "Percentage (%)" },
      ];
      return (
        <DataTable title={title} data={data} columns={columns} maximized />
      );
    },
  },
  {
    id: "incomplete-cases-count",
    title: "Incomplete Cases Count",
    type: "bar",
    fetch: async () => {
      const res = await fetch("http://34.60.217.109/incompletecases/count");
      const data = await res.json();
      return [{ name: "Incomplete Cases", value: data.count }];
    },
    render: (data, title) => (
      <DataVisualizationWidget
        type="incomplete-bar"
        title={title}
        data={data}
        maximized
      />
    ),
  },
  {
    id: "incomplete-case-table",
    title: "Incomplete Case Table",
    type: "table",
    fetch: async () => {
      const res = await fetch("http://34.60.217.109/incompletecase_table");
      let data = await res.json();
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      if (!Array.isArray(data) && typeof data === "object" && data !== null)
        data = Object.values(data);
      return data;
    },
    render: (data, title) => {
      if (!Array.isArray(data) || data.length === 0) return <div>No data</div>;
      const columns = Object.keys(data[0] || {}).map((key) => ({
        key,
        label: key,
      }));
      return (
        <DataTable title={title} data={data} columns={columns} maximized />
      );
    },
  },
  {
    id: "long-running-cases-count",
    title: "Long Running Cases Count",
    type: "bar",
    fetch: async () => {
      const res = await fetch("http://34.60.217.109/longrunningcases/count");
      const data = await res.json();
      return [{ name: "Long Running Cases", value: data.count }];
    },
    render: (data, title) => (
      <DataVisualizationWidget
        type="longrunning-bar"
        title={title}
        data={data}
        maximized
      />
    ),
  },
  {
    id: "long-running-table",
    title: "Long Running Table",
    type: "table",
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
    render: (data, title) => {
      if (!Array.isArray(data) || data.length === 0) return <div>No data</div>;
      const columns = Object.keys(data[0] || {}).map((key) => ({
        key,
        label: key,
      }));
      return (
        <DataTable title={title} data={data} columns={columns} maximized />
      );
    },
  },
  {
    id: "resource-switches-count",
    title: "Resource Switches Count",
    type: "bar",
    fetch: async () => {
      const res = await fetch("http://34.60.217.109/resourceswitches/count");
      const data = await res.json();
      return [{ name: "Resource Switches", value: data.count }];
    },
    render: (data, title) => (
      <DataVisualizationWidget
        type="resource-switches-bar"
        title={title}
        data={data}
        maximized
      />
    ),
  },
  {
    id: "resource-switches-count-table",
    title: "Resource Switches Count Table",
    type: "table",
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
    render: (data, title) => {
      if (!Array.isArray(data) || data.length === 0) return <div>No data</div>;
      const columns = Object.keys(data[0] || {}).map((key) => ({
        key,
        label: key,
      }));
      return (
        <DataTable title={title} data={data} columns={columns} maximized />
      );
    },
  },
  {
    id: "resource-switches-table",
    title: "Resource Switches Table",
    type: "table",
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
    render: (data, title) => {
      if (!Array.isArray(data) || data.length === 0) return <div>No data</div>;
      const columns = Object.keys(data[0] || {}).map((key) => ({
        key,
        label: key,
      }));
      return (
        <DataTable title={title} data={data} columns={columns} maximized />
      );
    },
  },
  {
    id: "rework-activities-count",
    title: "Rework Activities Count",
    type: "bar",
    fetch: async () => {
      const res = await fetch("http://34.60.217.109/reworkactivities/count");
      const data = await res.json();
      return [{ name: "Rework Activities", value: data.count }];
    },
    render: (data, title) => (
      <DataVisualizationWidget
        type="rework-activities-bar"
        title={title}
        data={data}
        maximized
      />
    ),
  },
  {
    id: "reworked-activities-table",
    title: "Reworked Activities Table",
    type: "table",
    fetch: async () => {
      const res = await fetch(
        "http://34.60.217.109/reworkedactivtiestable?page=1&size=100"
      );
      let data = await res.json();
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      if (!Array.isArray(data) && typeof data === "object" && data !== null)
        data = Object.values(data);
      return data;
    },
    render: (data, title) => {
      if (!Array.isArray(data) || data.length === 0) return <div>No data</div>;
      const columns = Object.keys(data[0] || {}).map((key) => ({
        key,
        label: key,
      }));
      return (
        <DataTable title={title} data={data} columns={columns} maximized />
      );
    },
  },
  {
    id: "timing-violations-count",
    title: "Timing Violations Count",
    type: "bar",
    fetch: async () => {
      const res = await fetch("http://34.60.217.109/timingviolations/count");
      const data = await res.json();
      return [{ name: "Timing Violations", value: data.count }];
    },
    render: (data, title) => (
      <DataVisualizationWidget
        type="timing-violations-bar"
        title={title}
        data={data}
        maximized
      />
    ),
  },
  {
    id: "timing-violations-table",
    title: "Timing Violations Table",
    type: "table",
    fetch: async () => {
      // Try API endpoint first, fallback to static file if not found
      let data;
      try {
        const res = await fetch(
          "http://34.60.217.109/timingviolations_table?page=1&size=100"
        );
        if (!res.ok) throw new Error("API not found");
        data = await res.json();
      } catch (e) {
        // fallback to static file
        const res = await fetch("/timingviolations_table.json");
        data = await res.json();
      }
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      if (!Array.isArray(data) && typeof data === "object" && data !== null)
        data = Object.values(data);
      return data;
    },
    render: (data, title) => {
      if (!Array.isArray(data) || data.length === 0) return <div>No data</div>;
      const columns = Object.keys(data[0] || {}).map((key) => ({
        key,
        label: key,
      }));
      return (
        <DataTable title={title} data={data} columns={columns} maximized />
      );
    },
  },
];

const OutlierAnalysis = () => {
  const [failureWidgets, setFailureWidgets] = useState<any[]>([]);
  const [resourcePerformance, setResourcePerformance] = useState<any[]>([]);
  const [timingAnalysis, setTimingAnalysis] = useState<any[]>([]);
  const [caseComplexity, setCaseComplexity] = useState<any[]>([]);
  const [activityPairThreshold, setActivityPairThreshold] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Failure Patterns section
    Promise.all(
      widgetConfigs.map(async (w) => {
        try {
          const data = await w.fetch();
          return { ...w, data };
        } catch (err) {
          return { ...w, data: [], error: (err as Error).message };
        }
      })
    )
      .then(setFailureWidgets)
      .catch((e) => setError("Failed to load visualizations."));

    // Resource Performance
    fetch("http://34.60.217.109/resourceperformance")
      .then((res) => res.json())
      .then((data) =>
        setResourcePerformance(Array.isArray(data) ? data : data.data || [])
      )
      .catch(() => setResourcePerformance([]));

    // Timing Analysis
    fetch("http://34.60.217.109/timinganalysis")
      .then((res) => res.json())
      .then((data) =>
        setTimingAnalysis(Array.isArray(data) ? data : data.data || [])
      )
      .catch(() => setTimingAnalysis([]));

    // Case Complexity Table
    fetch("http://34.60.217.109/casecomplexity?page=1&size=100")
      .then((res) => res.json())
      .then((data) =>
        setCaseComplexity(Array.isArray(data) ? data : data.data || [])
      )
      .catch(() => setCaseComplexity([]));

    // Activity Pair Threshold Table
    fetch("http://34.60.217.109/activitypairthreshold")
      .then((res) => res.json())
      .then((data) =>
        setActivityPairThreshold(Array.isArray(data) ? data : data.data || [])
      )
      .catch(() => setActivityPairThreshold([]));

    setLoading(false);
  }, []);

  // Remove all SOP Deviation Patterns tables from widgetConfigs except one, and ensure only one is rendered in the Failure Patterns section
  const filteredFailureWidgets = failureWidgets.filter(
    (w) =>
      w.id !== "sop-patterns" && w.id !== "sop-low-percentage-patterns-table"
  );

  // Only render the correct SOP Deviation Patterns table ONCE, with correct columns and data
  const sopPatternsWidget = failureWidgets.find((w) => w.id === "sop-patterns");
  let sopPatternsTable = null;
  if (sopPatternsWidget) {
    let data = sopPatternsWidget.data;
    if (data && data.data && Array.isArray(data.data)) data = data.data;
    if (!Array.isArray(data) && typeof data === "object" && data !== null)
      data = Object.values(data);
    if (Array.isArray(data)) {
      data = data.map((row) => ({
        pattern_no: row.pattern_no,
        pattern: row.pattern,
        count: row.count,
        percentage: row.percentage,
      }));
    }
    if (Array.isArray(data) && data.length > 0) {
      const columns = [
        { key: "pattern_no", label: "Pattern No" },
        { key: "pattern", label: "Pattern" },
        { key: "count", label: "Count" },
        { key: "percentage", label: "Percentage (%)" },
      ];
      sopPatternsTable = (
        <DataTable
          title="SOP Deviation Patterns"
          data={data}
          columns={columns}
          maximized
        />
      );
    } else {
      sopPatternsTable = <div>No data</div>;
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-10">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
          Outlier Analysis
        </h1>
        <p className="text-lg text-gray-600 font-medium max-w-3xl">
          Comprehensive analysis of process anomalies, failure patterns, and performance outliers to identify optimization opportunities.
        </p>
      </div>

      {/* Failure Patterns Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-10 mb-10">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full mr-4"></div>
          <h2 className="text-2xl font-bold text-gray-900">Failure Patterns</h2>
        </div>
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 font-medium">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {filteredFailureWidgets.map((w) => (
            <div key={w.id} className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
              {w.render(w.data, w.title)}
            </div>
          ))}
        </div>
        {sopPatternsTable && (
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
            {sopPatternsTable}
          </div>
        )}
      </div>

      {/* Resource Performance Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-10 mb-10">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-4"></div>
          <h2 className="text-2xl font-bold text-gray-900">Resource Performance</h2>
        </div>
        <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
          <DataVisualizationWidget
            type="resource-performance-table"
            title="Resource Performance Analysis"
            data={resourcePerformance}
            maximized
          />
        </div>
      </div>

      {/* Timing Analysis Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-10 mb-10">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
          <h2 className="text-2xl font-bold text-gray-900">Timing Analysis</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
            <DataVisualizationWidget
              type="timing-analysis-table"
              title="Timing Analysis Overview"
              data={timingAnalysis}
              maximized
            />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
            <DataTable
              title="Activity Pair Threshold"
              data={activityPairThreshold}
              columns={
                activityPairThreshold.length > 0
                  ? Object.keys(activityPairThreshold[0]).map((key) => ({
                      key,
                      label: key,
                    }))
                  : []
              }
              maximized
            />
          </div>
        </div>
      </div>

      {/* Case Complexity Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-10 mb-10">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-4"></div>
          <h2 className="text-2xl font-bold text-gray-900">Case Complexity</h2>
        </div>
        <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
          <DataTable
            title="Case Complexity Analysis"
            data={caseComplexity}
            columns={
              caseComplexity.length > 0
                ? Object.keys(caseComplexity[0]).map((key) => ({
                    key,
                    label: key,
                  }))
                : []
            }
            maximized
          />
        </div>
      </div>
    </div>
  );
};

export default OutlierAnalysis;
