// src/pages/SignUp/signup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    let navigate = useNavigate();


    const handleSubmit = async (event: React.SubmitEvent) => {
        event.preventDefault();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({username, password})
        })
    }

    const routeChange = () => {
        let signInPage = '/signin';
        navigate(signInPage);
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
            <button type="submit">Register</button>
            <button onClick={routeChange}>Login</button>
        </form>
    )
}
export default SignUp;