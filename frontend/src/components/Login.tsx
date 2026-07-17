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
    return (
        <div className="login-container">
        
            <h1>Collection Tracker</h1>
        
            <form onSubmit={doLogin}>
        
                <input
                    type="text"
                    placeholder="Username/Email"
                    value={loginName}
                    onChange={handleSetLoginName}
                />
        
                <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={handleSetPassword}
                />
        
                <label className="remember-me">
        
                    <input type="checkbox" />
        
                    Remember Me
        
                </label>
        
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

body{
    margin:0;
    font-family:Arial, Helvetica, sans-serif;
    background:#09071d;
}

.page-header{

    background:#8ed6ef;

    display:flex;

    justify-content:center;

    align-items:center;

    padding:20px;
}

.logo{

    width:350px;

    max-width:90%;
}

.login-container{

    display:flex;

    flex-direction:column;

    align-items:center;

    margin-top:25px;
}

.login-container h1{

    color:#90e6ff;

    font-size:64px;

    font-weight:300;

    margin-bottom:35px;
}

.login-container form{

    display:flex;

    flex-direction:column;

    width:460px;

    gap:20px;
}

.login-container input[type=text],
.login-container input[type=password]{

    height:42px;

    font-size:22px;

    padding:10px;

    border:none;

    outline:none;

    background:#efefef;
}

.remember-me{

    color:white;

    font-size:20px;

    display:flex;

    align-items:center;

    gap:12px;
}

.login-button{

    margin-top:10px;

    background:#91dbf3;

    color:black;

    border:none;

    height:60px;

    font-size:28px;

    cursor:pointer;

    transition:.2s;
}

.login-button:hover{

    background:#7bcde8;
}

.login-links{

    color:white;

    font-size:18px;

    margin:8px;
}

.login-links span{

    color:#7fdcff;

    cursor:pointer;
}

.login-links span:hover{

    text-decoration:underline;
}

.error-message{

    color:#ff7070;

    margin-top:20px;

    font-size:18px;
}


export default Login;
