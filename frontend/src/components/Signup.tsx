import { useState } from 'react';
import { buildPath } from './Path';
import { useNavigate } from 'react-router-dom';

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
        <div id="signupDiv">

            <span id="inner-title">CREATE ACCOUNT</span>
            <br /><br />

            <input
                type="text"
                id="signupUsername"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
            />
            <br />

            <input
                type="email"
                id="signupEmail"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <br />

            <input
                type="password"
                id="signupPassword"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />

            <input
                type="password"
                id="signupConfirmPassword"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <br />

            <input
                type="submit"
                id="signupButton"
                className="buttons"
                value="Create Account"
                onClick={doSignup}
            />
            
            <br /><br />
            
            <input
                type="button"
                id="loginRedirectButton"
                className="buttons"
                value="Already have an account? Log in!"
                onClick={() => navigate('/')}
            />
            
            <br /><br />
            
            <span id="signupResult">{message}</span>

        </div>
    );
}

export default Signup;
