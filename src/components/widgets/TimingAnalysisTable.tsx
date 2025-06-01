
import { mockDataService } from "@/services/dataService";
import React, { useEffect, useState } from "react";
import DataTable from "./DataTable";

interface TimingAnalysisRow {
  [key: string]: any;
}

const TimingAnalysisTable: React.FC = () => {
  const [data, setData] = useState<TimingAnalysisRow[]>([]);
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await mockDataService.getTimingAnalysisData();
        if (Array.isArray(json) && json.length > 0) {
          setColumns(Object.keys(json[0]).map((key) => ({ key, label: key })));
          setData(json);
        } else {
          setColumns([]);
          setData([]);
        }
      } catch (err: any) {
        setError("Failed to load timing analysis data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading Timing Analysis...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data.length) return <div>No timing analysis data available.</div>;

  return <DataTable title="Timing Analysis" data={data} columns={columns} />;
};

export default TimingAnalysisTable;
