
import { dataService } from "@/services/dataService";
import React, { useEffect, useState } from "react";
import DataTable from "./DataTable";

interface TimingAnalysisRow {
  [key: string]: any;
}

const TimingAnalysisTable: React.FC = () => {
  const [data, setData] = useState<TimingAnalysisRow[]>([]);
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const json = await dataService.getTimingAnalysisTable();
        if (Array.isArray(json) && json.length > 0) {
          setColumns(Object.keys(json[0]).map((key) => ({ key, label: key })));
          setData(json);
        } else {
          setColumns([]);
          setData([]);
        }
      } catch (err: any) {
        // Silently handle errors - no error message displayed
        setColumns([]);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading Timing Analysis...</div>;
  if (!data.length) return <div>No timing analysis data available.</div>;

  return <DataTable title="Timing Analysis" data={data} columns={columns} />;
};

export default TimingAnalysisTable;
