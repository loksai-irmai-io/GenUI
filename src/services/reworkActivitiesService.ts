
// e:\Gen-UI\genui-dynamic-dashboards\src\services\reworkActivitiesService.ts
export class ReworkActivitiesService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://34.60.217.109/reworkactivities/count');
    const data = await response.json();
    // Defensive: handle both { count } and { rework_activities }
    if (typeof data.count === 'number') {
      return [
        { name: 'Rework Activities', value: data.count }
      ];
    }
    return [
      { name: 'Rework Activities', value: data.rework_activities ?? 0 }
    ];
  }

  async getCount(): Promise<number> {
    const response = await fetch('http://34.60.217.109/reworkactivities/count');
    const data = await response.json();
    return data.count ?? data.rework_activities ?? 0;
  }
}

export const reworkActivitiesService = new ReworkActivitiesService();

