import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { ProjectData } from '../ProjectBuilder/builder';
import { fetchProjectData } from '../ProjectBuilder/builder';
import type { ComponentKey } from './selector';
import {
  componentConfigs,
  fetchCompatibleParts,
  selectComponentForProject,
  buildDetailRows
} from './selector';

function ComponentSelector() {
  const { projectId, componentKey: rawComponentKey } = useParams();
  const componentKey = (rawComponentKey ?? '').toLowerCase() as ComponentKey;
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<ProjectData | null>(location.state?.project ?? null);
  const [parts, setParts] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);

  const config = componentConfigs[componentKey];

  const pageTitle = useMemo(() => {
    if (!config) return 'Component Selector';
    return `${config.label} Selector`;
  }, [config]);

  const tableFields = useMemo(() => {
    if (!config) return [];

    const availableFields = new Set(parts.flatMap((item) => Object.keys(item)));
    return config.summaryFields.filter((field) => availableFields.has(field));
  }, [config, parts]);

  const formatValue = (value: unknown, field: string) => {
    if (value === null || value === undefined) return '—';
    if (field === 'price' && typeof value === 'number') return `$${value.toFixed(2)}`;
    if (field === 'price' && !Number.isNaN(Number(value))) return `$${Number(value).toFixed(2)}`;
    return String(value);
  };

  const getFieldLabel = (field: string) => field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  useEffect(() => {
    const load = async () => {
      if (!config || !projectId) {
        setError('Invalid component selector route');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedProject = project ?? await fetchProjectData(projectId);
        if (!project) {
          setProject(fetchedProject);
        }

        const fetchedParts = await fetchCompatibleParts(projectId, componentKey);
        setParts(fetchedParts);
        setError(null);
      } catch (err) {
        console.error('Error loading selector data:', err);
        setError(err instanceof Error ? err.message : 'Unable to load parts');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [componentKey, config, projectId]);

  const handleBack = () => {
    if (!projectId) return;
    navigate(`/project/${projectId}`);
  };

  const handleSelectPart = async (item: Record<string, any>) => {
    if (!projectId || !config) return;

    setSaving(true);
    const success = await selectComponentForProject(projectId, componentKey, item[config.idField]);
    setSaving(false);

    if (!success) {
      alert(`Unable to set selected ${config.label}.`);
      return;
    }

    alert(`${config.label} selected successfully.`);
    navigate(`/project/${projectId}`);
  };

  const handleViewDetails = (item: Record<string, any>) => {
    setDetailItem(item);
  };

  if (loading) {
    return <div>Loading compatible components...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={handleBack}>Back to Builder</button>
      </div>
    );
  }

  if (!config) {
    return (
      <div>
        <p>Unsupported component type.</p>
        <button onClick={handleBack}>Back to Builder</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h1 style={{ margin: 0 }}>{pageTitle}</h1>
          <p style={{ margin: '6px 0 0' }}>
            Choose a {config.label} for your project.
            {componentKey === 'cpu' && !project?.motherboard_id && ' Showing all CPUs because no motherboard is selected yet.'}
            {componentKey === 'motherboard' && !project?.cpu_id && ' Showing all motherboards because no CPU is selected yet.'}
          </p>
        </div>
        <button onClick={handleBack} style={{ padding: '10px 18px' }}>
          Back to Builder
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {tableFields.map((field) => (
              <th
                key={field}
                style={{ border: '1px solid', padding: '10px', textAlign: field === 'price' ? 'right' : 'left' }}
              >
                {getFieldLabel(field)}
              </th>
            ))}
            <th style={{ border: '1px solid', padding: '10px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parts.length === 0 ? (
            <tr>
              <td colSpan={tableFields.length + 1} style={{ padding: '16px', textAlign: 'center' }}>
                No compatible {config.label.toLowerCase()}s found.
              </td>
            </tr>
          ) : (
            parts.map((item) => (
              <tr key={item[config.idField]}>
                {tableFields.map((field) => (
                  <td
                    key={field}
                    style={{
                      border: '1px solid',
                      padding: '10px',
                      textAlign: field === 'price' ? 'right' : 'left'
                    }}
                  >
                    {formatValue(item[field], field)}
                  </td>
                ))}
                <td style={{ border: '1px solid', padding: '10px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleViewDetails(item)}
                    style={{ marginRight: '8px', padding: '8px 12px' }}
                  >
                    View More
                  </button>
                  <button
                    onClick={() => handleSelectPart(item)}
                    style={{ padding: '8px 12px' }}
                    disabled={saving}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {detailItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              background: '#3a3a3a',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              overflowY: 'auto',
              maxHeight: '90vh'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{detailItem.name ?? config.label}</h2>
              <button onClick={() => setDetailItem(null)} style={{ padding: '8px 12px' }}>
                Close
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <tbody>
                {buildDetailRows(detailItem, config.summaryFields).map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold', width: '35%' }}>{label}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{value}</td>
                  </tr>
                ))}
                {Object.entries(detailItem)
                  .filter(([key]) => !config.summaryFields.includes(key) && key !== config.idField)
                  .map(([key, value]) => (
                    <tr key={key}>
                      <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold', width: '35%' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>{value === null || value === undefined ? 'N/A' : String(value)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComponentSelector;
