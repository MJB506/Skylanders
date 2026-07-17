import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';
import "./LoginStyles.css";

function RecoverAccount()
{
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    async function sendResetCode(event: any): Promise<void>
    {
        event.preventDefault();

        if (!email)
        {
            setMessage("Please enter your email.");
            return;
        }

        try
        {
            const response = await fetch(
                buildPath('api/requestpasswordreset'),
                {
                    method: 'POST',
                    headers:
                    {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                }
            );

            const res = await response.json();

            if (res.error)
            {
                setMessage(res.error);
                return;
            }

            sessionStorage.setItem("resetEmail", email);

            navigate('/reset-password',
            {
                state:
                {
                    email
                }
            });
        }
        catch(error: any)
        {
            setMessage(error.toString());
        }
    }

    return (
        <div className="login-container">
    
            <h1>Recover Account</h1>
    
            <p className="auth-description">
                Enter the email address associated with your account.
                We'll send you a recovery code to reset your password.
            </p>
    
            <form
                onSubmit={(e) =>
                {
                    e.preventDefault();
                    sendResetCode(e);
                }}
            >
    
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
    
                <button
                    className="login-button"
                    type="submit"
                >
                    Send Recovery Code
                </button>
    
            </form>
    
            <p className="login-links">
                Remember your password?{" "}
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

export default RecoverAccount;
