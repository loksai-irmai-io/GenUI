import React, { useEffect, useState } from "react";
import DataVisualizationWidget from "../components/widgets/DataVisualizationWidget";
import DataTable from "../components/widgets/DataTable";

const CCM = () => {
  // State for each widget
  const [controlsCount, setControlsCount] = useState<any[]>([]);
  const [controlsDesc, setControlsDesc] = useState<any[]>([]);
  const [controlsDef, setControlsDef] = useState<any[]>([]);
  const [slaAnalysis, setSlaAnalysis] = useState<any[]>([]);
  const [kpi, setKpi] = useState<any[]>([]);
  const [slaBarData, setSlaBarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("http://34.60.217.109/controls_identified_count").then((res) =>
        res.json()
      ),
      fetch("http://34.60.217.109/control_description?page=1&size=100").then(
        (res) => res.json()
      ),
      fetch("http://34.60.217.109/control_defination?page=1&size=100").then(
        (res) => res.json()
      ),
      fetch("http://34.60.217.109/sla_analysis").then((res) => res.json()),
      fetch("http://127.0.0.1:8001/kpi").then((res) => res.json()),
      fetch("http://127.0.0.1:8001/slagraph/avg-activity-duration-bar").then(
        (res) => res.json()
      ),
    ])
      .then(([count, desc, def, sla, kpi, slaBar]) => {
        // Bar chart expects array of { name, value }
        let countArr = Array.isArray(count)
          ? count
          : Object.entries(count).map(([name, value]) => ({ name, value }));
        setControlsCount(countArr);
        setControlsDesc(Array.isArray(desc) ? desc : desc.data || []);
        setControlsDef(Array.isArray(def) ? def : def.data || []);
        setSlaAnalysis(Array.isArray(sla) ? sla : sla.data || []);
        setKpi(Array.isArray(kpi) ? kpi : kpi.data || []);
        // Bar chart expects array of { name, value }
        // Fix: transform plotly-style data to recharts array
        let barArr: any[] = [];
        if (slaBar && Array.isArray(slaBar.data)) {
          // Plotly bar data: [{ x: [...], y: [...], ... }]
          const bar = slaBar.data[0];
          if (bar && Array.isArray(bar.x) && Array.isArray(bar.y)) {
            barArr = bar.x.map((x: string, i: number) => ({
              name: x,
              value: bar.y[i],
            }));
          }
        } else if (Array.isArray(slaBar)) {
          barArr = slaBar;
        } else if (slaBar && typeof slaBar === "object") {
          barArr = Object.entries(slaBar).map(([name, value]) => ({
            name,
            value,
          }));
        }
        setSlaBarData(barArr);
      })
      .catch((e) => setError("Failed to load CCM data."))
      .finally(() => setLoading(false));
  }, []);

  // Helper to auto-generate columns from data, with better label formatting
  const getColumns = (data: any[]) =>
    data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          key,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        }))
      : [];

  // Helper for table cell formatting
  const formatCell = (value: any) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value, null, 1);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  // Table wrapper for improved formatting and independent sizing
  const TableWidget = ({ title, data, columns }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 max-w-full overflow-x-auto">
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <table className="min-w-[400px] w-full text-sm border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col: any) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left font-semibold text-gray-700 border-b"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-gray-400 py-4"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row: any, idx: number) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {columns.map((col: any) => (
                  <td key={col.key} className="px-3 py-2 border-b align-top">
                    {formatCell(row[col.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // SLA Analysis: handle object or array, with fallback data
  const fallbackSla = {
    SLA_Analysis: {
      Title: "SLA Breach Analysis and Optimization",
      Metrics: {
        Total_Cases_Processed: 21234,
        Average_Time_Between_Steps_hrs: 93.08,
        Longest_Single_Step_Time_hrs: 383.98,
        Case_With_Max_Time: {
          Case_ID: "MORT_14752",
          Activity: "Valuation Accepted",
        },
      },
      Key_Findings: {
        High_Duration_Activities: {
          Observation:
            "Majority of 'Valuation Accepted' durations are ~383.9 hours, indicating a bottleneck.",
          Implication:
            "Pre-Valuation process is taking approximately 16 days, which is unusually long.",
          Valuation_Issues:
            "Single entry found; not enough data to analyze impact, but may point to root cause.",
        },
        Case_Patterns: {
          Observation:
            "Insufficient data to detect patterns in case IDs alone.",
          Recommendation:
            "Link case_id to loan amount, property type, or applicant characteristics for deeper analysis.",
        },
        Process_Flow_Insights: {
          Observation:
            "Low variability in 'Valuation Accepted' durations suggests a rigid process.",
          Implication:
            "Consistent durations across cases point to systemic issues, not isolated incidents.",
          Valuation_Issues_Insight:
            "Limited data; deeper exploration required to understand contribution to delays.",
        },
      },
      Recommendations: [
        {
          Title: "Investigate the Pre-Valuation Process",
          Details:
            "Map each step leading to 'Valuation Accepted', measure durations, and analyze handoffs. Check team workloads and average handling time to identify exact delay source.",
        },
        {
          Title: "Analyze 'Valuation Issues'",
          Details:
            "Expand dataset and understand reasons, frequency, and impact of valuation issues. Conduct staff interviews to uncover root causes.",
        },
      ],
      Conclusion:
        "The current mortgage processing workflow has a major bottleneck before the 'Valuation Accepted' step. Further data and qualitative analysis are needed to optimize the process and meet SLA expectations.",
    },
  };

  // Helper to flatten nested objects for table display
  function flattenObject(obj: any, parentKey = "", result: any = {}) {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const propName = parentKey ? `${parentKey} > ${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObject(obj[key], propName, result);
      } else {
        result[propName] = obj[key];
      }
    }
    return result;
  }

  // SLA Analysis: handle object or array, with fallback
  const getSlaTableDataAndColumns = (data: any) => {
    let useData = data;
    if (
      (!useData || (Array.isArray(useData) && useData.length === 0)) &&
      fallbackSla.SLA_Analysis
    ) {
      useData = fallbackSla.SLA_Analysis;
    }
    if (Array.isArray(useData)) {
      return { data: useData, columns: getColumns(useData) };
    }
    if (useData && typeof useData === "object") {
      // Flatten nested object for better table display
      const flat = flattenObject(useData);
      const arr = Object.entries(flat).map(([key, value]) => ({
        Field: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        Value:
          typeof value === "object"
            ? JSON.stringify(value, null, 1)
            : String(value ?? ""),
      }));
      return {
        data: arr,
        columns: [
          { key: "Field", label: "Field" },
          { key: "Value", label: "Value" },
        ],
      };
    }
    return { data: [], columns: [] };
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">CCM</h2>
      {loading && <div>Loading CCM visualizations...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {/* Controls Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Controls</h3>
        <div className="mb-6">
          <div className="inline-block align-top w-full md:w-auto">
            <DataVisualizationWidget
              type="incomplete-bar"
              title="Controls identified count"
              data={controlsCount}
              maximized={false}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <TableWidget
              title="Controls description"
              data={controlsDesc}
              columns={getColumns(controlsDesc)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <TableWidget
              title="Control definition"
              data={controlsDef}
              columns={getColumns(controlsDef)}
            />
          </div>
        </div>
      </div>
      {/* SLA Analysis Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          SLA Analysis
        </h3>
        <DataVisualizationWidget
          type="incomplete-bar"
          title="Average Activity Duration (hrs)"
          data={slaBarData}
          maximized={false}
        />
      </div>
      {/* KPI Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI</h3>
        <TableWidget title="KPI" data={kpi} columns={getColumns(kpi)} />
      </div>
    </div>
  );
};

export default CCM;
