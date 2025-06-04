// e:/Gen-UI/genui-dynamic-dashboards/src/services/resourcePerformanceService.ts
export class ResourcePerformanceService {
  async getTable(): Promise<any[]> {
    const response = await fetch('http://34.60.217.109/resourceperformance');
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }
}

export const resourcePerformanceService = new ResourcePerformanceService();
