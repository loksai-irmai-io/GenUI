// e:/Gen-UI/genui-dynamic-dashboards/src/services/timingAnalysisService.ts
export class TimingAnalysisService {
  async getTable(): Promise<any[]> {
    const response = await fetch('http://34.60.217.109/timinganalysis');
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }
}

export const timingAnalysisService = new TimingAnalysisService();
