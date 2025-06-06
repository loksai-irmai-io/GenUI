// e:\Gen-UI\genui-dynamic-dashboards\src\services\timingViolationsService.ts
export class TimingViolationsService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://34.60.217.109/timingviolations/count');
    const data = await response.json();
    // Defensive: handle both { count } and { timing_violations }
    if (typeof data.count === 'number') {
      return [
        { name: 'Timing Violations', value: data.count }
      ];
    }
    return [
      { name: 'Timing Violations', value: data.timing_violations ?? 0 }
    ];
  }

  async getTable(): Promise<any[]> {
    try {
      // Try API first
      const response = await fetch('http://34.60.217.109/timingviolations_table?page=1&size=100');
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
      const response = await fetch('/timingviolations_table.json');
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      console.error('Failed to load timing violations table data');
      return [];
    }
  }
}

export const timingViolationsService = new TimingViolationsService();
