import { useState } from 'react';
import { buildPath } from './Path';
import { storeToken } from '../tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import "./LoginStyles.css";

function Login()
{
    const navigate = useNavigate();
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = useState('');
    const [loginPassword,setPassword] = useState('');

    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();
        var obj = {login:loginName,password:loginPassword};
        var js = JSON.stringify(obj);
        try
        {
            const response = await fetch(
                buildPath('api/login'),
                {
                    method: 'POST',
                    body: js,
                    headers:
                    {
                        'Content-Type': 'application/json'
                    }
                }
            );
            //var res = JSON.parse(await response.text());
            const res = await response.json();
            console.log("Login response:", res);
            if (res.needsVerification)
            {
                navigate('/verify-email',
                {
                    state:
                    {
                        email: res.email
                    }
                });
            
                return;
            }
            
            if (!res.accessToken)
            {
                setMessage(res.error || "Login failed");
                return;
            }
            else
            {
                
                const { accessToken } = res;

                storeToken(res);

                const decoded: any =
                    jwtDecode(accessToken);

                const user =
                {
                    username: decoded.Username,
                    id: decoded.userId
                };

                localStorage.setItem(
                    'user_data',
                    JSON.stringify(user)
                );

                navigate('/collection');
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };
    return (
        <div className="login-container">
        
            <h1>Collection Tracker</h1>
        
            <form onSubmit={doLogin}>
        
                <input
                    type="text"
                    placeholder="Username"
                    value={loginName}
                    onChange={handleSetLoginName}
                />
        
                <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={handleSetPassword}
                />
        
                <button
                    className="login-button"
                    type="submit"
                >
                    Login
                </button>
        
            </form>
        
            <p className="login-links">
        
                New User?
        
                <span onClick={() => navigate("/signup")}>
                    Sign Up
                </span>
        
            </p>
        
            <p className="login-links">
        
                Forgot Your Password?
        
                <span onClick={() => navigate("/recover-account")}>
                    Reset
                </span>
        
            </p>
        
            <div className="error-message">
                {message}
            </div>
        
        </div>
        );
    function handleSetLoginName( e: any ) : void
    {
    setLoginName( e.target.value );
    }
    function handleSetPassword( e: any ) : void
    {
    setPassword( e.target.value );
    }
    
};

export default Login;
