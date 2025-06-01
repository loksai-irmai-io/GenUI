
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

export interface IncompleteCaseData {
  case_id: string;
  pattern: string;
  is_incomplete: number;
  is_sop_deviation: number;
}

export interface LongRunningCaseData {
  long_running_case_ids: string[];
  long_running_case_count: string;
}

interface SOPDeviationResponse {
  data: Array<{
    pattern_count: string;
    percentage: number;
    is_sop_deviation: number;
    sop_deviation_sequence_preview: string[];
  }>;
}

interface IncompleteCasesResponse {
  data: IncompleteCaseData[];
}

interface LongRunningCasesResponse {
  data: LongRunningCaseData[];
}

class DataService {
  private async loadSOPDeviationData(): Promise<SOPDeviationResponse> {
    const response = await fetch('/sopdeviation.json');
    if (!response.ok) {
      throw new Error('Failed to load SOP deviation data');
    }
    return await response.json();
  }

  async getSOPDeviationPatterns(): Promise<SOPDeviationPattern[]> {
    return [
      {
        pattern_id: "PAT_001",
        pattern_name: "Skip Assessment",
        frequency: 45,
        severity: "high",
        timestamp: new Date().toISOString()
      },
      {
        pattern_id: "PAT_002", 
        pattern_name: "Missing Documentation",
        frequency: 32,
        severity: "medium",
        timestamp: new Date().toISOString()
      }
    ];
  }

  async getIncompleteCasesCount(): Promise<CaseCount> {
    return {
      count: 156,
      total_cases: 1000,
      percentage: 15.6
    };
  }

  async getLongRunningCasesCount(): Promise<CaseCount> {
    return {
      count: 89,
      total_cases: 1000,
      percentage: 8.9
    };
  }

  async getCaseComplexity(): Promise<CaseComplexity[]> {
    return [
      {
        case_id: "CASE_001",
        complexity_score: 8.5,
        event_count: 24,
        z_score: 2.1,
        classification: "high"
      },
      {
        case_id: "CASE_002",
        complexity_score: 4.2,
        event_count: 12,
        z_score: 0.8,
        classification: "medium"
      }
    ];
  }

  async getResourceSwitchesCount(): Promise<CaseCount> {
    return {
      count: 78,
      total_cases: 1000,
      percentage: 7.8
    };
  }

  async getReworkActivitiesCount(): Promise<CaseCount> {
    return {
      count: 134,
      total_cases: 1000,
      percentage: 13.4
    };
  }

  async getResourcePerformance(): Promise<ResourcePerformance[]> {
    return [
      {
        resource_id: "RES_001",
        resource_name: "John Smith",
        avg_duration: 24.5,
        total_activities: 156,
        efficiency_score: 8.2
      },
      {
        resource_id: "RES_002",
        resource_name: "Jane Doe",
        avg_duration: 18.3,
        total_activities: 189,
        efficiency_score: 9.1
      }
    ];
  }

  async getTimingViolationsCount(): Promise<CaseCount> {
    return {
      count: 67,
      total_cases: 1000,
      percentage: 6.7
    };
  }

  async getTimingAnalysis(): Promise<TimingAnalysis[]> {
    return [
      {
        activity_pair: "Application Submission → Initial Assessment",
        avg_gap: 4.2,
        max_gap: 12.5,
        min_gap: 0.5,
        violations_count: 23
      },
      {
        activity_pair: "Assessment → Decision",
        avg_gap: 8.7,
        max_gap: 25.3,
        min_gap: 1.2,
        violations_count: 45
      }
    ];
  }

  // --- API-based methods for new categories ---
  async getIncompleteCasesCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/incompletecases/count');
    const data = await response.json();
    // Defensive logging for debugging blank chart issue
    console.log('[DataService] getIncompleteCasesCountBar API response:', data);
    // Expecting { incomplete: number, complete: number }
    return [
      { name: 'Incomplete Cases', value: data.incomplete ?? 0 },
      { name: 'Complete Cases', value: data.complete ?? 0 }
    ];
  }

  async getLongRunningCasesCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/longrunningcases/count');
    const data = await response.json();
    console.log('[DataService] getLongRunningCasesCountBar API response:', data);
    // Expecting { long_running: number, regular: number }
    return [
      { name: 'Long Running Cases', value: data.long_running ?? 0 },
      { name: 'Regular Cases', value: data.regular ?? 0 }
    ];
  }

  async getResourceSwitchesCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/resourceswitches/count');
    const data = await response.json();
    console.log('[DataService] getResourceSwitchesCountBar API response:', data);
    // Expecting { resource_switches: number }
    return [
      { name: 'Resource Switches', value: data.resource_switches ?? 0 }
    ];
  }

  async getReworkActivitiesCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/reworkactivities/count');
    const data = await response.json();
    console.log('[DataService] getReworkActivitiesCountBar API response:', data);
    // Expecting { rework_activities: number }
    return [
      { name: 'Rework Activities', value: data.rework_activities ?? 0 }
    ];
  }

  async getTimingViolationsCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/timingviolations/count');
    const data = await response.json();
    console.log('[DataService] getTimingViolationsCountBar API response:', data);
    // Expecting { timing_violations: number }
    return [
      { name: 'Timing Violations', value: data.timing_violations ?? 0 }
    ];
  }

  async getCaseComplexityCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/casecomplexity/count');
    const data = await response.json();
    console.log('[DataService] getCaseComplexityCountBar API response:', data);
    // Expecting { simple: number, moderate: number, complex: number }
    return [
      { name: 'Simple', value: data.simple ?? 0 },
      { name: 'Moderate', value: data.moderate ?? 0 },
      { name: 'Complex', value: data.complex ?? 0 }
    ];
  }

  async getCaseComplexityTable(): Promise<Array<any>> {
    const response = await fetch('http://127.0.0.1:8001/casecomplexity');
    const data = await response.json();
    // Expecting an array of case complexity details
    return Array.isArray(data) ? data : (data.cases ?? []);
  }

  // Fetch resource performance table data from API
  async getResourcePerformanceTable(): Promise<any[]> {
    const response = await fetch('http://127.0.0.1:8001/resourceperformance');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  // Fetch timing analysis table data from API
  async getTimingAnalysisTable(): Promise<any[]> {
    const response = await fetch('http://127.0.0.1:8001/timinganalysis');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }
}

export const mockDataService = new MockDataService();

console.warn('Using mock data service. This provides sample data when the API is unavailable.');
