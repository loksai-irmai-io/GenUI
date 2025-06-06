
// e:\Gen-UI\genui-dynamic-dashboards\src\services\reworkActivitiesService.ts
export class ReworkActivitiesService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://34.60.217.109/reworkactivities/count');
    const data = await response.json();
    // Defensive: handle both { count } and { rework_activities }
    if (typeof data.count === 'number') {
      return [
        { name: 'Rework Activities', value: data.count }
      ];
    }
    return [
      { name: 'Rework Activities', value: data.rework_activities ?? 0 }
    ];
  }

  async getCount(): Promise<number> {
    const response = await fetch('http://34.60.217.109/reworkactivities/count');
    const data = await response.json();
    return data.count ?? data.rework_activities ?? 0;
  }

  async getTable(): Promise<any[]> {
    try {
      // Try API first
      const response = await fetch('http://34.60.217.109/reworkedactivtiestable?page=1&size=100');
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        if (typeof data === 'object' && data !== null) return Object.values(data);
      }
    } catch (e) {
      console.warn('Rework activities API failed, using fallback data');
    }

    // Return empty array as fallback
    return [];
  }
}

export const reworkActivitiesService = new ReworkActivitiesService();

