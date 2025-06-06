
// e:\Gen-UI\genui-dynamic-dashboards\src\services\longRunningCasesService.ts
export class LongRunningCasesService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://34.60.217.109/longrunningcases/count');
    const data = await response.json();
    // Defensive: handle both { count } and { long_running, regular }
    if (typeof data.count === 'number') {
      return [
        { name: 'Long Running Cases', value: data.count }
      ];
    }
    return [
      { name: 'Long Running Cases', value: data.long_running ?? 0 },
      { name: 'Regular Cases', value: data.regular ?? 0 }
    ];
  }

  async getCount(): Promise<number> {
    const response = await fetch('http://34.60.217.109/longrunningcases/count');
    const data = await response.json();
    return data.count ?? data.long_running ?? 0;
  }

  async getTable(): Promise<any[]> {
    try {
      // Try API first
      const response = await fetch('http://34.60.217.109/longrunning_table?page=1&size=100');
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        if (typeof data === 'object' && data !== null) return Object.values(data);
      }
    } catch (e) {
      console.warn('API failed, falling back to local data');
    }

    // Fallback to local JSON
    try {
      const response = await fetch('/longrunning_case.json');
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      console.error('Failed to load long running cases table data');
      return [];
    }
  }
}

export const longRunningCasesService = new LongRunningCasesService();

