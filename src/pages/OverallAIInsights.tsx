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
    label: "SOP Deviation AI Insights",
    url: "http://34.60.217.109/aiinsights/sop",
  },
  {
    key: "incomplete",
    label: "Incomplete Cases AI Insights",
    url: "http://34.60.217.109/aiinsights/incomplete",
  },
  {
    key: "longrunning",
    label: "Long Running Cases AI Insights",
    url: "http://34.60.217.109/aiinsights/longrunning",
  },
  {
    key: "reworked",
    label: "Reworked Activities AI Insights",
    url: "http://34.60.217.109/aiinsights/reworked",
  },
  {
    key: "resourceswitches",
    label: "Resource Switches AI Insights",
    url: "http://34.60.217.109/aiinsights/resourceswitches",
  },
  {
    key: "timingviolation",
    label: "Timing Violations AI Insights",
    url: "http://34.60.217.109/aiinsights/timingviolation",
  },
  {
    key: "casecomplexity",
    label: "Case Complexity AI Insights",
    url: "http://34.60.217.109/aiinsights/casecomplexity",
  },
  {
    key: "resourceperformance",
    label: "Resource Performance AI Insights",
    url: "http://34.60.217.109/aiinsights/resourceperformance",
  },
  {
    key: "timinganalysis",
    label: "Timing Analysis AI Insights",
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
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          renderAIContent(data, label)
        )}
      </CardContent>
    </Card>
  );
};

const OverallAIInsights: React.FC = () => {
  const [tab, setTab] = useState(endpoints[0].key);
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Overall AI Insights</h1>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
          {endpoints.map((ep) => (
            <TabsTrigger
              key={ep.key}
              value={ep.key}
              className={`capitalize whitespace-nowrap ${
                tab === ep.key
                  ? "bg-blue-100 text-blue-700 font-semibold shadow"
                  : ""
              }`}
              style={{ minWidth: 180 }}
            >
              {ep.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {endpoints.map((ep) => (
          <TabsContent key={ep.key} value={ep.key} className="w-full">
            {tab === ep.key && <TabContent url={ep.url} label={ep.label} />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OverallAIInsights;
