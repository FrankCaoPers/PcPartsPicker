import { useState } from "react";
import { useNavigationUtils } from "../../util/util";


function SignUp() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const { goToLogin } = useNavigationUtils();


    const handleSubmit = async (event: React.SubmitEvent) => {
        event.preventDefault();
        setMessage("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({username, password})
            })

            const data = await response.json();

            if (response.ok) {
                    setMessage("Sign up successful!"); 
                    setUsername('');
                    setPassword('');
                } else {
                    setMessage(data.message || "Sign up failed. Please try again.");
                }
        } catch (err) {
            console.error("Network error:", err);
            setMessage("Cannot connect to server. Is the backend running?");
        }
    }

    const messageClass = message.includes('successful') ? 'message-success' : 'message-error';

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input 
                        id="username"
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input 
                        id="password"
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-submit">Sign Up</button>
                    <button type="button" onClick={goToLogin} className="btn-link">Log In</button>
                </div>
            </form>

            {message && (
                <p className={`status-message ${messageClass}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
export default SignUp;
