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
  
  cpu?: { name: string; price: number; manufacturer?: string };
  cooler?: { name: string; price: number; manufacturer?: string };
  gpu?: { name: string; price: number; manufacturer?: string };
  memory?: { name: string; price: number; manufacturer?: string };
  motherboard?: { name: string; price: number; manufacturer?: string };
  psu?: { name: string; price: number; manufacturer?: string };
  storage?: { name: string; price: number; manufacturer?: string };
  chassis?: { name: string; price: number; manufacturer?: string };
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

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, {
      method: 'GET',
      credentials: 'include'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch project data');
  }

  const data = await response.json();
  
  // Ensure numeric fields are actually numbers
  return {
    ...data,
    project_id: Number(data.project_id),
    total_price: Number(data.total_price),
    total_power: Number(data.total_power),
    user_id: Number(data.user_id),
    cpu_id: data.cpu_id !== null ? Number(data.cpu_id) : null,
    cooler_id: data.cooler_id !== null ? Number(data.cooler_id) : null,
    gpu_id: data.gpu_id !== null ? Number(data.gpu_id) : null,
    memory_id: data.memory_id !== null ? Number(data.memory_id) : null,
    motherboard_id: data.motherboard_id !== null ? Number(data.motherboard_id) : null,
    psu_id: data.psu_id !== null ? Number(data.psu_id) : null,
    storage_id: data.storage_id !== null ? Number(data.storage_id) : null,
    chassis_id: data.chassis_id !== null ? Number(data.chassis_id) : null
  };
};

export const fetchComponentDetails = async (
  endpoint: string, 
  id: number
): Promise<{ name: string; price: number; power_draw: number; manufacturer: string }> => {
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}/${id}`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch details for ${endpoint}`);
  }

  const data = await response.json();
  return {
    name: data.name,
    price: Number(data.price),
    power_draw: data.power_draw ? Number(data.power_draw) : 0,
    // Safely capture manufacturer field or fallback to an empty string/Unknown
    manufacturer: data.manufacturer || 'Unknown Brand' 
  };
};

export const calculateTotalPrice = (project: ProjectData): number => {
  const componentKeys = ['cpu', 'motherboard', 'memory', 'gpu', 'psu', 'cooler', 'storage', 'chassis'] as const;
  return componentKeys.reduce((total, key) => {
    const component = project[key] as { name: string; price: number } | undefined;
    return total + (component?.price ?? 0);
  }, 0);
};

export const calculateTotalPower = (project: ProjectData): number => {
  const componentKeys = ['cpu', 'motherboard', 'memory', 'gpu', 'psu', 'cooler', 'storage', 'chassis'] as const;
  return componentKeys.reduce((total, key) => {
    const component = project[key] as { name: string; price: number; power_draw?: number } | undefined;
    return total + (component?.power_draw ?? 0);
  }, 0);
};

export const fetchProjectDataWithComponentDetails = async (projectId: string | undefined): Promise<ProjectData> => {
  const project = await fetchProjectData(projectId);

  // Map your state keys to your backend API endpoints
  const endpoints: Record<string, string> = {
    cpu: 'cpus',
    motherboard: 'motherboards',
    memory: 'memory',
    gpu: 'gpus',          
    psu: 'psus',          
    cooler: 'coolers',  
    storage: 'storage',
    chassis: 'chassis'
  };

  // Dynamically fetch details for every part that has an ID saved in the project
  for (const [key, endpoint] of Object.entries(endpoints)) {
    const idField = `${key}_id` as keyof ProjectData;
    const componentId = project[idField] as number | null;
    
    if (componentId) {
      try {
        (project as any)[key] = await fetchComponentDetails(endpoint, componentId);
      } catch (err) {
        console.error(`Error loading ${key}:`, err);
      }
    }
  }

  project.total_price = calculateTotalPrice(project);
  project.total_power = calculateTotalPower(project);

  return project;
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
): { name: string; price: number; manufacturer?: string } | undefined => {
  return project[componentKey as keyof ProjectData] as
    | { name: string; price: number; manufacturer?: string }
    | undefined;
};

export const getComponentsList = (project: ProjectData): Component[] => {
  return COMPONENTS.map((component) => ({
    ...component,
    id: project[`${component.key}_id` as keyof ProjectData] as number | null
  }));
};

export const updateProjectName = async (projectId: number, newName: string): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName }),
      credentials: 'include'
    });

    return response.ok;
  } catch (err) {
    console.error('Network error during project update:', err);
    return false;
  }
};

export const saveProject = async (project: ProjectData): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project.project_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: project.name,
        total_price: project.total_price,
        total_power: project.total_power,
        cpu_id: project.cpu_id,
        cooler_id: project.cooler_id,
        gpu_id: project.gpu_id,
        memory_id: project.memory_id,
        motherboard_id: project.motherboard_id,
        psu_id: project.psu_id,
        storage_id: project.storage_id,
        chassis_id: project.chassis_id
      }),
      credentials: 'include'
    });

    return response.ok;
  } catch (err) {
    console.error('Network error during project save:', err);
    return false;
  }
};

export const clearProjectComponent = async (projectId: number, componentKey: string): Promise<boolean> => {
  const fieldName = `${componentKey}_id`;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ [fieldName]: null })
    });

    return response.ok;
  } catch (err) {
    console.error('Network error during component removal:', err);
    return false;
  }
};
