import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { ProjectData } from './builder';
import {
  fetchProjectData,
  fetchProjectDataDummy,
  handleChangePart as onChangePart,
  handleAddPart as onAddPart,
  getComponentData,
  getComponentsList
} from './builder';

// Dummy data for testing without backend
const USE_DUMMY_DATA = true;

function ProjectBuilder() {
  const { projectId } = useParams();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const data = USE_DUMMY_DATA
          ? await fetchProjectDataDummy(projectId)
          : await fetchProjectData(projectId);
        setProject(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleChangePart = (componentType: string) => onChangePart(componentType);
  const handleAddPart = (componentType: string) => onAddPart(componentType);

  if (loading) {
    return <div>Loading project...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const components = getComponentsList(project);

  return (
    <div>
      <h1>{project.name}</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
        <thead>
          <tr style={{ }}>
            <th style={{ border: '1px solid', padding: '8px', textAlign: 'left' }}>Component Type</th>
            <th style={{ border: '1px solid', padding: '8px', textAlign: 'left' }}>Component Name</th>
            <th style={{ border: '1px solid', padding: '8px', textAlign: 'right' }}>Price</th>
            <th style={{ border: '1px solid', padding: '8px', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component) => {
            const componentData = getComponentData(project, component.key);
            const hasComponent = component.id !== null && componentData;

            return (
              <tr key={component.key}>
                <td style={{ border: '1px solid', padding: '8px' }}>{component.type}</td>
                <td style={{ border: '1px solid', padding: '8px' }}>
                  {hasComponent ? componentData.name : 'Not Selected'}
                </td>
                <td style={{ border: '1px solid', padding: '8px', textAlign: 'right' }}>
                  {hasComponent ? `$${componentData.price.toFixed(2)}` : '-'}
                </td>
                <td style={{ border: '1px solid', padding: '8px', textAlign: 'center' }}>
                  <button
                    onClick={() =>
                      hasComponent
                        ? handleChangePart(component.type)
                        : handleAddPart(component.type)
                    }
                  >
                    {hasComponent ? 'Change' : 'Add'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Total Row */}
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Total Price:</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
                ${project.total_price.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Total Power Draw:</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                {project.total_power} W
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProjectBuilder;
