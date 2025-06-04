// e:\Gen-UI\genui-dynamic-dashboards\src\services\resourceSwitchesService.ts
export class ResourceSwitchesService {
  async getCountBar(): Promise<Array<{ name: string; value: number }>> {
    const response = await fetch('http://34.60.217.109/resourceswitches/count');
    const data = await response.json();
    // Defensive: handle both { count } and { resource_switches }
    if (typeof data.count === 'number') {
      return [
        { name: 'Resource Switches', value: data.count }
      ];
    }
    return [
      { name: 'Resource Switches', value: data.resource_switches ?? 0 }
    ];
  }
}

export const resourceSwitchesService = new ResourceSwitchesService();
