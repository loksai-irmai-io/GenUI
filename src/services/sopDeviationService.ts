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

interface FallbackData {
  pattern_count: string;
  percentage: number;
  is_sop_deviation: number;
  sop_deviation_sequence_preview: string[];
}

interface FallbackResponse {
  data: FallbackData[];
}

class SOPDeviationService {
  private baseUrl = 'http://34.60.217.109';

  private async loadFallbackData(): Promise<FallbackResponse> {
    const response = await fetch('/sopdeviation.json');
    if (!response.ok) {
      throw new Error('Failed to load fallback data');
    }
    return await response.json();
  }

  private convertFallbackToCountData(fallbackData: FallbackData[]): SOPCountData {
    const deviationData = fallbackData.filter(item => item.is_sop_deviation === 1);
    const totalCount = fallbackData.reduce((sum, item) => sum + parseInt(item.pattern_count), 0);
    const deviationCount = deviationData.reduce((sum, item) => sum + parseInt(item.pattern_count), 0);
    const percentage = (deviationCount / totalCount) * 100;

    return {
      count: deviationCount,
      percentage: Math.round(percentage * 100) / 100,
      threshold: "30%"
    };
  }

  private convertFallbackToPatternsData(fallbackData: FallbackData[]): SOPPatternData[] {
    return fallbackData.slice(0, 10).map((item, index) => ({
      pattern_id: `pattern_${index + 1}`,
      pattern_name: `Pattern ${index + 1} (${item.is_sop_deviation ? 'Deviation' : 'Standard'})`,
      frequency: parseInt(item.pattern_count),
      severity: item.is_sop_deviation ? (item.percentage > 10 ? 'high' : 'medium') : 'low',
      timestamp: new Date().toISOString()
    }));
  }

  async getSOPDeviationCount(): Promise<SOPCountData> {
    try {
      const response = await fetch('/sopdeviation.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fallbackData = await response.json();
      return this.convertFallbackToCountData(fallbackData.data);
    } catch (error) {
      console.error('Fallback data loading failed:', error);
      // Last resort fallback
      return {
        count: 9520,
        percentage: 44.84,
        threshold: "30%"
      };
    }
  }

  async getSOPDeviationPatterns(): Promise<SOPPatternData[]> {
    try {
      const response = await fetch('/sopdeviation.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fallbackData = await response.json();
      return this.convertFallbackToPatternsData(fallbackData.data);
    } catch (error) {
      console.error('Fallback data loading failed:', error);
      // Last resort fallback
      return [
        {
          pattern_id: "pattern_1",
          pattern_name: "Standard Process Flow",
          frequency: 6764,
          severity: "low",
          timestamp: new Date().toISOString()
        },
        {
          pattern_id: "pattern_2", 
          pattern_name: "Early Rejection Pattern",
          frequency: 3100,
          severity: "high",
          timestamp: new Date().toISOString()
        },
        {
          pattern_id: "pattern_3",
          pattern_name: "Re-assessment Flow",
          frequency: 2803,
          severity: "medium",
          timestamp: new Date().toISOString()
        }
      ];
    }
  }

  async getTable(): Promise<any[]> {
    try {
      const response = await fetch('/sopdeviation.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fallbackData = await response.json();
      
      // Convert fallback data to table format
      return fallbackData.data.map((item: FallbackData, index: number) => ({
        id: index + 1,
        pattern_id: `pattern_${index + 1}`,
        pattern_name: `Pattern ${index + 1} (${item.is_sop_deviation ? 'Deviation' : 'Standard'})`,
        frequency: parseInt(item.pattern_count),
        percentage: item.percentage,
        severity: item.is_sop_deviation ? (item.percentage > 10 ? 'High' : 'Medium') : 'Low',
        deviation_type: item.is_sop_deviation ? 'SOP Deviation' : 'Standard Process',
        sequence_preview: item.sop_deviation_sequence_preview.join(' → ')
      }));
    } catch (error) {
      console.error('Failed to load SOP deviation table data:', error);
      // Last resort fallback
      return [
        {
          id: 1,
          pattern_id: "pattern_1",
          pattern_name: "Standard Process Flow",
          frequency: 6764,
          percentage: 34.23,
          severity: "Low",
          deviation_type: "Standard Process",
          sequence_preview: "Start → Document Review → Assessment → Approval"
        },
        {
          id: 2,
          pattern_id: "pattern_2", 
          pattern_name: "Early Rejection Pattern",
          frequency: 3100,
          percentage: 15.68,
          severity: "High",
          deviation_type: "SOP Deviation",
          sequence_preview: "Start → Quick Assessment → Immediate Rejection"
        },
        {
          id: 3,
          pattern_id: "pattern_3",
          pattern_name: "Re-assessment Flow",
          frequency: 2803,
          percentage: 14.18,
          severity: "Medium",
          deviation_type: "SOP Deviation",
          sequence_preview: "Start → Initial Review → Re-assessment → Final Decision"
        }
      ];
    }
  }

}

export const sopDeviationService = new SOPDeviationService();
