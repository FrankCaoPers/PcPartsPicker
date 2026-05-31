import { useNavigate } from 'react-router-dom';

export function useNavigationUtils() {
    const navigate = useNavigate();

    const goToSignup = () => navigate('/signup');
    const goToLogin = () => navigate('/login');
    const goToDashboard = () => navigate('/dashboard');

    return {
        goToSignup,
        goToLogin,
        goToDashboard
    };
}
