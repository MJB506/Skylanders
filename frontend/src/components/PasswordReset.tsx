import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildPath } from './Path';

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
                        code,
                        password
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

            alert("Password changed successfully!");

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
                buildPath('api/resendpasswordreset'),
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
        <div id="passwordResetDiv">

            <span id="inner-title">
                RESET PASSWORD
            </span>

            <br /><br />

            <strong>{email}</strong>

            <br /><br />

            <input
                type="text"
                maxLength={6}
                placeholder="Recovery Code"
                value={code}
                onChange={(e)=>setCode(e.target.value)}
            />

            <br />

            <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
            />

            <br />

            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
            />

            <br /><br />

            <input
                type="submit"
                className="buttons"
                value="Reset Password"
                onClick={resetPassword}
            />

            <br /><br />

            <input
                type="button"
                className="buttons"
                value="Send New Code"
                onClick={resendCode}
            />

            <br /><br />

            <span>{message}</span>

        </div>
    );
}

export default PasswordReset;
