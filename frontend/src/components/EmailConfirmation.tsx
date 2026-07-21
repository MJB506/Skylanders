import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildPath } from './Path';
import "./LoginStyles.css";

function EmailConfirmation()
{
    const navigate = useNavigate();
    const location = useLocation();

    // Email passed from Signup page
    const email = location.state?.email || '';

    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');

    async function verifyEmail(event: any): Promise<void>
    {
        event.preventDefault();

        if (code.length !== 6)
        {
            setMessage("Please enter your 6-digit verification code.");
            return;
        }
        if (!/^\d{6}$/.test(code))
        {
            setMessage("Please enter a valid 6-digit code.");
            return;
        }

        const obj =
        {
            email: email,
            code: code
        };

        try
        {
            const response = await fetch(
                buildPath('api/verifyemail'),
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
                return;
            }
            navigate('/');
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    async function resendCode(): Promise<void>
    {
        try
        {
            const response = await fetch(
                buildPath('api/resendverification'),
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
    
            setMessage("A new verification code has been sent.");
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    return (
        <div className="login-container">
    
            <h1>Verify Your Email</h1>
    
            <p className="email-display">
                A verification code has been sent to
                <br />
                <strong>{email}</strong>
            </p>
    
            <form
                onSubmit={(e) =>
                {
                    e.preventDefault();
                    verifyEmail(e);
                }}
            >
    
                <input
                    className="code-input"
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Verification Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
    
                <button
                    className="login-button"
                    type="submit"
                >
                    Verify Email
                </button>
    
            </form>
                
            <p className="login-links">
        
                Didn't Recieve An Email?
        
                <span onClick={() => onClick={resendCode}>
                    Resend
                </span>
        
            </p>
    
            <div className="error-message">
                {message}
            </div>
    
        </div>
    );
}

export default EmailConfirmation;
