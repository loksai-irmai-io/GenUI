
// e:\Gen-UI\genui-dynamic-dashboards\src\services\incompleteCasesService.ts
export class IncompleteCasesService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://34.60.217.109/incompletecases/count');
    const data = await response.json();
    // Defensive: handle both { count } and { incomplete, complete }
    if (typeof data.count === 'number') {
      return [
        { name: 'Incomplete Cases', value: data.count }
      ];
    }
    return [
      { name: 'Incomplete Cases', value: data.incomplete ?? 0 },
      { name: 'Complete Cases', value: data.complete ?? 0 }
    ];
  }

  async getCount(): Promise<number> {
    const response = await fetch('http://34.60.217.109/incompletecases/count');
    const data = await response.json();
    return data.count ?? data.incomplete ?? 0;
  }

  async getTable(): Promise<any[]> {
    try {
      // Try API first
      const response = await fetch('http://34.60.217.109/incompletecase_table');
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
      const response = await fetch('/incompletecases.json');
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      console.error('Failed to load incomplete cases table data');
      return [];
    }
  }
}

export const incompleteCasesService = new IncompleteCasesService();

