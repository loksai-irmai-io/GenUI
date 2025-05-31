
const API_BASE_URL = 'http://127.0.0.1:8001';

export interface SOPDeviationCount {
  count: number;
  percentage: number;
  threshold: string;
}

export interface SOPDeviationPattern {
  pattern_id: string;
  pattern_name: string;
  frequency: number;
  severity: string;
  timestamp: string;
}

export interface CaseCount {
  count: number;
  total_cases: number;
  percentage: number;
}

export interface CaseComplexity {
  case_id: string;
  complexity_score: number;
  event_count: number;
  z_score: number;
  classification: string;
}

export interface ResourcePerformance {
  resource_id: string;
  resource_name: string;
  avg_duration: number;
  total_activities: number;
  efficiency_score: number;
}

export interface TimingAnalysis {
  activity_pair: string;
  avg_gap: number;
  max_gap: number;
  min_gap: number;
  violations_count: number;
}

class APIService {
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  }

  // SOP Deviation endpoints
  async getSOPDeviationCount(): Promise<SOPDeviationCount> {
    return this.fetchData<SOPDeviationCount>('/sopdeviation/low-percentage/count');
  }

  async getSOPDeviationPatterns(): Promise<SOPDeviationPattern[]> {
    return this.fetchData<SOPDeviationPattern[]>('/sopdeviation/patterns');
  }

  // Case-related endpoints
  async getIncompleteCasesCount(): Promise<CaseCount> {
    return this.fetchData<CaseCount>('/incompletecases/count');
  }

  async getLongRunningCasesCount(): Promise<CaseCount> {
    return this.fetchData<CaseCount>('/longrunningcases/count');
  }

  async getCaseComplexity(): Promise<CaseComplexity[]> {
    return this.fetchData<CaseComplexity[]>('/casecomplexity');
  }

  // Resource and activity endpoints
  async getResourceSwitchesCount(): Promise<CaseCount> {
    return this.fetchData<CaseCount>('/resourceswitches/count');
  }

  async getReworkActivitiesCount(): Promise<CaseCount> {
    return this.fetchData<CaseCount>('/reworkactivities/count');
  }

  async getResourcePerformance(): Promise<ResourcePerformance[]> {
    return this.fetchData<ResourcePerformance[]>('/resourceperformance');
  }

  // Timing-related endpoints
  async getTimingViolationsCount(): Promise<CaseCount> {
    return this.fetchData<CaseCount>('/timingviolations/count');
  }

  async getTimingAnalysis(): Promise<TimingAnalysis[]> {
    return this.fetchData<TimingAnalysis[]>('/timinganalysis');
  }
}

export const apiService = new APIService();
