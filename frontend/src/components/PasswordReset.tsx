import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildPath } from './Path';
import "./LoginStyles.css";

function PasswordReset()
{
    const navigate = useNavigate();
    const location = useLocation();

    const email =
        location.state?.email ||
        sessionStorage.getItem("resetEmail") ||
        "";

    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    async function resetPassword(event: any): Promise<void>
    {
        event.preventDefault();

        if (!/^\d{6}$/.test(code))
        {
            setMessage("Please enter a valid 6-digit code.");
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{10,}$/;

        if (!passwordRegex.test(password))
        {
            setMessage(
                "Password must be at least 10 characters long, contain one uppercase letter, and one number."
            );
            return;
        }

        if (password !== confirmPassword)
        {
            setMessage("Passwords do not match.");
            return;
        }

        try
        {
            const response = await fetch(
                buildPath('api/resetpassword'),
                {
                    method: 'POST',
                    headers:
                    {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        recoveryCode: code,
                        newPassword: password
                    })
                }
            );

            const res = await response.json();

            if (res.error)
            {
                setMessage(res.error);
                return;
            }

            sessionStorage.removeItem("resetEmail");

            navigate('/');
        }
        catch(error: any)
        {
            setMessage(error.toString());
        }
    }

    async function resendCode()
    {
        try
        {
            const response = await fetch(
                buildPath('api/recoveraccount'),
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

            setMessage("A new recovery code has been sent.");
        }
        catch(error: any)
        {
            setMessage(error.toString());
        }
    }

    return (
        <div className="login-container">
    
            <h1>Reset Password</h1>
    
            <p className="email-display">
                Recovery code sent to
                <br />
                <strong>{email}</strong>
            </p>
    
            <form
                onSubmit={(e) =>
                {
                    e.preventDefault();
                    resetPassword(e);
                }}
            >
    
                <input
                    className="code-input"
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Recovery Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
    
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <p className="password-requirements">
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
    
                <button
                    className="login-button"
                    type="submit"
                >
                    Reset Password
                </button>
    
            </form>
    
            <button
                className="secondary-button"
                onClick={resendCode}
            >
                Send New Code
            </button>
    
            <div className="error-message">
                {message}
            </div>
    
        </div>
    );
}

export default PasswordReset;
