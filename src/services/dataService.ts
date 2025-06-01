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

  private async loadIncompleteCasesData(): Promise<IncompleteCasesResponse> {
    const response = await fetch('/incompletecases.json');
    if (!response.ok) {
      throw new Error('Failed to load incomplete cases data');
    }
    return await response.json();
  }

  private async loadLongRunningCasesData(): Promise<LongRunningCasesResponse> {
    const response = await fetch('/longrunning_case.json');
    if (!response.ok) {
      throw new Error('Failed to load long running cases data');
    }
    return await response.json();
  }

  private convertSOPDataToTableFormat(sopData: SOPDeviationResponse): Array<{
    pattern_count: string;
    percentage: number;
    deviation_status: string;
    sequence_preview: string;
  }> {
    return sopData.data.map(item => ({
      pattern_count: item.pattern_count,
      percentage: item.percentage,
      deviation_status: item.is_sop_deviation ? 'Deviation' : 'Standard',
      sequence_preview: item.sop_deviation_sequence_preview.slice(0, 3).join(' → ') + '...'
    }));
  }

  private convertIncompleteCasesToChartData(incompleteCases: IncompleteCasesResponse): Array<{
    name: string;
    value: number;
  }> {
    const incomplete = incompleteCases.data.filter(item => item.is_incomplete === 1).length;
    const complete = incompleteCases.data.filter(item => item.is_incomplete === 0).length;
    
    return [
      { name: 'Incomplete Cases', value: incomplete },
      { name: 'Complete Cases', value: complete }
    ];
  }

  private convertLongRunningCasesToChartData(longRunningCases: LongRunningCasesResponse): Array<{
    name: string;
    value: number;
  }> {
    const data = longRunningCases.data[0];
    const totalCases = parseInt(data.long_running_case_count);
    
    return [
      { name: 'Long Running Cases', value: totalCases },
      { name: 'Regular Cases', value: Math.max(0, 1000 - totalCases) } // Assuming total of 1000 cases
    ];
  }

  async getSOPDeviationTableData(): Promise<Array<{
    pattern_count: string;
    percentage: number;
    deviation_status: string;
    sequence_preview: string;
  }>> {
    const sopData = await this.loadSOPDeviationData();
    return this.convertSOPDataToTableFormat(sopData);
  }

  async getIncompleteCasesChartData(): Promise<Array<{
    name: string;
    value: number;
  }>> {
    const incompleteCases = await this.loadIncompleteCasesData();
    return this.convertIncompleteCasesToChartData(incompleteCases);
  }

  async getLongRunningCasesChartData(): Promise<Array<{
    name: string;
    value: number;
  }>> {
    const longRunningCases = await this.loadLongRunningCasesData();
    return this.convertLongRunningCasesToChartData(longRunningCases);
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

export const dataService = new DataService();
