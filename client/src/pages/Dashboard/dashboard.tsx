// client/src/pages/dashboard/Dashboard.tsx
import { useState, useEffect } from "react";
import { getProjects, createProject, deleteProject, type ProjectRow } from "./dashboard";
import { useNavigationUtils } from "../../util/util";

function Dashboard() {
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const { goToWorkSpace } = useNavigationUtils(); 

    const loadProjects = async () => {
        const data = await getProjects();
        setProjects(data);
    };

    useEffect(() => {
        loadProjects();
    }, []);


    const handleSignOut = () => {
        localStorage.removeItem("token");     
        window.location.href = "/login"; 
    };


    const handleCreateClick = async () => {
        const projectName = prompt("Enter a name for your new PC build:");
        if (!projectName || projectName.trim() === "") return;

        const success = await createProject(projectName.trim());
        if (success) {
            loadProjects();
        } else {
            alert("Could not create project. Try again.");
        }
    };

    const handleDeleteClick = async (e: React.MouseEvent, projectId: number, name: string) => {
        e.stopPropagation();

        const doubleCheck = window.confirm(`Are you sure you want to permanently delete "${name}"?`);
        if (!doubleCheck) return;

        const success = await deleteProject(projectId);
        if (success) {
            loadProjects();
        } else {
            alert("Failed to delete project.");
        }
    };

    const renderProjectCard = (project: ProjectRow) => {
        return (
            <div 
                key={project.project_id} 
                className="project-card"
            >
                <div className="project-card-content">
                    <h3>{project.name}</h3>
                    <p>Estimated Cost: ${project.total_price}</p>
                    <p>Power Draw: {project.total_power}W</p>
                </div>
                
                <div className="project-card-actions">
                    <button 
                        type="button" 
                        className="btn-edit"
                        onClick={() => goToWorkSpace(project.project_id)}
                    >
                        Edit Build
                    </button>
                    <button 
                        type="button" 
                        className="btn-delete"
                        onClick={(e) => handleDeleteClick(e, project.project_id, project.name)}
                    >
                        Delete Build
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Your PC Builds</h2>
                <button type="button" onClick={handleCreateClick} className="btn-create">
                    + Start New Build
                </button>
                <button type="button" onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>

            <div className="projects-grid">
                {projects.length === 0 ? (
                    <p className="no-data">
                        No builds found. Click the button above to start your first project!
                    </p>
                ) : (
                    projects.map(renderProjectCard)
                )}
            </div>
        </div>
    );
}

export default Dashboard;