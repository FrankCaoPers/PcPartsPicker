import { useState } from "react";

function Dashboard(){

    const [projects, setProjects] = useState([]);

    const getProjects = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
                method: 'GET',
                credentials: 'include'
            });
            const projects = await response.json();
            console.log(projects);
            setProjects(projects);


        } catch (err) {
            console.error("Network error:", err);
        }
    }

    getProjects();

    return (
        <div>Heloo</div>
    )

}


export default Dashboard;
