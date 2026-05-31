import { useNavigate } from 'react-router-dom';

export function useNavigationUtils() {
    const navigate = useNavigate();

    const goToSignup = () => navigate('/signup');
    const goToLogin = () => navigate('/login');
    const goToDashboard = () => navigate('/dashboard');
    const goToWorkSpace = (projectId: number) => navigate(`/project/${projectId}`);

    return {
        goToSignup,
        goToLogin,
        goToDashboard,
        goToWorkSpace
    };
}
