import { useState } from "react"
import { useNavigate } from "react-router-dom";


function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    let navigate = useNavigate();


    const handleSubmit = (event: React.SubmitEvent) => {
        event.preventDefault();
        console.log(`Logging in with username: ${username} and password: ${password}`);
    }

    const routeChange = () => {
        let signUpPage = '/signup';
        navigate(signUpPage);
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
            <button onClick={routeChange}>Sign Up</button>
        </form>
    )
}

export default Login
