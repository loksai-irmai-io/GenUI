
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const endpoints = [
  {
    key: "aianalysis",
    label: "AI Analysis",
    url: "http://34.60.217.109/aianalysis",
  },
  {
    key: "sop",
    label: "SOP Deviation",
    url: "http://34.60.217.109/aiinsights/sop",
  },
  {
    key: "incomplete",
    label: "Incomplete Cases",
    url: "http://34.60.217.109/aiinsights/incomplete",
  },
  {
    key: "longrunning",
    label: "Long Running Cases",
    url: "http://34.60.217.109/aiinsights/longrunning",
  },
  {
    key: "reworked",
    label: "Reworked Activities",
    url: "http://34.60.217.109/aiinsights/reworked",
  },
  {
    key: "resourceswitches",
    label: "Resource Switches",
    url: "http://34.60.217.109/aiinsights/resourceswitches",
  },
  {
    key: "timingviolation",
    label: "Timing Violations",
    url: "http://34.60.217.109/aiinsights/timingviolation",
  },
  {
    key: "casecomplexity",
    label: "Case Complexity",
    url: "http://34.60.217.109/aiinsights/casecomplexity",
  },
  {
    key: "resourceperformance",
    label: "Resource Performance",
    url: "http://34.60.217.109/aiinsights/resourceperformance",
  },
  {
    key: "timinganalysis",
    label: "Timing Analysis",
    url: "http://34.60.217.109/aiinsights/timinganalysis",
  },
];

