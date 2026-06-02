import type { ProjectData } from '../ProjectBuilder/builder';

export type ComponentKey = 'cpu' | 'motherboard' | 'memory' | 'gpu' | 'psu' | 'cooler' | 'storage' | 'chassis';

export interface SelectorItem {
  [key: string]: any;
}

export interface ComponentConfig {
  label: string;
  idField: string;
  allEndpoint: string;
  compatibleEndpoint: string;
  projectField: 'cpu_id' | 'motherboard_id' | 'memory_id' | 'gpu_id' | 'psu_id' | 'cooler_id' | 'storage_id' | 'chassis_id';
  summaryFields: string[];
}

export const componentConfigs: Record<ComponentKey, ComponentConfig> = {
  cpu: {
    label: 'CPU',
    idField: 'cpu_id',
    allEndpoint: '/api/cpus',
    compatibleEndpoint: '/api/compatible/cpus',
    projectField: 'cpu_id',
    summaryFields: ['name', 'manufacturer', 'socket', 'chipset', 'price', 'power_draw']
  },
  motherboard: {
    label: 'Motherboard',
    idField: 'motherboard_id',
    allEndpoint: '/api/motherboards',
    compatibleEndpoint: '/api/compatible/motherboards',
    projectField: 'motherboard_id',
    summaryFields: ['name', 'manufacturer', 'form_factor', 'socket', 'chipset', 'ram_slots', 'pcie_slots', 'price', 'power_draw']
  },
  memory: {
    label: 'Memory (RAM)',
    idField: 'memory_id',
    allEndpoint: '/api/memory',
    compatibleEndpoint: '/api/compatible/memory',
    projectField: 'memory_id',
    summaryFields: ['name', 'manufacturer', 'ram_type', 'speed', 'modules', 'price']
  },
  gpu: {
    label: 'Video Card (GPU)',
    idField: 'gpu_id',
    allEndpoint: '/api/gpus',
    compatibleEndpoint: '/api/compatible/gpus',
    projectField: 'gpu_id',
    summaryFields: ['name', 'manufacturer', 'chipset', 'memory', 'core_clock', 'length', 'price', 'power_draw']
  },
  psu: {
    label: 'Power Supply',
    idField: 'psu_id',
    allEndpoint: '/api/psus',
    compatibleEndpoint: '/api/compatible/psus',
    projectField: 'psu_id',
    summaryFields: ['name', 'manufacturer', 'type_psu', 'efficiency', 'wattage', 'price']
  },
  cooler: {
    label: 'CPU Cooler',
    idField: 'cooler_id',
    allEndpoint: '/api/coolers',
    compatibleEndpoint: '/api/compatible/coolers',
    projectField: 'cooler_id',
    summaryFields: ['name', 'manufacturer', 'type_cooler', 'size_cooler', 'price']
  },
  storage: {
    label: 'Storage',
    idField: 'storage_id',
    allEndpoint: '/api/storage',
    compatibleEndpoint: '/api/compatible/storage',
    projectField: 'storage_id',
    summaryFields: ['name', 'manufacturer', 'capacity', 'type_storage', 'form_factor', 'price']
  },
  chassis: {
    label: 'Chassis (Case)',
    idField: 'chassis_id',
    allEndpoint: '/api/chassis',
    compatibleEndpoint: '/api/compatible/chassis',
    projectField: 'chassis_id',
    summaryFields: ['name', 'manufacturer', 'type_chassis', 'color', 'price']
  }
};

export const fetchCompatibleParts = async (
  projectId: string,
  componentKey: ComponentKey
): Promise<SelectorItem[]> => {
  const config = componentConfigs[componentKey];
  if (!config) {
    throw new Error(`Unsupported component key: ${componentKey}`);
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}${config.compatibleEndpoint}/${projectId}`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${config.label} list`);
  }

  return await response.json();
};

export const selectComponentForProject = async (
  projectId: string,
  componentKey: ComponentKey,
  componentId: number
): Promise<boolean> => {
  const config = componentConfigs[componentKey];
  if (!config) {
    throw new Error(`Unsupported component key: ${componentKey}`);
  }

  const body = {
    [config.projectField]: componentId
  } as Record<string, unknown>;

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(body)
  });

  return response.ok;
};

export const loadProjectForSelection = async (projectId: string): Promise<ProjectData> => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project data');
  }

  return await response.json();
};

export const buildDetailRows = (item: SelectorItem, fields: string[]): Array<[string, string]> => {
  return fields.map((field) => {
    const value = item[field];
    return [
      field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      value === null || value === undefined ? 'N/A' : String(value)
    ];
  });
};
