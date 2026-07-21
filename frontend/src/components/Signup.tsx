import { useState } from 'react';
import { buildPath } from './Path';
import { useNavigate } from 'react-router-dom';
import "./LoginStyles.css";

function Signup()
{
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    async function doSignup(event: any): Promise<void>
    {
        event.preventDefault();

        // Check all fields are filled in
        if (!username || !email || !password || !confirmPassword)
        {
            setMessage("Please fill out all fields.");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email))
        {
            setMessage("Please enter a valid email address.");
            return;
        }

        // Username validation
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        if (!usernameRegex.test(username))
        {
            setMessage("Username may only contain letters, numbers, or underscores.");
            return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{10,}$/;

        if (!passwordRegex.test(password))
        {
            setMessage(
                "Password must be at least 10 characters long, contain one uppercase letter, and one number."
            );
            return;
        }

        // Confirm password
        if (password !== confirmPassword)
        {
            setMessage("Passwords do not match.");
            return;
        }

        const obj =
        {
            username: username,
            email: email,
            password: password
        };

        try
        {
            const response = await fetch(
                buildPath('api/register'),
                {
                    method: 'POST',
                    headers:
                    {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                }
            );

            const res = await response.json();

            if (res.error)
            {
                setMessage(res.error);
            }
            else
            {
                navigate('/verify-email', {
                    state:
                    {
                        email: email
                    }
                });
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    return (
        <div className="login-container">
    
            <h1>Create Account</h1>
    
            <form
                onSubmit={(e) =>
                {
                    e.preventDefault();
                    doSignup(e);
                }}
            >
    
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <p className="input-requirements">
                    A-Z, 0-9, and "_" only
                </p>
    
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
    
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <p className="input-requirements">
                    Password must contain:
                    <br />
                    • At least 10 characters
                    <br />
                    • At least 1 uppercase letter
                    <br />
                    • At least 1 number
                </p>
    
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <p className="input-requirements">
                    Passwords Must Match
                </p>
    
                <button
                    className="login-button"
                    type="submit"
                >
                    Create Account
                </button>
    
            </form>
    
            <p className="login-links">
                Already have an account?{" "}
                <span onClick={() => navigate("/")}>
                    Log In
                </span>
            </p>
    
            <div className="error-message">
                {message}
            </div>
    
        </div>
    );
}

export default Signup;
