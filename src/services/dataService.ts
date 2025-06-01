
// Mock data service to provide sample data when API is not available
export class MockDataService {
  async getSOPDeviationCount() {
    return { count: 15, percentage: 23.5 };
  }

  async getSOPDeviationPatterns() {
    return [
      { pattern: "Missing Documentation", frequency: 8, severity: "High" },
      { pattern: "Incorrect Procedure", frequency: 5, severity: "Medium" },
      { pattern: "Training Gap", frequency: 2, severity: "Low" }
    ];
  }

  async getSOPDeviationTableData() {
    return [
      { id: 1, deviation: "Missing Step 3", case: "CASE-001", severity: "High", date: "2024-01-15" },
      { id: 2, deviation: "Wrong Parameter", case: "CASE-002", severity: "Medium", date: "2024-01-14" },
      { id: 3, deviation: "Skipped Validation", case: "CASE-003", severity: "Low", date: "2024-01-13" }
    ];
  }

  async getIncompleteCasesCount() {
    return [
      { name: "Pending Review", value: 12 },
      { name: "Missing Data", value: 8 },
      { name: "Awaiting Approval", value: 5 }
    ];
  }

  async getIncompleteCasesChartData() {
    return this.getIncompleteCasesCount();
  }

  async getLongRunningCasesCount() {
    return [
      { name: "> 30 days", value: 7 },
      { name: "> 60 days", value: 4 },
      { name: "> 90 days", value: 2 }
    ];
  }

  async getLongRunningCasesChartData() {
    return this.getLongRunningCasesCount();
  }

  async getResourceSwitchesCount() {
    return [
      { name: "Department A", value: 15 },
      { name: "Department B", value: 10 },
      { name: "Department C", value: 8 }
    ];
  }

  async getReworkActivitiesCount() {
    return [
      { name: "Quality Issues", value: 9 },
      { name: "Process Changes", value: 6 },
      { name: "Customer Requests", value: 4 }
    ];
  }

  async getTimingViolationsCount() {
    return [
      { name: "Late Start", value: 11 },
      { name: "Exceeded Duration", value: 7 },
      { name: "Missed Deadline", value: 3 }
    ];
  }

  async getCaseComplexityData() {
    return [
      { complexity: "Low", count: 45, percentage: 60 },
      { complexity: "Medium", count: 22, percentage: 30 },
      { complexity: "High", count: 8, percentage: 10 }
    ];
  }

  async getResourcePerformanceData() {
    return [
      { resource: "John Doe", tasks: 25, completed: 23, efficiency: 92 },
      { resource: "Jane Smith", tasks: 20, completed: 19, efficiency: 95 },
      { resource: "Bob Johnson", tasks: 18, completed: 16, efficiency: 89 }
    ];
  }

  async getTimingAnalysisData() {
    return [
      { process: "Order Processing", avgTime: 2.5, target: 2.0, variance: 0.5 },
      { process: "Quality Check", avgTime: 1.8, target: 1.5, variance: 0.3 },
      { process: "Approval Workflow", avgTime: 3.2, target: 3.0, variance: 0.2 }
    ];
  }
}

export const mockDataService = new MockDataService();
