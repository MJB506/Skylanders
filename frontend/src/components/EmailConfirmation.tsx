import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildPath } from './Path';

async function resendCode()
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

            alert("Email verified successfully!");

            navigate('/');
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    return (
        <div id="emailConfirmationDiv">

            <span id="inner-title">VERIFY YOUR EMAIL</span>

            <br /><br />

            <p>
                A verification code has been sent to:
            </p>

            <strong>{email}</strong>

            <br /><br />

            <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                id="verificationCode"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            <br /><br />

            <input
                type="submit"
                className="buttons"
                value="Verify Email"
                onClick={verifyEmail}
            />

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

export default EmailConfirmation;
