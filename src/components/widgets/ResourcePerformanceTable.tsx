import { dataService } from "@/services/dataService";
import React, { useEffect, useState } from "react";
import DataTable from "./DataTable";

interface ResourcePerformanceRow {
  [key: string]: any;
}

const ResourcePerformanceTable: React.FC = () => {
  const [data, setData] = useState<ResourcePerformanceRow[]>([]);
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await dataService.getResourcePerformanceTable();
        if (Array.isArray(json) && json.length > 0) {
          setColumns(Object.keys(json[0]).map((key) => ({ key, label: key })));
          setData(json);
        } else {
          setColumns([]);
          setData([]);
        }
      } catch (err: any) {
        setError("Failed to load resource performance data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading Resource Performance...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data.length) return <div>No resource performance data available.</div>;

  return (
    <DataTable title="Resource Performance" data={data} columns={columns} />
  );
};

export default ResourcePerformanceTable;
