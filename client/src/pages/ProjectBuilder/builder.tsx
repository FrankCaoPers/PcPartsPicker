import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { ProjectData } from './builder';
import {
  fetchProjectData,
  fetchProjectDataDummy,
  handleChangePart as onChangePart,
  handleAddPart as onAddPart,
  getComponentData,
  getComponentsList,
  updateProjectName,
  saveProject
} from './builder';
import { useNavigationUtils } from '../../util/util';

// Dummy data for testing without backend
const USE_DUMMY_DATA = false;

function ProjectBuilder() {
  const { projectId } = useParams();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const { goToDashboard } = useNavigationUtils();

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const data = USE_DUMMY_DATA
          ? await fetchProjectDataDummy(projectId)
          : await fetchProjectData(projectId);
        setProject(data);
        setEditedTitle(data.name);
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

  const handleSaveTitle = async () => {
    if (!project || !editedTitle.trim()) {
      alert('Project name cannot be empty');
      return;
    }

    const success = await updateProjectName(project.project_id, editedTitle.trim());
    if (success) {
      setProject({ ...project, name: editedTitle.trim() });
      setIsEditingTitle(false);
    } else {
      alert('Failed to update project name');
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(project?.name || '');
    setIsEditingTitle(false);
  };

  const handleSaveProject = async () => {
    if (!project) return;
    const success = await saveProject(project);
    if (success) {
      alert('Project saved successfully!');
    } else {
      alert('Failed to save project');
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={goToDashboard}
          style={{ padding: '8px 16px' }}
        >
          ← Back to Dashboard
        </button>
        {isEditingTitle ? (
          <>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              style={{ fontSize: '28px', padding: '8px', flex: 1 }}
              autoFocus
            />
            <button onClick={handleSaveTitle} style={{ padding: '8px 16px' }}>
              Save
            </button>
            <button onClick={handleCancelEdit} style={{ padding: '8px 16px' }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1 style={{ margin: 0 }}>{project.name}</h1>
            <button 
              onClick={() => setIsEditingTitle(true)}
              style={{ padding: '8px 16px' }}
            >
              Edit Title
            </button>
          </>
        )}
      </div>

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
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Estimated Power Consumption:</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                {project.total_power} W
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '15px', textAlign: 'right' }}>
          <button 
            onClick={handleSaveProject}
            style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectBuilder;
