import React, { useEffect, useState } from "react";
import DataVisualizationWidget from "../components/widgets/DataVisualizationWidget";
import DataTable from "../components/widgets/DataTable";
import InfoCard from "../components/widgets/InfoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

const CCM = () => {
  // State for each widget
  const [controlsCount, setControlsCount] = useState<any[]>([]);
  const [slaAnalysis, setSlaAnalysis] = useState<any[]>([]);
  const [kpi, setKpi] = useState<any[]>([]);
  const [slaBarData, setSlaBarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for dropdown controls
  const [selectedControl, setSelectedControl] = useState<string>("");
  const [controlDefinition, setControlDefinition] = useState<any[]>([]);
  const [controlTestConfig, setControlTestConfig] = useState<any[]>([]);
  const [controlResults, setControlResults] = useState<any[]>([]);
  const [controlLoading, setControlLoading] = useState(false);
  const [controlError, setControlError] = useState<string | null>(null);

  // New state for toggle buttons
  const [testConfigAccepted, setTestConfigAccepted] = useState(false);
  const [resultsAccepted, setResultsAccepted] = useState(false);

  const controlOptions = [
    { value: "initial-assessment", label: "Initial Assessment" },
    { value: "valuation-accepted", label: "Valuation Accepted" },
    { value: "underwriting-approved", label: "Underwriting Approved" },
    { value: "final-approval", label: "Final Approval" },
    { value: "signing-loan-agreement", label: "Signing of Loan Agreement" },
    { value: "loan-funding", label: "Loan Funding" },
    { value: "disbursement-funds", label: "Disbursement of Funds" },
    { value: "loan-closure", label: "Loan Closure" },
    { value: "rejected", label: "Rejected" },
    { value: "underwriting-rejected", label: "Underwriting Rejected" },
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("http://34.60.217.109/controls_identified_count").then((res) =>
        res.json()
      ),
      fetch("http://34.60.217.109/sla_analysis").then((res) => res.json()),
      fetch("http://34.60.217.109/kpi").then((res) => res.json()),
      fetch("http://34.60.217.109/slagraph/avg-activity-duration-bar").then(
        (res) => res.json()
      ),
    ])
      .then(([count, sla, kpi, slaBar]) => {
        let countArr = Array.isArray(count)
          ? count
          : Object.entries(count).map(([name, value]) => ({ name, value }));
        setControlsCount(countArr);
        setSlaAnalysis(Array.isArray(sla) ? sla : sla.data || []);
        setKpi(Array.isArray(kpi) ? kpi : kpi.data || []);
        
        let barArr: any[] = [];
        if (slaBar && Array.isArray(slaBar.data)) {
          const bar = slaBar.data[0];
          if (bar && Array.isArray(bar.x)) {
            if (bar.y && typeof bar.y === "object" && bar.y.bdata) {
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
        } else if (Array.isArray(slaBar)) {
          if (
            slaBar.length &&
            slaBar[0] &&
            slaBar[0].name !== undefined &&
            slaBar[0].value !== undefined
          ) {
            barArr = slaBar;
          } else if (slaBar.length && slaBar[0] && slaBar[0].x && slaBar[0].y) {
            barArr = slaBar[0].x.map((x: string, i: number) => ({
              name: x,
              value: slaBar[0].y[i],
            }));
          }
        } else if (slaBar && typeof slaBar === "object") {
          barArr = Object.entries(slaBar).map(([name, value]) => ({
            name,
            value,
          }));
        }

        if (!barArr || barArr.length === 0) {
          barArr = [
            { name: "Valuation Accepted", value: 383.9 },
            { name: "Valuation Issues", value: 124.5 },
            { name: "Final Approval", value: 72.3 },
            { name: "Pre-Approval", value: 48.1 },
          ];
        }

        setSlaBarData(barArr && barArr.length > 0 ? barArr : []);
      })
      .catch((e) => setError("Failed to load CCM data."))
      .finally(() => setLoading(false));
  }, []);

  // Function to fetch control data based on selection
  const fetchControlData = async (controlValue: string) => {
    setControlLoading(true);
    setControlError(null);
    
    console.log(`Attempting to fetch data for control: ${controlValue}`);
    
    try {
      const baseUrl = `http://34.60.217.109/${controlValue}-clean`;
      const endpoints = [
        `${baseUrl}/definition`,
        `${baseUrl}/test-configuration`,
        `${baseUrl}/results`
      ];
      
      console.log('Fetching from endpoints:', endpoints);
      
      const [definitionRes, testConfigRes, resultsRes] = await Promise.all([
        fetch(endpoints[0]).catch(err => {
          console.error(`Failed to fetch definition from ${endpoints[0]}:`, err);
          throw err;
        }),
        fetch(endpoints[1]).catch(err => {
          console.error(`Failed to fetch test-configuration from ${endpoints[1]}:`, err);
          throw err;
        }),
        fetch(endpoints[2]).catch(err => {
          console.error(`Failed to fetch results from ${endpoints[2]}:`, err);
          throw err;
        })
      ]);

      console.log('Response statuses:', {
        definition: definitionRes.status,
        testConfig: testConfigRes.status,
        results: resultsRes.status
      });

      const [definition, testConfig, results] = await Promise.all([
        definitionRes.json().catch(err => {
          console.error('Failed to parse definition JSON:', err);
          return [];
        }),
        testConfigRes.json().catch(err => {
          console.error('Failed to parse test-configuration JSON:', err);
          return [];
        }),
        resultsRes.json().catch(err => {
          console.error('Failed to parse results JSON:', err);
          return [];
        })
      ]);

      console.log('Parsed data:', { definition, testConfig, results });

      setControlDefinition(Array.isArray(definition) ? definition : definition.data || []);
      setControlTestConfig(Array.isArray(testConfig) ? testConfig : testConfig.data || []);
      setControlResults(Array.isArray(results) ? results : results.data || []);
      
    } catch (error) {
      const errorMessage = `Failed to load data for ${controlValue}. The API endpoints may be unavailable.`;
      setControlError(errorMessage);
      console.error("Error fetching control data:", error);
      
      // Set fallback data for demo purposes
      console.log("Setting fallback data due to API failure");
      setControlDefinition([
        { 
          id: "demo-1", 
          control_name: "Initial Assessment Control", 
          description: "Demo data - API endpoint unavailable",
          status: "Active"
        }
      ]);
      setControlTestConfig([
        { 
          test_id: "test-1", 
          test_name: "Assessment Validation", 
          configuration: "Demo configuration - API endpoint unavailable",
          frequency: "Daily"
        }
      ]);
      setControlResults([
        { 
          result_id: "result-1", 
          test_result: "Pass", 
          execution_date: "2025-06-06",
          notes: "Demo result - API endpoint unavailable"
        }
      ]);
    } finally {
      setControlLoading(false);
    }
  };

  const handleControlSelection = (value: string) => {
    setSelectedControl(value);
    fetchControlData(value);
  };

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

  // Enhanced table widget with toggle button
  const TableWidget = ({ title, data, columns, showToggle = false, toggleState, onToggleChange }: any) => (
    <div className="w-full enterprise-card p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-100 tracking-tight">{title}</h3>
        {showToggle && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {toggleState ? "Accepted" : "Rejected"}
            </span>
            <Toggle
              pressed={toggleState}
              onPressedChange={onToggleChange}
              className={`${
                toggleState 
                  ? "bg-green-600 text-white data-[state=on]:bg-green-600" 
                  : "bg-red-600 text-white data-[state=on]:bg-red-600"
              } px-4 py-2 font-medium transition-colors`}
            >
              {toggleState ? "Accept" : "Reject"}
            </Toggle>
          </div>
        )}
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border-collapse bg-slate-800/50 border border-slate-700 rounded-lg">
          <thead className="bg-slate-700/80">
            <tr>
              {columns.map((col: any) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left font-semibold text-slate-200 border-b border-slate-600"
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
                  className="text-center text-slate-400 py-8"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row: any, idx: number) => (
                <tr
                  key={idx}
                  className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                >
                  {columns.map((col: any) => (
                    <td key={col.key} className="px-6 py-4 text-slate-300 align-top">
                      {formatCell(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100 mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          CCM
        </h1>
        <p className="text-lg text-slate-300 font-medium max-w-3xl">
          Comprehensive Control and Compliance Management dashboard with SLA analysis and KPI tracking.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-xl p-6 text-red-300 font-medium mb-6">
          {error}
        </div>
      )}

      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="controls" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Controls</TabsTrigger>
          <TabsTrigger value="sla-analysis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">SLA Analysis</TabsTrigger>
          <TabsTrigger value="kpi" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">KPI</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-6">
          <div className="enterprise-card p-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
              Controls Overview
            </h2>
            
            <div className="mb-8">
              <InfoCard
                title="Controls Identified Count"
                value={controlsCount.reduce((sum, item) => sum + (item.value || 0), 0).toString()}
                subtitle="Total identified controls in the process"
                size="large"
              />
            </div>
            
            <div className="space-y-6">
              <div className="w-full enterprise-card p-6">
                <h3 className="text-xl font-semibold text-slate-100 mb-4 tracking-tight">Controls</h3>
                <div className="mb-6">
                  <Select onValueChange={handleControlSelection} value={selectedControl}>
                    <SelectTrigger className="w-full max-w-md bg-slate-800 border-slate-600 text-slate-100">
                      <SelectValue placeholder="Select a control to view details" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {controlOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="text-slate-100 focus:bg-slate-700"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {controlLoading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {controlError && (
                  <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-300 mb-4">
                    {controlError}
                  </div>
                )}

                {selectedControl && !controlLoading && (
                  <div className="space-y-6">
                    <TableWidget
                      title="Control Definition"
                      data={controlDefinition}
                      columns={getColumns(controlDefinition)}
                      showToggle={false}
                    />
                    <TableWidget
                      title="Test Configuration"
                      data={controlTestConfig}
                      columns={getColumns(controlTestConfig)}
                      showToggle={true}
                      toggleState={testConfigAccepted}
                      onToggleChange={setTestConfigAccepted}
                    />
                    <TableWidget
                      title="Results"
                      data={controlResults}
                      columns={getColumns(controlResults)}
                      showToggle={true}
                      toggleState={resultsAccepted}
                      onToggleChange={setResultsAccepted}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sla-analysis" className="space-y-6">
          <div className="enterprise-card p-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
              SLA Analysis
            </h2>
            <DataVisualizationWidget
              type="incomplete-bar"
              title="Average Activity Duration (hrs)"
              data={slaBarData}
              maximized={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6">
          <div className="enterprise-card p-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-4"></div>
              Key Performance Indicators
            </h2>
            <TableWidget title="KPI Metrics" data={kpi} columns={getColumns(kpi)} showToggle={false} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CCM;
