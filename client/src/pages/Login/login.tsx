import { useState } from "react"
import { useNavigationUtils } from "../../util/util";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { goToSignup, goToDashboard } = useNavigationUtils()

    const handleSubmit = async (event: React.SubmitEvent) => {
        event.preventDefault();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({username, password}),
            credentials: 'include'
        })

        if(response.ok) {
            goToDashboard()
        }

        
        console.log(`Logging in with username: ${username} and password: ${password}`);
    }

    return (
        <form onSubmit={handleSubmit}>  
            <div>
                <label htmlFor="username">Username</label>
                <input 
                    id="username"
                    name="username" 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} 
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input 
                    id="password"
                    name="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                />
            </div>
            <button type="submit">Login</button>
            <button onClick={goToSignup}>Sign Up</button>
        </form>
    )
}

export default Login
