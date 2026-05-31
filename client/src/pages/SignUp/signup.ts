interface SignUpCredentials {
    username: string;
    password:  string;
}

interface SignUpResult {
    success: boolean;
    message: string;
}

export async function submitSignUpRequest(credentials: SignUpCredentials): Promise<SignUpResult> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/POST/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, message: "Sign up successful!" };
        } else {
            return { success: false, message: data.message || "Sign up failed" };
        }
    } catch (err) {
        console.error("Network error during signup:", err);
        return { success: false, message: "Cannot connect to server" };
    }
}
