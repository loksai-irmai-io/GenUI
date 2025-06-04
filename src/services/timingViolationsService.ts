// e:\Gen-UI\genui-dynamic-dashboards\src\services\timingViolationsService.ts
export class TimingViolationsService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://34.60.217.109/timingviolations/count');
    const data = await response.json();
    // Defensive: handle both { count } and { timing_violations }
    if (typeof data.count === 'number') {
      return [
        { name: 'Timing Violations', value: data.count }
      ];
    }
    return [
      { name: 'Timing Violations', value: data.timing_violations ?? 0 }
    ];
  }
}

export const timingViolationsService = new TimingViolationsService();
