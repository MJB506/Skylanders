import { useState } from 'react';
import { buildPath } from './Path';
import { storeToken } from '../tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

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
                    firstName: decoded.firstName,
                    lastName: decoded.lastName,
                    id: decoded.userId
                };

                localStorage.setItem(
                    'user_data',
                    JSON.stringify(user)
                );

                navigate('/cards');
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };
    return(
        <div id="loginDiv">
        <span id="inner-title">PLEASE LOG IN</span><br />
        <input type="text" id="loginName" placeholder="Username"onChange={handleSetLoginName} /><br></br>
        <input type="password" id="loginPassword" placeholder="Password"onChange={handleSetPassword} /><br></br>
        <input
            type="submit"
            id="loginButton"
            className="buttons"
            value="Do It"
            onClick={doLogin}
        />
        
        <br /><br />

        <input
            type="button"
            className="buttons"
            value="Forgot your password?"
            onClick={() => navigate('/recover-account')}
        />
            
        <br /><br />
        <input
            type="button"
            id="signupRedirectButton"
            className="buttons"
            value="Don't have an account? Sign up!"
            onClick={() => navigate('/signup')}
        />

        <br /><br />
    
        <span id="loginResult">{message}</span>
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
