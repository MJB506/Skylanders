import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';

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
        <div id="recoverAccountDiv">

            <span id="inner-title">
                RECOVER ACCOUNT
            </span>

            <br /><br />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br /><br />

            <input
                type="submit"
                className="buttons"
                value="Send Recovery Code"
                onClick={sendResetCode}
            />

            <br /><br />

            <span>{message}</span>

        </div>
    );
}

export default RecoverAccount;
