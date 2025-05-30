
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
}

export const dataService = new DataService();
