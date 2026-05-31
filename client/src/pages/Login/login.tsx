import { useState } from "react";
import { useNavigationUtils } from "../../util/util";
import { submitLoginRequest } from "./login";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { goToSignup, goToDashboard } = useNavigationUtils();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        const isSuccess = await submitLoginRequest({ username, password });

        if (isSuccess) {
            goToDashboard();
        } else {
            alert("Invalid username or password");
        }
    };

    return (
        <form onSubmit={handleSubmit}>  
            <div>
                <label htmlFor="username">Username</label>
                <input 
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} 
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                />
            </div>
            <button type="submit">Login</button>
            <button type="button" onClick={goToSignup}>Sign Up</button>
        </form>
    );
}

export default Login;