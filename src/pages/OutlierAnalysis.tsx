import React, { useEffect, useState } from "react";
import DataVisualizationWidget from "../components/widgets/DataVisualizationWidget";
import DataTable from "../components/widgets/DataTable";

const widgetConfigs = [
  {
    id: "all-counts",
    title: "All Failure Pattern Counts",
    type: "bar",
    fetch: async () => {
      const res = await fetch("http://127.0.0.1:8001/allcounts");
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
        "http://127.0.0.1:8001/sopdeviation/low-percentage/count"
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
      const res = await fetch("http://127.0.0.1:8001/sopdeviation/patterns");
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
      const res = await fetch("http://127.0.0.1:8001/incompletecases/count");
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
      const res = await fetch("http://127.0.0.1:8001/incompletecase_table");
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
      const res = await fetch("http://127.0.0.1:8001/longrunningcases/count");
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
        "http://127.0.0.1:8001/longrunning_table?page=1&size=100"
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
      const res = await fetch("http://127.0.0.1:8001/resourceswitches/count");
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
        "http://127.0.0.1:8001/resourceswitches_count_table"
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
        "http://127.0.0.1:8001/resourceswitchestable_table?page=1&size=100"
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
      const res = await fetch("http://127.0.0.1:8001/reworkactivities/count");
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
        "http://127.0.0.1:8001/reworkedactivtiestable?page=1&size=100"
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
      const res = await fetch("http://127.0.0.1:8001/timingviolations/count");
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
          "http://127.0.0.1:8001/timingviolations_table?page=1&size=100"
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
    fetch("http://127.0.0.1:8001/resourceperformance")
      .then((res) => res.json())
      .then((data) =>
        setResourcePerformance(Array.isArray(data) ? data : data.data || [])
      )
      .catch(() => setResourcePerformance([]));

    // Timing Analysis
    fetch("http://127.0.0.1:8001/timinganalysis")
      .then((res) => res.json())
      .then((data) =>
        setTimingAnalysis(Array.isArray(data) ? data : data.data || [])
      )
      .catch(() => setTimingAnalysis([]));

    // Case Complexity Table
    fetch("http://127.0.0.1:8001/casecomplexity?page=1&size=100")
      .then((res) => res.json())
      .then((data) =>
        setCaseComplexity(Array.isArray(data) ? data : data.data || [])
      )
      .catch(() => setCaseComplexity([]));

    // Activity Pair Threshold Table
    fetch("http://127.0.0.1:8001/activitypairthreshold")
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
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Outlier Analysis</h2>
      {/* Failure Patterns Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Failure Patterns
        </h3>
        {loading && <div>Loading visualizations...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFailureWidgets.map((w) => (
            <div key={w.id}>{w.render(w.data, w.title)}</div>
          ))}
        </div>
        <div className="mt-8">{sopPatternsTable}</div>
      </div>
      {/* Resource Performance Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resource Performance
        </h3>
        <DataVisualizationWidget
          type="resource-performance-table"
          title="Resource Performance"
          data={resourcePerformance}
          maximized
        />
      </div>
      {/* Timing Analysis Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Timing Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataVisualizationWidget
            type="timing-analysis-table"
            title="Timing Analysis"
            data={timingAnalysis}
            maximized
          />
          <DataTable
            title="Activity pair threshold"
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
      {/* Case Complexity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Case Complexity
        </h3>
        <DataTable
          title="Case Complexity Table"
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
  );
};

export default OutlierAnalysis;
