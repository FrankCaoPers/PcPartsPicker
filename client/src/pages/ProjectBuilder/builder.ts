export interface ProjectData {
  project_id: number;
  name: string;
  total_price: number;
  total_power: number;
  cpu_id: number | null;
  cooler_id: number | null;
  gpu_id: number | null;
  memory_id: number | null;
  motherboard_id: number | null;
  psu_id: number | null;
  storage_id: number | null;
  chassis_id: number | null;
  cpu?: { name: string; price: number };
  cooler?: { name: string; price: number };
  gpu?: { name: string; price: number };
  memory?: { name: string; price: number };
  motherboard?: { name: string; price: number };
  psu?: { name: string; price: number };
  storage?: { name: string; price: number };
  chassis?: { name: string; price: number };
}

export const DUMMY_PROJECT_DATA: ProjectData = {
  project_id: 1,
  name: 'Gaming PC Build',
  total_price: 1849.97,
  total_power: 650,
  cpu_id: 1,
  cooler_id: 1,
  gpu_id: 1,
  memory_id: 1,
  motherboard_id: 1,
  psu_id: 1,
  storage_id: 1,
  chassis_id: 1,
  cpu: { name: 'Intel Core i7-13700K', price: 409.99 },
  cooler: { name: 'Noctua NH-D15', price: 99.99 },
  gpu: { name: 'NVIDIA RTX 4070', price: 549.99 },
  memory: { name: 'Corsair Vengeance RGB 32GB DDR5', price: 149.99 },
  motherboard: { name: 'MSI Z790-A PRO', price: 239.99 },
  psu: { name: 'Corsair RM850x', price: 139.99 },
  storage: { name: 'Samsung 990 Pro 1TB NVMe', price: 109.99 },
  chassis: { name: 'Lian Li Lancool 216', price: 50.05 }
};

export interface Component {
  type: string;
  key: string;
  id: number | null;
}

export const COMPONENTS: Component[] = [
  { type: 'CPU', key: 'cpu', id: null },
  { type: 'Motherboard', key: 'motherboard', id: null },
  { type: 'Memory', key: 'memory', id: null },
  { type: 'GPU', key: 'gpu', id: null },
  { type: 'Power Supply', key: 'psu', id: null },
  { type: 'CPU Cooler', key: 'cooler', id: null },
  { type: 'Storage', key: 'storage', id: null },
  { type: 'Chassis', key: 'chassis', id: null }
];

export const fetchProjectData = async (projectId: string | undefined): Promise<ProjectData> => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/projects/${projectId}`,
    {
      method: 'GET',
      credentials: 'include'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch project data');
  }

  return await response.json();
};

export const fetchProjectDataDummy = (projectId: string | undefined): Promise<ProjectData> => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }
  
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_PROJECT_DATA);
    }, 500);
  });
};

export const handleChangePart = (componentType: string): void => {
  console.log(`Opening selector for ${componentType}`);
  // TODO: Open modal/page to select different component
};

export const handleAddPart = (componentType: string): void => {
  console.log(`Adding new ${componentType}`);
  // TODO: Open modal/page to add component
};

export const getComponentData = (
  project: ProjectData,
  componentKey: string
): { name: string; price: number } | undefined => {
  return project[componentKey as keyof ProjectData] as
    | { name: string; price: number }
    | undefined;
};

export const getComponentsList = (project: ProjectData): Component[] => {
  return COMPONENTS.map((component) => ({
    ...component,
    id: project[`${component.key}_id` as keyof ProjectData] as number | null
  }));
};
