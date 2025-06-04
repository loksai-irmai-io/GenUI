// Utility to normalize and validate data for visualizations
export function normalizeVisualizationData(data: any, type?: string): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && data !== null) {
    // For bar/series types, convert object to array of { name, value }
    if (
      type &&
      [
        "incomplete-bar",
        "longrunning-bar",
        "resource-switches-bar",
        "rework-activities-bar",
        "timing-violations-bar",
        "process-failure-patterns-bar",
      ].includes(type)
    ) {
      return Object.entries(data).map(([name, value]) => ({ name, value }));
    }
    // For table types, use object values if not array
    if (
      type &&
      [
        "case-complexity-table",
        "resource-performance-table",
        "timing-analysis-table",
        "sop-table",
      ].includes(type)
    ) {
      return Object.values(data);
    }
  }
  return [];
}

// Validate that array data contains required fields for visualization
export function isValidVisualizationData(data: any[], requiredFields: string[]): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;
  return data.every((row) =>
    requiredFields.every((field) => Object.prototype.hasOwnProperty.call(row, field))
  );
}