// Utility to render structured content for each endpoint
function renderAIContent(data: any, label: string) {
  if (!data) return <div className="text-gray-500">No data found.</div>;

  // SOP Deviation AI Insights (and similar endpoints)
  if (
    typeof data === "object" &&
    (data.title ||
      data.key_findings ||
      data.potential_causes_impacts ||
      data.actionable_recommendations)
  ) {
    // If any of the fields are a stringified array, parse them
    const keyFindings = Array.isArray(data.key_findings)
      ? data.key_findings
      : typeof data.key_findings === "string" &&
        data.key_findings.trim().startsWith("[")
      ? (() => {
          try {
            return JSON.parse(data.key_findings);
          } catch {
            return [data.key_findings];
          }
        })()
      : data.key_findings
      ? [data.key_findings]
      : [];
    const causes = Array.isArray(data.potential_causes_impacts)
      ? data.potential_causes_impacts
      : typeof data.potential_causes_impacts === "string" &&
        data.potential_causes_impacts.trim().startsWith("[")
      ? (() => {
          try {
            return JSON.parse(data.potential_causes_impacts);
          } catch {
            return [data.potential_causes_impacts];
          }
        })()
      : data.potential_causes_impacts
      ? [data.potential_causes_impacts]
      : [];
    const recommendations = Array.isArray(data.actionable_recommendations)
      ? data.actionable_recommendations
      : typeof data.actionable_recommendations === "string" &&
        data.actionable_recommendations.trim().startsWith("[")
      ? (() => {
          try {
            return JSON.parse(data.actionable_recommendations);
          } catch {
            return [data.actionable_recommendations];
          }
        })()
      : data.actionable_recommendations
      ? [data.actionable_recommendations]
      : [];
    return (
      <div className="space-y-4">
        {data.title && (
          <h2 className="text-xl font-semibold mb-2">{data.title}</h2>
        )}
        {keyFindings.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-1">Key Findings</h3>
            <ul className="list-disc ml-6 space-y-1">
              {keyFindings.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        {causes.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-1">
              Potential Causes & Impacts
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              {causes.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        {recommendations.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-1">
              Actionable Recommendations
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              {recommendations.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // AI Analysis (example structure)
  if (label === "AI Analysis" && typeof data === "object") {
    return (
      <div className="space-y-4">
        {data.overall_summary && (
          <section>
            <h2 className="text-xl font-semibold mb-1">Overall Summary</h2>
            <p className="text-gray-800">{data.overall_summary}</p>
          </section>
        )}
        {Array.isArray(data.key_cross_cutting_themes_findings) && (
          <section>
            <h2 className="text-xl font-semibold mb-1">
              Key Cross-Cutting Themes & Findings
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              {data.key_cross_cutting_themes_findings.map(
                (item: any, i: number) => (
                  <li key={i}>
                    <span className="font-medium">{item.theme}:</span>{" "}
                    {item.details}
                  </li>
                )
              )}
            </ul>
          </section>
        )}
        {data.recommendations && (
          <section>
            <h2 className="text-xl font-semibold mb-1">Recommendations</h2>
            <p className="text-gray-800">{data.recommendations}</p>
          </section>
        )}
      </div>
    );
  }

  // Generic: If the data is an array of objects with title/description
  if (Array.isArray(data) && data.length && typeof data[0] === "object") {
    return (
      <div className="space-y-4">
        {data.map((item, idx) => (
          <section
            key={idx}
            className="border-b pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0"
          >
            {item.title && (
              <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
            )}
            {item.description && (
              <p className="text-gray-800">{item.description}</p>
            )}
            {/* Fallback: show all fields if no title/description */}
            {!item.title && !item.description && (
              <ul className="list-disc ml-6">
                {Object.entries(item).map(([k, v]) => (
                  <li key={k}>
                    <span className="font-medium">{k}:</span> {String(v)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    );
  }

  // Generic: If the data is an object with keys
  if (typeof data === "object" && data !== null) {
    // Try to display as a summary if possible
    if (data.title || data.description || data.summary) {
      return (
        <div className="space-y-4">
          {data.title && (
            <h2 className="text-xl font-semibold mb-2">{data.title}</h2>
          )}
          {data.summary && <p className="text-gray-800 mb-2">{data.summary}</p>}
          {data.description && (
            <p className="text-gray-800 mb-2">{data.description}</p>
          )}
          {/* Show other fields as sections, skipping title/summary/description */}
          {Object.entries(data)
            .filter(([k]) => !["title", "summary", "description"].includes(k))
            .map(([k, v], idx) => (
              <section key={idx} className="mb-2">
                <h3 className="text-lg font-semibold mb-1">
                  {k.replace(/_/g, " ")}
                </h3>
                {Array.isArray(v) ? (
                  <ul className="list-disc ml-6">
                    {v.map((item, i) => (
                      <li key={i}>
                        {typeof item === "string" ? item : JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-800">
                    {typeof v === "string" ? v : JSON.stringify(v)}
                  </p>
                )}
              </section>
            ))}
        </div>
      );
    }
    // Fallback: show all fields as sections, but format arrays and objects nicely
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([k, v], idx) => (
          <section key={idx} className="mb-2">
            <h3 className="text-lg font-semibold mb-1">
              {k.replace(/_/g, " ")}
            </h3>
            {Array.isArray(v) ? (
              <ul className="list-disc ml-6">
                {v.map((item, i) => (
                  <li key={i}>
                    {typeof item === "string" ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : typeof v === "object" && v !== null ? (
              <div className="bg-gray-50 p-2 rounded border text-xs">
                {Object.entries(v).map(([subk, subv], subi) => (
                  <div key={subi}>
                    <span className="font-medium">
                      {subk.replace(/_/g, " ")}:{" "}
                    </span>
                    {typeof subv === "string" ? subv : JSON.stringify(subv)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-800">
                {typeof v === "string" ? v : JSON.stringify(v)}
              </p>
            )}
          </section>
        ))}
      </div>
    );
  }

  // Fallback: just show as string
  return <div className="text-gray-800">{String(data)}</div>;
}

const TabContent: React.FC<{ url: string; label: string }> = ({
  url,
  label,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <div className="w-full">
      <Card className="w-full bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-100">{label}</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          {loading ? (
            <div className="flex items-center justify-center py-8 space-x-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">{error}</div>
          ) : (
            <div className="w-full max-w-none text-slate-200">
              {renderAIContent(data, label)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const OverallAIInsights: React.FC = () => {
  const [tab, setTab] = useState(endpoints[0].key);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 tracking-tight">Overall AI Insights</h1>
          <p className="text-lg text-slate-400">
            Comprehensive AI-driven analysis and insights across all process areas
          </p>
        </div>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 w-full mb-8 h-auto p-2 bg-slate-800 border border-slate-700 rounded-lg">
            {endpoints.map((ep) => (
              <TabsTrigger
                key={ep.key}
                value={ep.key}
                className="text-xs sm:text-sm font-medium px-2 py-3 rounded-md transition-all duration-200 text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400 data-[state=active]:shadow-sm hover:bg-slate-700/50 hover:text-slate-200"
              >
                <span className="text-center leading-tight">{ep.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="w-full">
            {endpoints.map((ep) => (
              <TabsContent key={ep.key} value={ep.key} className="w-full mt-0">
                {tab === ep.key && (
                  <div className="w-full">
                    <TabContent url={ep.url} label={ep.label} />
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default OverallAIInsights;
