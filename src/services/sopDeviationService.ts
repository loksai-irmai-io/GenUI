
export interface SOPCountData {
  count: number;
  percentage: number;
  threshold: string;
}

export interface SOPPatternData {
  pattern_id: string;
  pattern_name: string;
  frequency: number;
  severity: string;
  timestamp: string;
}

class SOPDeviationService {
  private baseUrl = 'http://127.0.0.1:8001';

  async getSOPDeviationCount(): Promise<SOPCountData> {
    try {
      const response = await fetch(`${this.baseUrl}/sopdeviation/low-percentage/count`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching SOP deviation count:', error);
      throw error;
    }
  }

  async getSOPDeviationPatterns(): Promise<SOPPatternData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sopdeviation/patterns`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching SOP deviation patterns:', error);
      throw error;
    }
  }
}

export const sopDeviationService = new SOPDeviationService();
