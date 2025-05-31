
import { 
  SOPDeviationCount, 
  SOPDeviationPattern, 
  CaseCount, 
  CaseComplexity, 
  ResourcePerformance, 
  TimingAnalysis 
} from './apiService';

// Mock data service to provide fallback data when API is unavailable
class MockDataService {
  async getSOPDeviationCount(): Promise<SOPDeviationCount> {
    return {
      count: 245,
      percentage: 12.3,
      threshold: "low"
    };
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
}

export const mockDataService = new MockDataService();

console.warn('Using mock data service. This provides sample data when the API is unavailable.');
