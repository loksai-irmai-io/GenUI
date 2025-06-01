// e:\Gen-UI\genui-dynamic-dashboards\src\services\longRunningCasesService.ts
export class LongRunningCasesService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/longrunningcases/count');
    const data = await response.json();
    // Defensive: handle both { count } and { long_running, regular }
    if (typeof data.count === 'number') {
      return [
        { name: 'Long Running Cases', value: data.count }
      ];
    }
    return [
      { name: 'Long Running Cases', value: data.long_running ?? 0 },
      { name: 'Regular Cases', value: data.regular ?? 0 }
    ];
  }
}

export const longRunningCasesService = new LongRunningCasesService();
