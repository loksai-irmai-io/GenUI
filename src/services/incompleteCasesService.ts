// e:\Gen-UI\genui-dynamic-dashboards\src\services\incompleteCasesService.ts
export class IncompleteCasesService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://127.0.0.1:8001/incompletecases/count');
    const data = await response.json();
    // Defensive: handle both { count } and { incomplete, complete }
    if (typeof data.count === 'number') {
      return [
        { name: 'Incomplete Cases', value: data.count }
      ];
    }
    return [
      { name: 'Incomplete Cases', value: data.incomplete ?? 0 },
      { name: 'Complete Cases', value: data.complete ?? 0 }
    ];
  }
}

export const incompleteCasesService = new IncompleteCasesService();
