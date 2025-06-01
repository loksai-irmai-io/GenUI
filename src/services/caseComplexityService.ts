// e:\Gen-UI\genui-dynamic-dashboards\src\services\caseComplexityService.ts
export class CaseComplexityService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/casecomplexity/count');
    const data = await response.json();
    return [
      { name: 'Simple', value: data.simple ?? 0 },
      { name: 'Moderate', value: data.moderate ?? 0 },
      { name: 'Complex', value: data.complex ?? 0 }
    ];
  }

  async getTable(): Promise<Array<any>> {
    const response = await fetch('http://127.0.0.1:8001/casecomplexity');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.cases ?? []);
  }
}

export const caseComplexityService = new CaseComplexityService();
