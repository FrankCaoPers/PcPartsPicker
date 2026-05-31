export interface ProjectRow {
    project_id: number;
    name: string;
    total_price: number;
    total_power: number;
    user_id: number;
    cpu_id: number | null;
    cooler_id: number | null;
    gpu_id: number | null;
    memory_id: number | null;
    motherboard_id: number | null;
    psu_id: number | null;
    storage_id: number | null;
    chassis_id: number | null;

}


export async function getProjects(): Promise<ProjectRow[]> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/GET/projects`, {
            method: 'GET',
            credentials: 'include'
        });
        const projects: ProjectRow[] = await response.json();
        return projects;

    } catch (err) {
        console.error("Network error:", err);
        return [];
    }
}


export async function createProject(projectName: string): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/POST/projects`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: projectName }),
            credentials: 'include'
        });

        return response.ok;
    } catch (err) {
        console.error("Network error during login:", err);
        return false;
    }
}


export async function deleteProject(projectId: number): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/DELETE/projects/${projectId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        return response.ok;
    } catch (err) {
        console.error("Network error during login:", err);
        return false;
    }
}
