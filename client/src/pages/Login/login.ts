interface LoginCredentials {
    username: string;
    password:  string;
}

export async function submitLoginRequest(credentials: LoginCredentials): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include'
        });

        return response.ok; 
    } catch (error) {
        console.error("Network error during login:", error);
        return false;
    }
}
